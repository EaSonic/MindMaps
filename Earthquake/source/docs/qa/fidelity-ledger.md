# Earthquake Simulator Fidelity Ledger

Reviewed against `public/art/concept-earthquake-simulator.png` using the final desktop ready, desktop extreme-quake, and 390×844 mobile browser captures in `test-results/qa/`.

| Area | Concept evidence | Final render evidence | Resolution |
| --- | --- | --- | --- |
| Overall layout | Four landmark choices sit at the top, the landmark fills most of the middle, and the controls sit along the bottom. | The same three-band composition is preserved at 1440×1000 and rearranges into a taller control area at 390×844. | Matched. |
| Landmark scale | The Eiffel Tower is the unmistakable focus and reaches from the street almost to the selector. | The interactive Eiffel Tower fills the center vertically without covering the selector or controls. | Matched. |
| Palette and atmosphere | Dark navy chrome, blue selection states, green/red action buttons, and a bright cloudy sky. | The same navy, blue, green, red, and sky palette is used, with additional high-contrast status overlays. | Matched. |
| Street readability | Cars, pedestrians, trees, lights, sidewalk, and road markings are visible below the landmark. | Ambulance, taxi, compact and large vehicles, people, trees, lights, sidewalk, and lane markings remain readable at desktop and phone sizes. | Matched; animated foreground actors remain code-native for legibility during motion. |
| Surrounding housing | The landmark sits inside a realistic, recognizable city rather than in front of generic block buildings. | Each landmark now has its own realistic city plate: Parisian stone housing, Pisa's Tuscan streetscape, Midtown Manhattan, or Lower Manhattan. | Matched; the landmark remains the visual focus. |
| Control placement | Start and Finish are left, strength is centered, Smaller and Bigger are right. | Desktop follows the same order; mobile keeps strength above a four-button row so every control remains touchable. | Matched, with responsive reflow. |
| Typography | Bold, compact, high-contrast control labels and landmark names. | The implementation uses the same visual hierarchy with responsive sizes and keyboard focus rings. | Matched. |
| Landmark asset treatment | The concept uses a photorealistic intact landmark. | Realistic, structure-specific artwork is clipped across independent physics sections, with the former block outlines removed. | Matched while retaining break-apart physics. |
| Motion-state clarity | The concept establishes an intact scene but does not show an active state. | Running mode adds an immediate earthquake alarm, staged evacuation waves, camera shake, progressive collapse, tree toppling, and light failure. | Improved for gameplay clarity. |

## Above-the-fold copy diff

Concept labels: `Eiffel Tower`, `Tower of Pisa`, `Empire State`, `Twin Towers`, `START`, `FINISH`, `Earthquake Strength`, `SMALLER`, `BIGGER`.

Final labels: identical. The final app also adds `Ready to shake`, `Earthquake alarm`, and a changing simulation-status message so the current state is accessible without relying on motion alone.

## Browser verification

- Desktop ready state captured at 1440×1000.
- Desktop extreme-quake state captured after progressive structural failure began.
- Mobile ready state captured at 390×844.
- Browser console checked after a clean reload: no warnings or errors.
- Automated flow covers all four landmarks, strength bounds, alarm and evacuation, collapse, Finish freeze, Start rebuild, and mobile control visibility.
