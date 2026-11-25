# Eastern Landscapes — First Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add the approved six Eastern Landscapes as a lazy-loaded, genuinely playable third suite while preserving the production natural/original suites.

**Architecture:** Keep the renderer/state and original model modules untouched. A small suite catalog supplies available metadata, URL resolution and ordered classic-script loading; CubeHabitats keeps its synchronous model interface after readiness. Eastern terrain/kinematics and Eastern geometry are separate lazy modules, with conservative per-cell bounds consumed by the existing framing mechanism.

**Tech Stack:** Dependency-free classic JavaScript, existing WebGL renderer, Node 22+ built-in test runner, portable static build and file-logged Python HTTP preview. No browser automation in this executor.

## Global Constraints
- Approved specs: the three `docs/superpowers/specs/2026-11-24-*-design.md` files and the review artifact under `/workspace/world-cube-natural-notes`.
- Explicit local override: work in the existing `/workspace/world-cube-natural` checkout, branch `local/natural-wonders`, base `ac4bd93`; preserve all three uncommitted user-approved specs.
- User approval 2026-11-24 22:43 Asia/Shanghai supersedes the specs' historical review-only status, but does NOT authorize commit, push or deployment in this batch.
- Only Eastern is implemented now. Catalog reserves fantasy/civilizations but marks them unavailable, hides their controls and rejects their CLI exports. An unavailable direct URL reports the reason and shows natural, never a counterfeit playable suite. This staged availability is the latest explicit user instruction.
- Preserve all 49 baseline assertions; original geometry/state/renderer/camera, natural geometry and both MIT files remain byte-identical to HEAD.
- All six scenes: nine clipped cells, finite convex geometry, 0≤height<1.45, high point>.85, five height levels, high landmark seams, deterministic reversible motion, two distinct large visible actions.
- No external model/image/audio, random clocks, new engine/backend/game targets, personal names/emails/secrets, CloudAgent or browser driving.
- Geometry: post-partition n−2 triangles, S0+A0+A5≤same-run original max×1.5; sampled active peak 0–42s step .1 plus key phases≤same-run original peak×1.5.
- Real browser composition/motion/occlusion/touch and matched-path RAF median/P90 remain parent acceptance work, never inferred from Node timing.

## Files and interfaces
- New `scene-cube/assets/starter/suite-catalog.js`: metadata, `create(legacy)`, `resolve(search,suites)`, `load(key,suites,root)`; available keys natural/eastern/original; classic script dependencies deduplicated and retryable.
- New `eastern-world.js`: `GroundEasternWorld.surface/height/motion/bounds`; whole-face coordinates, explicit seconds, shared shoreline/contact and analytic conservative cell bounds.
- New `ground-eastern.js`: `GroundEastern.draw(id,b,t)`, using the world contract and existing primitives only; fixed and living passes separated.
- Update `cube-habitats.js`: expose catalog/ensureSuite/isReady/bounds and exact synchronous model dispatch; keep legacy list references.
- Update `ground-surfaces.js`: provider branch for eastern palette/shoreline; legacy formulas unchanged.
- Update `habitat-framing.js`: optional declared bounds and selected-face bounds for new close views, without changing the fallback sampled natural envelopes.
- Update `cube.js`: readiness bootstrap, atomic guarded suite switch, metadata cameras and Eastern cues/shots, fit lifecycle, unknown/unavailable notices, read-only loading state/ready promise.
- Update `index.html/styles.css`: third available suite and loading notice in normal inspector flow, touch-sized wrapping controls, lazy assets NOT eager script tags.
- Update `render.cjs` and `scripts/world-cube.cjs`: available suite CLI/ready wait and manifest dependency validation.
- Tests: new catalog, Eastern model/framing/controller/export/asset tests; existing controller harness may gain platform fakes/dependency loading only, never weaker assertions.

### Task 1: Catalog, URL and lazy model dispatch
- [x] Write `scene-cube/tests/suite-catalog.test.cjs` first. Assert available keys, reserved suites hidden, URL first-value/default/error notice, unloaded model refusal, unknown ID refusal, load de-duplication, ordered dependencies, failed-load retry and unchanged legacy lists.
```js
assert.equal(art.resolveSuite('?suite=eastern').suite,'eastern');
assert.equal(art.resolveSuite('?suite=fantasy').suite,'natural');
assert.throws(()=>art.model('eastern_waterlane',0,true),/not ready/);
```
- [x] Run `node --test scene-cube/tests/suite-catalog.test.cjs`; verify failure is missing catalog behavior.
- [x] Implement the catalog and CubeHabitats seams with root providers and explicit availability. Loader accepts only manifest-owned local file names, removes failed promises, verifies provider after scripts load. Successful script promises stay cached.
- [x] Re-run targeted tests and all baseline tests; record real output. Do not commit.

