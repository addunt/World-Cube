# Miniature Civilizations T-5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement only the approved final six civilizations/twelve mechanical actions, preserving all24 existing habitats and frozen fantasy evidence.
**Architecture:** Add GroundCivilizationWorld for shared support/absolute-time kinematics and cached component envelopes; GroundCivilizations is a separate low-poly provider. Activate the existing catalog entry and material branch, with no new engine/renderer/clock. Reuse metadata-driven controller, latest-intent loader and fit.
**Tech Stack:** Classic JS, existing builder/partition/WebGL,240px procedural ground, Node built-in tests, static copy exporter. No dependencies, assets or audio added.

## Global Constraints
- Same local tree/branch by explicit user instruction, no CloudAgent/browser automation/commit/push/deploy; no changes to immutable8773/8774. Natural remains default. Original scene list/API/state/renderer/copyright/licenses unchanged.
- Approved specs: miniature-civilizations-design.md and eastern-landscapes-design.md. Stale pending-review header is superseded by explicit user approval, not edited.
- LocalXY[-1.5,1.5],0≤Z<1.45,highest>.85,five height levels,nine cells; partition once, no duplicated per-cell actors. Static canonical at nonzero first request, pure reverse seeks and positive19.2-periodic time.
- Distinct railway/radial farm/S-canal/quarry/U-city/ribbed-dome compositions. Twelve actual entities with mobile default contour≥12CSSpx and representative endpoint/center change≥6CSSpx;70% visible for75% cycle, actual browser evidence separate. Do not wrongly import fantasy-only18% into a different spec or substitute supports for subjects; report all actual masks/sizes.
- Authored sizes are visible design targets/lower bounds under shared§6. Enlarge local components or alter layout as needed for declared screen/contact gates; preserve stated periods/route extrema/pivots where consistent. No silently waived thresholds.
- Geometry after partition n−2: S0+A0+A5≤same-run original maximum×1.5; active peak0..42/.1+extrema≤same-run original peak×1.5. Report counts, not fake RAF. Standard1280×800 /390×844 real performance10s warm/30s×3 plus first-frame remain external/untested.
- All five suites ready-gated/lazy/id-separated; CLI new suite silent and rejects audio; original explicit audio unchanged. Build copies all indirect dependencies. Five buttons stay normal document flow.

## File map and interfaces
Create `assets/starter/civilization-world.js` under scene-cube: `GroundCivilizationWorld.surface(id,x,y)`, `height(id,x,y)`, `motion(id,t)`, `bounds(id)`; helpers `at(pose,p)`, `route(t,offset)`, `river(y)`, `ribs`. Motion returns `features:[vec3,vec3]`, complete actor pivots/cord/hinge/rod points consumed verbatim by provider.
Create `assets/starter/ground-civilizations.js`: `GroundCivilizations.draw(id,b,t)` and surface/height/bounds/palettes delegates. Helpers local, no older-module changes.
Modify suite-catalog.js/index.html/ground-surfaces.js only for actual activation/description/cues/local dependency palette. Existing cube.js metadata path should need no changes.
Create test-support/civilizations.cjs and tests/civilizations-{landscapes,integration,quality}.test.cjs. Update old availability assertions intentionally; preserve their behavioral assertions. README/production/this record only additional docs.
External notes/civilizations include real budgets/build/protection/HTTP evidence, isolated responsiveQA copy; no QA files in product source.

### Task0: Freeze fantasy gate
- [x] Append exact parent desktop review and limitations to fantasy record; fresh120 tests,19-resource build and source archive.
- [x] Freeze actual desktop evidence/metadata/SHA into notes/fantasy-snapshot-20261125-0203; no mobile validation inferred from files merely existing.

