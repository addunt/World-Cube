"use strict";

const fs = require("node:fs/promises");
const { constants } = require("node:fs");
const { spawn } = require("node:child_process");
const { createRequire } = require("node:module");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { parseArgs } = require("node:util");

const help = "node scripts/render.cjs INPUT.html OUTPUT.mp4 [--duration 12 --fps 60 --width 1280 --height 720] [--suite natural|eastern|fantasy|civilizations|original] [--audio path (original only)] [--playwright path --browser path]";

// Pure configuration: testable without importing Playwright or starting a browser.
function exportSettings(input, values = {}) {
  const suite = values.suite ?? "natural";
  const catalog=require("../assets/starter/suite-catalog.js");
  if(!["natural","original",...Object.keys(catalog.definitions)].includes(suite))throw new Error(`Invalid suite: ${suite}. Use natural, eastern, fantasy, civilizations or original.`);
  if(catalog.definitions[suite]?.available===false)throw new Error(`Suite unavailable in this batch: ${suite}`);
  if (/[?#]/.test(input)) throw new Error("INPUT must be a local HTML path without a query or fragment; select the scene with --suite original or --suite natural.");
  if (suite === "natural" && values.audio) throw new Error("Natural exports are silent; --audio is supported only with --suite original.");
  if(suite!=="original"&&values.audio)throw new Error("New suite exports are silent; --audio is supported only with --suite original.");
  const entry = pathToFileURL(path.resolve(input));
  entry.searchParams.set("export", "1");
  entry.searchParams.set("suite", suite);
  return { suite, entry: entry.href, audioFile: values.audio ? path.resolve(values.audio) : null };
}

function positive(value, name, integer) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || (integer && !Number.isInteger(parsed))) {
    throw new Error(`Invalid ${name}: ${value}`);
  }
  return parsed;
}

function getPlaywright(input, override) {
  if (override) return require(path.resolve(override));
  const projectRequire = createRequire(input);
  let dependency;
  try {
    dependency = projectRequire.resolve("playwright");
  } catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") throw error;
    try {
      dependency = require.resolve("playwright");
    } catch (fallback) {
      if (fallback.code !== "MODULE_NOT_FOUND") throw fallback;
      throw new Error("Install Playwright beside the source project or pass --playwright with its package directory.");
    }
  }
  return require(dependency);
}

async function encode(page, output, frameCount, fps, audioFile) {
  const folder = await fs.mkdtemp(path.join(path.dirname(output), ".scene-cube-"));
  const pending = path.join(folder, "frames.mp4");
  const sound = audioFile ? ["-i", audioFile, "-map", "0:v:0", "-map", "1:a:0",
    "-af", "apad", "-t", String(frameCount/fps), "-c:a", "aac", "-b:a", "192k"] : [];
  const ffmpeg = spawn("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-nostdin", "-f", "image2pipe",
    "-framerate", String(fps), "-i", "pipe:0", ...sound, "-c:v", "libx264",
    "-crf", "18", "-preset", "fast", "-pix_fmt", "yuv420p", "-movflags", "+faststart", pending
  ], { stdio:["pipe","ignore","inherit"], windowsHide:true });
  let error;
  ffmpeg.on("error", err => { error = err; });
  ffmpeg.stdin.on("error", () => {});
  const closed = new Promise(resolve => ffmpeg.once("close", resolve));
  try {
    for (let i=0; i<frameCount; i++) {
      await page.evaluate(t => window.renderAt(t), i/fps);
      const frame = await page.screenshot({ type:"png" });
      if (error) throw error;
      await new Promise((resolve,reject) => {
        ffmpeg.stdin.write(frame, failure => failure ? reject(failure) : resolve());
      });
    }
    ffmpeg.stdin.end();
    const code = await closed;
    if (error || code !== 0) throw error || new Error(`FFmpeg exited with code ${code}`);
    await fs.copyFile(pending,output,constants.COPYFILE_EXCL);
  } finally {
    if (ffmpeg.exitCode === null && ffmpeg.signalCode === null && !error) ffmpeg.kill();
    await closed;
    await fs.rm(pending,{force:true});
    await fs.rmdir(folder);
  }
}

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals:true,
    options:{
      help:{type:"boolean"},
      duration:{type:"string"},
      fps:{type:"string",default:"60"},
      width:{type:"string",default:"1280"},
      height:{type:"string",default:"720"},
      suite:{type:"string",default:"natural"},
      audio:{type:"string"},
      playwright:{type:"string"},
      browser:{type:"string"}
    }
  });
  if (values.help) { console.log(help); return; }
  if (positionals.length !== 2) throw new Error(help);
  const [input,output] = positionals.map(file=>path.resolve(file));
  const settings = exportSettings(input, values);
  if (path.extname(output).toLowerCase() !== ".mp4") throw new Error("Output must end in .mp4.");
  const exists=await fs.lstat(output).then(()=>true,err=>{
    if(err.code==="ENOENT") return false;
    throw err;
  });
  if(exists) throw new Error(`Output already exists: ${output}`);
  await fs.access(input,constants.R_OK);
  const audioFile=settings.audioFile;
  if(audioFile)await fs.access(audioFile,constants.R_OK);
  const width=positive(values.width,"width",true), height=positive(values.height,"height",true);
  if(width%2 || height%2) throw new Error("Use even dimensions for yuv420p.");
  const fps=positive(values.fps,"fps",true);
  const { chromium }=getPlaywright(input,values.playwright);
  const executablePath=values.browser ? path.resolve(values.browser) : undefined;
  const browser=await chromium.launch({
    headless:true, executablePath, args:["--enable-unsafe-swiftshader"]
  });
  try {
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    const errors=[];
    page.on("pageerror",err=>errors.push(err.message));
    await page.goto(settings.entry);
    await page.evaluate(async()=>{await window.sceneCube?.ready;});
    const properties=await page.evaluate(()=>({
      clock:typeof window.renderAt,duration:window.sceneCube?.duration
    }));
    if (errors.length) throw new Error(errors[0]);
    if (properties.clock!=="function") throw new Error("The page did not initialize a renderAt(t) function. Check WebGL and the source files.");
    const duration=positive(values.duration??properties.duration,"duration",false);
    const frameCount=Math.ceil(duration*fps-1e-8);
    if (frameCount<1) throw new Error("Duration must cover at least one frame.");
    await encode(page,output,frameCount,fps,audioFile);
    console.log(`${output} · ${width} × ${height} · ${frameCount} frames at ${fps} fps`);
  } finally {
    await browser.close();
  }
}

module.exports = { exportSettings };

if (require.main === module) main().catch(error=>{
  console.error(error.message);
  process.exitCode=1;
});