### Task 2: Eastern terrain and six independent model compositions
- [x] Write `scene-cube/tests/eastern-landscapes.test.cjs` before model files. Cover the six exact IDs, nine nonempty cells, height/finite/convex/area/seams, deterministic nonzero-time static, reverse seek, motion A/B and actual animated mesh correspondence, contact/water paths, conservative bounds and fixed budgets.
```js
assert.deepEqual(art.model(id,.36,false),art.model(id,.36,false));
assert.notDeepEqual(art.model(id,.36,false),art.model(id,2.81,false));
assert.deepEqual(art.model(id,17,true),art.model(id,0,true));
```
- [x] Run target and confirm missing world/model failure.
- [x] Implement world surface/height/motion with the approved curve parameters and positive-mod periodic time; expose production kinematics consumed by drawing, not independent test-only replicas.
- [x] Implement fixed geometry: river houses/arch bridge; stepped terraces/stilt village; snowy temple/open bell pavilion; segmented karst towers; rolling tea rows/stone road; coastal cliff/double pavilion. Use triangulated terrain, faceted roof geometry and support connections, not old scene recolors.
- [x] Implement living pairs from spec: boat/flag; wheel/channel ribbons; bell/banner; raft/net; porter/tea shoots; sailboat/foam ridges. Draw connected actor subordinate parts under the same transforms. Fixed bounds include all these extremes without model sampling at first fit.
- [x] Add Eastern palette provider sharing its surface/height. Run model tests and diagnostic triangle/peak sampler against same-run originals. If over budget reduce repeated decorative geometry, not the two core motions.

### Task 3: Controller and fit readiness lifecycle
- [x] Add failing controller tests for direct Eastern startup before first paint, loading error recovery, repeated selection, last-request-wins, reset/cancel, playback/turn/close/pointer interruption, URL preservation, unavailable controls and no-WebGL behavior.
- [x] Add failing projection tests with actual renderer camera at desktop 856×626 stage and mobile 356.8×429 stage: all six normal views contain real geometry in solved/mixed states; new close views contain selected landmarks; A/B kinematic endpoints have measurable projected size/displacement in at least one prescribed view. These are mathematical evidence, not browser acceptance.
- [x] Add resize tests for camera/turn/overlap during Eastern selection, repeated resize and bounds call counts. Natural/original assertions must remain unchanged.
- [x] Implement bootstrap that publishes `sceneCube.ready`, waits only for unloaded requested suites, and initializes renderer only after readiness; old ready suites retain synchronous startup.
- [x] Implement atomic suite commit and monotonically increasing selection token; cancel old inputs and frames during load, keep old atlas until success, reject stale completions, recover a clean paused current suite on error, update history only on success.
- [x] Generalize normal fit eligibility to new suite metadata, preserve original/natural close behavior, consume Eastern declared bounds and new close-view fit. Pending resize is consumed once after BOTH camera and layer animations finish, never every frame.
- [x] Add Eastern 19.2-second shots/cues with the same physical six beats; preserve both old arrays. Add third in-flow menu button and status. Re-run target and baseline tests.

### Task 4: Export/build and full verification
- [x] Add failing pure CLI tests: Eastern URL, no audio, unavailable suites rejected before browser, explicit original audio unchanged. Add source/resource tests for ready wait and all catalog dependencies.
- [x] Implement CLI catalog validation, awaited ready before renderAt and manifest-owned static dependency checks. Do not run Playwright or export a movie here.
- [x] Run `node --test`; run `node --check` on every changed JS/CJS; `git diff --check`; byte-compare protected files against HEAD; scoped non-disclosing secret/privacy scan.
- [x] Build to fresh `/workspace/world-cube-eastern-preview` using `node scripts/world-cube.cjs deploy --out ...`, leaving old dist/service untouched. Serve via independent detached process with file stdin/stdout/stderr and actual PID receipt; curl every linked and lazy dependency with repeated GET/HEAD across separate tool calls.
- [x] Update this plan with actual test/geometry/build results and explicit browser/touch/performance NOT TESTED. Provide parent URL/PID/logs, six view/action times and exact changed files, then STOP before fantasy/civilizations and all publication.

