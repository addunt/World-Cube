"use strict";

const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const fs = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { promisify } = require("node:util");

const run = promisify(execFile);
const repo = path.join(__dirname, "..");
const cli = path.join(repo, "scripts", "world-cube.cjs");

async function tempDir(t) {
  const dir = await fs.mkdtemp(path.join(await fs.realpath(tmpdir()), "world-cube-test-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return dir;
}

async function command(cwd, ...args) {
  const { stdout } = await run(process.execPath, [cli, ...args], { cwd });
  return JSON.parse(stdout);
}

test("deploy exports an offline entry and all its resources, then preserves local edits", async t => {
  const temp = await tempDir(t);
  const output = path.join(temp, "portable demo", "site");
  const first = await command(temp, "deploy", "--out", output);
  assert.equal(first.status, "created");
  assert.equal(first.entry, path.join(output, "index.html"));
  const html = await fs.readFile(first.entry, "utf8");
  assert.match(html, /<canvas id="world"/);
  const hits = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)];
  assert.ok(hits.length > 4);
  for (const [, file] of hits) {
    assert.deepEqual(await fs.readFile(path.join(output, file)),
      await fs.readFile(path.join(repo, "scene-cube", "assets", "starter", file)));
  }
  assert.equal((await command(temp, "deploy", "--out", output)).status, "unchanged");
  await fs.writeFile(first.entry, "my local copy");
  await assert.rejects(command(temp, "deploy", "--out", output), /Destination already exists/);
  assert.equal(await fs.readFile(first.entry, "utf8"), "my local copy");
});

test("install writes a complete skill into the chosen project's discovery directory", async t => {
  const temp = await tempDir(t);
  const project = path.join(temp, "another project");
  await fs.mkdir(project);
  const result = await command(temp, "install", "--project", project);
  const installDir = path.join(project, ".agents", "skills", "scene-cube");
  assert.equal(result.entry, path.join(installDir, "SKILL.md"));
  assert.match(await fs.readFile(result.entry, "utf8"), /name: scene-cube/);
  await fs.access(path.join(installDir, "agents", "openai.yaml"));
  await fs.access(path.join(installDir, "assets", "starter", "index.html"));
  assert.equal((await command(temp, "install", "--project", project)).status, "unchanged");
  await assert.rejects(command(temp, "install", "--project", project, "--user"), /Choose either/);
});

test("vercel publishes the same offline demo with no dependencies", async () => {
  const config = JSON.parse(await fs.readFile(path.join(repo, "vercel.json"), "utf8"));
  const pkg = JSON.parse(await fs.readFile(path.join(repo, "package.json"), "utf8"));
  assert.equal(config.framework, null);
  assert.equal(config.installCommand, "");
  assert.equal(config.buildCommand, "rm -rf dist && node scripts/world-cube.cjs deploy");
  assert.equal(config.outputDirectory, "dist");
  assert.equal(pkg.private, true);
  assert.equal(pkg.engines.node, "22.x");
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.devDependencies, undefined);
  assert.equal(await fs.readFile(path.join(repo, "LICENSE"), "utf8").then(text => text.includes("MIT License")), true);
});

test("a destination nested inside the starter leaves the source untouched", async () => {
  const pathInsideStarter = path.join(repo, "scene-cube", "assets", "starter", "uncreated", "nested");
  await assert.rejects(command(repo, "deploy", "--out", pathInsideStarter), /outside the source tree/);
  await assert.rejects(fs.lstat(path.dirname(pathInsideStarter)), { code: "ENOENT" });
});
