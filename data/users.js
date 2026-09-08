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
    "salt": "414d17fc7f48b8ae3d482d5aa0af440f",
    "verifier": "fbb41a3aee6f8cb38ce245bf4d51fd3597bae5f65012ccf21ace74634d766efd",
    "keys": {
      "police": "FzjTWVUDbyLBALpxRMtLpSOH/qV2jXzxyz421g80LL8wAjqVSnGtTgASpF1vNN3Io9C3/Mb4yz6/V2ev",
      "crew": "SR/PgUcm0c1msmdDjUp+62StyxBDEux+fJUPVmA++VxdEdDlvy5oADD3VnbdEThPvz6RP7Q92DW8/Vua"
    }
  },
  {
    "username": "officer",
    "label": "Officer Reyes",
    "salt": "4ee41ae49be061cc642a02a91a2cf460",
    "verifier": "99e62252bdcfccae37b38a6d91de42985630d3ba10683bd81779ad580b8827d8",
    "keys": {
      "police": "WxPPKSr0a/wYmcXJEwtfEDu/ID/NVIHkYFqQP8xDEXpTbABrXKYN8MQtLou1DIBP/ZPS3HXDYH4Z+loe"
    }
  },
  {
    "username": "crew",
    "label": "Crew Member",
    "salt": "06770b946caa4a3d3c9e52a2410f0cbb",
    "verifier": "3e8a3e3e088ebfbefcb04d0a9f19f71a7adf45a6e72cbed8621e44b72c049b9d",
    "keys": {
      "crew": "hk2iIDVbF6b0H3k1okStiQ5ptF61/KspGgv9dJQH5zZJSJYnLZPxwPTXogTTjNOwTZvIv2J6AQTv01wi"
    }
  }
];
