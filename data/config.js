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
  headerLink: "http://discord.gg/immenseRP",

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

  /* Print each zone's name inside its area. */
  zoneLabels: true,

  /* How the label is sized.
   *   'zone' (default) — from the zone's real-world size only, so a big
   *                      district always reads bigger than a small one
   *                      and nothing changes as you zoom.
   *   'fit'            — sized to fill the zone on screen, so it grows
   *                      with zoom and hides when too small to read. */
  zoneLabelMode: 'zone',

  /* Sections with no blips are left out of the sidebar. A section whose
   * blips sit behind a login therefore stays absent until someone signs
   * in. Set true to list them anyway, with a count of 0. */
  showEmptySections: false,

  /* Optional. Tags get a colour derived from their name, which stays
   * stable between loads. Pin specific ones here if you'd rather choose:
   *   tagColors: { MLO: '#f59e0b', IPL: '#a855f7', 'Los Santos': '#38bdf8' },
   * Tags themselves are declared nowhere — they come from the blips. */
  tagColors: {},

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

    /* The 85 GTA V map zones, loaded from data/zones.js. Starts toggled
     * off — flip hidden to false if you'd rather see them by default. */
    districts: {
      label: 'Map Zones',
      icon: 'polygon',
      color: '#94a3b8',
      collapsed: true,
      hidden: true
    },

    police: {
      label: 'Police',
      icon: 'shop',
      color: '#d310a9',
      subsections: {
        stations: { label: 'Police Stations', icon: 'utensils', color: '#60a5fa' }
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
    service: { label: 'Public Services', color: '#e011ba' },
  },

  /* ---------------------------------------------------------------- *
   * SUGGESTIONS — let signed-in members propose new blips and
   * corrections. The site opens a Google Form in a new tab with the
   * fields already filled in, so there's no backend and nothing secret
   * in this file.
   *
   * Setup:
   *  1. Build a Google Form with one question per field you want below.
   *     Short-answer questions are easiest. Add whatever extra questions
   *     you like — they just won't be prefilled.
   *  2. In the form editor, use the three-dot menu > "Get pre-filled
   *     link", type a recognisable dummy value into every question, and
   *     press "Get link".
   *  3. The link it copies looks like
   *     .../viewform?usp=pp_url&entry.1234567=dummy&entry.7654321=dummy
   *     Put the part before "?" into formUrl, and match each
   *     entry.NNNNN to the right field name below.
   *  4. Set enabled: true.
   *
   * Leave a field as '' to skip prefilling it.
   * ---------------------------------------------------------------- */
  suggestions: {
    enabled: true,
    requireLogin: true,

    formUrl: 'https://forms.gle/gRHf95fxXDKV5hET6',

    fields: {
      type: '',        /* New blip / Correction / Removal */
      name: '',        /* the location's name */
      blipId: '',      /* id of the blip being corrected, if any */
      section: '',     /* section / subsection */
      coords: '',      /* x, y, z */
      tags: '',        /* comma-separated */
      details: '',     /* free text */
      submittedBy: ''  /* the member's username */
    }
  },

  footerNote: 'Locations are in-game only.'
};