### Task1: Failing registration/data/geometry contracts
- [x] Write tests requiring:
```js
const ids=['civ_station','civ_farm','civ_canal','civ_mine','civ_caravan','civ_greenhouse'];
assert.equal(art.resolveSuite('?suite=civilizations').suite,'civilizations');
assert.deepEqual(Array.from(art.availableSuites()),['natural','eastern','fantasy','civilizations','original']);
assert.throws(()=>art.model(ids[0],0,true),/not ready/);
```
Run `node --test scene-cube/tests/civilizations-*.test.cjs` and retain RED. Add nine-cell/Z/nondegenerate/static/time/budget tests before drawing.
- [x] Implement pure kinematics with `phase=t/P-Math.floor(t/P)`:
```js
trainX=.80*Math.sin(2*Math.PI*t/19.2); wheelAngle=-trainX/.09;
crateZ=.42+.18*Math.sin(2*Math.PI*t/6.4);
windAngle=2*Math.PI*t/6.4; wheelAngleFarm=2*Math.PI*t/4.8;
boatY=-.34+.55*Math.sin(2*Math.PI*t/19.2);boatX=.18*Math.sin(2*boatY);
boatYaw=Math.atan2(1,.36*Math.cos(2*boatY))+Math.PI*(smooth(4,5.6,t)-smooth(13.6,15.2,t));
liftZ=.48+.25*Math.sin(2*Math.PI*t/6.4);
hammerZ=.45+.16*Math.cos(2*Math.PI*t/3.2);
pin=[.66+.16*Math.sin(2*Math.PI*t/3.2),-.63,hammerZ+.18];
bucketZ=.38+.17*Math.sin(2*Math.PI*t/6.4);
headAngle=2*Math.PI*t/9.6;panelAngle=(30+25*Math.sin(2*Math.PI*t/6.4))*Math.PI/180;
```
Caravan constant-speed rounded rectangle clockwise, r.22, extremaX±.72/Y−1.04.. .04, half-perimeter offset. Build8 exact line/quarter-circle segments with tangent continuous at joins; gait from absolute arc length, no accumulated dt.
- [x] Shared wet support: canal signed distance from S centre with end-turn pools .82 wide, water .045/land.025; farm raised open trough water.075/banks≤.10. Other floors .025. All pixel shore coloring uses same `surface` as model.
- [x] Cache conservative component-union boxes from declared static sizes/analytic actor extrema. Dome ribs share exact polyline points for draw and bounds. Bounds must not call model; test all static and0..42s meshes against union parts.

### Task2: Independent fixed/live constructions and contact
- [x] Station: rail pair y−.60±.10/rail top.045, train six wheels r.09 centerZ.135, baseZ.15/chimney.61; exposed cream crank pins/rod tied to travel. Brick hall/real open arch/clock tower1.18, water tower.88, front train path unobstructed. Crane at1,.18,hook1.05 and crate.28×.24×.20 (minimum bottom.14), exact connected rope/three height marks.
- [x] Farm: tapered four-sided wind tower1.12, rotor centre−.65,.16,.80,r.44, one rust sail,3cream; distinct right-front eight-bucket wheel r.25 with2adjacent gold markers. Ground-level channels/transmission supports, radial golden field rows and low red granary. Actual blades/buckets in front of opaque tower/supports.
- [x] Canal: asymmetric continuous narrow brick houses and indigo market, open foreground S river, raised back bridge .54 clear of full boat including turn pools. Closed .62×.26 hull intersects waterline, visible multicolor cargo, continuous1.6s endpoint turn; basket.28 wide/cord/short mast in front of market with≥.10 hull clearance. No vessel teleport.
- [x] Mine:3-stage faceted quarry/ore strips, exposed lift/rails/rope pulley, open-front forge. Hammer.30×.24×.16 over anvil.20, actual slotted yoke with opening.36×.05, pinr.02 travels inside, fixed-radius crank.16; yoke/head shareZ, real connector/supports rather than variable-length fake rod.
- [x] Caravan: U-wall/gate/tower/teal shade, separate stone rounded road. Two ear/neck/four-foot pack animals (.46 long), half-loop apart and actual foot poses. Mandatory clearance exposes a coordinate conflict: authored bucketY.12 would intersect back-routeY.04 (less than required.18). Under shared§6 layout permission move bucketY to.50 and support frame behind it atY.58; min XY body gap≥.18, retainX−.55/Z/period. Do not silently keep impossible gap. Bucket is visible beside separate low well, not disappearing underground.
- [x] Greenhouse:6ribs fromR1.175/floor.025 toapex1.26, front open, few rear translucent panes; six raised leaf beds≤.33, amber one-arm scanner radius.62/bottom.43, front supply tank/back airlock. Two .42×.28 real hinged cyan boards atX±.65/Y.45/Z.85, swing5–55° forward/up; position between ribs to avoid crossings. Fixed brackets attach actual hinge lines.
Run each scene tests after its implementation. Primitive `b.static` wraps only fixed construction; no renderer/cache edits.