## Plan self-review
Coverage: registration/URL/availability/load races→1/3; terrain/geometry/determinism/contact/static/seams/budgets→2; fit/cache/resize/mobile/reset/old compatibility→3; CLI/assets/silent configuration/build/preview→4; actual browser/occlusion/touch/RAF/encoded audio streams remain explicit external acceptance, not fabricated unit claims. No unresolved interface placeholders. The only staged deviation from all-five playable is explicit user-approved unavailable handling. No commit steps are authorized.

## Execution record
- Initial inspection: HEAD ac4bd93, only three untracked approved specs; existing PID831003 listens on8766. Baseline `node --test` exit0; TAP saved under notes/eastern-baseline.tap. Existing service HEAD request succeeds. No installation needed (built-ins only).

## First-batch local verification / handoff (2026-11-24 23:10 Asia/Shanghai)
- Implemented first batch only. All task checkboxes record local implementation/verification, **not** real-browser acceptance or authorization to implement the next suites.
- Baseline 49/49 retained. Fresh `node --test`: **75 tests, 75 pass, 0 fail**, exit0, 20201.033232ms; exact TAP: `/workspace/world-cube-natural-notes/eastern-final-75.tap`.
- TDD red/green evidence includes missing catalog/model/controller/export behavior; actual mesh projection and representative ray checks; cloth phase; failed-provider retry; desktop menu wrapping; inherited-property URL rejection. Logs remain under the notes directory.
- Changed/new JS/CJS `node --check` and `git diff --check`: exit0. Scoped source privacy scan found no new personal identity or credential pattern. Nine protected sources/licenses byte-identical to HEAD; all three approved spec bytes equal the original review ZIP. No credential files accessed.
- Same-run post-partition n−2 triangles: original maximum S0+A0+A5=25726, cap38589; original sampled active peak8031, cap12046.5. Active peak is sampled t0–42 step.1 plus critical phases, **not an all-real-time proof**.

| Scene | S0+A0+A5 triangles | sampled active peak |
|---|---:|---:|
| eastern_waterlane | 1958 | 142 |
| eastern_terraces | 3338 | 460 |
| eastern_zentemple | 1824 | 64 |
| eastern_li_river | 1705 | 563 |
| eastern_tea_trail | 4766 | 326 |
| eastern_seacliff | 1564 | 74 |

- Mathematical frame tests use actual camera projection at representative 1280×800 /390×844 stage dimensions and narrow resized stages, solved/mixed states, finite physical turn samples and motion samples. Declared bounds avoid cold model generation for Eastern fit. Demo envelope uses finite turn-angle samples; no assertion of exhaustive all-time projection proof.
- Actual material meshes have best prescribed-view extents≥12 CSS pixels; representative static ray visibility is≥.75 over24 phases (boat19/24, bell18/24). These are selected feature rays, **not complete silhouette/occlusion or human recognition evidence**. Full browser twelve-action visibility remains untested.
- Concrete spec-number conflicts resolved minimally: terrace stilt floor .62 would be buried beneath the local .73 terrace, so floor=.84 while roof stays1.28; right karst center/radius changed from nominal(.95,.85)/.39 to(.84,.85)/.58 to actually cross x=.5 after faceting, with matching canonical foothill shore masks; waterlane close azimuth18° rather than26° after representative boat visibility improved17/24→19/24. Composition/action identities stay as approved; parent should review these numeric adjustments visually.
- Clean build exit0: `node scripts/world-cube.cjs deploy --out /workspace/world-cube-eastern-preview-final`; newly created17-file tree, no existing dist or preview artifacts overwritten. Current build resource SHA manifest is in `eastern-preview-manifest.json` under notes.
- Preview http://127.0.0.1:8767/?suite=eastern, actual Python PID1066449, bind0.0.0.0, persistent `/workspace/world-cube-natural-notes/http-eastern-preview-final.log`; stdin DEVNULL, independent session, stdout/stderr file-backed. Original PID831003/8766 unchanged.
- HTTP first final round:40 actual curl GET/HEAD requests across root, three suite URLs and all linked/lazy dependencies; every GET byte-identical to clean build. Subsequent persistence round is recorded separately in `eastern-http-final-round2.json`.
- **NOT TESTED:** real browser desktop/mobile compositions, full silhouette occlusion, twelve motions' human readability, true mobile touch, first-frame/first-fit latency, same-path10s-warm/30s-sample/3-round RAF median/P90, actual encoded MP4 and absence of its audio stream. Node mocks, pixel/ray math and CLI options do not replace these gates.
- No browser/CloudAgent, no commit/push/deploy; HEAD remains ac4bd93 on local/natural-wonders. Stop here for parent browser/reviewer before fantasy/civilizations.

