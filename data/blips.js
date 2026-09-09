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
 *   coords       the coords of the blip
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
      "id": "henhouse",
      "name": "Hen House",
      "section": "business",
      "subsection": "food",
      "coords": "-302.9332, 6267.124, 35.27686",
    },
    {
      "id": "rexdiner",
      "name": "Rex\'s Dinner",
      "section": "business",
      "subsection": "food",
      "coords": "vector3(2532.0, 2607.0, 38.0)",
    },
    {
      "id": "arcade",
      "name": "Eight Bit Arcade",
      "section": "business",
      "subsection": "other",
      "coords": "vector3(-604.0, 288.2, 82.1)",
    },
    {
      "id": "pizza",
      "name": "Pizza This",
      "section": "business",
      "subsection": "food",
      "coords": "vector3(95.07, 9.55, 68.59)",
    },
    {
      "id": "tunershop",
      "name": "Tuners Mech Shop",
      "section": "business",
      "subsection": "mech",
      "coords": "821.2342, -2102.592, 34.45048",
    },
    {
      "id": "catcafe",
      "name": "UWU Cat Cafe",
      "section": "business",
      "subsection": "food",
      "coords": "-583.802, -1059.24, 23.2042",
    },
    {
      "id": "record",
      "name": "Ctrl Sound Recording Studio",
      "section": "business",
      "subsection": "other",
      "coords": "-825.5715, -717.1394, 28.91001",
    },
    {
      "id": "sightings",
      "name": "Sightings Space Resturant",
      "section": "business",
      "subsection": "food",
      "coords": "vector3(53.09, 209.01, 109.34)",
    },
    {
      "id": "boathouse",
      "name": "Boat House",
      "section": "business",
      "subsection": "food",
      "coords": "vector3(1539.0, 3790.0, 34.0)",
    },
    {
      "id": "pdm",
      "name": "Premium Deluxe Motorsport",
      "section": "business",
      "subsection": "dealer",
      "coords": "-1005.07867, -1507.96948, 8.797941",
    },
    {
      "id": "import",
      "name": "Rockford Import Dealership",
      "section": "business",
      "subsection": "dealer",
      "coords": "-791.2505, -227.43457, 39.1784554",
    },
    {
      "id": "hof",
      "name": "Hall of Fame",
      "section": "business",
      "subsection": "other",
      "coords": "212.947632, 1170.6311, 233.092087",
    },
    {
      "id": "luxx",
      "name": "Luxx Nightclub",
      "section": "business",
      "subsection": "club",
      "coords": "-80.2426, -1277.99731, 30.35423",
    },
    {
      "id": "lsc",
      "name": "Los Santos Custom",
      "section": "business",
      "subsection": "mech",
      "coords": "-327.895874, -131.346161, 49.6273537",
    },
    {
      "id": "seaton",
      "name": "Seaton Sands",
      "section": "business",
      "subsection": "mech",
      "coords": "vector3(1718.0, 3695.0, 36.0)",
    },
    {
      "id": "vu",
      "name": "Vanilla Unicorn",
      "section": "business",
      "subsection": "club",
      "coords": "128.79303, -1292.10437, 27.8926239",
    },
    {
      "id": "paletomech",
      "name": "Paleto Mechanic Shop",
      "section": "business",
      "subsection": "mech",
      "coords": "-283.8359, 6029.02734, 30.5414181",
    },
    {
      "id": "petshop",
      "name": "Animal Ark",
      "section": "business",
      "subsection": "other",
      "coords": "560.2896, 2771.7, 44.60243",
    },
    {
      "id": "tequilala",
      "name": "Tequilala",
      "section": "business",
      "subsection": "food",
      "coords": "-558.0049, 285.664, 81.1764",
    },
    {
      "id": "lovebite",
      "name": "Love Bites",
      "section": "business",
      "subsection": "food",
      "coords": "-1222.50293, -281.2516, 36.5717468",
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
    // {
    //   "id": "transport-run",
    //   "name": "Cargo Run",
    //   "color": "#06b6d4",
    //   "mode": "chain",
    //   "members": [
    //     "docks-warehouse",
    //     "lsia",
    //     "sandy-airfield",
    //     "grapeseed-farm",
    //     "quarry"
    //   ]
    // }
  ],

  groups: {
    /* Encrypted with each group's key. Regenerate via tools/admin.html
     * whenever you add or change a group's blips. */
    // police: {
    //   encrypted: "MVVP2TRSrMcbNoQrTDQcYQJFJZgTrT+2fwvS5bV3LDFz3+qqISP6rVyS1LTE/4Ve4B7EJNc07h0Arni7kAzV4ZpD6ZXcfI0ATxuIxRVZjYNX0M94obl9pxbgkYZaFbORw7lPotMhhU7QO3FKyfLy0gXz8NwTRWpmTSfTk6M5b5Pc35c0AEYiEcRs9xKzyFZ7xH4VQJ7esM/TCEPCMxeoiKtMxSQ41VmPH1+pn0xhMr9ax1Xq3w37CDZoaGt662nWxd06AGiAwjXn7hypX2q1asy7C0X9QuxqpCBO/NoDIfhZrWIlQqvN2lT+Vb/tkckePLIttz1c3jmNCVIwtIrCIwN4bG/TXbbFUlCtXQ9RwpZHLSkjhtqBLqwQ1YPx8x3x8EoPlhIvC+/0/vtMW54E3jAIQz2R9mFiuQg8RK4VLnTN0u8SBNlFEESKNGhWkfIw3NcEoiUUSIhNpCy1nSl7SXcSbWRf/+jxt4e/OBXjrz4t47G0Jdot4qP7gPmG/VLu1OSIRhy3xUc6bfIHN3BCVzrqrOF/KnLhVc2411pqTFVT0a2WmpFgVb/laQnXG/hL1AnWWUGxaizUIIxlz8IfILs68b6x1jNosSb9oiGast1QkmBUrZknj9Fmierd8GjOKP80GvNMEijBI2AsTgOSvm+twrzpMqHIrcl10qDmt8wF//FN5Jd87OUDnAXa6zaHdZCBGQURXKy11+92916DawSbC0ek035w6oUgyBCXA8xhrc2AuHsJB7JvBYyKXolQpFDP+NTMBk25UTgauRSFXrrN2+dqAXFcbC4YnG24kDM0QQ=="
    // },

    /* While setting things up you can use plain text instead, but anyone
     * reading this file can then see the blips:
     *
     * testing: {
     *   plaintextPublic: true,
     *   blips: [ { name: 'Test', section: 'general', x: 0, y: 0 } ],
     *   connectors: []
     * }
     */
  }
};
