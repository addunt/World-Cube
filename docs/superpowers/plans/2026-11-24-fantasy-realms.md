# Fantasy Realms T-4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add only the approved fantasy six-scene suite with twelve real geometric actions, retaining the three playable suites and the Eastern evidence snapshot.
**Architecture:** Extend the existing lazy catalog/provider system. GroundFantasyWorld owns support/absolute-time kinematics/analytic component bounds; GroundFantasy builds independent fixed/live low-poly compositions; the controller uses the existing suite metadata, fit and latest-intent loader. QA recorder remains an external artifact.
**Tech Stack:** Plain classic JavaScript, existing seven builder primitives, 240px procedural materials, unchanged WebGL renderer/state, Node built-in tests and static exporter.

## Global Constraints
- Approved specs: docs/superpowers/specs/2026-11-24-fantasy-realms-design.md and shared eastern-landscapes-design.md, approved by user2026-11-24. Stale review-status prose in immutable approved specs is superseded by explicit approval, not edited.
- Same existing tree/branch by explicit user choice; no CloudAgent/browser automation/commit/push/deploy; no third suite implementation. Keep natural default; civilizations unavailable/hidden; all original/MIT, natural and Eastern geometry unchanged.
- Local face XY[-1.5,1.5], all geometry0≤Z<1.45; nine nonempty varied cells, five height levels, min<.065/max>.85. Shared surface/height; convex planar faces or explicit triangles; partition once.
- Authored periods and dimension lower bounds from fantasy§3 (scales/positions may increase under§100/104 to meet visibility, not override it); three moths/eight spores, two crystals/three rings, three blocks/one banner, two books/one lantern, sixteen grains/one pendant, one dragon/≤7 breath feathers. No Math.random or time accumulation.
- Geometry: post-partition n−2 S0+A0+A5≤same-run original max×1.5; active0..42 step.1 plus extrema≤same-run original active peak×1.5. Analytic conservative component bounds, no per-frame whole-model fit generation.
- Real-browser normal/close desktop1280×800 and mobile390×844 evidence remains external; complete fit8px, two actions≥8px in≤4sec, entity/band≥3CSSpx and80% visibility are goals, not assumed results. Fixed .025 water-band / .035–.055 star-grain sizes may project below3px on narrow full-cube views: measure and report any conflict, retain grain .035–.055 and camera adjustment limits; other authored sizes are lower bounds per§100/104, not stricter exact maxima.
- Real first-frame/RAF/touch/media audio only from reliable browser/media observations; otherwise UNTESTED. No personal name/email/credential added.

## File map
- Create `scene-cube/assets/starter/fantasy-world.js`: GroundFantasyWorld.surface/height/motion/bounds and pose helpers; explicit per-component static/dynamic boxes with cached nine-cell bounds.
- Create `scene-cube/assets/starter/ground-fantasy.js`: GroundFantasy.draw/surface/height/bounds/palettes. Independent mushroom/cave/ring/library/spring/dragon geometry; primitive helpers local, not changes to older modules.
- Modify `suite-catalog.js`: fantasy available=true, files, six descriptions/colors, specified angles/focus, cues/overview; civilizations remains false.
- Modify `ground-surfaces.js`: fantasy provider palette/surface branch without changing existing branches.
- Modify `cube.js`: metadata-driven loading text/cues and provider-angle fit/resize/demonstration path; preserve original/natural/Eastern outputs and startup token. `index.html`: fourth in-flow button, existing wrapping CSS retained.
- Modify `habitat-framing.js`: accept provider component-union corner points; retain older lo/hi corner path unchanged.
- Test `scene-cube/tests/fantasy-{landscapes,integration,assets}.test.cjs`, add fantasy loader export in `scene-cube/test-support/load.cjs`; existing availability assertions update only intended fantasy activation.
- Documentation README/production and this execution record; external notes/fantasy QA files/build/HTTP evidence only.

