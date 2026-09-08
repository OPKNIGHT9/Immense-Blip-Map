/* ------------------------------------------------------------------ *
 * USERS — member accounts.
 *
 * No passwords are stored here. Each record holds a random salt, a
 * verifier derived from the password, and the group keys that password
 * unwraps. A wrong password fails the verifier check and unwraps nothing.
 *
 * Generate records with tools/admin.html — do not write them by hand.
 * To remove someone, delete their record. To lock them out of data they
 * already had, regenerate that group's key and re-encrypt its blips.
 *
 * DEMO ACCOUNTS — replace these before you go live:
 *   admin / changeme     police + crew
 *   officer / police123  police
 *   crew / crew123       crew
 * ------------------------------------------------------------------ */

window.USERS = [
  {
    "username": "admin",
    "label": "Admin",
    "salt": "dc6fe9de861778f295413befa9623685",
    "verifier": "dfe66f0ab245d41e44ad566af2cd29c20e153cd794ae9ee1613ae385ae5e1348",
    "keys": {
      "police": "yBdMyI44N0DQPRtTQwkfdXkurX6c50Grg2jfr4qhKg4PFi7TWfZZZ9EP83RHasqzfEtlyE+WJjcFP4eG",
      "crew": "ftZY5prkW4K8PHAHjMdn5NyWhj5RXZm8+W8LgqziAKa5f/SrDYma0Ogmmik4/JY5b16gW479doi7bW0j"
    }
  },
  {
    "username": "officer",
    "label": "Officer Reyes",
    "salt": "baf81d1d312a52d8826d9cdff318c2ff",
    "verifier": "52f09501f496e851353b770d29042871e0a9cb8ce60b688b82fd66965df23493",
    "keys": {
      "police": "K0FsTRsESOlIign2NhvQlkJ0veKFambgetif8MF5tQ7CxIaahv8Rb+WVKFlW1ViqwMBIJ8KnrAzIIqid"
    }
  },
  {
    "username": "crew",
    "label": "Crew Member",
    "salt": "7874409123d57ff1a9d62ddbc2a0100f",
    "verifier": "e9c73661c14b93c995a1f2615b67cdc0a42a06a4326737bbd9357a1c5e4dbd91",
    "keys": {
      "crew": "mCXazGykXdkbdD5DFq3/BDlLXdVNovpp+fdzeoNFpA6lVp6dt4biT+btdX0QscRTwwqV2dpbY7x/pjiP"
    }
  }
];
