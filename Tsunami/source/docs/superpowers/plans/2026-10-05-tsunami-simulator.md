# Tsunami Simulator Implementation Plan

> For agentic workers: execute inline using superpowers:executing-plans, with a fresh final code review. User explicitly authorized immediate implementation; no additional approval gate.

**Goal:** A complete playable side-view tsunami sandbox covering every confirmed feature in the design.

**Architecture:** React owns controls, selector, palette and input mode. A deterministic JavaScript simulation owns wave generation, water transport, damage, actors and props. Three.js renders actual volumetric structures, models, water and effects from the simulation; no React updates per animation frame.

**Tech Stack:** React, Vite, ES modules, locally vendored Three.js 0.180.0, Node test runner, Playwright Chromium.

**Spec:** `../specs/2026-10-05-tsunami-simulator-design.md`

## Global constraints

- Work only inside Tsunami Simulator. No Git repository is present; do not create a worktree or commits.
- Fixed side view, actual 3D buildings and dam, detailed natural materials/colors; no repeated plain cubes.
- Include Shanghai/Huangpu, New York and Hawaii; selection always restores pristine defaults.
- Preserve four controls, Pencil/Eraser/Hammer, placement palette, all actors/props and final rescue.
- Finish stops/freeze; fresh Start rebuilds at the chosen dam height. City selection resets height.
- Rubbish stays beside its source bin; underwater objects/people remain visible; drowning is non-graphic.

## Review focus

- A pointer gesture must trigger exactly one active tool; touch cannot duplicate placement or hits.
- Raising/erasing must change physical overtopping independently of fixed emitted wave heights.
- Fresh/revisited location selection must discard every old timer, actor addition, damage and water state.
- Low frame rates/hidden tabs must not generate enormous simulation jumps or duplicate waves.
- Transparent water must preserve underwater visibility without showing actors through solid buildings.

## Task 1 Simulation and water

Files: `src/simulation/locations.js`, `water.js`, `Simulation.js`, `actors.js`, `props.js`; `tests/simulation.test.js`.

Interface: `Simulation` exposes `selectLocation(id)`, `start()`, `finish()`, `setSize(value)`, `setDamHeight(height)`, `hammer()`, `place(kind,x,y)`, `step(dt)`, `snapshot()`; WaterField exposes `sample(x)`, `step(dt, crest, breached, pulses)`.

- [x] Write tests for complete freeze/reset, size bounds, recurring progressive breach, overtopping comparison with raised/erased dam, wave/hammer shared damage, city reset, swimmer/drowning, boats/ships/cars, falling props/local rubbish, and rescue.
- [x] Run tests and observe missing behavior failures.
- [x] Implement seeded location definitions, stable bounded flux, coherent snapshots, actors/props and lifecycle.
- [x] Run `npm test`; expect all simulation checks green.

## Task 2 Detailed 3D scene

Files: `src/rendering/materials.js`, `models.js`, `CityScene.js`, `Renderer.js`; `tests/rendering.test.js`.

Interface: `Renderer(canvas, simulation)`, `render()`, `resize()`, `worldPoint(clientX,clientY)`, `dispose()`; scene builders consume location definitions and snapshots.

- [x] Write geometry tests for actual depth, distinct model silhouettes, dam edit geometry and all location assets.
- [x] Implement detailed facades, roofs, dam, ships/boats, clothed articulated people, cars, trees/lights/bins, local rubbish; shader water and foam/spray; fixed camera and resource disposal.
- [x] Verify model tests and inspect browser ready/flooded states against the concept. Correct rendering/scale/visibility problems.

## Task 3 Playable controls and tools

Files: `src/App.jsx`, `src/components/Controls.jsx`, `Palette.jsx`, `Tools.jsx`, `Stage.jsx`, `src/styles.css`, `src/main.jsx`, `index.html`, `package.json`, `vite.config.js`.