## Independent review Important fixes — 2026-11-24 23:18 Asia/Shanghai
- Both findings reproduced before production edits. Failing logs: `eastern-review-important-red.tap` (cold entry had no listener) and `eastern-foundation-red.tap` (actual static triangles, not height-field guesses).
- Cold-start root cause: asynchronous bootstrap lived outside `start/configure`; warm selection's cancellation counter and listeners did not exist yet. Now the pre-controller intent listeners and controller share one generation; stale success/failure callbacks are ignored across handover. The original startup ready promise settles on the latest intent, not an obsolete load. Reset before any world is active cancels to default natural; suite and reset handlers bind only once. No first Eastern paint occurs until its dependencies are ready.
- New real-entry tests cover cold slow Eastern load→original/natural/reset before configure, original ready settlement without waiting for obsolete scripts, late script completion/failure, and subsequent warm selection races/retry. These execute the actual cube.js entry with platform/renderer fakes, not browser acceptance.
- Foundation root cause: fixed plinth bottoms .100/.180/.590 assumed terrain contact independently of the triangulated surface. Actual center-ray gaps were waterlane .075 (both houses), temple .08911953100921982, cliff .08908527422990231.
- Minimal correction: four reviewed plinths (two waterlane houses, main temple, main cliff pavilion) remain closed boxes with unchanged footprints and tops .18/.28/.69; their lower bases embed to terrain datum0. Upper architecture, roofs and motions are untouched. Nonnegative terrain makes these genuine overlapping foundations rather than floating platforms.
- Regression casts vertical rays against actual clipped static n−2 triangles: 9 footprint points per foundation, 36 total. Each intersects terrain and lower/upper foundation surfaces, verifies no gap, preserves top height and rejects terrain above the platform. It does not infer contact only from W.height or a global minimum.
- Fresh complete `node --test`: **78/78 pass**, exit0, 22629.439799ms; `eastern-important-final-tests.tap`. Changed JS/CJS syntax and diff checks exit0. Full geometry budgets unchanged (largest sum4766 / cap38589; sampled active peak563 / cap12046.5).
- New clean build `/workspace/world-cube-eastern-review-1` created successfully. New preview http://127.0.0.1:8768/?suite=eastern, actual PID1085625, log `/workspace/world-cube-natural-notes/http-eastern-review-1.log`. All stdout/stderr file-backed, separate session. Existing browser worker's8767/PID1066449 and immutable build were not touched; all17 old build/live HTTP SHA256 checked identical.
- This review-fix scope is cube.js, ground-eastern.js, eastern-integration.test.cjs, eastern-landscapes.test.cjs, and this record. New preview/log/manifest evidence lives outside the repository. No next suites, commit, push, deploy, CloudAgent or browser driving.
- Browser composition/readability, physical touch, first-frame/performance protocol and encoded audio remain unverified here. Parent should finish its8767 acceptance without changing versions, then choose to inspect8768 for these two fixes.

## Browser-readability revision — 2026-11-24 23:40 Asia/Shanghai

### Diagnosis / reproducible limits
- Parent browser8768 accepted terrace wheel/water and cliff sail/waves, but did not accept clear bell/banners/raft-oar/porter/shoot motion. Treat that result as authoritative; prior moving-vertex tests did not prove human recognition.
- Body-level projected triangle-centroid/static-occluder probes exposed what the single-tip ray missed: bell had only15/24 normal and9/24 close phases with ≥.70 weighted projected-body area unblocked. These remain finite approximate static probes (not union silhouettes/self-occlusion/browser evidence).
- Old flag cross-sections only translated a flat ribbon, with muted adjacent-band contrast≈1.78/1.88. Tea leaf/static-green contrast≈1.47–1.82; leaves lay nearly horizontal to the low camera, while foreground crowns could hide a waist. Raft's solid boat deck hid its five bamboo cylinders; generic oar was shorter than approved and used35° rather than32°.
- Checked approved §4.5: close view may crop other back faces; selected scenery, base and both full motion envelopes need≥8px. Regression confirms selected-face bounds at desktop/mobile remain inside8px. Did not shrink whole cube to preserve rear shell in a near view; no fit/state/renderer changes. Browser should still identify whether its reported cropped edge belongs to the selected base or a permitted rear face.

