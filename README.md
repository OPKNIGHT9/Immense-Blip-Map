# Blip Map

A read-only map of server locations. Anyone can open it and see the public blips. Members sign in to reveal blips shared with their group.

Plain HTML, CSS and JavaScript. No build step, no backend, no dependencies to install.

## The three files you control

Everything you manage lives in `data/`:

| File | What it does |
|---|---|
| `data/config.js` | Site name, categories, colours, groups, default map position, feature toggles |
| `data/blips.js` | Public blips (plain text) and group blips (encrypted) |
| `data/users.js` | Member accounts — salts, verifiers and wrapped group keys |

Edit, commit, push. The site picks up the changes on the next Pages build.

## About hiding these files

**They can't be hidden.** GitHub Pages serves your repo as a public static site, so anything the browser loads, a visitor can load too. `.gitignore` doesn't help either: an ignored file never gets deployed, so the site couldn't read it.

So instead of hiding the file, the **contents are encrypted**. Group blips live in `blips.js` as a base64 blob. Without the group's key it's noise. The login derives that key from the member's password, decrypts the blips in the browser, and shows them. A visitor reading `blips.js` sees ciphertext, not your safehouse coordinates.

The same goes for `users.js` — it holds no passwords, just a random salt per user, a verifier derived from their password, and the group keys wrapped with it. A wrong password fails the verifier and unwraps nothing.

What this does **not** protect against: someone who has a valid login can read everything that account unlocks, and could pass it on. Security here is exactly as good as your passwords and who you give them to.

## Adding blips

**Public blips** — edit the `public` array in `data/blips.js` directly:

```js
{
  id: 'legion-square',            // needed only if something connects to it
  name: 'Legion Square',
  section: 'general',             // a key from config.js sections
  subsection: 'retail',           // optional, a key under that section
  x: 195.0,
  y: -934.0,
  z: 30.7,                        // optional, used by vec3 / vec4 / TP
  heading: 145.0,                 // optional, 0-360, 0 = north
  icon: 'flag',                   // optional, overrides the section icon
  color: '#f87171',               // optional, overrides the section colour
  connections: ['mission-row-pd'],// optional, draws a line to those blips
  description: 'Central meeting spot.'
}
```

Coordinates are game coordinates. Right-click anywhere on the map to copy the coordinates under your cursor, or press `Ctrl+F` to jump to a pair you already have.

**Headings.** Give a blip a `heading` and it grows an arrow pointing that way, with 0 as north. Game headings run counter-clockwise (90 is west), which the map accounts for. A blip without a heading has its `vec4` button greyed out, since there'd be nothing to put in the fourth slot.

**Connectors.** Set `connections` to an array of other blips' `id` values and a dashed line is drawn between them. Lines only appear when both ends are visible, so hiding a section hides its lines too. The link button on the map toggles all of them; `connectionsOn` in `config.js` sets the starting state.

**Group blips** — these have to be encrypted, so open `tools/admin.html` in your browser (locally, or from the deployed site — it does everything in-page and sends nothing anywhere):

1. **Step 1** — generate a key for the group. Save it somewhere safe; you need it every time.
2. **Step 2** — paste that key and the group's blips as a JSON array. Copy the output into the `groups` section of `data/blips.js`.
3. **Step 3** — create each member's account with their password and the group keys they should get. Copy the output into the array in `data/users.js`.

Adding a blip to a group means re-running step 2 with the full list for that group and replacing the blob. Existing members keep working — the key hasn't changed.

## Managing members

- **Add someone**: step 3 in the admin tool, paste the record into `data/users.js`.
- **Remove someone**: delete their record. They can't log in any more.
- **Lock someone out properly**: deleting their record stops future logins, but if they saved the group key they can still decrypt an old copy of `blips.js`. To be certain, generate a new key for the group (step 1), re-encrypt its blips (step 2), and re-issue records for everyone who should still have access (step 3).
- **Change a password**: re-run step 3 for that user with the same group keys and replace their record.

The demo file ships with three accounts — `admin` / `changeme`, `officer` / `police123`, `crew` / `crew123`. Replace them before you go live.

## Sections and groups

These are two different things and it's worth keeping them straight.

**Sections** organise the sidebar, navbar-style. They're defined in `data/config.js` and can have subsections:

```js
sections: {
  business: {
    label: 'Businesses',
    icon: 'shop',
    color: '#3b82f6',
    subsections: {
      retail: { label: 'Retail' },
      food:   { label: 'Food & Drink', color: '#60a5fa' }
    }
  }
}
```

A blip inherits its icon and colour from its subsection, then its section, unless it sets its own. Clicking a section name toggles its blips off; the caret folds it. `collapsed: true` starts a section folded, `hidden: true` starts it toggled off. Blips that name a section but no subsection get grouped under "Other".

Icon names come from `js/icons.js` — `map-pin`, `house`, `shop`, `car`, `briefcase`, `star`, `flag`, `anchor`, `lock`, `key` and more. Adding your own is a matter of pasting an SVG path into that file.

**Groups** are access control — who sees what after signing in. Also in `config.js`, but they only need a label and colour, and the key has to match the group name used in `blips.js` and the admin tool. `public` is built in; leave it there.

## Clicking a blip

The popup has four coordinate formats, with **Coords** selected by default. Click one to switch, then click the value to copy it:

| Button | Output |
|---|---|
| Coords | `195.00, -934.00, 30.70` |
| vec3 | `vector3(195.00, -934.00, 30.70)` |
| vec4 | `vector4(195.00, -934.00, 30.70, 145.00)` |
| TP | `/tp 195.00 -934.00 30.70` |

Everything prints as a float. `vec4` is greyed out on blips with no heading. The TP command deliberately leaves the heading off — change the command itself with `tpCommand` in `config.js`, and the number of decimals with `decimals`.

## Deploying

1. Push these files to your repo with `index.html` at the root.
2. **Settings → Pages → Source → Deploy from a branch**, branch `main`, folder **/ (root)**.

There's nothing to build, so no Actions workflow is needed — and if an old one is still in `.github/workflows`, delete it or it'll keep failing on the missing lockfile.

## Map controls

| Control | What it does |
|---|---|
| Link button (top left) | Show or hide connector lines |
| Crosshair button | Jump to coordinates |
| `Ctrl+F` | Same jump dialog — accepts `123, -456` or a whole `vector3(...)` pasted into the X field |
| Right-click the map | Copy the coordinates under the cursor |
| `Esc` | Close any dialog |

## Running locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Use a server rather than opening `index.html` from disk: WebCrypto only works in a secure context, so logins fail on `file://`.

## Files

```
index.html              the map page
css/styles.css          all styling
js/app.js               map, section tree, list, popups, login flow
js/crypto.js            key derivation and decryption
js/icons.js             inline SVG icons
data/config.js          settings          <- you edit
data/blips.js           blips             <- you edit
data/users.js           accounts          <- you edit (via the admin tool)
tools/admin.html        key / account / encryption generator
assets/gta_map.jpg      satellite map
vendor/leaflet/         Leaflet 1.9.4, vendored
```

## Credits

Map rendering by [Leaflet](https://leafletjs.com/). Map coordinate conversion from the original zone creator by SD ([Samuels-Development](https://github.com/Samuels-Development)). See [LICENSE](LICENSE).
