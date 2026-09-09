/* ------------------------------------------------------------------ *
 * CONFIG — general site settings.
 *
 * Everything here is loaded by the browser, so treat it as public.
 * Nothing secret belongs in this file.
 * ------------------------------------------------------------------ */

window.CONFIG = {
  siteName: 'Immense Blip Map',
  tagline: 'Server locations & points of interest',

  /* Link in the header. null hides it. */
  headerLink: null,

  /* Where the map opens. Game coordinates, not pixels. */
  defaultView: { x: 0, y: 0, zoom: -1 },

  /* Login button. false = purely public map. */
  loginEnabled: true,

  /* Stay signed in across refreshes (sessionStorage — cleared when the
   * tab closes). false requires a login on every page load. */
  rememberSession: true,

  /* Right-click the map to copy the coordinates under the cursor. */
  copyCoordsOnRightClick: true,

  /* Coordinate readout in the bottom corner. */
  showCoords: true,

  /* Decimal places used everywhere coordinates are printed. */
  decimals: 2,

  /* The teleport command shown by the TP button in a blip's popup.
   * Coordinates are appended as floats. Heading is never included. */
  tpCommand: '/tp',

  /* Starting state of the three map toggles. All three can be flipped
   * from the buttons in the top-left of the map. */
  connectionsOn: true,
  showPins: true,
  showZones: true,

  /* ---------------------------------------------------------------- *
   * SECTIONS — how blips are organised in the sidebar, navbar-style.
   *
   * A section may have subsections. A blip names a section and,
   * optionally, a subsection.
   *
   *   icon      any name from js/icons.js
   *   color     any CSS colour
   *   collapsed true starts the section folded shut
   *   hidden    true starts the section toggled off
   *
   * A blip inherits icon and colour from its subsection, then its
   * section, unless it sets its own.
   * ---------------------------------------------------------------- */
  sections: {
    general: {
      label: 'General',
      icon: 'map-pin',
      color: '#22c55e'
    },

    business: {
      label: 'Businesses',
      icon: 'shop',
      color: '#3b82f6',
      subsections: {
        food: { label: 'Food & Drink', icon: 'utensils', color: '#60a5fa' },
        mech: { label: 'Mech', icon: 'wrench', color: '#93c5fd' },
        club: { label: 'Club', icon: 'wine', color: '#3984d9' },
        dealer: { label: 'Dealership', icon: 'car', color: '#0f3561' },
        other: { label: 'Unqiue' }
      }
    },
  },

  /* ---------------------------------------------------------------- *
   * GROUPS — access control, not organisation.
   *
   * The key must match the group name used in data/blips.js and
   * data/users.js. 'public' is built in — leave it here.
   * ---------------------------------------------------------------- */
  groups: {
    public: { label: 'Public', color: '#22c55e' },
  },

  footerNote: 'Locations are in-game only.'
};
