# Starter and rendering

Open `assets/starter/index.html` in a WebGL browser. The local starter has a 19.2-second demo, layer controls, an orbit camera and a **贴地看** view for inspecting ground contact.

## Source map

| Change | File under `assets/starter/` |
| --- | --- |
| Scene labels, primitive builder, clip planes and static cache | `cube-habitats.js` |
| Top-down pixel materials for the ground or seabed | `ground-surfaces.js` |
| Shark reef and shrimp among driftwood | `ground-water.js` |
| Autumn cottage, lighthouse, lake and shoreline functions | `ground-valley.js` |
| Egret marsh and jellyfish among kelp | `ground-night.js` |
| Mesh upload, perspective, cubie attachment, shadows and depth testing | `habitat-renderer.js` |
| Terrain-relative camera poses, roll and orientation blending | `ground-camera.js` |
| Face assignment, turn cues, shots, duration and interaction | `cube.js` |
| Cube state, quarter-turns, moving ground frames and cubie identities | `cube-state.js` |

## Author geometry across nine regions

A habitat module implements `draw(id, b, t)`. The ground plan spans `[-1.5, 1.5]` in both X and Y. Z is altitude measured from the tile surface in cubie-width units. Author foundations, shorelines and roots in XY. Build walls, trunks and emergent plants in +Z. A falling leaf descends toward its contact height, then settles there. A bubble rises along +Z while its XY position drifts with the current. Keep whole-face positions and a single absolute time across tile seams.

For the lake and valley, `GroundValley.surface(id,x,y)` supplies a signed shoreline measure to both the terrain painting and the objects along the banks. Positive values are land. Keep a shared shoreline function when you change a river, lake or island and its mooring points.

| Builder call | Use |
| --- | --- |
| `b.face(points, color, alpha = 1)` | A convex polygon of `[x,y,h]` vertices. Split concave or warped surfaces into triangles. |
| `b.box(x,y,h,sx,sy,sh,color)` | A shaded, centered box, with full side lengths. |
| `b.ell(x,y,h,rx,ry,rh,color,seed)` | A faceted ellipsoid using the three supplied radii. |
| `b.branch(a,b,r0,r1,color,sides)` | A tapered tube between two 3D points. |
| `b.pixel(x,y,h,size,color)` | A small, square mark parallel to the face. |
| `b.rnd(seed)` | A repeatable value for site placement or variation. |
| `b.static(key, fn)` | Draw fixed geometry in the static pass. The callback receives the builder. |

Use hex colors of the form `#rrggbb`. Put trunks, banks and architecture inside `b.static(...)`. Draw fish, foliage in motion, smoke and other moving elements outside that callback and derive them from the explicit time `t` in seconds. Stable seeds preserve the same arrangement after seeking. The static geometry cache is keyed by habitat ID.

`CubeHabitats.model(id,t,true)` returns nine arrays of fixed polygons. `CubeHabitats.model(id,t,false)` returns the same structure for the living elements at `t`. Each polygon has `points`, `color` and `alpha`. Regions are ordered top-left to bottom-right. Both passes clip meshes at `x = ±0.5` and `y = ±0.5` and at the outer square. **The points in each returned region still use whole-face coordinates.**

The WebGL vertex shader subtracts the original slot center `[col−1, 1−row]`. For every tile, `CubeState.groundFrame(cubie, faceName, move, angle)` returns its transformed `origin` at the cubie center, the two ground tangents `right` and `forward`, the outward `normal`, and `gravity` facing inward. A scene point at height Z is that far above the shell surface along the normal. Apply the same intermediate turn to positions, geometry and gravity. The terrain material uses the original row and column. Opaque mesh fragments use the shell's depth buffer, and the renderer handles translucent details in a later pass.

