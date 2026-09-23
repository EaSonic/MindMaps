# Coastline Drive

A self-contained 3D browser driving demo with physically lit materials, soft shadows, textured scenery, and a cinematic follow camera. Start in the hills, reach the city, then keep driving along the coast for as long as you can. The road continues indefinitely.

## Play

From this folder, run:

```sh
python3 -m http.server 4173
```

Open `http://localhost:4173` in a browser with WebGL support. No install or internet connection is needed. A local server is needed because the game uses JavaScript modules.

Use the arrow keys or WASD. The four on-screen buttons also work with mouse and touch. **Restart** returns to the beginning; crashes automatically respawn the car near the crash location. The distance counter resets after a crash, and your best distance is saved in the browser.

## Collision rules

| Hit | Result |
| --- | --- |
| Another car | Your car briefly catches fire, the other car disappears, then you respawn nearby. |
| Building | The building stays intact; you respawn nearby. |
| Pedestrian | A brief stylized red effect appears, then you respawn nearby. |
| Tree | The tree falls, the car slows, and you keep driving. |
| Water | The car stops at the shore. |

The visual direction is in [design/concept.png](design/concept.png). The playable scene uses procedural 3D geometry and a vendored Three.js renderer, so it runs without downloading assets at play time. Three.js remains available in `package.json` for documented dependency updates; the bundled browser copy and license are in `vendor/`.