### Task0: Eastern gate
- [x] Record relayed actual desktop two-action results and precise mobile/touch/RAF/media gaps.
- [x] Fresh `node --test`91/91, clean build to notes/eastern-snapshot-20261125-0046/product, source archive+manifest; retain8771 unmodified.

### Task1: Red contracts and support/kinematics
**Interfaces:** `GroundFantasyWorld.surface(id,x,y):number`, `height(id,x,y):number`, `motion(id,t):{features:[vec3,vec3],...actors}`, `bounds(id):Array9<{lo:vec3,hi:vec3}>`; global `GroundFantasy` provider after both classic scripts.
- [x] Add failing catalog/geometry tests using:
```js
const ids=['fantasy_moonshroom','fantasy_crystal','fantasy_ruins','fantasy_treehouse','fantasy_starspring','fantasy_dragon'];
assert.deepEqual(Array.from(art.suites.fantasy.scenes,s=>s.id),ids);
assert.throws(()=>art.model(ids[0],0,true),/not ready/);
assert.equal(art.resolveSuite('?suite=fantasy').suite,'fantasy');
```
Run `node --test scene-cube/tests/fantasy-*.test.cjs`, save red logs before provider implementation.
- [x] Implement pure motion with exact periods: moth6/flap.8/spore4; crystal5/ring2.4; stone7/banner2; book6/page1.5/lantern2.8; grain5/pendant3; body3/tail4/breath4 (emit1.8/fade.7). Use positive modulo; arbitrary `.36→2.81→.36` identical.
- [x] Specify complete actor contact/hinge data consumed by draw: moth wing vertices, crystal tip, ring segments, stone corners, banner rows; book hinge/pages, lantern rope/body transform; star grain/pendulum transform; dragon fixed feet/connected tail/ice-sheet vertices.
- [x] Build conservative bounds from declared component AABBs and analytic orbit/radius/extremum intervals, cached once per id. Example aggregation:
```js
for(const box of components[id])for(let i=0;i<9;i++)if(intersectsXY(cell(i),box))heights[i]=Math.max(heights[i],box.hi[2]);
```
Actual mesh/extrema tests validate containment; finite samples are regression evidence, not analytic proofs themselves.

### Task2: Six independent compositions and textures
- [x] Build mushroom stems/caps/gills/roots/stream with front moth ellipse and spore column outside cap, matching spec coordinates/radii/heights; two real colored wing panels per moth and eight small geometric spores.
- [x] Build open-front horseshoe cave, six-sided crystal clusters and actual crystal bridge on two raised stone bases (left base is explicit emergent islet). Moving crystals clear bridge; expanding rings clip to same elliptical wet surface including stone bases.
- [x] Build three tapered island bellies/top disks, broken vertical stone ring with1/5 gap, residual columns/stairs; rotated asymmetric cubes travel in front of ring, banner anchored on first island.
- [x] Build rooted giant trunk, rear canopy, two genuinely supported shelves/platforms, open-front house with thick book spines, stair/bridge. Book orbit phases chosen to avoid lamp/roof; pages share hinge, lamp cord/body share exact transform.
- [x] Build indigo pond with twelve ring stones, stepped right dunes, split star-stone and convex-triangulated five-point star; two eight-grain spiral arms plus separate rear pendulum with stone clear of supporting fork.
- [x] Build actual four-legged hatchling: fixed feet on nest floor, breathing upper torso only, neck/head/eyes/horns/folded wings, connected segmented moving tail, eggs/ice peaks and six ice sheets from fixed mouth. No moving support feet.
- [x] Add fantasy texture branch using GroundFantasy.surface and palette; originals' generated byte signatures must stay equal snapshot. Run mesh/contact/seam/bounds/determinism/budget tests; adjust repeated decorations rather than core motions if budget exceeds.