`GroundCamera.habitat(face, azimuth, altitude, zoom, focusHeight, x, y)` produces a camera whose local horizon follows that terrain. Azimuth and altitude are degrees. Focus height is the distance from the cube center along the selected face normal. The last two arguments move the focus along its ground tangents. Use `GroundCamera.between(a,b,t)` to interpolate the orientation, focus and zoom between two poses.

## Set the landing

`{axis:"y", layer:1, dir:1}` turns the top slice through 90° by the right-hand rule. `CubeState.faceLayout(landing,"PZ")` resolves the front face's nine destination slots to their source regions and rotations. The landing checker in `cube.js` uses this information to distinguish a completely assembled picture from nine pieces with inconsistent orientations. Keep the original sticker identity for every draw, including the center and fragments from other sides.

## Export an MP4

The browser exposes `window.renderAt(t)` and `window.sceneCube.duration`. The model, layer interpolation and camera use the requested time on every export frame. Add `?export=1` to hide the preview controls. The optional exporter needs Node, Playwright with Chromium, and FFmpeg with `libx264` on PATH. From the skill directory run the following command with an unused output path.

```sh
# Natural Wonders: silent by default; --suite natural is shown explicitly.
node scripts/render.cjs assets/starter/index.html natural-cube.mp4 --suite natural --fps 60 --width 1080 --height 1080

# Eastern Landscapes: lazy-loaded first batch, also silent.
node scripts/render.cjs assets/starter/index.html eastern-cube.mp4 --suite eastern --fps 60 --width 1080 --height 1080

# Fantasy Realms: second local batch, also silent.
node scripts/render.cjs assets/starter/index.html fantasy-cube.mp4 --suite fantasy --fps 60 --width 1080 --height 1080
node scripts/render.cjs assets/starter/index.html civilizations-cube.mp4 --suite civilizations --fps 60 --width 1080 --height 1080

# Original six habitats: bundled foley belongs only to this suite.
node scripts/render.cjs assets/starter/index.html gravity-cube.mp4 --suite original --fps 60 --width 1080 --height 1080 --audio assets/gravity-foley.flac
```

Use `--playwright` and `--browser` for an existing package directory and Chromium executable. At 19.2 seconds and 60 fps the exporter captures 1,152 frames at `frame / fps`. The bundled sound mixes creek, forest and underwater ambience with six wooden detents. The CLI defaults to `--suite natural`, always silent, and rejects `--audio` for that suite. Use `--suite original` to render the original six habitats; omit `--audio` there for a silent original export. The CLI adds both `export=1` and the selected `suite` to the file URL before loading. `INPUT.html` is a filesystem path: do not append `?suite=original` to that filename. The query form is for opening the page directly in a browser only. Decode the film and inspect local verticals on two adjacent faces, the sweep of a turn, and a settled scene with living motion. Seek away and back to a moving frame to verify repeatability.


All five suites (`natural`, `eastern`, `fantasy`, `civilizations`, `original`) are implemented locally; default remains `natural`, not a publication/acceptance claim. Each new suite's two classic scripts load on demand over HTTP/file URLs; the encoder awaits `window.sceneCube.ready`. All non-original suites reject `--audio`; original retains explicit optional audio. Pure CLI tests do not establish absence of audio in an actual encoded MP4.

Original/natural physical beats and old24 geometry/materials remain unchanged. Parent reports Eastern and Fantasy desktop two-action real-media checks; Fantasy independent120-test review closed threeImportant. Prior wrong-target/whole-cycle-sampling “frozen” reports were withdrawn. Parent's latest mobile check is still pending. Mobile full-cycle8px, realtouch, firstframe, prescribed10s warm/30s×3 median/P90 and encoded media are not established by Node tests. Civilizations is a fresh local candidate: all real desktop/mobile/readability/touch/performance/encoded-audio acceptance remains pending. A separate responsive, video-only20second QA recorder covers its19.2second long motions; no QA code is included in product builds. Do not infer a release from local construction or borrow historic natural RAF measurements.
