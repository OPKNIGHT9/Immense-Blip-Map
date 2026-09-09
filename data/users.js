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
    "salt": "d4393254beb5a1259276425d3f3ce0f7",
    "verifier": "c2fbb70ed5aa9daa6c2745aa94c5054de03460cd6b4c82391073856eb3b35db1",
    "keys": {
      "police": "6/8ganyG8SN5VdXf9E4GlXAkN8uJk3GbcO3f0Y6ATxh7czed33qpMKGsWAUJhIYiGA5j4pVmnG2WLNXS",
      "crew": "8r3UIQ3ObEi34G9AcNvrDpE8b3IQyLCU3rauChiHhXwYT69RPNkPO2GBMeewR6i37Kh+LFYEr8P2Uld2"
    }
  },
  {
    "username": "officer",
    "label": "Officer Reyes",
    "salt": "23ca287c3136690ae9810346ed48b963",
    "verifier": "8ac95cca220ba1ba7fa328822e606327bfd4722adb12dbaf112b52011ba24dca",
    "keys": {
      "police": "aBsxcsJ2m1seXxGnOdBCzgVNM02LQ2sPPOSr34nj1O1cfljcdzSHv3L9OavQJzfQzr79CvgeGRrI8CeU"
    }
  },
  {
    "username": "crew",
    "label": "Crew Member",
    "salt": "f00e17f37243cc54089a069f43a5a4e9",
    "verifier": "0425f3d02c4d08de0ffbf246f349a273ce22700860751a275b3e3be8916dc526",
    "keys": {
      "crew": "pvX/aa+PTj44hkcDHcw+vim2cVGMJE+UQr7UCv1JVMNM0ia5nb5SO+vbArP9A4/Db2giAvapalme16lO"
    }
  }
];