- [x] Define e2e checks for three location selections, Start/Finish/size, exclusive Pencil/Eraser/Hammer/placement, opaque height editing, hammer breach, touch behavior and mobile layout.
- [x] Implement responsive navy frame, top location row, small left tools, right recognizable palette, code-native controls/status/help, pointer/keyboard actions and single frame loop.
- [x] Verify production build and complete desktop/mobile interactions with no console errors.

## Task 4 Final verification and handoff

- [x] Run full unit/build/browser checks; inspect concept and latest screenshots with view_image.
- [x] Obtain fresh reviewer feedback under executing-plans and fix substantive findings with regression checks.
- [x] Record actual tested behavior, visual departures and honest limitations in README, keep the app running, and open its URL in Codex.

## Execution ledger

Ruling: use JavaScript ES modules with clear model boundaries rather than TypeScript to keep the local build lean; test behavior directly. Vendored Three.js is copied into this project so it has no runtime dependency on Driving. React/Vite packages can be installed from the existing local package store. Browser plugin is absent; use Playwright fallback. No extra approval/commit steps because the user explicitly asked for immediate construction in a non-Git folder.


Task 1: complete — deterministic water/actors/props and freeze/reset verified. Task 2: complete — actual volumetric meshes, materials, depth-tested translucent water, building light loss, and resource disposal; concept and rendered screenshots inspected. Task 3: implemented — pointer/keyboard tools, exclusive placement, responsive controls and city selection.

Final review: fresh read-only reviewer found four Important boat initialization/movement problems. Each reproduction was watched fail, then fixed: local water height initializes hull and previousSurface; movement respects an intact barrier and shallow land; capsizing uses actual water forces rather than the next-wave size selector; passengers receive deck transforms immediately in Ready. Full model/simulation suite passed 17/17 after this fix pass. No deferred minors. Scientific hazard accuracy was set aside by the reviewer and remains outside the entertainment scope.

Final verification: Chromium at 1440×950 and 390×844; pointer draw/erase, person/rescuer/boat/rescue placement, shared hammer damage/breach, freeze/restart, city resets, and single-action touch taps verified. First cold-start runs hit software-GPU readiness timing; the pointer flow passed in isolation in 29.3s. Readiness assertions now have a bounded 15s wait. Final combined suite is recorded below after completion.

User follow-up: make floodwater move quicker to the buildings. Existing city diffusion took about 18s for one unit of water depth at the second building. Increased transport only on the city side and at an open breach; retained ocean transport and the original overtopping threshold/flow. Regression was observed RED, then GREEN: the second building now exceeds one unit by 12s, and middle-city depth exceeds 0.3 by 20s. Full unit/model suite 18/18 passed; production build passed (Three.js chunk-size advisory only). This is a speed adjustment within the requested gameplay, without a new control or feature.


Final browser suite: `node node_modules/@playwright/test/cli.js test --workers=1` → 5/5 passed, 1.3 minutes, including actual mouse height edits/placement/breach and phone single-event touch input. Fresh final `node --test tests/*.test.js` → 18/18 passed. Fresh final `node node_modules/vite/bin/vite.js build` → success. Pointer startup assertion passed in the combined run (30.3 seconds for the whole interaction test); there is no remaining reproducible startup failure.


Task 4: complete — final live Chromium run used only city selection, Bigger and Start (zero manually placed rescue boats). The visible run-state changed to Rescue and the phase message to Rescue boats arriving, with two automatically added rescue boats/four crew. Revisited Shanghai reset to ready, time 0, integrity 100%, 30 people/3 boats and no breach; console/page error list empty. Actual phase/time/count evidence is saved in `docs/qa/live-run-evidence.jsonl`; all three city previews, before/after flood, underwater actors/sinking ship, automatic rescue, mobile and pristine reset screenshots are in `docs/qa`. The faster-water flood screenshot was inspected visually. The playable browser URL was opened via Codex (queued for this chat); server stays running on 127.0.0.1:4188. No Git repository or branch exists, so branch integration and commits do not apply. No worktree or plan scratch directory was deleted.
