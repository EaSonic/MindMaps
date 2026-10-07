"""Package the checked Archify map and original screenshots into one offline HTML."""
import base64
import html
import json
from pathlib import Path

folder = Path(__file__).resolve().parent.parent
assets = {
 'driving': folder/'source/screenshots/driving.png',
 'quakeReady': folder/'source/screenshots/quake-ready.png',
 'quakeStrong': folder/'source/screenshots/quake-strong.png',
 'waveReady': folder/'source/screenshots/wave-ready.png',
 'waveStrong': folder/'source/screenshots/wave-strong.png',
}
encoded = {name: 'data:image/png;base64,' + base64.b64encode(path.read_bytes()).decode() for name, path in assets.items()}
source = (folder / 'source/presentation-source.html').read_text()
core = (folder / 'mvc-architecture-map.html').read_text()
output = source.replace('@DRIVING@', encoded['driving']).replace('@CORE@', html.escape(core, quote=True)).replace('@ASSETS@', json.dumps(encoded).replace('</', '<\\/'))
assert all(token not in output for token in ('@CORE@', '@ASSETS@', '@DRIVING@'))
target = folder / 'index.html'
target.write_text(output)
print(json.dumps({'output': str(target), 'bytes': target.stat().st_size, 'embeddedScreenshots': len(assets), 'archifyMap': str(folder / 'mvc-architecture-map.html')}))
