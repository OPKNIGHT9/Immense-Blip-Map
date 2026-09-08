/* ------------------------------------------------------------------ *
 * BLIPS — every marker on the map.
 *
 * "public" blips are visible to everyone, no login. Edit them freely.
 *
 * "groups" hold blips that only members see. Each group's blips are
 * encrypted with that group's key, so this file can sit in a public repo
 * without giving the locations away. Produce the encrypted string with
 * tools/admin.html — you cannot write it by hand.
 *
 * Fields per blip:
 *   name         required
 *   category     a key from config.js categories
 *   x, y         game coordinates
 *   z            optional, shown in the popup
 *   description  optional
 * ------------------------------------------------------------------ */

window.BLIPS = {
  public: [
    {
      "name": "Legion Square",
      "category": "general",
      "x": 195,
      "y": -934,
      "z": 30.7,
      "description": "Central meeting spot downtown."
    },
    {
      "name": "Los Santos Customs — La Mesa",
      "category": "garage",
      "x": 731,
      "y": -1088,
      "z": 22.2,
      "description": "Vehicle mods and repairs."
    },
    {
      "name": "Mission Row PD",
      "category": "general",
      "x": 441,
      "y": -982,
      "z": 30.7,
      "description": "Police headquarters."
    },
    {
      "name": "Pillbox Hill Medical",
      "category": "general",
      "x": 298,
      "y": -584,
      "z": 43.3,
      "description": "Main hospital."
    },
    {
      "name": "24/7 Supermarket — Strawberry",
      "category": "business",
      "x": 25,
      "y": -1347,
      "z": 29.5,
      "description": "General goods and snacks."
    },
    {
      "name": "Vespucci Beach",
      "category": "general",
      "x": -1223,
      "y": -1490,
      "z": 4.3,
      "description": "Boardwalk and pier."
    },
    {
      "name": "Sandy Shores Airfield",
      "category": "general",
      "x": 1747,
      "y": 3273,
      "z": 41.1,
      "description": "Desert airstrip."
    },
    {
      "name": "Paleto Bay Sheriff",
      "category": "general",
      "x": -448,
      "y": 6012,
      "z": 31.7,
      "description": "Northern law enforcement."
    },
    {
      "name": "Grapeseed Farm",
      "category": "job",
      "x": 2005,
      "y": 4985,
      "z": 41.4,
      "description": "Farming work available here."
    },
    {
      "name": "Del Perro Pier",
      "category": "business",
      "x": -1663,
      "y": -1082,
      "z": 13.1,
      "description": "Shops and amusements."
    },
    {
      "name": "Vinewood Hills Estate",
      "category": "housing",
      "x": -174,
      "y": 502,
      "z": 137.4,
      "description": "Upmarket residential area."
    },
    {
      "name": "Docks Warehouse",
      "category": "job",
      "x": 1208,
      "y": -3115,
      "z": 5.5,
      "description": "Freight and shipping work."
    }
  ],

  groups: {
    /* Encrypted with each group's key. Regenerate via tools/admin.html
     * whenever you add or change a group's blips. */
    police: {
      encrypted: "iMdaBWL6qJHKi5MrRHfNGvjBfPeO3A+Aa7XcWJHJo8Xs1JeJob0G5Czl6v7NbTqkyjpB8pw97Zlf7jQ85qF1DyJy+tKkn7h9sk1HTj0rb8gngg3wxVfbyJ5YCkyJrvyumlvbfqgW+a78fVrWnKSIHnqE5oQL8rZuBK4/qJ6F7Txuxb2DLomoIqC/ObNXT4SgyqYxpLTbb8D1pmdT/PuWWf9VEHeegmvnVzlOl/ZYxQHQyFDUNzf7KKYV/B5fO3P3Re79Nzb/kmMMVW8t28EKATYaWDHkebkprsOtcd/KN99y4kPtZb8aLhz5S3W5juCbhXEufEgL1voUmE7ssDlMRkCGPylDf7sW2r0Wuj8IOaW1ZIssQPf8ym+NytAqqGg1kVkZGC1tI5xnq8AtUu5z0W4DXiW/66USu1ugTwGw6SDtBMazFQ5bhe0xYJNbVxNB2i+5GFct+Pkoy5ZT7osOO6ZjVHg5MXTEs1qF7fSfbcI1jBkCLoFqtHNnWV94zzn4V9bZNI11t1Sfnjo="
    },

    crew: {
      encrypted: "wsbZTz9wXc5849EQcRRkyVLm5nBl/eqvbELVeXvygSaG3fEqqEbwdlNtwHPa7v0LpTAmpjb+H6iQQxyhiBht4qSahdyyLFA1JjkN2a5f/Gssv24t9Ew997Fn9KxLGHLphWRHapi/ogz5YkI0BgZNledwG5c+t4jO3I4TyS3b3FXH0oNWePUiZqVLvXvUMaZFsZciiAkPVki8fkyJW+lJs0valJRF9TVxOLZXnHUeGktG+szJlAgb2bQOMex44rXJhvvpeZnjxYvlGVfK65zlad1eJ+9JlBKSC3lqRVMza6g/jKWTFzB4p288apPiESP6cC4OL2r8XA57HjuVf+M3uclq5uy3/veV4d8mo2fLfDDO7fvsaedvQBK5KTwCrx2aVhkuwiEIvWkUoF8LeX5bmdWNllxuF/dT6qE6Cyj2biPQIInhOuxMTaKzkXXmqCw+uOA2ItsND+ex2g5woolyXEQX64xmi3o5a7rjvnf4Tsxff9mHDwB1xdXZhZPhR0bdUr39KdoX4+R/q2SfEYl/JVOnRjdukcTB1VBDd0MKWwMjYjQs6+dDYH0SFnz0PP9GFZ9O7AHbUqEKKapWgV6DabVDkQ581WGMQSilIfhUqywpDsQi8wyKYs4l5haxGgiRZQ=="
    }

    /* While setting things up you can use plain text instead, but note
     * that anyone reading this file can then see the blips:
     *
     * testing: {
     *   plaintextPublic: true,
     *   blips: [ { name: 'Test', category: 'general', x: 0, y: 0 } ]
     * }
     */
  }
};
