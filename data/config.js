/* ------------------------------------------------------------------ *
 * CONFIG — general site settings.
 *
 * Everything here is loaded by the browser, so treat it as public.
 * Nothing secret belongs in this file.
 * ------------------------------------------------------------------ */

window.CONFIG = {
  /* Shown in the header and the browser tab. */
  siteName: 'Immense Blip Map',
  tagline: 'Server locations & points of interest',

  /* Link in the header. Set to null to hide it. */
  headerLink: null,

  /* Where the map opens. Game coordinates, not pixels. */
  defaultView: {
    x: 0,
    y: 0,
    zoom: -1
  },

  /* Show the login button at all. Set false for a purely public map. */
  loginEnabled: true,

  /* Stay logged in across refreshes (sessionStorage — cleared when the
   * tab closes). Set false to require a login on every page load. */
  rememberSession: true,

  /* Right-click the map to copy coordinates to the clipboard. */
  copyCoordsOnRightClick: true,

  /* Show the coordinate readout in the corner. */
  showCoords: true,

  /* Blip categories. Every blip names one of these keys.
   * icon: any name from js/icons.js
   * color: any CSS colour
   * hidden: true starts the category toggled off */
  categories: {
    general: { label: 'General', icon: 'map-pin', color: '#22c55e' },
    business: { label: 'Businesses', icon: 'shop', color: '#3b82f6' },
    housing: { label: 'Housing', icon: 'house', color: '#f59e0b' },
    garage: { label: 'Garages', icon: 'car', color: '#06b6d4' },
    job: { label: 'Jobs', icon: 'briefcase', color: '#a855f7' },
    secret: { label: 'Secret Spots', icon: 'star', color: '#ec4899' }
  },

  /* Group display names and colours. The key must match the group name
   * used in data/blips.js and data/users.js.
   * 'public' is built in and always visible — don't remove it. */
  groups: {
    public: { label: 'Public', color: '#22c55e' },
    police: { label: 'Police', color: '#3b82f6' },
    crew: { label: 'Crew', color: '#ef4444' }
  },

  /* Text under the sidebar. Set to null to hide. */
  footerNote: 'Locations are in-game only.'
};
