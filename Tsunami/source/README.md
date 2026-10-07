# Tsunami Simulator

Play at **http://127.0.0.1:4188/** while the local server is running. On this Mac, double-click `start.command` to start it again. The server must keep running while you play.

Choose **Shanghai**, **New York**, or **Hawaii**, then press **Start**. **Smaller/Bigger** sets the next emitted wave, from 1 to 5. **Finish** freezes the scene; Start then rebuilds the same location at your edited dam height and selected size. Clicking any city name, including the current city, restores pristine defaults.

Before Start, select **Pencil** and drag upward on the dam to add opaque concrete. **Eraser** removes only your added height, down to the original crest. While waves run, **Hammer** taps weaken the same integrity that wave impacts damage. An overtopped wall passes water; a breached wall opens the barrier. The raised wall changes flooding without changing incoming wave heights. Floodwater moves faster across the city and through a breached wall, so building impacts arrive sooner.

Select a person, rescuer, ordinary boat, or rescue boat, then tap a valid street, roof, deck, or water location. Boats require water near the surface and room between hulls. People climb roofs, ride vessels, swim, and can remain visible underwater. Floating and sunken cars, fallen trees/lights, and bin rubbish respond to the flood. Rubbish stays beside its source bin. Rescue boats arrive after the final waves; they can pick up swimmers and can also overturn.

Keyboard: focus the scene, use arrows to move a placement target or adjust a dam preview, **Enter** to apply the active action, and **Escape** to clear the tool.

## Local development

Dependencies are prepared in this folder. With Node available:

```sh
npm run dev
npm test
npm run test:e2e
npm run build
```

Three.js 0.180.0 is vendored locally; its license is in `vendor/THREE-LICENSE.txt`. React 19.3.0, Vite 7.3.6, and Playwright 1.63.0 match the installed local dependencies. Reference games were read for local dependency reuse and were not edited. A clean dependency installation requires registry access; an offline lockfile could not be generated with the local package manager's registry checks.

## Verified behavior and limits

The final verification covers simulation/model regression tests, real pointer drawing and erasing, actor and rescue-boat placement, five hammer hits opening a breach, freeze/restart, exclusive modes, city restoration, and desktop/phone controls. Chromium screenshots cover all cities, large waves, damage, rescue arrival, and reset. Browser plugin not available; browser QA uses Playwright. Final results: 18/18 simulation/model tests and 5/5 browser tests passed; production build succeeded. Exact commands and results are recorded in the implementation plan's execution ledger. Durable screenshots and live automatic-rescue/reset evidence are in `docs/qa/`.

This is an entertainment sandbox with approximate water transport and scripted actor physics, not a scientific hazard model. The scene uses real 3D meshes and textured materials with a fixed side camera, but its appearance is stylized rather than photorealistic. Cities are representative environments, not accurate geographic reconstructions. Models are small on narrow portrait screens; desktop or landscape gives a clearer scene. Only Chromium is browser-verified. Severe runs intentionally make survival difficult; reaching rescue does not guarantee that every boat or person survives. The production Three.js chunk triggers Vite's size advisory; the build succeeds.

## Visual assets

Built-in image generation produced the design concept at `docs/superpowers/specs/visual-concept.png` and a concrete/brick/stone/asphalt texture atlas at `public/art/material-atlas.png`. The concept informed composition; runtime controls, buildings, actors, vessels, and water are code-built 3D objects. No image generation was repeated during final implementation.

Visual comparison: the runtime retains the concept's navy frame, named city row, left dam tools, right entity palette, four bottom controls, muted building colors, and side-view composition. The generated reference has greater photographic fidelity than the actual lightweight 3D game; this departure is visible and intentional for the playable implementation.
