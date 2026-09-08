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
    "salt": "78995c904115f05d650d46994d758379",
    "verifier": "10a80009c95e7bee2d9f245188124c7be5e5c4dddbfddb424f7ec5cfe9ad41fd",
    "keys": {
      "police": "5H1Z/yDzewlHtJOFsctB1vgi2ayJ2fqXUTeErviqIJn5mGbFg6IJhskWR9eqDUc+eLU/qJ5xY9N2jGHW",
      "crew": "3rKY1p9IcU8iwDdwCb+nRI/nvKCGrddgBz+NSabGdldwCeRDlYGqPB9s/SHGVKIHd9MhnsjdHluswwSe"
    }
  },
  {
    "username": "officer",
    "label": "Officer Reyes",
    "salt": "53264715f43489e45f69ca6e0bcdca17",
    "verifier": "15c3050ff24b46680d8206cbceb8d91eb1704e05448508da9e1044b58b9c1abd",
    "keys": {
      "police": "LwEhiq9hQB+U6KXSX28c8nUuRrJ0E61E+0EV4oDelS/o/7f5MxBTnXarxqPzgv/OkySe2GcyWt5TUF8o"
    }
  },
  {
    "username": "crew",
    "label": "Crew Member",
    "salt": "983368b33399bcf7352755d3f9d20a4e",
    "verifier": "09999fa8b5c83ec18935ca09806ecfb47a8da61b09295cd7618adfaee282c5a4",
    "keys": {
      "crew": "lijcZqnMYrFICCKpc9e05VOqWfcMfpGrGxZNqXrojdEGaDTqhJBm++OklKD3b0An14fLobSSpu/7HlTt"
    }
  }
];
