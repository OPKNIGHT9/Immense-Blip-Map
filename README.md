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
  name: 'Legion Square',
  category: 'general',       // a key from config.js
  x: 195.0,
  y: -934.0,
  z: 30.7,                   // optional
  description: 'Central meeting spot.'   // optional
}
```

Coordinates are game coordinates. Right-click anywhere on the map to copy the coordinates under your cursor.

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

## Groups and categories

Both are defined in `data/config.js`.

**Categories** control the icon and colour of a blip and give visitors filter chips:

```js
categories: {
  housing: { label: 'Housing', icon: 'house', color: '#f59e0b' },
  secret:  { label: 'Secret Spots', icon: 'star', color: '#ec4899', hidden: true }
}
```

`hidden: true` starts that category toggled off. Icon names come from `js/icons.js` — `map-pin`, `house`, `shop`, `car`, `briefcase`, `star`, `flag`, `anchor`, `lock`, `key` are all available, and adding your own is a matter of pasting an SVG path in.

**Groups** just need a label and colour. The key must match the group name used in `blips.js` and in the admin tool. `public` is built in — leave it there.

Other switches in `config.js`: `loginEnabled` (set false for a purely public map), `rememberSession`, `copyCoordsOnRightClick`, `showCoords`, `defaultView`, `siteName`, `tagline`, `footerNote`.

## Deploying

1. Push these files to your repo with `index.html` at the root.
2. **Settings → Pages → Source → Deploy from a branch**, branch `main`, folder **/ (root)**.

There's nothing to build, so no Actions workflow is needed — and if an old one is still in `.github/workflows`, delete it or it'll keep failing on the missing lockfile.

## Running locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Use a server rather than opening `index.html` from disk: WebCrypto only works in a secure context, so logins fail on `file://`.

## Files

```
index.html              the map page
css/styles.css          all styling
js/app.js               map, filters, list, login flow
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
