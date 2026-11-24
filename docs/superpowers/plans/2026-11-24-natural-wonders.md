# Natural Wonders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Add six original procedural habitats with whole-suite switching while preserving the original cube.

**Architecture:** GroundNatural owns signed surface sampling, local-height modeling and time-derived living meshes. CubeHabitats registers two suites and dispatches unique IDs; cube.js switches its mutable face atlas in place, resets interaction state, and selects separate camera/cue tables. The existing renderer, state, original habitat geometry and export copier remain unchanged.

**Tech Stack:** Node.js 22.x, dependency-free JavaScript, existing WebGL/canvas renderer, node:test.

## Global Constraints
- Spec: docs/superpowers/specs/2026-11-24-natural-wonders-design.md at 0c753f72925cd82fda181a0d3043aca740aad201; approved by user after document was written.
- Existing fourteen assertions remain unchanged; CubeHabitats.scenes remains original six.
- New IDs: snow, oasis, bamboo, firefly, volcano, island. All geometry 0 ≤ h < 1.45, ground contact < .065, highest point > .85.
- No Math.random, external assets, new dependencies, game rules, backend, audio, real-person names, license changes, cloud agents, deployment, push, merge or commits in this phase.
- Natural default; ?suite=original selects original before first frame; invalid values select natural. Export defaults natural and stays silent.
- Static meshes ignore t and caches remain isolated by ID. Animals animate outside static. Per-ID triangle sum (static0 + active0 + active5) ≤ original max × 1.5, measured in same run.
- Suite switch cancels turn/camera/pointer, clears undo and close view, resets solved cube and t=0 paused, target initial camera. Reset preserves suite.
- Buttons in inspector document flow; mobile stage min(110vw,510px), 60px header, existing controls remain below stage.

## File responsibilities
- Create scene-cube/assets/starter/ground-natural.js: surface(id,x,y), draw(id,b,t), animal pose helpers used for contact checks; six authored worlds, shared compact geometry helpers.
- Modify cube-habitats.js: suites registry, backwards-compatible model dispatch, canonical static time zero.
- Modify ground-surfaces.js: six palette branches sampling GroundNatural.surface, originals unchanged.
- Modify cube.js: suite selection/reset, independent natural camera and cue tables, rebuild thumbnails, expose inspect diagnostics for acceptance.
- Modify index.html/styles.css: script load ordering and accessible in-flow suite controls.
- Create scene-cube/tests/natural-wonders.test.cjs: model contracts, determinism, seams, caches, animals, triangle budget, source/export dependencies.
- Create scene-cube/tests/suite-controls.test.cjs: dependency-free DOM/renderer test harness for actual controller execution, no browser automation.

### Task 1: Establish failing model and integration contracts
- [x] Write node:test assertions for registry: `assert.equal(art.suites.original.scenes,art.scenes)` and natural IDs, and `art.model(id,t,pass)` geometry checks copied in spirit (not weakening original tests).
- [x] Check seam samples on both axes and raised specified landmarks; test t=.36 → 2.81 → .36 seek, static first requested at nonzero time, original cache signatures before/after natural generation.
- [x] Measure triangles using `tiles.flat().reduce((s,p)=>s+p.points.length-2,0)` across required channels; assert against same-run original maximum.
- [x] Run `node --test scene-cube/tests/natural-wonders.test.cjs`; expect registry absent assertion failure before implementation.

### Task 2: Author six grounded worlds
- [x] Implement `GroundNatural.surface(id,x,y)` with positive land/negative water or lava; consistent coordinates from spec. Implement compact faceted mounds, polygon rings, leaves, ripple strips and deterministic scatter.
- [x] Snow: sloping mountain ridge with snow caps, cabin at (-.55,.15) crossing -.5, warm turquoise pool (.15,-.35), stone ring; steam and snow.
- [x] Oasis: crescent dunes around (.2,-.55), rooted palms including (.55,-.25), articulated camel walks y=-.15, low drifting sand.
- [x] Bamboo: sinuous shared river, stepped stone arch bridge crossing .5, bamboo with nodes and root flares, black/white grounded panda, moving tips and drifting leaves.
- [x] Firefly: shallow open water, raised rooted reeds, diagonal cross-seam hollow log, frog jumps water→log with contact height and landing ripple, closed-path fireflies.
- [x] Volcano: faceted open crater at (0,.25), basalt peak at (-.75,.55), shared lava channel crossing y=-.5, time-varying streaks, upward sparks/smoke.
- [x] Island: grass platform ellipse and tapered rocky belly to ground, timber windmill at (.45,.35), rotor .55 with tips below 1.45, waterfall to rock ≥.05, low drifting clouds.
- [x] Register `suites.original={scenes,atlasOf}` and natural counterpart, preserving original list and model API. Use unique ID dispatch and canonical time 0 for fixed draw.
- [x] Add natural surface palettes to ground-surfaces.js without altering original formulas; load ground-natural.js before surfaces.
- [x] Run model tests; fix geometry until height/seam/contact/determinism/budget pass. Inspect real diagnostic triangle counts, not invented performance claims.