### Narrow substantive changes (no unapproved enlarged/faster motion)
- Bell pavilion: retain center/hinge(-.72,-.28,.82),24°/3.2s swing and approved .23 belly width. Remove the two obstructing front posts, use real rear piers/cantilevers and dark rear wall, shorten roof from .62×.56 to .52×.44 per spec's explicit shrink-eaves rule. Add attached bright mouth rim within the same .23 width. Small pavilion foundation also embeds to datum, maintaining its .18 top. Body probe frames improve to24/24 in both views; human readability NOT yet confirmed.
- Both banners: exact existing widths/lengths,3.2/4.8s periods and center-tip amplitudes±.18/±.20 retained. Adjacent folds now phase-offsetπ/3; width cross-sections rotate up to26°, with dark physical edges and crimson/gold opaque panels. No screen-space labels, glow or particle substitute.
- River: unchanged .50×.30 raft and .90/.20 path,9.6s period, net geometry/lift. Expose five distinct bamboo logs/lashings rather than covering them with an opaque hull; approved .48 long oar/32° stroke shares actual tip kinematics, attached broad blade meets shared water level. Shaft radius at water tip reduced to .010 after full bounds regression caught a negative-z tube edge; no clamping. Camera normal -35°/46°, close -35°/30° (authorized camera adjustment), measured same-path screen displacement improves desktop≈31%/23%, mobile≈23%/14% versus prior cameras. Not a claim of real visual acceptance.
- Tea: same .52-class person/path/speed, crop foreground crowns below waist and cap static canopy at approved .58; use deeper static greens, actual .28×.24×.30 pale bamboo basket with dark bands, navy shirt. New-shoot roots/tips/±.15/3.2s unchanged; correct individual fans to approved .22 width and upright faces with contrasting pale new leaves rather than oversized horizontal .34 fans. Real material minimum contrast recorded in notes/legibility/contrast.json, not asserted as human recognition.
- Waterlane boat/bridge path unchanged. Actual clipped arch-edge intersections verify10420 sampled living vertices clear the inner arch by≥.0215789 and center crosses twice/9.6s. Useful observation phases≈3.56/6.04s; this does not replace a browser crossing recording.
- Terrace and cliff models/kinematics untouched. Cold-start generation/reset fixes and main-foundation fixes from previous review preserved. No following suites or approved-spec edits.

### Verification and isolated revision
- Added8 regressions in eastern-legibility.test.cjs plus Node-only visibility helper; prior material-classification lists updated to actual new colors without weakening existing thresholds. Red logs under notes/legibility; fresh full `node --test`: **86/86**,0 failures,20233.957665ms, exact notes/legibility/final-tests.tap. Syntax and diff checks exit0.
- Geometry S0+A0+A5: waterlane2246, terraces3338, temple2158, river1767, tea4798, cliff1564; same-run original cap38589. Sampled active peaks306/460/258/602/350/74; cap12046.5. Real RAF/first-frame NOT measured.
- Fresh build `/workspace/world-cube-eastern-legibility-1`; preview http://127.0.0.1:8769/?suite=eastern, actual PID1114420, persistent log `/workspace/world-cube-natural-notes/http-eastern-legibility-1.log`. 8768/PID1085625 retained unchanged; all17 previous disk/live HTTP resources checked SHA256-identical.
- New manifest, two separate-tool GET/HEAD rounds and targeted browser retest handoff under notes/legibility. No browser driven here; no commit/push/deploy/CloudAgent. Original protected files/licenses and all3 approved specs remain identical.
- Current acceptance remains incomplete: targeted desktop motion retest, mobile six-scene checks, real touch, protocol performance/first-frame and encoded audio untested. Do not write six scenes/twelve actions as accepted based on these regressions.

