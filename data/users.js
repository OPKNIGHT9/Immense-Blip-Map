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
        "username": "service",
        "label": "Public Services",
        "salt": "4226e6dc4df76e9586f26342a120f85a",
        "verifier": "8f866819278164daed66629e522524aec401dcd8f3d492889ad696451f9a1c85",
        "keys": {
            "service": "TvtdF69pK1tdvWJnQ0XHldKBjPoJ7XmhH7fjAUnVQVS1HFJ2aU3C3+RAKqnuLdSM24KMUo6otOWuujwx"
        }
    }
];