### Task 3: Suite-aware controller and cameras (test first)
- [x] Write actual-controller VM harness with fake DOM/WebGL boundary; test default/invalid/original URLs, switch mid-turn and camera animation, reset/undo/close/timeline semantics, thumbnail labels, no-WebGL disables buttons.
- [x] Run `node --test scene-cube/tests/suite-controls.test.cjs`; expect missing suite controls/inspection state failures.
- [x] Initialize suite before renderer and mutate same atlas object on switch. Rebuild scene map and thumbnail elements, invalidate inspector text, cancel RAF and pointer, then reset to t=0/manual and schedule living motion.
- [x] Keep original shots and beat cue strings untouched; add natural tables using same six move times. Include six habitat portraits, four contact shots altitude ≤32°, wide endpoints and moving-ground views at turn midpoints.
- [x] Add in-flow two-button group before intro, update aria-pressed, disable on WebGL fallback, retain existing responsive layout.
- [x] Expose readonly inspect suite/view/history/playing/close fields for test and parent manual verification; no extra UI interactions.
- [x] Run controller and all original tests.

### Task 4: Verify and hand off local preview
- [x] Run `node --test` (expect all old + new passing); `node --check` for changed JS.
- [x] Run `node scripts/world-cube.cjs deploy`; expect created dist/index.html; verify all scripts copied and second identical build unchanged.
- [x] Run `git diff --check` and verify untouched original geometry/state/renderer, licenses and original shots/cues.
- [x] Start `python3 -u -m http.server 8765 --bind 0.0.0.0 --directory dist` in background; read output once. Parent performs real desktop/mobile touch and visual/performance acceptance, not this worker.
- [x] Return URL, checkout/branch, tests, triangle counts, pending visual checks and exact controls. Leave files uncommitted, no push/deploy.

## Plan self-review
Spec coverage: all six landmarks, shared surfaces, static/living split, original preservation, reset semantics, URLs/export, responsive buttons, geometry evidence and browser handoff mapped to tasks 1–4. Integration signatures are surface(id,x,y)→number, draw(id,b,t)→void, suites[key].scenes→scene[], suites[key].atlasOf→face/id object. No hidden dependencies or omitted build-resource copying. Browser screenshots and actual frame intervals are explicitly pending parent acceptance, not Node claims. User already selected inline local execution; no further approval gate.


## Execution result (2026-11-24, Asia/Shanghai)
- Baseline: 14 tests passed before any implementation.
- Red/green observed for missing suite registry/model module, missing controller suite state/reset, frog support height/rotor clearance, and opaque steam.
- Final Node run: 49 tests, 49 passed, 0 failed, 0 skipped. Existing 14 tests and assertions unchanged.
- Build: first `node scripts/world-cube.cjs deploy` returned `created`, second `unchanged`, entry `/workspace/world-cube-natural/dist/index.html`.
- Syntax checks and `git diff --check` passed. Source comparison confirmed original three geometry modules, cube-state.js, habitat-renderer.js, original beats/shots and both licenses byte-identical to base.
- Local HTTP server now serves port 8766 on 0.0.0.0, actual PID 831003, stdout/stderr redirected to /workspace/world-cube-natural-notes/http-preview.log. Original 8765 service was reproduced returning empty replies and terminated. Two separate 30-request GET/HEAD batches (root, original query, CSS, controller JS, natural JS) returned 200; service remained healthy across tool calls and full tests.
- Geometry triangle totals (static0 + active0 + active5): snow 2525, oasis 4179, bamboo 8169, firefly 6263, volcano 4402, island 5820. Same-run original max 25726; limit 38589.
- Self-review found and corrected windmill/grass clearance: grass at .30, rotor axis .87, blade length .55, tests sample full rotation. Frog now contacts water at start and log at landing; steam fades by altitude/phase.
- No commits, push, merge, cloud-agent invocation, browser-driving script or Vercel deployment performed.
- Parent handoff is the next gate: actual six-face screenshots/animation quality, console/WebGL, desktop drag/orbit/undo, 390×844 touch/layout, suite reset, and matched-path 1280×800 frame-interval medians. These are NOT claimed as verified here. Parent should also independently code-review the uncommitted diff against base 0c753f72925cd82fda181a0d3043aca740aad201 before publishing.


