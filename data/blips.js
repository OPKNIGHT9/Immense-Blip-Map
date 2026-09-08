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

  groups: {
    /* Encrypted with each group's key. Regenerate via tools/admin.html
     * whenever you add or change a group's blips. */
    police: {
      encrypted: "SfhL8mqVQKguTrHg3OUx2N4e2gOjNOFD6HJWgQCgYKPFMz1JN+6XXnRv//f4bAKlm6ysckx2mRZxqZ4DPFBfS6LDg/7DprqK1DUEWpZTfe4rOyg5c4pEFW8X3QNBOw4ltAuBJlTFzuFS/fk7QW68qvtwRYIiURJXj0aa1y03EgZRtQzbzCCmm3pJKAbU2GtgOe8JOXHRzssHrA/6rdI0Bt+RmEBWc3cY0qmCvkdkGRw12tTUxrUCDIbbQD+S19QhHR+OIQy+Wk7jWNKqqh6YCJjuy1lQFMCsitpv6IqOmf7F+TVcjE+2X19InijCms0+gpJPlbBSl/1jOKX1FXfwjVyjp/XbGbWwlSOf6bbvrfOoSU9Pq/489ZDO3IcSNQGH8hC7PfPlWRFLvhNb7yuvSONEiuEjdE8gxJySK++R7VY0UyvfXfVjbE94iJlpjAs+gDT7kDwQexp5y/1BxzrPE4uev94QbBI+sUeXLkAFuFUvAZHwavQPK+CsgCdwfB9ifXs56fFCQqfxgF1U68BTQnZOh2hU2foedVD/aaBlEHqOD+Yd/fDzKrcRH4hzfQyLd5u4viGjqGnMaNi8HvEiv5K4ugyzkuxFPAdbUEcPiB2DlTZ/YSqbF9E71nIJ0eQUKlOoH+IMBceLRybVAnuHQtnoTJ835s5beOpaRtei79N5o4xBkebUiiVlgMK9f1jD/0HiML7oMVhfhibrkcumASH0vokzisw9NcvZqnezbLHt4wyJocA+wjgIXwijwVQm8f0z4CUyHFc="
    },

    crew: {
      encrypted: "nE73xX/kGjeOKXvCq2co1z/zx9c8Dy4LsLuLy2Bb4gK2yDGgt+mchM6aNAI51Ka4g4nBh0qXQP/7BVl8Ebmhw5N0l1UF/uyQ1TCgCogb3jW6wu39bsj66NPuXOs+FQjEsLE2/23FN03FRtc/h6n/0YSTO1FzgX5gAyfxIs4gHWHyYrQF2D+pypB0RJ/nCXvEGBUVz0+9EmaFG54HKn9/kxbobp+fvIG1rN7sRSW/6Rq5Zwg5vI/ihpqXnLNfo+KlISq38sH1m5ZAvALNvyta/7YBu4Jmvt3nlMFEqJTUP0QuSeVix3Vjntu3Mg/e0o7qzRbsW85qpr0NT8CjDnhKIPG38fuRiYg+0zoUd84BayhQbNMYjSZu83a2oUEI3fUR4M2YQoHXQ4ndGuSMYU/cGd4qUI2C3MVmLdKXY2aEqT9Vpz2zb+SJQRDFgpJmZhe2nEU3BNqRiQpfw9OKmmGCT3DOtm3wbOe5d+mLionnCjcmdkb+QshjZVZ2sTAzFiT/b7PeK2R0IjG9TC5266NuLLR5BLUd2qdCIM2C/A96Kmy8DGjWg5ABfd0/w4MFF0YLt0O8YdsD9leRsi7k2/v/hdbsY5f3ZF+7wvyxoMxQZigiiMwVRx3Y56x331m8V8px8wrU+qChoHrx+Li0oTxqFZpWot8Mxtrd7/Qjk7ltTSSve3M05aJY+thWP50W/evGqXTvQVtIWIqufpqrKn5btUEyVspZLrIvMH0d5vaOMSHbFSIsm2/PYGKS0sh+6GKGO1d3Hqp9qbto0I8uwU52netSdY0SwkwxDrhM+5FPC4fZBVn8cWiLm4gJAk2YwY9BR7FWaPML0j7euO1l2Eh2D7qA3/TbRnuMnvMblN7RnDqaXPZU9MGlFwiBmiWkrFtAmRtwueCpaZsS0F1VDNp4y9sH1SoikG6cnDc/GL4/GY0/xTfqLrumK7XAWwGsBpyupZxSRfndoDfS+6uHEIEnX6XdBA=="
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
