# Earthquake Simulator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, playable browser earthquake simulator with four recognizable landmarks, progressive physics damage, evacuation activity, and simple quake controls.

**Architecture:** A React and TypeScript app owns explicit `ready`, `running`, and `finished` states while a focused Matter.js simulation module owns bodies, constraints, damage, and scene rebuilding. A canvas renderer draws approved raster art and code-native UI around deterministic model/config modules that can be tested without a browser.

**Tech Stack:** React 19, TypeScript, Vite, Matter.js, Vitest, Testing Library, Playwright, Canvas 2D, Web Audio API

**Spec:** `docs/superpowers/specs/2026-09-27-earthquake-simulator-design.md`

## Global Constraints

- One of four landmarks is visible at a time: Eiffel Tower, Leaning Tower of Pisa, Empire State Building, or Twin Towers.
- The landmark selector stays at the top; Start, Finish, Smaller, and Bigger stay at the bottom.
- The landmark dominates the view; the street remains clearly visible but secondary.
- Light shaking sways a strong landmark; strong or sustained shaking can progressively collapse it.
- Start sounds the alarm and begins evacuation; Finish stops shaking and preserves the result.
- Starting after Finish rebuilds the same landmark; changing landmarks rebuilds immediately.
- Nearby buildings, people, varied vehicles, trees, and streetlights respond progressively to quake strength.
- Human harm remains non-graphic with no blood or gore.
- The app supports desktop, mobile, keyboard, touch, mute, and reduced-motion preferences.
- The experience is illustrative and not an engineering-grade seismic analysis tool.

## Review Focus

- Rapid Start/Finish/Start input must leave exactly one active engine, alarm, and animation loop; covered by Task 5 state-transition tests.
- Rapid landmark switching must fully remove old physics bodies and timers; covered by Task 4 rebuild tests.
- Minimum and maximum strength clicks must clamp without wrapping or producing invalid forces; covered by Task 2 reducer tests.
- Audio denial or unavailable audio context must not block the simulation; covered by Task 6 audio fallback tests.
- Small mobile viewports and reduced-motion mode must keep controls usable and the landmark visible; covered by Task 7 browser tests.

---

### Task 1: Approved Visual Concept and Project Foundation

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/test/setup.ts`
- Create: `tests/smoke/App.smoke.test.tsx`
- Create: `public/art/concept-earthquake-simulator.png`

**Interfaces:**
- Consumes: the approved design specification.
- Produces: a bootable React application, global design tokens, test harness, and accepted full-screen concept image used as the fidelity reference.

- [ ] **Step 1: Generate the full primary-screen visual concept**

Use ImageGen to create a realistic two-dimensional side-view game screen showing the Eiffel Tower as the dominant intact landmark, smaller city buildings, a readable street strip with people and varied vehicles, trees, streetlights, the four landmark choices at the top, and the four primary controls at the bottom. Keep text short and readable and exclude graphic injury.

- [ ] **Step 2: Review the concept for specification coverage**

Check composition, natural colors, control placement, landmark dominance, street readability, vehicle variety, and family-safe treatment. Iterate until the concept can serve as the implementation reference.

- [ ] **Step 3: Write the failing smoke test**

Create `tests/smoke/App.smoke.test.tsx` asserting that `App` renders the landmark selector and buttons named `Start`, `Finish`, `Smaller`, and `Bigger`.

- [ ] **Step 4: Run the smoke test to verify it fails**

Run: `npm test -- --run tests/smoke/App.smoke.test.tsx`

Expected: FAIL because the application shell is not implemented.

- [ ] **Step 5: Scaffold the React/Vite application**

Implement the listed configuration and entry files. Define exact design tokens for the concept palette, typography, spacing, control height, and responsive breakpoints. Keep `App` as composition glue.

- [ ] **Step 6: Run the smoke test and production build**

Run: `npm test -- --run tests/smoke/App.smoke.test.tsx && npm run build`

Expected: PASS and a successful Vite production build.

- [ ] **Step 7: Save checkpoint**

If the project is under Git, commit with `feat: scaffold earthquake simulator`; otherwise record the completed checkbox state in this plan.

### Task 2: Simulation State and Earthquake Strength Model

**Files:**
- Create: `src/simulation/types.ts`
- Create: `src/simulation/config.ts`
- Create: `src/simulation/state.ts`
- Test: `src/simulation/state.test.ts`

**Interfaces:**
- Consumes: no runtime dependencies.
- Produces: `SimulationStatus`, `LandmarkId`, `SimulationState`, `simulationReducer(state, action)`, `intensityConfig(level)`, and exact strength bounds used by the UI and physics engine.

- [ ] **Step 1: Write failing reducer and configuration tests**

Test that strength starts at `2`, clamps to `1...5`, Start changes `ready` or `finished` to `running`, Finish changes `running` to `finished`, repeated Start/Finish is stable, and selecting a landmark returns a fresh `ready` state for that landmark.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/simulation/state.test.ts`

