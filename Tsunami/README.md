# Tsunami Simulator

Play: https://easonic.github.io/MindMaps/Tsunami/

The root contains the static GitHub Pages build; editable application files are in `source/`. This is an entertainment simulation with approximate physics.

Develop: `cd source`, install dependencies, then `npm run dev`.

Rebuild for GitHub Pages from this folder:

```sh
cd source
npm install
npm run build -- --base=./
cp -R dist/. ../
```

Asset paths use Vite's base URL so artwork stays within this game's directory. See the source documentation for controls, validation and limitations.