### Task3: Five-suite integration and actual-mesh gates
- [x] Activate civilizations files/provider/angles [12,38;−16,38;18,44;−12,40;10,44;−14,42] and close [−18,20;−24,22;26,24;−20,24;18,24;−22,24]; add complete cues/overview and fifth in-flow button.
- [x] Add pure CLI silent cases and manifest dependencies. Old test “unavailable civilizations” uses unknown suite instead; no fake unavailable playable entries left. Bad ids/query paths still reject.
- [x] Actual-entry cold latest-intent race original/reset/eastern/fantasy, error/retry; all five roundtrip reset/undo/close/play state, cached materials isolated, resize camera/turn coalesces once. Full19.2 physical-beat parity and six takes.
- [x] For each action, filter actual emitted mesh with explicit unique materials/roles, compare actual points not whole scene signatures. On desktop871×682/mobile357×429 normal: bbox long edge≥12, stated endpoint motion≥6; include changing self-occluders in70%/75% phase probes. If weak, enlarge/move part or choose permitted camera/layout, not thresholds. Contact/rod/pin/cord/hinge and route boundaries/clearances must inspect actual mesh too.
- [x] Fit all normal/close/mixed face states and complete envelope to8px in desktop/mobile; no per-frame whole-suite geometry. Tests are mathematical samples not human acceptance.

### Task4: Verification and local handoff only
- [x] Fresh full `node --test`, allJS/CJSsyntax, diff check, three immutable spec ZIP equality, exact old24 models/pixels against frozen product, protected original/state/renderer/licenses. Save actual n−2 counts/active peaks and no-secret scope scan.
- [x] Clean sibling `/workspace/world-cube-civilizations-preview-1`, product21resources. Copy repaired responsiveQA externally (noJSfixedpx;100%/100dvh;overflow-wrap:anywhere), correct manifest.suite/name and iframe URL only; preserve exact product bytes. QA tests explicitly fake/platform, require actual browser frame dimensions next.
- [x] New free8775 persistent HTTP server, detached/stdinDEVNULL/log files, realPID; two separated actualGET+HEAD all root/product/QA dependencies with SHA/length. Keep8773/8774 unchanged.
- [x] Handoff exact12targets/periods/key times/default+close, crop pitfalls/occluders, test/budget/evidence paths and all still-unmeasured browser/touch/perf/first-frame/encoded-audio limits. Stop, no publication.

## Plan self-review
Coverage: civil§1–3 scope/API→1/3; six§4 actors/contact→1/2; §5camera/pixel thresholds→3; budgets/state/export/evidence→3/4. Authored motions are19.2periodic, slot/pin names matchworld/provider/tests; route helpers define real positions/tangents. Coordinate conflict at caravan bucket is explicitly resolved by allowed layout change to enforce the stricter gap. No newengine/assets/audio/identity, no placeholder steps, no unsupported performance claims; same-tree execution and no commit steps follow explicit user override. Parent real browser/reviewer handles acceptance after this local candidate.


## Executed local candidate — 2026-11-25 Asia/Shanghai

All implementation tasks above refer to the **local candidate/automated handoff**, not browser acceptance. No commit/push/deployment or browser automation was performed. Branch remains `local/natural-wonders`, HEAD `ac4bd93`; all prior approved specs and local work retained.

### TDD findings and actual corrections
- Initial five new landscape tests were RED before providers existed. First real geometry pass exposed a negative canal arch spring and narrowly omitted component bounds; flattened arch rise and exact eave/pier/shaft/quarry/wall/airlock component bounds fixed them without changing old scenes.
- Actual hull test caught a bank incursion at authoredt4.5 while turning; replacing abrupt pool width steps with smooth .64→.82 shoulders passed actual hull vertices over the full19.2s. No path-centre-only claim.
- Actual crank draw capture caught a skew Y endpoint: fixed radius.16 crank now lies in its own XZ plane, a real .02 pin extends to the .36×.05 front slot; yoke sliders join the fixed guides. No changing-length linkage.
- Actual emitted animal face-footprint AABBs initially measured only.11888 separation even with buckety.44. Moved to y=.50/depth.20 (x/height/period unchanged), obtaining conservative minimum.1988775≥.18; shared§184 explicitly permits local layout/scale corrections. Cut real U-wall gate opening and verified static-triangle line of sight.
- Wheel sign RED test linked actual XZ crank geometry to no-slip displacement: q=−x/.09. Connected six wheels/rods retain approved radius/route/period. All periods divide19.2; negative/reverse addressing deterministic.
- Local reading sizes per shared§184: crate.28×.24×.20; basket.28×.28×.20; minebucket.32×.26×.20; hammer.30×.24×.16; scannerhead.26×.20×.18. No lowered thresholds, >1.45 heights, changed periods or out-of-range camera angles. Approved specs themselves unchanged.
- Product changes relative to frozen fantasy: only suite-catalog.js, ground-surfaces.js, index.html plus civilization-world.js/ground-civilizations.js. CLI help/error adds allfive names. Controller/state/renderer/old24 providers/CSS byte-identical. Old availability-only tests now target an unknown suite rather than pretending implementedcivilizations unavailable.

