# Earthquake Simulator Design

## Purpose

Create a browser-based, realistic-looking earthquake sandbox where a player selects one landmark, starts a quake, changes its strength, and watches the landmark and surrounding city react. The experience should feel like a visual structural test rather than an arcade score game.

## Experience Goals

- Make the selected landmark immediately recognizable and visually dominant.
- Let light shaking create believable swaying without instant collapse.
- Let stronger or sustained shaking progressively damage the landmark and city.
- Keep controls simple enough to understand without instructions.
- Show evacuation and emergency activity without blood, gore, or graphic injury.
- Make every run easy to stop, inspect, rebuild, and repeat.

## Landmark Set

The first version includes four selectable landmarks, with one visible at a time:

1. Eiffel Tower
2. Leaning Tower of Pisa
3. Empire State Building
4. Twin Towers

Each landmark uses its recognizable silhouette, proportions, structural rhythm, and real-world-inspired material colors. The models are assembled from connected rigid sections rather than generic rectangular stacks. The landmark begins structurally strong and only separates after sufficient stress.

The Twin Towers are presented as an architectural model in a neutral structural simulation. The experience does not recreate a real-world attack or use graphic imagery.

## Screen Composition

- A landmark selector sits across the top.
- The selected landmark occupies most of the central view.
- Smaller city buildings frame the landmark without obscuring it.
- A street-and-sidewalk band occupies a smaller but clearly visible portion of the lower scene.
- The primary controls sit along the bottom: **Start**, **Finish**, **Smaller**, and **Bigger**.
- A compact strength indicator communicates the current earthquake force without adding another control.
- The layout adapts to desktop and mobile screens while preserving the landmark as the focal point.

## Core Interaction

### Ready State

- The selected landmark is intact.
- Cars move along the street and pedestrians walk on sidewalks.
- Some occupants are visible inside the landmark and surrounding buildings.
- Streetlights are on and trees are upright.

### Start

- Pressing **Start** begins the earthquake and sounds an alarm.
- Pedestrians on the street run toward the edges of the scene.
- Most vehicles drive away; a small number may break down during severe shaking.
- Occupants inside buildings move downward and toward exits.
- If the prior run has finished, pressing **Start** first rebuilds the current scene and then begins a new run.

### Strength Controls

- **Smaller** reduces shaking intensity by one step.
- **Bigger** increases shaking intensity by one step.
- Strength changes take effect during an active quake.
- Light shaking produces movement and swaying.
- Medium shaking creates stronger motion and early structural stress.
- Strong shaking can break constraints, topple objects, disable infrastructure, and collapse structures.

### Finish

- Pressing **Finish** stops the earthquake.
- The final positions of fallen or damaged objects remain visible for inspection.
- Pressing **Start** again rebuilds the same landmark for another run.
- Selecting a different landmark rebuilds the entire scene immediately with the new landmark.

## City Reactions

The city responds progressively to earthquake strength:

- Surrounding buildings sway during light shaking and may partially or fully collapse during sustained strong shaking.
- Trees sway, then may topple at high intensity.
- Streetlights shake, flicker, and can go dark at high intensity.
- Traffic includes ambulances, taxis, compact cars, and larger vehicles with distinct silhouettes and natural colors.
- Most vehicles evacuate. A few may stop or break down during a strong quake.
- People evacuate through simple, readable movement. Danger is communicated through motion and warning indicators, never blood or gore.

## Visual Direction

The demo uses a polished, realistic two-dimensional side-view illustration style. Colors should be inspired by each real landmark and its city environment. Buildings, vehicles, people, street furniture, and vegetation should be detailed enough to read clearly while remaining efficient for a browser simulation.

The primary landmark receives the highest detail. Background buildings use restrained detail and contrast so they support the scene without competing with it. Dust, small debris, light flicker, and camera motion may reinforce strong shaking, but effects must not obscure the controls or make the scene unreadable.

## Technical Architecture

Use a React application with a dedicated two-dimensional physics layer.

Suggested component boundaries:

- `AppShell`: owns the active landmark and high-level simulation state.
- `LandmarkSelector`: switches landmarks and triggers a clean scene rebuild.
- `SimulationStage`: renders the city and advances physics.
- `ControlBar`: exposes Start, Finish, Smaller, and Bigger.
- `StrengthIndicator`: displays the current intensity.
- `SceneFactory`: constructs the chosen landmark, nearby buildings, roads, trees, lights, people, and vehicles.
- `LandmarkBuilders`: one focused builder per landmark, each producing connected rigid sections and break thresholds.
- `EvacuationController`: coordinates pedestrians, occupants, and vehicles after the alarm.
- `DamageController`: maps quake intensity and duration to joint stress, power failure, tree falls, and vehicle breakdowns.
- `AudioController`: manages the alarm and respects mute/reduced-motion preferences.

The simulation uses explicit states: `ready`, `running`, and `finished`. A scene rebuild clears physics bodies, animation timers, audio, and evacuation state before constructing a fresh scene.

## Physics Model

- The ground applies horizontal displacement and smaller vertical impulses.
- Intensity controls amplitude and frequency within stable, bounded ranges.
- Landmark sections are connected using constraints with tuned strength and damping.
- Stress accumulates from strong or sustained motion; constraints break only after their threshold is exceeded.
- Decorative detail remains attached to larger physics sections so the landmark is recognizable without creating excessive body counts.
- Fallen bodies remain collision-active until Finish freezes the simulation.
- Mobile devices use reduced particle and background-detail counts while preserving the same structural behavior.

## Sound and Accessibility

- The earthquake alarm starts with the quake and stops on Finish.
- Sound begins only after a user gesture to comply with browser audio rules.
- A visible mute control is available near the stage without competing with the four primary buttons.
- Buttons have text labels, keyboard focus states, and accessible names.
- The experience respects reduced-motion preferences by reducing camera shake and decorative particles while retaining essential simulation movement.
- Controls remain usable by keyboard and touch.

## Failure Handling

- If audio cannot play, the simulation continues with a visible alarm indicator.
- If advanced rendering is unavailable, the app falls back to lower-detail effects rather than blocking the experience.
- Rapid landmark changes cancel the previous scene cleanly and prevent duplicated bodies, timers, or sounds.
- Repeated Start and Finish presses remain idempotent and never create duplicate simulations.

## Verification

Functional checks:

- All four landmarks can be selected and rebuild correctly.
- Start, Finish, Smaller, and Bigger work in every simulation state.
- Starting after Finish rebuilds the same landmark.
- Light shaking sways a strong landmark without immediate collapse.
- Strong or sustained shaking can produce progressive collapse.
- Evacuation begins with the alarm.
- Vehicle variety is present; most escape and a small number can break down.
- Nearby buildings, trees, and streetlights respond at the intended thresholds.
- Audio failure does not block gameplay.

Visual checks:

- Every landmark is recognizable at desktop and mobile sizes.
- The landmark dominates the composition while the street remains readable.
- People, cars, trees, and streetlights use natural, distinct colors.
- Controls never overlap the simulation or become clipped.
- Damage effects do not hide important scene action.
- No graphic injury imagery appears.

Quality checks:

- Production build succeeds.
- Automated tests cover state transitions, rebuilding, intensity bounds, and landmark selection.
- Browser testing covers the full interaction flow on desktop and mobile viewports.
- Final rendered screenshots are compared against the approved visual concept before handoff.

## Out of Scope

- Three-dimensional rendering or free camera movement
- Real seismic datasets or engineering-grade structural analysis
- Multiplayer or online leaderboards
- Graphic injury, blood, or gore
- User-generated buildings
- A campaign, score system, or economy