### Task3: Integration and controller regressions
- [x] Activate catalog and add fantasy menu button only after full provider exists. Test available order natural/eastern/fantasy/original; all30 metadata ids remain unique; civilizations rejects CLI/not shown.
- [x] Cold `?suite=fantasy` load with original/reset/new-suite latest intent; dedup/failure/retry and Eastern↔fantasy competing loads. Keep latest-request token across bootstrap/controller.
- [x] Extend provider metadata use (labels/cues/overview); generic provider `angles` participates in normal/close fit, pending resize completion and six-shot19.2sec demo. Preserve existing beats/times and old suites' model/state/renderer.
- [x] Real projection tests desktop856×626 and mobile356.8×429 stage approximations, all six faces including mixed cubies, multiple phases/close; declaration cache prevents repeated model enumeration. Test animation/turn overlapping resize coalesces one fit; reset/undo/suite URL/export audio semantics.
- [x] Pure CLI tests `exportSettings('index.html',{suite:'fantasy'})` has suite parameter/audioFile=null and rejects any audio; offline manifest includes both modules; new four-button mobile flow no stage overlay.

### Task4: Verify and handoff only
- [x] Fresh full `node --test`, all JS/CJS syntax, `git diff --check`, protected bytes/spec ZIP/model snapshot comparisons, privacy-pattern scan. Save exact TAP and actual n−2/active peak counts.
- [x] `node scripts/world-cube.cjs deploy --out /workspace/world-cube-fantasy-preview-1` fresh output; append same isolated QA files externally, changing allowed suite/metadata label only. QA tests guard real canvas, manual clock and no synthetic renderer; product resources SHA equal source.
- [x] Detached Python HTTP server fresh free port8772, stdinDEVNULL/stdout+stderr persistent logs; record actual PID and two separated GET/HEAD rounds roots/all dependencies. Verify8771 full hashes unchanged.
- [x] Provide six precise dynamic target descriptions and time windows, normal/close links, real evidence limitations; stop before civilizations or any publication.

## Plan self-review
Coverage: fantasy§2/6→tasks1/3; six§3 compositions/contact/unique shapes→2; §4 visibility/§5 fit and lifecycle→1/3 plus external QA4; §7 geometry/performance/evidence→4. Signature/hinge/pivot/property names match between motion and draw; no unknown external model/audio APIs. Interface values/pivots/dimensions come directly from approved spec. Potential narrow-screen3px-vs-fixed-size tension is explicitly measured/reported, not silently waived. No unapproved scope or publication step. User explicitly selected same-tree inline local execution, so no execution-choice question or commit step.

## Execution record — 2026-11-25, Asia/Shanghai

The approved same-tree second batch is implemented as a **local candidate, not visually accepted or published**. No third suite, commit/push/deploy, cloud coding or browser automation occurred. Earlier Eastern snapshot is `/workspace/world-cube-natural-notes/eastern-snapshot-20261125-0046/`:91/91 fresh tests, source archive/manifests, clean17-file build, exact real-review evidence/limits in acceptance.md. Old8771 directory and all20 recorded resource hashes remain unchanged/reachable.

### TDD / actual mechanisms
- Red catalog/provider/CLI contracts preceded activation. Canonical static construction at first nonzero time, arbitrary reverse seek, all9 cells, five height bands and high shared seams are tested.
- Real-mesh collision caught a large orbit stone clipping an island near its lower phase: selected .12/.11/.10 cube sides, still inside approved .10–.16, now clear. Independent14s spin avoids corner snapping at the wrapped7s orbit boundary.
- Ruins flag old quadrature wind projected only6.69–7.07CSSpx on representative mobile stage. Searching allowed camera angles alone reached only7.93. Same-phase Y/Z wind (amplitudes/period unchanged) now projects9.72 at the original22°/35° camera. No out-of-range camera or amplitude was introduced.
- Component-union bounds avoid inflating one high tiny object across an entire cell; cached once, no model enumeration during bound generation. Mesh samples through42s and declared extrema are regression checks, not a proof derived from sampling.
- Real contact tests required a closed crystal-bridge deck and four solid legs connecting actual fixed feet to torso. Added supports, no moved approved deck top/foot contacts. Real flying-book/lamp meshes remain separate through42s; pages share hinges and lamp/rope share the same pivot.
- A final actual-wing dimension test caught a folded span<.16. Fold5°–40° per side now preserves .169–.219 combined spans and70° combined angular sweep, with approved .8s period and unchanged .22 unfolded size/orbit.
- Ready-gated actual material caches, real cold-entry original/reset/latest-intent cancellation, competing eastern/fantasy load, retry, URL/reset, close/turn resize coalescing,19.2s physical-beat parity and CLI silent settings are covered. These are Node/API checks, not actual GPU/browser acceptance.