## Review follow-up: export chain
- Verified review finding: old production command combined default-natural rendering with original foley; CLI previously had no suite option and treated query suffixes as filenames.
- Added pure exportSettings(input, values), `--suite natural|original`, explicit suite URL propagation, and original-only `--audio`. Natural exports reject audio rather than silently mixing it.
- Export CLI is safe to require for configuration tests; actual browser/encoding path remains behind main-module guard. No browser was launched by this worker.
- New five tests first failed, then passed: natural silent URL default; original URL and audio; invalid suite/query filename/audio mismatch; CLI help and pre-browser validation; production example contracts.
- Updated production.md and README with separate natural-silent and original-audio commands. Renamed the controller export-default test so it no longer claims to test silence.
- `node --test`: 35/35, log /workspace/world-cube-natural-notes/tests-after-export.tap. Syntax checks, diff check and two unchanged static builds passed. No scene code changed during this follow-up.


## Browser-review follow-up: natural portrait composition
- Read both supplied screenshots. Reproduced clipped shell numerically using the UNCHANGED HabitatRenderer.getCamera(): with stage 856×626, old natural thumbnail shell bottom was y=728.6–743.9 (102.6–117.9px overflow); stage 360×429 gave 24.5–33.3px overflow. The 1.43 outward focus moves the projected cube down, while fixed zoom 1.21 never accounts for the full shell and neighboring habitat extents.
- Added habitat-framing.js: caches per-habitat, per-cell fixed/living height envelopes; transforms them through current CubeState ground frames (including mixed states); centers against actual perspective-projected bounds and fits zoom to the real stage with margin. It does not enlarge the canvas or change the renderer/lens. Repeated fitting is idempotent; resize can recover available zoom.
- Only natural normal thumbnail portraits use this fit. Original normal/low/demo cameras, natural close-up camera contract, original geometry, natural geometry, state and renderer remain unchanged. Natural inspector subject is explicit after selecting a portrait, because geometric centering must not accidentally change the selected habitat label to a neighboring face.
- Selected natural portrait angles improve subject visibility without rebuilding scenery. A ray/triangle regression for the actual oasis camera requires ≥90% of 80 sampled camel body/head/feet lines along its route to avoid static foreground obstruction. Additional local diagnostic calculations (not browser screenshots) found the new waterfall view mostly unobstructed, while frog remains a small detail and needs actual visual re-review.
- TDD observed missing framing module and real controller shell clipping, then green; separate regression caught accumulating resize zoom loss, fixed; camel route occlusion test failed 66/80 before the clearer natural camera, then passed.
- Added frame-sampler.js and opt-in ?diagnostics=1 output in inspector document flow. It observes the existing refresh callbacks; computes actual median/P90; starts a new batch on reset, suite or viewport/stage change; pauses continuity across hidden tabs. No automatic UI-driving events or synthetic benchmark frames. Unit timestamp tests are NOT browser performance measurements.
- Final `node --test`: 44 passed, 0 failed; /workspace/world-cube-natural-notes/tests-after-framing.tap. JS syntax and git diff --check passed. Fresh staged build created successfully, swapped into dist preserving old preview at /workspace/world-cube-natural-notes/preview-before-framing-x054jp60/dist, then two normal builds returned unchanged.
- Server PID 831003 and port 8766 preserved. 60/60 later GET/HEAD requests for both suite entries and every static resource returned 200, including the two new modules. Numeric projected shell bounds saved in /workspace/world-cube-natural-notes/framing-projection-results.json.
- Parent next: hard reload http://127.0.0.1:8766/?rev=framing-2; screenshot all six selected normal views at 1280×800 and 390×844, assess camel/waterfall/frog-ripple/steam readability. Repeat interaction checks. For frame median, use ?diagnostics=1&rev=framing-2 and equal 1280×800 paths/sample counts (≥600); compare natural to original. Actual performance remains unmeasured here. Touch remains unverified because the available computerUse context does not provide hasTouch; mouse is not a substitute. No commit/push/deploy/browser automation performed.