Expected: FAIL because the state module does not exist.

- [ ] **Step 3: Implement typed state and intensity configuration**

Define `LandmarkId` as `'eiffel' | 'pisa' | 'empire' | 'twin-towers'`; define status as `'ready' | 'running' | 'finished'`; map levels `1...5` to bounded amplitude, frequency, vertical impulse, stress multiplier, and city-damage threshold values.

- [ ] **Step 4: Run the focused tests**

Run: `npm test -- --run src/simulation/state.test.ts`

Expected: PASS.

- [ ] **Step 5: Save checkpoint**

Commit when available with `feat: add earthquake simulation state`.

### Task 3: Landmark and City Scene Definitions

**Files:**
- Create: `src/scene/sceneTypes.ts`
- Create: `src/scene/landmarks/eiffel.ts`
- Create: `src/scene/landmarks/pisa.ts`
- Create: `src/scene/landmarks/empire.ts`
- Create: `src/scene/landmarks/twinTowers.ts`
- Create: `src/scene/landmarks/index.ts`
- Create: `src/scene/cityProps.ts`
- Test: `src/scene/landmarks/landmarks.test.ts`

**Interfaces:**
- Consumes: `LandmarkId` from Task 2.
- Produces: `LandmarkDefinition`, `LandmarkSection`, `ConstraintDefinition`, `getLandmarkDefinition(id)`, and `createCityPropDefinitions(viewport)`.

- [ ] **Step 1: Write failing landmark definition tests**

