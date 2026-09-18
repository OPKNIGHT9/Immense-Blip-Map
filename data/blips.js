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
 *   coords       "x, y, z" or "vector3(x, y, z)" or [x, y, z].
 *                A fourth number is the heading.
 *   heading      optional if not already in coords. 0-360, 0 = north.
 *                Draws a direction arrow and enables the vec4 button
 *   tags         optional array of free-text labels, e.g. ["MLO", "Base"].
 *                They become filter chips in the sidebar and can be
 *                sorted by. Invent whatever labels suit you — nothing
 *                needs declaring in config.js
 *   enabled      optional. false hides the blip completely: no marker,
 *                no list entry, not counted anywhere. Use it to park a
 *                location without deleting it
 *   icon         optional, overrides the section's icon
 *   color        optional, overrides the section's colour
 *   connections  optional array of blip ids to draw a line to
 *   description  optional
 * ------------------------------------------------------------------ */

window.BLIPS = {
  public: [
    {
      "id": "henhouse",
      "tags": ["MLO", "Paleto"],
      "name": "Hen House",
      "section": "business",
      "subsection": "food",
      "coords": "-302.9332, 6267.124, 35.27686"
    },
    {
      "id": "rexdiner",
      "tags": ["MLO", "Sandy Shores"],
      "name": "Rex's Dinner",
      "section": "business",
      "subsection": "food",
      "coords": "vector3(2532.0, 2607.0, 38.0)"
    },
    {
      "id": "arcade",
      "tags": ["MLO", "Los Santos"],
      "name": "Eight Bit Arcade",
      "section": "business",
      "subsection": "other",
      "coords": "vector3(-604.0, 288.2, 82.1)"
    },
    {
      "id": "pizza",
      "tags": ["MLO", "Los Santos"],
      "name": "Pizza This",
      "section": "business",
      "subsection": "food",
      "coords": "vector3(95.07, 9.55, 68.59)"
    },
    {
      "id": "tunershop",
      "tags": ["MLO", "Los Santos"],
      "name": "Tuners Mech Shop",
      "section": "business",
      "subsection": "mech",
      "coords": "821.2342, -2102.592, 34.45048"
    },
    {
      "id": "catcafe",
      "tags": ["MLO", "Los Santos"],
      "name": "UWU Cat Cafe",
      "section": "business",
      "subsection": "food",
      "coords": "-583.802, -1059.24, 23.2042"
    },
    {
      "id": "record",
      "tags": ["MLO", "Los Santos"],
      "name": "Ctrl Sound Recording Studio",
      "section": "business",
      "subsection": "other",
      "coords": "-825.5715, -717.1394, 28.91001"
    },
    {
      "id": "sightings",
      "tags": ["MLO", "Los Santos"],
      "name": "Sightings Space Resturant",
      "section": "business",
      "subsection": "food",
      "coords": "vector3(53.09, 209.01, 109.34)"
    },
    {
      "id": "boathouse",
      "tags": ["MLO", "Sandy Shores"],
      "name": "Boat House",
      "section": "business",
      "subsection": "food",
      "coords": "vector3(1539.0, 3790.0, 34.0)"
    },
    {
      "id": "pdm",
      "tags": ["MLO", "Los Santos"],
      "name": "Premium Deluxe Motorsport",
      "section": "business",
      "subsection": "dealer",
      "coords": "-1005.07867, -1507.96948, 8.797941"
    },
    {
      "id": "import",
      "tags": ["MLO", "Los Santos"],
      "name": "Rockford Import Dealership",
      "section": "business",
      "subsection": "dealer",
      "coords": "-791.2505, -227.43457, 39.1784554"
    },
    {
      "id": "hof",
      "tags": ["IPL", "Los Santos"],
      "name": "Hall of Fame",
      "section": "business",
      "subsection": "other",
      "coords": "212.947632, 1170.6311, 233.092087"
    },
    {
      "id": "luxx",
      "tags": ["MLO", "Los Santos"],
      "name": "Luxx Nightclub",
      "section": "business",
      "subsection": "club",
      "coords": "-80.2426, -1277.99731, 30.35423"
    },
    {
      "id": "lsc",
      "tags": ["MLO", "Los Santos"],
      "name": "Los Santos Custom",
      "section": "business",
      "subsection": "mech",
      "coords": "-327.895874, -131.346161, 49.6273537"
    },
    {
      "id": "seaton",
      "tags": ["MLO", "Sandy Shores"],
      "name": "Seaton Sands",
      "section": "business",
      "subsection": "mech",
      "coords": "vector3(1718.0, 3695.0, 36.0)"
    },
    {
      "id": "vu",
      "tags": ["Los Santos"],
      "name": "Vanilla Unicorn",
      "section": "business",
      "subsection": "club",
      "coords": "128.79303, -1292.10437, 27.8926239"
    },
    {
      "id": "paletomech",
      "tags": ["MLO", "Paleto"],
      "name": "Paleto Mechanic Shop",
      "section": "business",
      "subsection": "mech",
      "coords": "-283.8359, 6029.02734, 30.5414181"
    },
    {
      "id": "petshop",
      "tags": ["MLO", "Sandy Shores"],
      "name": "Animal Ark",
      "section": "business",
      "subsection": "other",
      "coords": "560.2896, 2771.7, 44.60243"
    },
    {
      "id": "tequilala",
      "tags": ["Los Santos"],
      "name": "Tequilala",
      "section": "business",
      "subsection": "food",
      "coords": "-558.0049, 285.664, 81.1764"
    },
    {
      "id": "lovebite",
      "tags": ["MLO", "Los Santos"],
      "name": "Love Bites",
      "section": "business",
      "subsection": "food",
      "coords": "-1222.50293, -281.2516, 36.5717468"
    },
    /* enabled: false parks a blip without deleting it. This one appears
     * nowhere on the site. Flip it to true, or drop the line, to show it. */
    {
      "id": "example-parked",
      "name": "Example — Parked Location",
      "section": "business",
      "subsection": "other",
      "coords": "0.0, 0.0, 70.0",
      "tags": ["MLO"],
      "enabled": false
    },

    // {
    //   "id": "downtown-zone",
    //   "name": "Downtown Safe Zone",
    //   "section": "general",
    //   "color": "#22c55e",
    //   "fillOpacity": 0.2,
    //   "z": 30,
    //   "description": "No-crime area. Enforced by dispatch.",
    //   "points": [
    //     {
    //       "x": 60,
    //       "y": -750
    //     },
    //     {
    //       "x": 420,
    //       "y": -820
    //     },
    //     {
    //       "x": 450,
    //       "y": -1120
    //     },
    //     {
    //       "x": 110,
    //       "y": -1180
    //     },
    //     {
    //       "x": -20,
    //       "y": -960
    //     }
    //   ]
    // }
  ],

  /* Connector groups link several blips at once. mode: 'mesh' (every
   * pair), 'chain' (in order) or 'hub' (first to all the rest). */
  connectors: [
    {
      "id": "pd-station",
      "name": "Stations",
      "color": "#2410d9",
      "mode": "mesh",
      "members": [
        "mrpd",
        "hwp",
        "sspd",
        "pbpd"
      ]
    }
  ],

  groups: {
    /* Encrypted with each group's key. Regenerate via tools/admin.html
     * whenever you add or change a group's blips. */
    service: {
      encrypted: "Cp5lL9oP7V/w1kZzQmMGjXvM6OzftWVGmBadqcAL8WyQqkmKkKytuF+KDvhZWdGGP87muukl7AJziaHhHh2kvOkgKdFjaWGsAXTq96WDLzfuyXVTwiLQYOg9Yf0PrIUx2gApzHUGADzRddm1789hvbINPFviGqq10GH58wkEqYQJ27EIBARgRj1gxJBnJWTiTlgIs4MTT4fUiYzetxk8HcRFtgs+0l0ZQ6lqycvmk/1nvA5r165wNbk+kOyKPgZyvh5JP5nTvqmEelpv8+ufP219KI5qTtIXgHoMSsjEqxm8fK0zrK8IFA+AwYePR8w35p3j0kUBkN0NWfsaGopzdIiN8hzUOeFpW+l5kFlKCz7ilCx82BOYJNbfakN4bbzurpsk7ZpNw7KzwUxiAT4OV6iTZP73wYNJUD03Zw4KcTvugC13rUtQfTsuSlM4ovX8sHWaIsGkR0vDNPBvZvH61ZfXzhqgZmDeTE+qUEUVwaGKXGaHN7wMMiXKy2TATCWZ2A54BmsHAozomfeLSDu8wV0eYYvmgul8KjDiryWR1Yi0CYT3fc98pZOXEsWCp4j9eYzHouNTpuT2rFhTC0KyWhsu7RdtSJn03IJp3O4WipDd12YdRHAdrQF9ZkKlHJXZ1Kk1V+e+eBpH9cNgrlm6vDd6/zpxxi7tyfEuByILgtGf9hXYaxwEyCnd3HJUtvtD+4DJMU0n4wrq9K9msts/E7kvqtDiXSs8bm2AywrAHXga+dobu31eI7vgwwFIaQvQPUEl+D9GKmS5dgpyyVQvas3sczrm49eQ5fSSRe6pJs2VsXahDX0cNektviXb8qTMI2C5qBTh4mS1bPE14Wo4PSHtyP6odOC4RsR5PN4eMvIir9T6tufZy+oOAeLIaL6iSp1gWDmn3fN+EEWTIlm3lLR7l4g77duZungoNO9j9zrYHpqx8V1XWOIXIFhCOdluj+b0FN4ijiwHRfc/L5Bs6xH0P4U4plFpU9Uw3yuOVdv3+5cSX3N0znp3Rec2b8JErMiKmZU75N/lY6LQ6kMTO4qJAmFLC45WOKq/4WXFckW7Xic0C0CAkbQHjEOIYg=="
    }
  }
};
