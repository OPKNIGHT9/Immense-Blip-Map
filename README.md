# Zone Creator (web)

> Draw polygon zones on an interactive GTA V satellite map and export them as PolyZone, ox_lib, vector2 or vector3 code. Plain HTML, CSS and JavaScript — no build step, no framework, no TypeScript.

**Live site:** https://YOUR-USERNAME.github.io/YOUR-REPO/

Everything runs in the browser. There is no backend and nothing is uploaded anywhere — your zones are stored in `localStorage` on your own machine.

## Deploying to GitHub Pages

Because there is nothing to compile, the files you commit are the files the browser loads. That means the simplest Pages setup works:

1. Push these files to your repo (`index.html` must sit at the repo root).
2. **Settings → Pages → Source → Deploy from a branch**.
3. Branch: `main`, folder: **/ (root)**. Save.
4. Wait a minute, then open the URL Pages gives you.

No Actions workflow, no `dist/` folder, nothing to configure. If you edit a file and push, the change is live after the next Pages build.

Every path in `index.html` is relative (`css/styles.css`, `js/app.js`, `assets/gta_map.jpg`), so the site works at a project subpath, a user site, or any static host — Netlify, Cloudflare Pages, nginx, or just opening `index.html` from disk.

## Running locally

Open `index.html` in a browser, or serve the folder if you prefer:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

A plain `file://` open works too, though the clipboard falls back to `document.execCommand('copy')` outside a secure context.

## Files

```
index.html          markup and modals
css/styles.css      all styling
js/icons.js         inline SVG icon set
js/app.js           the whole application
assets/gta_map.jpg  satellite map (4096 x 6144)
vendor/leaflet/     Leaflet 1.9.4, vendored so there's no CDN dependency
```

## Features

- **Interactive map** — click to place points on a high-resolution satellite map
- **Multiple export formats** — PolyZone, ox_lib, vector2, vector3, copied to clipboard
- **Import** — paste existing zone code to edit and visualise it; name, thickness and minZ/maxZ are read out of the code where present
- **Template shapes** — rectangle, circle, triangle, pentagon, hexagon, star, L-shape, each with size and rotation sliders and a draggable centre
- **Grid snapping** — grid overlay with 10-unit snapping
- **Multi-zone** — build several zones in one session, each with its own colour, thickness and ground Z
- **Autosave** — zones persist across refreshes in `localStorage`

### Point editing

| Action | How |
|---|---|
| Add point | Click the map |
| Move point | Drag the marker |
| Delete point | Right-click the marker |
| Insert on an edge | Click the polygon outline |
| Select points | Shift + drag a box |
| Toggle one point's selection | Ctrl + click the marker |
| Remove last point | `Delete` or `Backspace` |

### Shortcuts

| Key | Action |
|---|---|
| `G` | Snap to grid |
| `D` | Show distances |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+F` | Jump to coordinates |
| `Esc` | Close modal / cancel template |

## Export examples

**PolyZone**

```lua
local myZone = PolyZone:Create({
    vector2(100.0, 200.0),
    vector2(150.0, 200.0),
    vector2(150.0, 250.0),
    vector2(100.0, 250.0)
}, {
    name = "myZone",
    minZ = 0,
    maxZ = 150
})
```

**ox_lib**

```lua
lib.zones.poly({
    name = 'myZone',
    points = {
        vec3(100.0, 200.0, 0),
        vec3(150.0, 200.0, 0),
        vec3(150.0, 250.0, 0),
        vec3(100.0, 250.0, 0)
    },
    thickness = 150,
    debug = true
})
```

## Not included

Three features from the original FiveM resource needed the game client and have no browser equivalent: the 3D free-fly zone viewer, automatic ground-Z sampling, and the live player-position marker. Ground Z is entered manually per zone, and `Ctrl+F` covers jumping to a known coordinate.

## Credits

Based on the original tool by SD ([Samuels-Development](https://github.com/Samuels-Development)). Map rendering by [Leaflet](https://leafletjs.com/). Icons are hand-rolled SVG in the style of [Lucide](https://lucide.dev/).

See [LICENSE](LICENSE).
