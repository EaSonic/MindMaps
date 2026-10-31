# Pilot Life

Play online: https://easonic.github.io/MindMaps/PilotLife/

A playable 3D flight game. For local development, open http://127.0.0.1:4193 while the server is running.

To relaunch, run `npm start` in this folder. No package installation or internet connection is required: Three.js 0.180 is vendored locally under its MIT license.

## Flying

Click **Take control**. Arrow keys steer, climb and descend; W/S also change pitch. +/− adjust throttle, or use the slider. G switches landing gear **On** (lower wheels) / **Off** (retract wheels). A toggles optional approach assistance, C changes the external camera, and P pauses. Drag the scene to orbit outside the aircraft. Touch direction buttons work on small screens.

The first flight is Paris → Shanghai. You can explore Paris for the short cruise or use **Continue to Shanghai**. Seven seconds into the Shanghai approach, both engines fail for the introductory emergency. Aim along the Huangpu River, keep gear Off, level the wings, and descend gently. Approach assist helps line up and descend, but you control gear. A stable landing requires 108–342 km/h, descent no faster than 6 m/s, and nearly level attitude. A normal runway touchdown needs gear On. After your first completed flight the teaching panels disappear permanently, while flight controls remain available.

A gentle water landing keeps the airframe intact, evacuates passengers, brings three rescue boats, and slowly sinks the aircraft. Hard impacts break parts away and produce a non-graphic explosion. Retry always restores an airborne approach checkpoint. Passengers are small procedural 3D people; no gore is depicted.

Later assignments are random, including London, Tokyo, Beijing, Washington, Rome, Paris, Shanghai, and Bermuda Triangle → San Francisco. Iran and Bermuda are explicitly fictional arcade attack scenarios. Engine failures vary in timing. One smoking engine means the other engine is working; two smoking engines mean both have failed.

A runway landing earns 600 credits; a water rescue earns 850. Fleet order: China Eastern, Spring Airlines, Cathay Pacific, American president’s plane, and fictional Falcon fighter. The fighter's ceiling is 20,000 m; passenger aircraft ceilings are 12,000–13,000 m. Unlocks spend wallet credits. The pilot career panel shows lifetime credits earned, completed flights, and emergency landings. Progress is saved in browser localStorage on this device and this host/port.

## Verification

`npm test` runs the flight-state tests. A real Chromium/Metal browser playthrough has checked first route, steering, manual gear, maps, engine warning/effects, assisted safe water landing, survivors/boats, career rewards, unlock/persistence, random assignments, tutorial removal, hard impact, and airborne retry. An additional browser run verified a presidential-aircraft runway landing, 600-credit reward, fighter selection, Bermuda → San Francisco, visible enemy fighters, and attack damage. Tree collisions and the Iran-specific visual scenario are implemented but have not received a separate browser playthrough. Desktop and mobile layouts were visually inspected. Regular Playwright was used because the Browser plugin was not available.

## Practical limits

Graphics are procedural 3D with natural colors, reflective materials, building textures and recognizable landmark shapes. They are **not photorealistic**, and buildings, people, aircraft details and airline liveries are approximations. Routes use compressed journeys and representative city/airport scenes, not a geographically continuous or navigable full-scale Earth. The Earth map is schematic. Flight and combat physics are forgiving arcade rules, not an aviation training simulator. Audio is not implemented. Low-end GPUs may require a smaller browser window. Progress is local to the browser; there is no online account or multiplayer.

## Assets

`assets/pilot.png` is a fictional pilot portrait generated with the built-in Image Gen tool. Prompt: "One friendly fictional Asian adult male airline pilot age about 35, head and shoulders centered, wearing realistic dark navy airline captain jacket with gold stripes, white shirt, black tie and captain hat; natural soft daylight, blue gray airport background, editorial portrait photograph, natural skin colors, no text or watermark."

`design/concept.png` is the generated visual direction for the full gameplay screen: an external China Eastern aircraft over Shanghai's Huangpu River, natural colors, translucent instrument HUD, route, minimap, manual gear and flight controls. The implemented HUD follows that layout; the procedural scene has lower fidelity than the generated reference.
