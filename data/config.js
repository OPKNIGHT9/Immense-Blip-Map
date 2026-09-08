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

  /* Draw connector lines between linked blips on load. Users can toggle
   * this from the map controls regardless. */
  connectionsOn: true,

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
        retail: { label: 'Retail', icon: 'shop' },
        food: { label: 'Food & Drink', color: '#60a5fa' },
        fuel: { label: 'Fuel', icon: 'car', color: '#93c5fd' }
      }
    },

    housing: {
      label: 'Housing',
      icon: 'house',
      color: '#f59e0b',
      subsections: {
        apartments: { label: 'Apartments' },
        estates: { label: 'Estates', color: '#fbbf24' }
      }
    },

    transport: {
      label: 'Transport',
      icon: 'car',
      color: '#06b6d4',
      subsections: {
        garages: { label: 'Garages' },
        air: { label: 'Air', icon: 'flag' },
        sea: { label: 'Sea', icon: 'anchor' }
      }
    },

    jobs: {
      label: 'Jobs',
      icon: 'briefcase',
      color: '#a855f7'
    },

    secret: {
      label: 'Secret Spots',
      icon: 'star',
      color: '#ec4899',
      collapsed: true
    }
  },

  /* ---------------------------------------------------------------- *
   * GROUPS — access control, not organisation.
   *
   * The key must match the group name used in data/blips.js and
   * data/users.js. 'public' is built in — leave it here.
   * ---------------------------------------------------------------- */
  groups: {
    public: { label: 'Public', color: '#22c55e' },
    police: { label: 'Police', color: '#3b82f6' },
    crew: { label: 'Crew', color: '#ef4444' }
  },

  footerNote: 'Locations are in-game only.'
};