### Fresh verification
- `node --test`:115/115 pass,0 fail (baseline91+24); TAP at notes/fantasy/final-tests.tap. External isolated recorder:8/8 platform-fake tests, explicitly not real video.
- `node --check`:40 JS/CJS files; `git diff --check` clean. Nine protected state/renderer/original/natural/camera/license files byte-identical to HEAD. Three approved specs byte-identical to review ZIP.
- Frozen Eastern comparison:18 old scene ids ×6 model calls=108 exact mesh JSON SHA matches;18 full240×240RGBA texture SHA matches. Eastern two source files and CSS untouched.
- Clean build:19 product resources, all SHA-identical to current starter source. QA HTML/recorder/manifest exist only in sibling preview, not product build/source. Scoped credential-pattern scan56 source/document files:0 hits; no identity configuration changed.
- HTTP: two separated rounds, each27 actual GET+27HEAD, all200 with exact bytes/hash and correct HEAD lengths. New actual server PID1198184,0.0.0.0:8772, log `/workspace/world-cube-natural-notes/http-fantasy-preview-1.log`; not a wrapper PID.

| Scene | Static S0 triangles | A0 | A5 | Sampled active peak | S0+A0+A5 |
|---|---:|---:|---:|---:|---:|
| moonshroom |2146|116|124|156|2386|
| crystal |973|174|222|242|1369|
| ruins |539|107|107|125|753|
| treehouse |1530|196|200|234|1926|
| starspring |815|152|162|194|1129|
| dragon |1771|141|147|153|2059|

n−2 after partition; same-run original sum max25726→limit38589, active peak8031→limit12046.5. Peak observed0..42s/.1 plus named extrema, not a continuous all-time proof. This is geometry, not RAF data.

### First-candidate numerical gaps (subsequent independent-review follow-up below) — not visual acceptance
Representative actual-camera mathematical diagnostics exposed a specification tension; sizes were **not silently enlarged or requirements waived**:
- At mobile stage356.8×429, the approved .025 water ring band projects .771–1.410CSSpx normal and .820–1.909 close, below3. Even representative desktop856×626 normal band1.416–2.590<3. Whole expanding circles are much larger, but that does not meet the written band-thickness gate.
- .055 star grains have mobile normal bbox3.008–3.203px wide but2.718–2.892px high; close3.733–3.986px high. Strict shortest-axis3px normal gate is not met in this diagnostic.
- If “主体” means the single main mushroom / single broken ring / whole dragon rather than the larger grove/island/nest composition, their normal widths at representative desktop stage are10.17% /10.45% /14.56%, below18%; mobile13.52% /12.41% /19.89%. These are explicit real-mesh masks, not a redefinition to pass. Need parent/user decision on literal fixed dimensions versus strict single-hero/band gate before claiming conformance; approved specs remain untouched.
- All twelve selected actual-mesh landmarks exceed8CSSpx over tested fixed0..4s windows and sampled static-occlusion probes meet80%; this does **not** prove every sliding4s interval, human readability or moving-actor occlusion over the entire cycle.
- No fantasy browser/video has been run here. Actual product canvas size is not measured by Shell; isolated QA reports CSS/client/buffer/DPR read-only for the real browser. Desktop/mobile full cycles/8px/touch/first-frame/standard10s+30s×3 RAF/actual encoded media audio remain UNTESTED. No fabricated performance values.

