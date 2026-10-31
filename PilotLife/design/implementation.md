# Pilot Life

The user's approved design is the binding spec. Implement directly in this new folder; no Git repository or additional approval is needed.

Architecture: local Three.js renderer, separate aircraft and world builders, deterministic flight state module, HTML/CSS HUD. No runtime network dependencies. External chase/orbit cameras only. Natural blue sky, green/brown terrain, concrete city blocks, recognizable custom landmarks, white airliners with airline-colored markings and reflective glazing.

1. Test flight state: Paris–Shanghai first, random subsequent assignments with capitals and Bermuda–San Francisco; manual gear, variable engine failure, controlled landing classification, airborne checkpoint restart, cumulative rescue/rewards/unlocks and safe local progress loading.
2. Implement flight state and pass the tests.
3. Implement aircraft meshes, city worlds, ground/river/runway collision, pedestrians and vehicles outside runway, smoke/sparks/debris/rescue boats and survivors.
4. Build a full-screen playable HUD with keyboard and touch controls, optional approach assistance, fleet and pilot career panels. Open the local page immediately when usable.
5. Verify the rendered desktop/mobile experience with Playwright (Browser plugin is absent), including inputs, gear, tutorial, emergency rescue, crash/retry, unlocks, random routes and persistence. Correct observed problems and retain evidence outside source.

Rulings: compressed Earth travel and representative city scenes make a reliable offline game possible. Approach assistance is optional for accessible landings; manual flying remains available. Fictional Iran/Bermuda attacks are arcade scenarios. Procedural meshes are detailed but not photorealistic or a navigable full-scale Earth. Existing games remain intact.
