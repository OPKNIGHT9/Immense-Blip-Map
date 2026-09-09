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
      "coords": "vector4(195.0, -934.0, 30.7, 145.0)",
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
      "coords": "-1223.0, -1490.0, 4.3",
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
      "coords": "2949.0, 2792.0, 41.0",
      "description": "Mining contracts."
    },
    {
      "id": "downtown-zone",
      "name": "Downtown Safe Zone",
      "section": "general",
      "color": "#22c55e",
      "fillOpacity": 0.2,
      "z": 30,
      "description": "No-crime area. Enforced by dispatch.",
      "points": [
        {
          "x": 60,
          "y": -750
        },
        {
          "x": 420,
          "y": -820
        },
        {
          "x": 450,
          "y": -1120
        },
        {
          "x": 110,
          "y": -1180
        },
        {
          "x": -20,
          "y": -960
        }
      ]
    },
    {
      "id": "airport-restricted",
      "name": "Airport Restricted Airspace",
      "section": "transport",
      "subsection": "air",
      "color": "#f59e0b",
      "fillOpacity": 0.15,
      "z": 20,
      "description": "Clearance required below 500ft.",
      "connections": [
        "lsia"
      ],
      "points": [
        "-1400.0, -2400.0",
        "-700.0, -2500.0",
        "-650.0, -3200.0",
        "-1500.0, -3100.0"
      ]
    }
  ],

  /* Connector groups link several blips at once. mode: 'mesh' (every
   * pair), 'chain' (in order) or 'hub' (first to all the rest). */
  connectors: [
    {
      "id": "fuel-network",
      "name": "Fuel Network",
      "color": "#93c5fd",
      "mode": "mesh",
      "members": [
        "ls-fuel-strawberry",
        "ls-fuel-sandy",
        "lsc-la-mesa",
        "lsc-burton"
      ]
    },
    {
      "id": "transport-run",
      "name": "Cargo Run",
      "color": "#06b6d4",
      "mode": "chain",
      "members": [
        "docks-warehouse",
        "lsia",
        "sandy-airfield",
        "grapeseed-farm",
        "quarry"
      ]
    }
  ],

  groups: {
    /* Encrypted with each group's key. Regenerate via tools/admin.html
     * whenever you add or change a group's blips. */
    police: {
      encrypted: "MVVP2TRSrMcbNoQrTDQcYQJFJZgTrT+2fwvS5bV3LDFz3+qqISP6rVyS1LTE/4Ve4B7EJNc07h0Arni7kAzV4ZpD6ZXcfI0ATxuIxRVZjYNX0M94obl9pxbgkYZaFbORw7lPotMhhU7QO3FKyfLy0gXz8NwTRWpmTSfTk6M5b5Pc35c0AEYiEcRs9xKzyFZ7xH4VQJ7esM/TCEPCMxeoiKtMxSQ41VmPH1+pn0xhMr9ax1Xq3w37CDZoaGt662nWxd06AGiAwjXn7hypX2q1asy7C0X9QuxqpCBO/NoDIfhZrWIlQqvN2lT+Vb/tkckePLIttz1c3jmNCVIwtIrCIwN4bG/TXbbFUlCtXQ9RwpZHLSkjhtqBLqwQ1YPx8x3x8EoPlhIvC+/0/vtMW54E3jAIQz2R9mFiuQg8RK4VLnTN0u8SBNlFEESKNGhWkfIw3NcEoiUUSIhNpCy1nSl7SXcSbWRf/+jxt4e/OBXjrz4t47G0Jdot4qP7gPmG/VLu1OSIRhy3xUc6bfIHN3BCVzrqrOF/KnLhVc2411pqTFVT0a2WmpFgVb/laQnXG/hL1AnWWUGxaizUIIxlz8IfILs68b6x1jNosSb9oiGast1QkmBUrZknj9Fmierd8GjOKP80GvNMEijBI2AsTgOSvm+twrzpMqHIrcl10qDmt8wF//FN5Jd87OUDnAXa6zaHdZCBGQURXKy11+92916DawSbC0ek035w6oUgyBCXA8xhrc2AuHsJB7JvBYyKXolQpFDP+NTMBk25UTgauRSFXrrN2+dqAXFcbC4YnG24kDM0QQ=="
    },

    crew: {
      encrypted: "DdxZyGH8/+eRR13c8vXxI+RacurOn6RmNHhcdt7EK8vuR3rB1l5oGgvU57eSRuRJmN4KsJotHYQ4rO3HKcTRZ/h3DBEklGJ3s5Ig+T3ieO/RMZEGwkJWlGXJhRsf5sc9BtRnXzQrNIbKfrSSrWlBpciKZZXlCA8Gip7ZYlJorqG/dbuuue3MFPrUYSGafFaWtQhV550IUbOtG6rYUyv2fQ0FpQQ+cAgZj+jta4RtaKvvslNnwHX+fPSSzVufT5OIQXkzNcRyJh2LvzW1xR9eeWNZpjFZZYTs3oGVkVZi5YgG9t1z2+hYVI6uxctgmFYqUTsLt3B0F4tnYAoVVZNt0xFJbmbV07Wo+dqsVepyMQy8PncgbUBcVTzah5PSOtgKfe+iQV8G8ndyIPNTmrv0P87xguU3nFQGV1woY4nCXbZ7bexKand9uVwFmxFLEk1LWJnQ9RxWaJxPwgag55JiRY8o6IQ2dAckUPafSmD7PDDjRscgJmFzxyYhez4yeYAjy3DnlJ1ukhfdCqqsbOWKSuLoxShc8vItwVJI3l3oT053je7S4EubGmHjVbqEr+1qSLj+eBWkS0MRDcPKY+JUxjGqu1T/tlmh4zneazsmOm2QGR3hCAnrQi7e6AFUlbJpZ+Yc5InoOEhVDCTR4AvkYbzEmJeJPu75xmA5u0zdLCJ85JXEY2CbNhbK1ktKRTJQH0mSSdWqFQWD9DyD+rLynJZAWF9NibcGirWGpba7f/kfj3eUBe1JibCInX+oS85rjKBeKomi4TazI6Z+5gJK3JTgrfOaaHX3QK9HjiyrvtskG6GZ83RCdYqq4Sl85xcwTcXlLGD1XEGizSDRdQIJNY9onvT17OS5gnVikVaLuhqlYED2ZkEMxmJkBxKClQxQUv9hLxzcAvV5qiN5RgDuBabJFCbusXWW0gYt7CphlDugatC+E1F8gdmRFAxfdfWoQ3W8updE2J95kDiLFgqbqygRBfMH4dqTLEgFzV2ZRLTtSkR4mPSX2bcBBMxVe+7VZGmb2ynstbZfOsUHTMwXT2Ns4S66fHDad1ChNcZCLsgawuoWBRy2qI9Xa8sRCnEz7v8ozwht9HIWwCeNrso4TeuoiN6y+S9evqkle8rz5I+xj/MorNehqxaS72pImmHygOH+DZW3tAH0LU3rrQX7JV4X98z24y0Kr2H2FxvLDuQ7ghLuWNhIdS30pCM="
    }

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
