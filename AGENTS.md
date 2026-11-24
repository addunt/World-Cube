# Working with World Cube

## Deploy the local demo

Run `node scripts/world-cube.cjs deploy` from the repository root with Node.js 22 or later. This stages the complete offline WebGL demo in `dist/`. No dependency installation or build server is needed. The command prints JSON with `status`, `directory` and `entry`. Report the absolute path in `entry` so the user can open it in a WebGL browser.

An identical redeployment succeeds without copying. If an existing output differs, preserve it and use `--out` with a new directory. Run `node --test` to verify the CLI and cube model.

## Host the same demo on Vercel

`vercel.json` publishes that export without a framework or npm dependencies. The install command is empty, the build command is `rm -rf dist && node scripts/world-cube.cjs deploy`, and the output directory is `dist`. `package.json` only pins Node.js `22.x`. Do not add a bundler or change the starter, the scenes, or the MIT license.

## Install the Codex Skill

Run `node scripts/world-cube.cjs install --project PATH` against the project where the user wants to use `$scene-cube`. The command copies the skill into that project's `.agents/skills/scene-cube/`. Use `--user` for all-project installation when the user asks for it. Report the returned `SKILL.md` path.
