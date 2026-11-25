"use strict";

const { createHash } = require("node:crypto");
const fs = require("node:fs/promises");
const { homedir } = require("node:os");
const path = require("node:path");
const { parseArgs } = require("node:util");

const repo = path.resolve(__dirname, "..");
const skill = path.join(repo, "scene-cube");
const starter = path.join(skill, "assets", "starter");
const help = `World Cube

  node scripts/world-cube.cjs deploy [--out PATH]
  node scripts/world-cube.cjs install [--project PATH | --user]

deploy  Copies the portable static demo to dist/ by default and prints the local entry.
install Copies the Skill to .agents/skills/scene-cube under the project (default: current directory)
        or your home directory with --user.

Both commands reuse identical output. For a different existing destination, choose a fresh path.`;

async function inventory(dir) {
  const files = new Map();
  async function scan(relative) {
    const entries = await fs.readdir(path.join(dir, relative), { withFileTypes: true });
    for (const entry of entries) {
      const name = path.join(relative, entry.name);
      if (entry.isDirectory()) {
        await scan(name);
      } else if (entry.isFile()) {
        const contents = await fs.readFile(path.join(dir, name));
        files.set(name, createHash("sha256").update(contents).digest("hex"));
      } else {
        throw Error(`Expected a regular file or directory: ${path.join(dir, name)}`);
      }
    }
  }
  await scan("");
  return files;
}

function sameFiles(a, b) {
  return a.size === b.size && [...a].every(([name, hash]) => b.get(name) === hash);
}

async function existingMatch(directory, expected) {
  const stat = await fs.lstat(directory).catch(error => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  if (!stat) return false;
  if (stat.isDirectory() && sameFiles(await inventory(directory), expected)) return true;
  throw Error(`Destination already exists with different contents: ${directory}\nChoose a fresh destination.`);
}

async function resolveDestination(directory) {
  try {
    return await fs.realpath(directory);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const parent = path.dirname(directory);
    if (directory === parent) throw error;
    return path.join(await resolveDestination(parent), path.basename(directory));
  }
}

async function publishTree(source, requested, entry, expected) {
  const parent = await resolveDestination(path.dirname(requested));
  const directory = path.join(parent, path.basename(requested));
  const relative = path.relative(await fs.realpath(source), directory);
  if (!relative || (!path.isAbsolute(relative) && relative.split(path.sep)[0] !== "..")) {
    throw Error(`Destination must be outside the source tree: ${directory}`);
  }
  if (await existingMatch(directory, expected)) {
    return { status: "unchanged", directory, entry: path.join(directory, entry) };
  }

  await fs.mkdir(parent, { recursive: true });
  const staging = await fs.mkdtemp(path.join(parent, ".world-cube-"));
  const content = path.join(staging, "content");
  try {
    await fs.cp(source, content, { recursive: true, force: false, errorOnExist: true });
    if (!sameFiles(await inventory(content), expected)) throw Error("The source changed during copying. Run the command again.");
    try {
      await fs.rename(content, directory);
    } catch (error) {
      if (await existingMatch(directory, expected)) {
        return { status: "unchanged", directory, entry: path.join(directory, entry) };
      }
      throw error;
    }
    return { status: "created", directory, entry: path.join(directory, entry) };
  } finally {
    await fs.rm(staging, { recursive: true, force: true });
  }
}

async function main() {
  const [command = "deploy", ...args] = process.argv.slice(2);
  if (command === "--help" || command === "-h") {
    console.log(help);
    return;
  }
  if (command === "deploy") {
    const { values } = parseArgs({ args, options: { out: { type: "string" } } });
    const expected = await inventory(starter);
    const html = await fs.readFile(path.join(starter, "index.html"), "utf8");
    for (const [, file] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
      if (!expected.has(path.normalize(file))) throw Error(`Missing starter resource: ${file}`);
    }
    // HTML does not list the lazy suite scripts: validate their manifest too.
    const catalog=require(path.join(starter,"suite-catalog.js"));
    for(const def of Object.values(catalog.definitions))if(def.available)for(const file of def.files){
      if(path.basename(file)!==file||!expected.has(file))throw Error(`Missing suite resource: ${file}`);
    }
    const directory = values.out ? path.resolve(values.out) : path.join(repo, "dist");
    console.log(JSON.stringify(await publishTree(starter, directory, "index.html", expected)));
    return;
  }
  if (command === "install") {
    const { values } = parseArgs({ args, options: { project: { type: "string" }, user: { type: "boolean" } } });
    if (values.user && values.project) throw Error("Choose either --project or --user.");
    const root = await fs.realpath(values.user ? homedir() : path.resolve(values.project || "."));
    const directory = path.join(root, ".agents", "skills", "scene-cube");
    const expected = await inventory(skill);
    if (!expected.has("SKILL.md")) throw Error("The skill is missing SKILL.md.");
    console.log(JSON.stringify(await publishTree(skill, directory, "SKILL.md", expected)));
    return;
  }
  throw Error(`Unknown command: ${command}\n\n${help}`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