## Mechanism diagnosis after four real recordings (2026-11-25 00:39 Asia/Shanghai)
- Followed diagnose-before-fix: actual WebM ffprobe/numerical decode plus extracted stills only, no executor video playback/browser. Contrary to a frozen-renderer hypothesis, bell ROI172 decoded frames moves19.487 video px (15.472 CSS px), tea right-shoot ROI183 frames moves42.767px (33.957 CSS px); approved3.2s sine-fit R²=.99884/.99342. Actual net stills show lift relative raft/hook. These compressed color-centroid observations are not exact endpoint measurements or a human-readability approval. Rejected contaminated river-blue-mask exploratory fit explicitly, not used as evidence.
- Added actual unchanged-renderer GL-boundary regression: changing target-color vertices reach dynamic GPU uploads and opaque draw ranges; identical t alone reuses living, static uploads once. No protected renderer changes or invented movement parameters. Bell, tea and net motion remain unchanged; attribution of the earlier perceived stasis cannot be established from a tool's description alone.
- TDD found a separate real problem: actual clipped net/torso triangle SAT intersects at t=0 (red). Net edge reaches localy=-.020 versus torso -.0225. Minimal green fix moves only raft fisherman's body/heady .015→.040, giving .0225 side clearance; no actor resize, boat/path/oar/net width/depth/lift/period/camera changes. Waterlane and other vessel figures unchanged.
- 193 phases0..9.6 step.05 now pass net/body and all-river-static intersections (825 opaque static triangles). All five neighbor faces' actual world static AABBs disjoint from actor bounds at those phases; nearest neighbor gap≥.354859, tea face≥.92655. Alleged external wood/peak crossings not reproduced; screen overlap is not 3D collision. These are finite phase samples, not all-continuous-time guarantees.
- Exact preservation:16/17 product bytes equal8770, only ground-eastern.js differs;17 other scenes plus riverstatic equal across280 serialized model comparisons. Nine protected sources/licenses equal HEAD; three approved specs equal review ZIP. Source change this round is only figure placement, new mesh-intersection test helper/test and this record; no following suites.
- Fresh full tests **91/91**,0fail,18939.014856ms; external QA tests **7/7**,0fail;36 JS/CJS syntax checks and diff check exit0. Actual post-partition n−2 S0+A0+A5 still2246/3338/2158/1767/4798/1564, original same-run cap38589; sampled active peaks306/460/258/596/350/74 vs12046.5 cap. Geometry is not a RAF measurement.
- Fresh CLI build `/workspace/world-cube-eastern-mechanism-1`; product URL http://127.0.0.1:8771/?suite=eastern, QA http://127.0.0.1:8771/qa.html. Detached actual server PID1169094, log `/workspace/world-cube-natural-notes/http-eastern-mechanism-1.log`. Two separate real HTTP rounds each24routes×GET/HEAD all200. Old8770 all20 artifact hashes and live resource samples unchanged.
- Recorder remains isolated outside product: same actual iframe/canvas/clock/capture guards, no artificial animation/speed/camera changes; only QA JSON reference reads current manifest instead of old8769 label. New browser captures/quality not performed here. Handoff and original decoded still crops in notes/motion-mechanism/browser-handoff.md. Full human motion acceptance, complete mobile/touch, protocol RAF/first-frame and CLI encoded-audio checks remain explicit gaps. No commit/push/deploy/CloudAgent.

## Eastern evidence gate before T-4 (2026-11-25 00:46 Asia/Shanghai)
- Parent reports actual8771 ten-second river videoReview: raft/oar and attached gold lift-net clear, figure/net no overlap, gray peaks/neighbor structures separated in depth, current actors remain framed. Correct-target re-review of original recordings confirms temple bell/banner and tea porter/pointed shoots clear; waterlane boat-under-bridge/banner passed; prior real browser confirmed terrace wheel/channel and cliff sail/waves. These are relayed real-review results, not executor browser claims.
- Desktop six scenes each have real two-action checks. Mobile six scenes normal/close static composition passed, but complete-cycle8px margin was not rigorously measured. True touch, first-frame, specified three-round RAF protocol and CLI finished-media audio remain UNTESTED. No “full acceptance” or online/publication claim. Earlier Important cold-start cancellation/foundation/fit issues closed by independent review; retained91-test baseline.
- Fresh91/91 tests and clean17-resource build frozen before fantasy under `/workspace/world-cube-natural-notes/eastern-snapshot-20261125-0046/` (tests.tap, build.json, product/, source-manifest.json, source.tar.gz and git-status.txt). No commit needed for a local snapshot. 8771/PID1169094 remains untouched and is not the build destination for later work.