For each ID, assert a unique title, natural palette, normalized bounds within `0...1`, at least eight structural sections, connected constraint references, and a stable base. Assert that city props include surrounding buildings, two trees, two streetlights, pedestrians, and ambulance/taxi/compact/large vehicle variants.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/scene/landmarks/landmarks.test.ts`

Expected: FAIL because the definitions do not exist.

- [ ] **Step 3: Implement the four landmark definitions**

Use landmark-specific proportions and section layouts. Keep visible landmark surfaces code-native SVG/canvas shapes so each section can follow its own physics body; document this as the intentional interactive-art exception to raster asset use.

- [ ] **Step 4: Implement reusable city prop definitions**

Return deterministic definitions for nearby buildings, street, sidewalks, trees, lights, people, and the four vehicle categories with natural color variants.

- [ ] **Step 5: Run the focused tests**

Run: `npm test -- --run src/scene/landmarks/landmarks.test.ts`

Expected: PASS.

- [ ] **Step 6: Save checkpoint**

Commit when available with `feat: define landmarks and city scenes`.

### Task 4: Physics Scene, Damage, and Evacuation Controllers

**Files:**
- Create: `src/simulation/PhysicsScene.ts`
- Create: `src/simulation/DamageController.ts`
- Create: `src/simulation/EvacuationController.ts`
- Create: `src/simulation/seededRandom.ts`
- Test: `src/simulation/PhysicsScene.test.ts`
- Test: `src/simulation/DamageController.test.ts`
- Test: `src/simulation/EvacuationController.test.ts`

**Interfaces:**
- Consumes: landmark/city definitions from Task 3 and intensity configuration from Task 2.
- Produces: `PhysicsScene.mount(definition, viewport)`, `step(deltaMs, intensity)`, `freeze()`, `destroy()`, `snapshot()`, `DamageController.update(snapshot, elapsedMs, intensity)`, and `EvacuationController.update(deltaMs, status, intensity)`.

- [ ] **Step 1: Write failing lifecycle and rebuild tests**

Assert one engine per mounted scene, complete cleanup on `destroy`, no old bodies after changing landmarks, and a frozen snapshot after Finish.

- [ ] **Step 2: Write failing progressive-damage tests**

Assert that level 1 does not immediately break landmark constraints, level 5 accumulates enough stress to break constraints after sustained steps, trees topple only at high thresholds, and lights transition through on/flicker/off states.

- [ ] **Step 3: Write failing evacuation tests**

Assert that evacuation is idle in `ready`, begins in `running`, moves pedestrians toward exits, moves building occupants downward, sends most vehicles off-screen, and marks only a seeded minority as broken down at high strength.

- [ ] **Step 4: Run focused tests to verify failure**

Run: `npm test -- --run src/simulation/PhysicsScene.test.ts src/simulation/DamageController.test.ts src/simulation/EvacuationController.test.ts`

Expected: FAIL because the controllers do not exist.

- [ ] **Step 5: Implement the physics lifecycle**

Create Matter.js bodies and constraints from normalized definitions, apply bounded ground motion, accumulate constraint stress, provide serializable snapshots, and make `freeze` and `destroy` idempotent.

- [ ] **Step 6: Implement damage and evacuation behavior**

Use deterministic seeded randomness per run so tests and visual verification are reproducible while still providing variation between rebuilt runs.

- [ ] **Step 7: Run the focused tests**

Run: `npm test -- --run src/simulation/PhysicsScene.test.ts src/simulation/DamageController.test.ts src/simulation/EvacuationController.test.ts`

Expected: PASS.

- [ ] **Step 8: Save checkpoint**

Commit when available with `feat: add quake physics and evacuation`.

### Task 5: Interactive Game Screen and Canvas Renderer

**Files:**
- Create: `src/components/LandmarkSelector.tsx`
- Create: `src/components/SimulationStage.tsx`
- Create: `src/components/ControlBar.tsx`
- Create: `src/components/StrengthIndicator.tsx`
- Create: `src/rendering/CanvasRenderer.ts`
- Create: `src/hooks/useSimulation.ts`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`
- Test: `src/App.test.tsx`
- Test: `src/hooks/useSimulation.test.tsx`

**Interfaces:**
- Consumes: reducer from Task 2, definitions from Task 3, physics/controllers from Task 4.
- Produces: the playable UI and `useSimulation()` orchestration hook.

- [ ] **Step 1: Write failing interaction tests**