## Review follow-up: resize/animation lifecycle race (framing-3)
- Root cause reproduced in the actual-controller VM: ResizeObserver discarded events when cameraMove or animation was active. Their completion paths never requested another fit, so the pre-resize camera goal survived until an unrelated later resize.
- Added a single pendingFit boolean. Eligible natural normal-view resizes coalesce; drawManual consumes the flag only after cameraMove AND animation are both clear, after turn commit and before painting. No per-frame fit is performed. New look/reset/suite/demo/close-up transitions clear obsolete requests.
- Red/green: camera-transition resize, layer-turn resize and overlapping animations first failed because expected one follow-up fit was absent; all now pass. Tests assert latest-size shell projection and fit-call counts, then run extra RAFs to prove no repeated fitting. Separate checks preserve original/close-up cameras and prevent requests leaking across suite/demo reset.
- Added a cache regression proving repeated selection/resize/mixed-state point queries do not regenerate sampled model envelopes. No speculative performance rewrite was made.
- Documentation now explicitly states: fixed geometry plus 10 sampled living poses and .05 height margin is NOT an analytic all-time bound; viewport/state/time tests do not prove every animation instant. First natural selection synchronously evaluates 6×10 living models once, so cold-start pause remains possible and requires browser measurement. Subsequent envelopes use existing per-art/per-id WeakMap caching.
- Full node --test: 49 passed, 0 failed. Log /workspace/world-cube-natural-notes/tests-after-resize-race.tap. Changed JS/tests syntax and git diff --check passed.
- Build to /workspace/world-cube-natural-preview-framing-3: created, then unchanged. This isolated output is served via a LOCAL-ONLY generated symlink dist/framing-3. Root dist remains framing-2 to avoid changing resources under the browser worker's in-flight visual/performance run. Do not package that temporary dist for release; final release must rebuild from current starter source into a clean/fresh output.
- New preview URL: http://127.0.0.1:8766/framing-3/?rev=framing-3 ; diagnostics append &diagnostics=1. Existing http://127.0.0.1:8766/ remains framing-2. Actual server PID 831003 unchanged. All 60 repeated GET/HEAD probes for the new page, original query and its linked resources returned 200.
- HTTP resource hashes verified: framing-3 cube.js equals current source (c81e7919b0ead1cbe1561a212789c112de28fa5f15c5a5bfeb054717766fc286), root framing-2 remains 97a433979527afff35530713ff5d22baedd4c409638ae0031c6b697212d456a9.
- No browser/CloudAgent/commit/push/deployment. Parent should rerun the supplied resize-during-animation repro at the isolated framing-3 URL; current browser performance/visual results remain parent-owned and touch remains unverified.


## Initial playable release acceptance / publication preparation
- Parent relayed independent reviewer result: 49/49 tests, no outstanding Critical/Important, resize lifecycle fix clear.
- Parent relayed actual browser acceptance: 1280×800 desktop and 390×844 layouts, all six natural normal-view compositions complete; desktop drag-layer/undo/suite reset working. Matched-path RAF medians natural 49.9ms / original 83.3ms = 0.599, within 1.5× goal. These are local samples, not universal or production guarantees.
- Known visual limitation retained for initial playable release: some steam, waterfall, frog jump, ripple and camel walking motion could not be clearly distinguished in browser observation. No further speculative scene rewrite is included.
- Touch remains untested; mobile layout does not imply touch verification. Manual testing did not precisely hit resize-during-animation timing; independent automated lifecycle regressions cover those paths, not a claim of manual timing validation.
- Full scene/interaction source is the release input. Local dist contains framing-2 and a framing-3 preview symlink; release must build cleanly from Git source with `rm -rf dist && node scripts/world-cube.cjs deploy`, never upload that temporary dist.
- Git fetch of existing PR branch completed successfully; at preparation time HEAD and origin/cursor/vercel-static-deploy-5955 were identical (0/0 divergence), base 0c753f72925cd82fda181a0d3043aca740aad201. No main changes or merge planned.
- Publication identity check found no configured Git author identity in this checkout. No personal identity was substituted and no commit/push/deployment has been performed pending a safe configured generic identity.

- Publication unblocked: user explicitly authorized the repository-scoped/single-command generic Git identity 世界魔方 <world-cube@localhost>. No personal identity is used. Ordinary commit and fast-forward push only; production will build from that Git commit.
