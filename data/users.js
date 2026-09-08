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
    "salt": "9b85a63b6c68089868eb87625ba782c4",
    "verifier": "e7dcb2da1471432e0cd9c27fd785f71e43e33ec98da433dd93d21fc9756e1e2f",
    "keys": {
      "police": "CzQUX5c2S+hyD+1UCCyMhZeeiSUR5xA9BzPNT3IaPvjH/A2qgvKiUGEjyLGk0jHPZyRohB/bXKixQdFc",
      "crew": "Wn/P3gucOmJkxApaYNLfPjc9XDJ7A8/FFWQJN7AOpDzZLFbEdpdOPTqZfWnT5ZNCqyEkkEpK/Fq+zeQS"
    }
  },
  {
    "username": "officer",
    "label": "Officer Reyes",
    "salt": "a31bc2cadd66ffe61097b076cffed67d",
    "verifier": "dce9044694270fda48016c5bc7ff12747188825b838684787e861e698d79ba8d",
    "keys": {
      "police": "BOIAUjQNQsaMIaRQo4hjMbHXNVRhiBGtCmvcDcB3sewAnFKMHMJsFQcvLakoP22QeGVXMb0eIR+1UDlu"
    }
  },
  {
    "username": "crew",
    "label": "Crew Member",
    "salt": "fa0c102928338b17a86151ab12da1b3a",
    "verifier": "379858810047dce736fe8300adb13f5b7fc9e2edf8dde52399e161456920baae",
    "keys": {
      "crew": "qt9aDhJDhK45/+y4WvhFw6OpDB36iyeHFjKvEDAQsuGLuA8TG3F6L3QV/U0meoec88O7tKfPa9falypI"
    }
  }
];