Handoff: `/workspace/world-cube-natural-notes/fantasy/browser-handoff.md`. Product http://127.0.0.1:8772/?suite=fantasy ; isolated actual-canvas recorder http://127.0.0.1:8772/qa.html . Stop before civilizations/publication; any dimensional-spec resolution is a separate explicit decision, not hidden in this implementation.

## Independent review follow-up TDD (2026-11-25 Asia/Shanghai)
Review confirmed authored dimensions are design lower bounds; the previous plan interpreted them too strictly. Preserve all gates. Diagnose at actual emitted/clipped mesh: widen only three water bands until contour-normal thickness>=3CSSpx, orient same .055 star octahedra to meet shortest projected side, widen ring-only and whole-dragon-only local geometry to>=18% without counting supports or hiding clipping. Keep8772 immutable. Red tests first, then one targeted mechanism at a time, full mesh/contact/bounds/CLI tests and new preview+same externalQA. No camera beyond±10°/±5°, grains stay .055; no other batch/publication.

### Follow-up result: fantasy-2 (2026-11-25 Asia/Shanghai)
- Authority clarified: §100 sizes are design lower bounds and§104 permits local scale/layout. Corrected the over-strict “exact dimensions” plan statement, without modifying the approved spec or lowering any gate. Mushroom **grove** is the approved subject, not a single cap; unchanged.
- Widened only three ring bands .025→.12, same2.4s radius/fade/3 phases and32 sectors, still exclude shoreline/islet intersections. Tests reconstruct actual emitted quad pairs *after* wet-surface exclusion, then project separation onto the averaged inner/outer **contour normal** at25/50/75% stations, alpha≥.5,0..4.75s/.05. Internal radial sector spokes are not silhouettes; shoreline end-cap corner widths tend to0 for any polygon and are not regular ring-band girth. A first diagnostic incorrectly counted internal spokes; corrected metric also reproduced old8772<3 before accepting new result. Desktop856×626 min6.788CSSpx; phone356.8×429 min3.695 (narrow341.8×429 supplementary3.511). Actual human contrast/readability remains unaccepted.
- Same .055-diameter octahedra: initial rigidEuler0/30/75 gave3.150phone but narrow-gutter2.993. Fixed asset rotationRx51/Rz−18 now gives phone shortest bbox axis3.157894, desktop5.370294; supplementary341.8 stage3.000419 (tiny margin, finite samples). Every actual extreme vertex retains radius.0275, diam.055; same16 particles/spiral/rise/phase/alpha, no billboarding/camera change. Bounds still contain all actual vertices.
- Main broken ring alone: X radius.40→.80 about fixed(.45,.35), same bottom/top/gap/support, no island counted. Whole connected dragon only: X affine1.5 about−.12, same Z/feet level, head/eyes/wings/tail/cordless ice breath share one transform; nest support transformed separately, shared height uses inverseX. Static/live transformation occurs before partition; actual motion API features use the same transform, maintaining feet/leg/torso/nose/plume contact. No nest/eggs/peaks/floor/breath counted toward body width.
- Minimum actual hero width over0..4s/.1: desktop856×626 ring20.1196% /dragon20.5003%; phone356.8×42924.1841% /27.9993%, both≥18. Normal/close full/mixed fit, analytic-union containment, paired high cuts, real foot/leg/nest support, no actor/static intersection, reverse seek and120-test baseline remain green. Original cameras/renderer untouched.
- New120/120 full Node tests;43syntax files;8external QA platform-fake tests; clean19-resource build. Geometry sums [2386,1343,753,1926,1129,2073], active sampled peaks[156,242,125,234,202,179], same-run caps38589/12046.5. Old18+unchanged mushroom/library:120 model hash comparisons exact; cave/spring static and ruins living also exact. Only fantasy-world.js/ground-fantasy.js changed in product relative8772. Old8772 all27 historical HTTP path hashes remain unchanged.