### Fresh verification evidence
- `node --test`: **144 passed,0 failed**,(Node tests, NOT RAF; latest raw duration remains in tests-final.tap). Includes120 baseline test cases adapted only for now-open fifth suite plus24 new contracts. Real-controller cold initial latest-intent original/reset/eastern/fantasy, failed-load retry,3five-suite playback/close/turn/reset rounds, deferred-resize coalescing, all30texture cache IDs/three rounds, original demo physical beats, both high seam axes, actual hull/route/slot/rib contact, source/draw cache and12actual GL actor masks covered. GL tracing does not rasterize or prove human readability.
- Independent isolated QA **11/11 platformfake tests**;20s timer had RED before QA-only change. Product build includes noQA. Responsive actual source policy width/max-width100%,height100dvh, wraps diagnostics, neverwritesfixedpx/neverhideshorizontaloverflow. Actual browser390×844 remains to verify.
- Fresh allJS/CJS syntax,git diff--check, no newly authored credential/identity literals, protectedHEADlicenses/original/state/renderer and3approvedspecZIP byte comparison PASS; details`scope-verification.json`. No credentials were read.
- `node scripts/world-cube.cjs deploy --out /workspace/world-cube-civilizations-preview-2`: created clean21product files. ExactSHA manifest shows same resources served to product andQA; QAonly3extra files, not product source.
- Old24 preservation: **192 exact modelSHA comparisons +24exact240px textureSHA comparisons** against frozen fantasy. Each of8773/8774's19product files unchanged.

### Same-run partitioned n−2 counts

|id|S0|A0|A5|sum|Apeak0..42/.1+extrema|
|---|---:|---:|---:|---:|---:|
|civ_station|1580|636|700|2916|792|
|civ_farm|1576|380|380|2336|394|
|civ_canal|1116|132|104|1352|148|
|civ_mine|920|264|264|1448|282|
|civ_caravan|1612|662|566|2840|746|
|civ_greenhouse|1876|144|144|2164|192|

Same-run originalmaxsum25726→ceiling38589; originalmaxactive8031→ceiling12046.5; allunderbudget. Rawcounts include allsix original scenes in`budget.json`, no submittedvertex-count shortcut.

### Numerical projection limitations
Actual one-animal/one-panel masks (not inflated pairs), emitted meshes, declaredCSS stages871×682,856×626,356.8×429: minimum longedge15.9653px≥12 and prescribed-vertex trajectory14.4530px≥6. Finite96phase probes are not real browser DOM/human acceptance. Static/other-actor occlusion probe uses projected triangle area and centre rays over32phases: minimum successfulphasecount25/32≥75%; not equivalent to exact visiblecontour or real-video proof. Cached component envelopes are declarations with analytic motionextrema and dense193phase mesh checks, not a formal proof merely because samples pass. Oldnatural fallback remains finite samples+.05. Normal/close mixed-state/narrowresize and demo fit tested numerically, not mouse/touch performance.

### Service, snapshot, next gate
- `http://127.0.0.1:8775/?suite=civilizations`; isolatedQA`/qa.html`. Actual detachedPythonPID**1262480**,stdout/stderr`/workspace/world-cube-natural-notes/civilizations/http-server.log`. Old8773/8774 unchanged.
- Two separated actualcurl rounds, each**30GET+30HEAD**, all200, exact resourceSHA/body andHEADlengths (`http-1/results.json`,`http-2/results.json`). Not a browser test.
- Evidencefolder`/workspace/world-cube-natural-notes/civilizations/`; human target/recording guide`browser-handoff.md`,36math-only camera/target locators`target-locations.json`. QA20s realcanvas capture covers19.2s primary cycles; no changed productclock/animation speed or synthetic output.
- Frozen secondgroup`/workspace/world-cube-natural-notes/fantasy-snapshot-20261125-0203/`:120tests,19product resources,source archive,actual desktop reviewevidence. Parent confirmed six12actions through40c18ef5/1d2a/d031. Earlier frozen claims withdrawn as wrongtarget/wholecycle sparse sampling. Mobile latest result still not relayed.
- **Still UNTESTED for civilizations:** real desktop/mobile sixscenes ordinary+close/fullcycle12action readability/8px, actualtouch/scroll/layerundo, true firstframe/firstfit/thumbnail latency, prescribedRAF10s warm/30s×3 median/P90 samepath≤original1.5, browser5suite3roundGPU/memory stability, actualCLI encodedvideo/audio. No Node timing or historicnatural ratio substituted. Parent handles independent reviewer/browser/video, then corrections; no publication implied.