Test top landmark selection, bottom control order, strength label changes, Start/Finish transitions, Start-after-Finish rebuild, rapid Start/Finish/Start leaving one active loop, and landmark switching triggering exactly one clean rebuild.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/App.test.tsx src/hooks/useSimulation.test.tsx`

Expected: FAIL because the components and hook do not exist.

- [ ] **Step 3: Implement focused React components and orchestration hook**

Keep `App` declarative. Put engine ownership and animation-frame cleanup in `useSimulation`. Expose current status, strength, landmark, alarm visibility, and callbacks to the components.

- [ ] **Step 4: Implement the canvas renderer**

Render background art, surrounding city, physics-following landmark sections, props, people, vehicles, dust, warning indicators, and light states. Use the approved concept as the palette and composition reference.

- [ ] **Step 5: Implement responsive styling**

Preserve the top selector, dominant central stage, readable lower street band, and bottom controls without overflow from `360px` mobile width through large desktop screens.

- [ ] **Step 6: Run tests and build**

Run: `npm test -- --run src/App.test.tsx src/hooks/useSimulation.test.tsx && npm run build`

Expected: PASS and successful build.

- [ ] **Step 7: Save checkpoint**

Commit when available with `feat: build interactive earthquake game screen`.

### Task 6: Alarm Audio, Accessibility, and Safe Fallbacks

**Files:**
- Create: `src/audio/AudioController.ts`
- Create: `src/audio/createAlarm.ts`
- Create: `src/components/MuteButton.tsx`
- Modify: `src/hooks/useSimulation.ts`
- Modify: `src/App.tsx`
- Test: `src/audio/AudioController.test.ts`
- Test: `src/App.accessibility.test.tsx`

**Interfaces:**
- Consumes: simulation status from Task 2 and UI orchestration from Task 5.
- Produces: `AudioController.startAlarm()`, `stopAlarm()`, `setMuted(boolean)`, graceful audio fallback, accessible labels, focus states, and reduced-motion behavior.

- [ ] **Step 1: Write failing audio and accessibility tests**

Test user-gesture audio startup, stop on Finish, no duplicate oscillator on repeated Start, safe behavior when AudioContext is rejected or absent, accessible names for all controls, keyboard activation, and reduced-motion camera-shake suppression.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- --run src/audio/AudioController.test.ts src/App.accessibility.test.tsx`

Expected: FAIL because audio and accessibility behavior are incomplete.

- [ ] **Step 3: Implement synthesized alarm and fallback**

Use Web Audio oscillators after user interaction; never require a downloaded audio file. On failure, retain the visible alarm indicator and continue the simulation.

- [ ] **Step 4: Implement accessibility behavior**

Add mute, focus-visible states, ARIA labels and live status, touch sizing, keyboard behavior, and reduced-motion CSS/renderer flags.

- [ ] **Step 5: Run tests and the full suite**

Run: `npm test -- --run && npm run build`

Expected: all tests PASS and build succeeds.

- [ ] **Step 6: Save checkpoint**

Commit when available with `feat: add alarm and accessible controls`.

### Task 7: Browser Gameplay and Fidelity Verification

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/gameplay.spec.ts`
- Create: `docs/qa/fidelity-ledger.md`
- Modify: implementation files only when verification finds a mismatch.

**Interfaces:**
- Consumes: the complete app and accepted concept from Tasks 1-6.
- Produces: repeatable browser coverage, desktop/mobile screenshots, and a completed fidelity ledger.

- [ ] **Step 1: Write the failing end-to-end flow**

Test initial Eiffel scene, each landmark choice, Bigger/Smaller bounds, Start alarm/evacuation, visible scene changes during strong shaking, Finish freeze, Start rebuild, and mobile control visibility.

- [ ] **Step 2: Run the browser test to verify any failures**

Run: `npm run test:e2e`

Expected: initial failures identify missing browser-visible behavior or selectors.

- [ ] **Step 3: Fix browser-visible behavior until the flow passes**

Keep changes scoped to verified defects and rerun the focused scenario after each repair.

- [ ] **Step 4: Capture desktop and mobile screenshots**

Capture the intact ready state and a strong-quake state at the accepted concept dimensions when practical, plus a `390x844` mobile viewport.

- [ ] **Step 5: Compare concept and implementation with image inspection**

Use `view_image` on the accepted concept and latest implementation screenshots. Record at least five comparisons covering layout, landmark scale, palette, street readability, control placement, typography, asset treatment, and motion-state clarity.

- [ ] **Step 6: Complete the fidelity ledger and fix all material mismatches**

Record mismatch, concept evidence, render evidence, and fix or intentional deviation. Run an above-the-fold copy diff and document the interactive vector landmark sections as the intentional asset deviation required for physics.

- [ ] **Step 7: Run final verification**

Run: `npm test -- --run && npm run build && npm run test:e2e`

Expected: all unit/integration tests PASS, production build succeeds, and browser tests PASS on desktop and mobile.

- [ ] **Step 8: Save final checkpoint**

Commit when available with `test: verify earthquake simulator gameplay`.