### Real-output diagnosis, not only Node vertices
The parent reported six original10s WebMs and a possibly sparse61s concatenated review. No video was played here; source WebMs were decoded numerically and selected extracted stills read. Results are external notes/fantasy-scale-2/decoded, not product QA replacement:
- All original decoded frames are distinct: crystal293/293, dragon245/245, mushroom222/222, ruins257/257, starspring281/281, treehouse276/276. The dragon file is10.112014s,1022×800. Metadata is fantasy/manual/playingfalse/reducefalse/stable camera; inspect.time=0 is the *demo slider*, not living time. Actual living clock is performance.now()-manualStart; metadata lacks its absolute phase, so no invented phase alignment.
- Actual decoded half-second pixel changes (max-channel delta>12, projected per-action full-cycle mesh masks using the exact recorded871×682camera/buffer1022×800): crystals2367–3268, pool rings3815–4655, flag1205–1776, lamp412–1270, pendant403–627, whole shaded tail774–1645. Ice breath0–355, with near-zero pauses at~3–4s and7–8s, repeated growth355/353 around2.5/6.5s: consistent4s emission/rest, not a frozen/missing animation. Compression means these counts are diagnostic, not pixel-perfect segmentation or human quality acceptance.
- Read original still pairs: dragon tail wedge changes position; ice plume appears/disappears as a thin strip from snout toward **screen left**, not the tall rear ice columns. Do not claim “watched video” or “all visually passed.” Whole-tail material mask includes branch shading; the decorative fin is mostly embedded in its own tail hull and is not the whole-tail silhouette. Including all moving self-occluders, sampled whole-tail≥80% visible for88.5% phases; lamp96.7%, other reported targets100%; these remain finite area probes.
- Unchanged real renderer/mesh packer GL-boundary trace: distinct uploaded/drawn coordinate snapshots crystals11/rings4/flag5/lamp7/pendant11/tail5/breath6; same-time reuses caches, changing time updates DYNAMIC_DRAW, no cross-id reuse. This does not rasterize; actual video pixel evidence is separate above. No production renderer/cache/clock edits were needed.
- Labeled **actual8772decoded-frame** target-location.png files and dragon actual-pixel-pair crops identify the correct targets. Re-review each original short clip with target image, not the sparse61s montage. Newly enlarged water/dragon and reoriented star still need fresh actual browser/short clips; no additional speculative motions were added.

New immutable product http://127.0.0.1:8773/?suite=fantasy ; same isolated capture QA http://127.0.0.1:8773/qa.html . PID1221576; root/workspace/world-cube-fantasy-preview-2; log/workspace/world-cube-natural-notes/http-fantasy-preview-2.log. All19 product files match source, QA HTML/recorder unchanged from8772 (only external manifest revised). No commit/push/deploy/cloud/browser/third batch. Human normal/close/mobile full-cycle clarity/margins, true touch, first-frame, standard three-roundRAF and CLI encoded audio still UNTESTED; old QAWebM video-only probes do not imply CLI acceptance.

### Parent real-review gate before T-5 (2026-11-25 02:03 Asia/Shanghai)
Parent relayed actual desktop recordings:40c18ef5 confirms crystal/orbits+rings, ruins/stones+flag, spring/grains+pendant, dragon/tail+ice all clear and framed in original-speed non-whole-cycle5.27s excerpts.1d2a confirms books+lamp;d031 moths+spores. Earlier “frozen” conclusions were wrong targets/whole-period sampling and are withdrawn; no speculative new animation was added. Independent reviewer closes all threeImportant,120/120, no newImportant. This establishes desktop core twelve actions, not every phase/view/viewport or full acceptance. Mobile direct-product/newresponsive-QA checks are in progress; mobile full-cycle8px/true touch/performance/first-frame/CLI audio remain unmeasured until explicit evidence. OldQA-mobile with non390 iframe is invalid mobile evidence. Freeze this state before same-tree civilizations work; keep8773/8774 immutable.