## Review follow-up: actual train tread support — 2026-11-25 Asia/Shanghai

Confirmed existing§46 defect independently, not treated as a new requirement: all6actual post-partition wheel bottoms had correctZ.045 but XYgap.039 from the actual rail tops. Original wheels were zero-thickness outer-body discs. TDD actual-triangle tests RED before fix; original constantheight equality was insufficient evidence.

Onlystation living geometry changed: gauge staysy−.60±.10/width.026; realr.09×.02wheel drums centredoverrails, lowerbody wheel recesses prevent the collision a simple inward shift would cause, actualaxles/bearingmounts/crankpins connect the preservedouterrods. Body length/width/base and upper silhouette, motion/camera, stationstatic and all29other scenes unchanged. No spec changes or unrelated scenery work.

Fresh `node --test`:146pass/0fail. Fullperiod385times(.05s)×6=2310actualwheel contact samples use emittedbottomvertices+realrailtriangle XYbarycentric/Zinterpolation, minwidth.02,maxZgap1.388e−17.97phase actualmeshSATchecks wheel/spoke/pin/rod vsbody and train vsstation clear; actualassembly contacts checked. Source motion is rigidXtranslation only for treadgeometry; |trainX|≤.8 plus axleoffset≤.24 gives bottomX≤1.04 insideactualrail±1.34, fixedtreadY/Z with.003transversemargin. This analytictranslation invariant supplements sampledpartition witnesses; neither is human acceptance.

New n−2 stationcounts S1580/A01576/A51680/sum4836/peak1816, within same original38589/12046.5caps. Otherfive unchanged.261actualmodelSHAcomparisons preserve all29otherids;stationstatic,palettes andworldfile unchanged.53JS/CJSsyntax/diff/approvedspecZIP checks pass; responsive20sQA11fakecontracts pass.

New immutablepreview`http://127.0.0.1:8776/?suite=civilizations`,QA`/qa.html`,root`/workspace/world-cube-civilizations-preview-3`,detachedactualPID1283041,log`/workspace/world-cube-natural-notes/civilizations-wheel-fix/http-server.log`.8775PID1262480/resources untouched, otherfive currentbrowserrecordings remain usable. Exactly1of21productfiles changed:ground-civilizations.js. Cleanbuild/source/product/QAmanifestSHA match;QAHTML/recorder unchanged. Evidence`/workspace/world-cube-natural-notes/civilizations-wheel-fix/`:red/green/fulltests,rawcontact-evidence.json,model-preservation.json,train-only.diff,handoff.md. Parent independentlyreviews/visuallyrechecks train; all prior mobile/touch/performance/encodedmedia limitations remain. No commit/push/deploy/cloudagent/browserautomation.

## Later parent evidence/status correction — 2026-11-25 Asia/Shanghai
The preceding “still untested” lists are historical handoff states, not the latest verdict. Parent has since relayed allsix core A/B recordings and specifically repairedstation1371 desktop+mobile core actions clear; do not list1371 as missing or repeat its core-action review. Complete phase/view/viewport8px envelopes, actualtouch, prescribed desktop+phone RAF, proved cold-cache firstframe and actual CLI MP4/audio are separate and not passed by that observation. The incorrectly targeted civilization-only QA refused fantasy/eastern and produced no clips; real390×844 dimensions from that attempt do not manufacture the missing spring/terraces/cliff recordings. Current truthful status/finite remaining gates: [three-suite acceptance status](../acceptance/2026-11-25-three-suites-status.md). This later controlled P product snapshot and Q-only CI preparation supersede the historical no-commit handoff status without asserting deployment or completed media acceptance.
