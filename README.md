# sd-zonecreator (web)

> A browser-based zone creation tool for GTA V / FiveM. Draw polygons on an interactive satellite map and export them as PolyZone, ox_lib, vector2 or vector3 code — no server, no resource, no game required.

**Live site:** https://YOUR-USERNAME.github.io/sd-zonecreator/

This is the standalone web version of the original FiveM resource. Everything runs client-side in the browser: the map, the editor, the exporters. There is no backend and nothing is uploaded anywhere — your zones are saved in your browser's `localStorage`.

## Features

- **Interactive map** — click a high-resolution GTA V satellite map to place zone points
- **Multiple export formats** — PolyZone, ox_lib, vector2, vector3
- **Import support** — paste existing zone code to edit and visualise it
- **Grid mode** — grid overlay with snapping to 10-unit intervals
- **Multi-zone management** — build and manage several zones in one session
- **Autosave** — zones persist in `localStorage` across refreshes

### Template shapes

| Shape | Description |
|-------|-------------|
| Rectangle | 4-point square/rectangular zone |
| Circle | 16-point circular approximation |
| Triangle | 3-point triangular zone |
| Pentagon | 5-point pentagonal zone |
| Hexagon | 6-point hexagonal zone |
| Star | 10-point star shape |
| L-Shape | 6-point L-shaped zone |

All templates support drag-to-position, a scale slider (5–3000 units) and a rotation slider (0°–360°).

### Point management

- **Click on map** — add a point to the active zone
- **Drag points** — reposition any point marker
- **Right-click point** — delete a single point
- **Click a polygon edge** — insert a point on the closest edge
- **Shift + drag** — box-select multiple points
- **Delete selected** — remove all selected points at once

### Tools and shortcuts

| Tool | Shortcut |
|------|----------|
| Snap to grid | `G` |
| Show distances | `D` |
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Y` |
| Search location | `Ctrl+F` |
| Close modals | `Esc` |

## Export examples

**PolyZone**

```lua
local myZone = PolyZone:Create({
    vector2(100.0, 200.0),
    vector2(150.0, 200.0),
    vector2(150.0, 250.0),
    vector2(100.0, 250.0),
}, {
    name = "myZone",
    minZ = 25.0,
    maxZ = 175.0,
})
```

**ox_lib**

```lua
lib.zones.poly({
    name = 'myZone',
    points = {
        vec3(100.0, 200.0, 30.0),
        vec3(150.0, 200.0, 30.0),
        vec3(150.0, 250.0, 30.0),
        vec3(100.0, 250.0, 30.0),
    },
    thickness = 150,
    debug = true,
})
```

**vector2 / vector3** — a plain list of coordinates you can drop straight into a table.

## Local development

Requires Node.js 18+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally
```

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.

1. Push this repo to GitHub.
2. Go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` — the workflow builds `dist/` and deploys it.

`vite.config.ts` sets `base: './'`, so the build works from a project subpath (`user.github.io/repo/`), a user site, or any other static host — Netlify, Vercel, Cloudflare Pages, or a plain nginx directory. Just serve `dist/`.

## Differences from the FiveM resource

Three features depended on being inside the game and are not present here:

| FiveM feature | Web version |
|---|---|
| 3D in-game zone viewer (free-fly camera) | Removed — there's no game client to render it |
| Auto ground-Z from the world | Removed — enter Ground Z manually per zone |
| Player position marker / jump to player | Removed — use `Ctrl+F` to jump to coordinates |

Everything else — the map, drawing, templates, import, export, undo/redo, grid, distances — works the same. If you need the in-game preview, keep using the [FiveM resource](https://github.com/Samuels-Development/sd-zonecreator) alongside this site.

## Credits

Original tool by SD ([Samuels-Development](https://github.com/Samuels-Development)). Map rendering by [Leaflet](https://leafletjs.com/), icons by [Lucide](https://lucide.dev/).

Licensed under the terms in [LICENSE](LICENSE).
