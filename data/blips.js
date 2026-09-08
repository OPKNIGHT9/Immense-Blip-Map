/* ------------------------------------------------------------------ *
 * BLIPS — every marker on the map.
 *
 * "public" blips are visible to everyone, no login. Edit them freely.
 *
 * "groups" hold blips only members see. Each group's blips are encrypted
 * with that group's key, so this file can sit in a public repo without
 * giving the locations away. Produce the encrypted string with
 * tools/admin.html — you cannot write it by hand.
 *
 * Fields per blip:
 *   id           optional, but required if anything connects to this blip
 *   name         required
 *   section      a key from config.js sections
 *   subsection   optional, a key under that section's subsections
 *   x, y         game coordinates
 *   z            optional, used by vec3 / vec4 / TP
 *   heading      optional, 0-360 with 0 = north. Draws a direction arrow
 *                and enables the vec4 button
 *   icon         optional, overrides the section's icon
 *   color        optional, overrides the section's colour
 *   connections  optional array of blip ids to draw a line to
 *   description  optional
 * ------------------------------------------------------------------ */

window.BLIPS = {
  public: [
    {
      "id": "legion-square",
      "name": "Legion Square",
      "section": "general",
      "x": 195,
      "y": -934,
      "z": 30.7,
      "heading": 145,
      "description": "Central meeting spot downtown."
    },
    {
      "id": "mission-row-pd",
      "name": "Mission Row PD",
      "section": "general",
      "icon": "flag",
      "x": 441,
      "y": -982,
      "z": 30.7,
      "heading": 270,
      "description": "Police headquarters."
    },
    {
      "id": "pillbox-medical",
      "name": "Pillbox Hill Medical",
      "section": "general",
      "color": "#f87171",
      "x": 298,
      "y": -584,
      "z": 43.3,
      "heading": 76,
      "description": "Main hospital."
    },
    {
      "id": "vespucci-beach",
      "name": "Vespucci Beach",
      "section": "general",
      "x": -1223,
      "y": -1490,
      "z": 4.3,
      "description": "Boardwalk and pier."
    },
    {
      "id": "paleto-sheriff",
      "name": "Paleto Bay Sheriff",
      "section": "general",
      "icon": "flag",
      "x": -448,
      "y": 6012,
      "z": 31.7,
      "heading": 45,
      "description": "Northern law enforcement."
    },
    {
      "id": "store-strawberry",
      "name": "24/7 Supermarket — Strawberry",
      "section": "business",
      "subsection": "retail",
      "x": 25,
      "y": -1347,
      "z": 29.5,
      "heading": 0,
      "description": "General goods and snacks."
    },
    {
      "id": "store-grove",
      "name": "24/7 Supermarket — Davis",
      "section": "business",
      "subsection": "retail",
      "x": -47,
      "y": -1758,
      "z": 29.4,
      "heading": 50
    },
    {
      "id": "burgershot",
      "name": "Burger Shot",
      "section": "business",
      "subsection": "food",
      "x": -1196,
      "y": -893,
      "z": 13.9,
      "heading": 214,
      "description": "Open late."
    },
    {
      "id": "bean-machine",
      "name": "Bean Machine",
      "section": "business",
      "subsection": "food",
      "x": -629,
      "y": 233,
      "z": 81.8,
      "heading": 269
    },
    {
      "id": "ls-fuel-strawberry",
      "name": "LTD Gasoline — Strawberry",
      "section": "business",
      "subsection": "fuel",
      "x": 265,
      "y": -1261,
      "z": 29.3
    },
    {
      "id": "ls-fuel-sandy",
      "name": "Xero Gas — Sandy Shores",
      "section": "business",
      "subsection": "fuel",
      "x": 1207,
      "y": 2660,
      "z": 37.9
    },
    {
      "id": "del-perro-pier",
      "name": "Del Perro Pier",
      "section": "business",
      "x": -1663,
      "y": -1082,
      "z": 13.1,
      "description": "Shops and amusements. No subsection — appears under \"Other\"."
    },
    {
      "id": "integrity-way",
      "name": "Integrity Way Apartments",
      "section": "housing",
      "subsection": "apartments",
      "x": -47,
      "y": -585,
      "z": 37,
      "heading": 340
    },
    {
      "id": "del-perro-heights",
      "name": "Del Perro Heights",
      "section": "housing",
      "subsection": "apartments",
      "x": -1447,
      "y": -538,
      "z": 34.7,
      "heading": 34
    },
    {
      "id": "vinewood-estate",
      "name": "Vinewood Hills Estate",
      "section": "housing",
      "subsection": "estates",
      "x": -174,
      "y": 502,
      "z": 137.4,
      "heading": 200,
      "description": "Upmarket residential area."
    },
    {
      "id": "lsc-la-mesa",
      "name": "Los Santos Customs — La Mesa",
      "section": "transport",
      "subsection": "garages",
      "x": 731,
      "y": -1088,
      "z": 22.2,
      "heading": 0,
      "description": "Vehicle mods and repairs.",
      "connections": [
        "lsc-burton"
      ]
    },
    {
      "id": "lsc-burton",
      "name": "Los Santos Customs — Burton",
      "section": "transport",
      "subsection": "garages",
      "x": -337,
      "y": -136,
      "z": 39,
      "heading": 70
    },
    {
      "id": "lsia",
      "name": "LS International Airport",
      "section": "transport",
      "subsection": "air",
      "x": -1037,
      "y": -2737,
      "z": 20.2,
      "heading": 240,
      "connections": [
        "sandy-airfield"
      ]
    },
    {
      "id": "sandy-airfield",
      "name": "Sandy Shores Airfield",
      "section": "transport",
      "subsection": "air",
      "x": 1747,
      "y": 3273,
      "z": 41.1,
      "heading": 105,
      "description": "Desert airstrip."
    },
    {
      "id": "marina-ls",
      "name": "Los Santos Marina",
      "section": "transport",
      "subsection": "sea",
      "x": -794,
      "y": -1497,
      "z": 1.6,
      "heading": 110
    },
    {
      "id": "grapeseed-farm",
      "name": "Grapeseed Farm",
      "section": "jobs",
      "x": 2005,
      "y": 4985,
      "z": 41.4,
      "heading": 130,
      "description": "Farming work available here."
    },
    {
      "id": "docks-warehouse",
      "name": "Docks Warehouse",
      "section": "jobs",
      "x": 1208,
      "y": -3115,
      "z": 5.5,
      "heading": 90,
      "description": "Freight and shipping work.",
      "connections": [
        "marina-ls",
        "grapeseed-farm"
      ]
    },
    {
      "id": "quarry",
      "name": "Davis Quarry",
      "section": "jobs",
      "x": 2949,
      "y": 2792,
      "z": 41,
      "description": "Mining contracts."
    }
  ],

  groups: {
    /* Encrypted with each group's key. Regenerate via tools/admin.html
     * whenever you add or change a group's blips. */
    police: {
      encrypted: "UkYzTyJptXqssFwoiaJBKGb9XforP8n6J0DA1CzC1pA83l+bPKDkjy/LpaNhNbo0tjXXai6UsHrcpHpgTK8nQxtQSdXuUuF48HJKYUTc0und9NA2B4zln0TimSTt+nJkYyxAw7mj6ASH3Qmntn+qGdwdCXQmEttA2OhDq2FfIG8M7gSVzMvkHVk5anp7P1t0y3CAe9qt+eVdYekfiHvya0JTwuQ+XIACCUfUuj9lvjoUfDU689eExJWLOKMQh4KoMqQ8E/CND6T2U6o89Wzbnepdh9gMr34TZS0T/JpNyeueeLVxTF12hIEcNWA70oWF63jvnZGUarsVy/s6aIWZ5wQZx6MBvFTNv5Ep+sZjlGK/h+w0lmdeDpxrrCdNR0o9uxQpsEchbrIQfNcZKb+YbHT6G0xDGRcen2D58apBD/lHgeHMqOh5jkRn2/ACeAqlFGtltsn1/EBvKZGiTzYA+ZB651uOvbFSKQqWrG5KdUMmKtwIG5jGU0bAxQQKrIVh6ymicAJhmwHNYsDAiaNeIrD0CYKEhssVEQs+ZJMaOeAZ3fs3IhJOdhDtn0u3MZTT6+mhOc9ykXFl4z7GZbAoISRzkJfSY1to3cDLm0OcCN65UoZHB1mo9tr9rExndkKzSHePDWiMpo1OMPjmfbY4pPT8DgsOK36D0e35Bdr7ubsjlerzGkMRCpQthzbrrpdh1pyfH/rp7g7v+IR9twu9u4wOxxrViAzypRLPSMZ/kOGo1XJwfj0zc717bQfXR7Sz1UZfS+mMtHw="
    },

    crew: {
      encrypted: "1CQLKOkGeBpgupIFZV9eSTGxtsOI1PsIjsNeDlo6AG5L7YnIc7mBp6w5zdO+jnAHe3v0PGFHPk8QhDJac9Aek4IWVIzHM8t8hXv3y1gnhm7uiHrAlI0BYX24UIGqZbw8HVxhKYUCsBnSACFhBV62MK0ZMWaIOYsNLhtNkOLWTLYw+MXUQg9aPhLa7p9Os6IrRYqqIhfqjTws3rArXuwkW9q2wDxkR5/jAnpcLJX+SIMizUQpdjrIc7BddC32FGuv4g5W8YjUhrr8qT80enNCqcIZoD6iZ341EgP0ut9DSrfVorGfJMQChCMu9vUbqYBR81XdlQXgg5LnyWKK0BTmEtxJKmdMNSB4VVEPbYKy8TOOtXMj26C28Un6p/g83J0CUzK+UE4gI5yQ4bRIdw1I/f0JtZMgGLd7HDPKMg0yr9x23lrO10IdIyKH9eafZzWsRzd5k/63yPhsYy+wEr9hwaz+C/i/03+FzRKsuFUm/UnGJXkZUiQrwRJmiF+U7EqUy3XedU4fAprQuV+KtA9vbgG6iu8ParL0pJup1vU/6yNIumz2LIAJCmA8Bijric76Fmgxh+2Wl45ktby4kyRrYZM6H0lpHAp5Z9PBnXwPJ6ZvA9Z2RrkT1s7rg9HsWyBa+gNn9Z8dHTQx+Fuvco2VG26Mb/b1mGRB871eF0qjQCiaxsr7qEMnKjaiUKrXbYzPhh/XI5i7ygrIuC/yGdsiQOv6xaINeDdk4xYFmMcyQ2DIoM3wzzduG2x2F0fiKfSedZBsmrxbJMDXPz3aTrsj1oyYq15VffMvEogDRBYOlM8ACD6F8lJIFrA2uXPSxvZHx1D0cGLoa4zT/in7hRAzoROXTRwy4SwXIYKPeITv0Z6XIodAKyREGPc1126zzdUDLJ9pz/Rg6pJXCcHA9Z184sj+tSs23GfRcBkoE+RNiFGgWWZQvSV8wYrkBBaGUCy766Wvob/FpWWdRs780W5zLsstZg=="
    }

    /* While setting things up you can use plain text instead, but anyone
     * reading this file can then see the blips:
     *
     * testing: {
     *   plaintextPublic: true,
     *   blips: [ { name: 'Test', section: 'general', x: 0, y: 0 } ]
     * }
     */
  }
};
