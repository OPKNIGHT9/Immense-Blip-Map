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
        {
          "x": -1400,
          "y": -2400
        },
        {
          "x": -700,
          "y": -2500
        },
        {
          "x": -650,
          "y": -3200
        },
        {
          "x": -1500,
          "y": -3100
        }
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
      encrypted: "vBLf7FqsPIymKX2hDiSvHSlBNBFSYaxwvrrE8wIkBSWu/6valGtrltnwgxc2uiKNdUgG96LD9nbJOuWWhLRT0wnFBvoM8WNhJjR50X/Ev+6VYbJWuGPN9tTZSUHUl1xNs1RXAoS7VibXDHcjGMRo2pgBVPAVTbfQppwYdKW1KyHi/IZNRh1uYSbEQhUoEEKm57+KGLP2qiM0Nw6U9aeTSLCMPjslew/RUGtEDIGNRXYoTtsV1cv5C4W2dtmK+pLPCdIkBbIOE6tPKUHz+XQrxbs9RT59mT7mxDRejkym6BMu3x3GwrIBM7v6RA37TWhr2XdU1US6mz5Dek8joMQ3TpEJOMN54yvE6/0RhaBbiGUudhKBWeY8+sWgLZtWuaWs/kroMNMaWA0YSkeMaVYX7f1WxV3XaBJHBUSsYrIqyD/MzjG3f4vNZ6Ygy2zbpj/4rzQh3gg1NjBUte+7kqMZfcC2rQp27kdXsBL8+39zWKvOlGEDMyqN4vHxOEn1v90IsWlljWWJp579ECGI4X2v8n1drOyUi8NlTKZqOnivp274Vp9r8LH9aBgUHW4F1uc8JFCSHBFjgECX/mwjS1ii/G5UVwi7IKlPurc9OljV3c8GuDWn9UKMdqaRFFeNpGKpHG0q+FCjIAFk1zHB6XIy9GbqAzRjpXtzZK4l0ioAm70rop3j8YMXFpBHWFPnqSHbWufW0wgkz5buEsf/45c7yf3PUDOLPHkf85eKwyLC/FhQeYFRBVq2GG25hb94JK4MnsP21PE5prBAqCANBBkNQUJWvrYCKB4ETwphKO+ZR2XxoA=="
    },

    crew: {
      encrypted: "e4w5pUjHd8kr7EEdoM+e1QVzoOdyYv+lAnkZv99KpJisnY1LUulSLoQcKyJEPOGkQi6rMwu7MySgnpxBfEKvqEP8PTyv7G3tEPecb1TdxL2/EYNwAKmWRZ5ivlAZQUBwE2wGJ7t0xLBfiiVWoxZNZZXyzioUKyS+cwYVU9rNlLxE2pXXMfTEDhW8AgakVoH97k4D8y6KEXbg8V1llhL1UMa+V7sHUzmVxyuVHZSVVuoZeawZ6Oxs98tCzN4g34tNZOKXqXJtVc//DyBJNQJL9XfTpon/5pdxQhMFHJNKKAbVgnwJDH+sznCjwuAa9tb4zLEKJSYKAGjHxu6U/762U7XrygHeaDcU463oVSzSAh1FPVYzkgaK8CyN742IKkCoBD/Ll+pXOkNYYb4+UFw3Val2o6kU2NBtwZZ2+qnHlrxW+V/N+qxxxvaVyg4iOBppfdqX72o2ekZyMtsE7URxU2s7oriQDW4cW2Nz8IWzwhMyfNK5CmYlkjYwj6SpMQgF5kzmEpiV39bQz8vct36fxTL68CttEcdjq06/VK8BJ763JevsSWBQQ2XrWSZXyh4hRlTa7m0aSMi1QdYU1mhS55ZHXplOzp0Tis0KkKG+Sb4udkDGcpfMmFkjmT0O8173bv1tWJoNzF8Q0oyQ2mPUzWadLF43J+27LjI0Xas+OToXk7AKmPvbe1EPMWIKtF4GQzQikDsbR2O/bam45g92koDUQjVSXDrkwCTeO1ovU6SMX/NzOYmRxjik/xkAVLMWIl3nS6lpkOVedh35opFUHA9wRiPptuTdm2Qkere3mM9/1lIkcmqxGwNcEw5T2DY+zCpBxn+5uUXz1cgcjZhU5wf+cmdq4w9SkAbr36XX+A40C2fhlRoBa7Ypo01gs12DjmXjdJa1AOKwi6Krd0a5z+6AEzVlumhoIj/gqjh2Z50I/uepQgyVb/HITn2dyDHwyTfu4QWCsEHFzwpIkKDHUlzzkJzZpaZCjqXt5nY8skifJq0uELdFwp1MGfCZGt7JL+guVmvdDdt6VKbPqIWUCsoXGFdfH3KRPsGZ/LoTy1V8RbUfCzVYLLPtTAWJGvoT33TkxrrlXAPDoznBCO8VFs0gVXyd/Hv/geN8kwXDBZEAgbpqafdF+tQqp6dW4J1e9iik2eMqepISadE03mOIDK7RQ60XdpxfDlhvWuBxwtfRshF9dRD7KVBVwzE="
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
