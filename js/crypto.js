/* Crypto helpers shared by the site and the admin tool.
 *
 * Model
 * -----
 *  - Each user has a random salt. PBKDF2(password, salt) produces 64 bytes:
 *      bytes 0-31  -> the user's key-wrapping key
 *      bytes 32-63 -> a verifier stored in users.js, so a wrong password is
 *                     rejected without anything sensitive being stored.
 *  - Each group has a random 256-bit key. The group's blips are encrypted
 *    with it (AES-GCM), and that ciphertext is what lives in blips.js.
 *  - For every group a user belongs to, users.js stores the group key
 *    encrypted with that user's wrapping key. Logging in unwraps the keys
 *    the user is entitled to, and nothing else.
 *
 * Consequence worth knowing: revoking a user by deleting their record stops
 * future logins, but if they kept a copy of a group key they can still read
 * old ciphertext. To lock someone out for real, regenerate the group key and
 * re-encrypt that group's blips.
 */
(function (global) {
  'use strict';

  var ITERATIONS = 250000;
  var subtle = global.crypto && global.crypto.subtle;

  function bytesToHex(bytes) {
    return Array.prototype.map
      .call(new Uint8Array(bytes), function (b) {
        return ('0' + b.toString(16)).slice(-2);
      })
      .join('');
  }

  function hexToBytes(hex) {
    var out = new Uint8Array(hex.length / 2);
    for (var i = 0; i < out.length; i++) {
      out[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return out;
  }

  function bytesToBase64(bytes) {
    var binary = '';
    var view = new Uint8Array(bytes);
    for (var i = 0; i < view.length; i++) binary += String.fromCharCode(view[i]);
    return global.btoa(binary);
  }

  function base64ToBytes(b64) {
    var binary = global.atob(b64);
    var out = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  }

  function randomBytes(n) {
    var buf = new Uint8Array(n);
    global.crypto.getRandomValues(buf);
    return buf;
  }

  /* PBKDF2 -> { wrapKey: CryptoKey, verifier: hex string } */
  function deriveFromPassword(password, saltHex) {
    var salt = hexToBytes(saltHex);
    return subtle
      .importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
      .then(function (baseKey) {
        return subtle.deriveBits(
          { name: 'PBKDF2', salt: salt, iterations: ITERATIONS, hash: 'SHA-256' },
          baseKey,
          512
        );
      })
      .then(function (bits) {
        var all = new Uint8Array(bits);
        var wrapRaw = all.slice(0, 32);
        var verifier = bytesToHex(all.slice(32, 64));
        return subtle
          .importKey('raw', wrapRaw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
          .then(function (wrapKey) {
            return { wrapKey: wrapKey, verifier: verifier };
          });
      });
  }

  /* AES-GCM encrypt -> base64(iv || ciphertext) */
  function encrypt(key, plaintextBytes) {
    var iv = randomBytes(12);
    return subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, plaintextBytes).then(function (ct) {
      var out = new Uint8Array(iv.length + ct.byteLength);
      out.set(iv, 0);
      out.set(new Uint8Array(ct), iv.length);
      return bytesToBase64(out);
    });
  }

  function decrypt(key, payloadB64) {
    var raw = base64ToBytes(payloadB64);
    var iv = raw.slice(0, 12);
    var ct = raw.slice(12);
    return subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ct);
  }

  function encryptText(key, text) {
    return encrypt(key, new TextEncoder().encode(text));
  }

  function decryptText(key, payloadB64) {
    return decrypt(key, payloadB64).then(function (buf) {
      return new TextDecoder().decode(buf);
    });
  }

  function importGroupKey(rawBytes) {
    return subtle.importKey('raw', rawBytes, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt']);
  }

  function newGroupKey() {
    return randomBytes(32);
  }

  /* Verify a login and unwrap whatever group keys the account carries.
   * Resolves to { username, groups: { name: CryptoKey } } or null. */
  function authenticate(users, username, password) {
    var record = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].username.toLowerCase() === String(username).toLowerCase()) {
        record = users[i];
        break;
      }
    }
    if (!record) return Promise.resolve(null);

    return deriveFromPassword(password, record.salt).then(function (derived) {
      if (derived.verifier !== record.verifier) return null;

      var names = Object.keys(record.keys || {});
      var groups = {};

      return names
        .reduce(function (chain, name) {
          return chain
            .then(function () {
              return decrypt(derived.wrapKey, record.keys[name]);
            })
            .then(function (rawKey) {
              return importGroupKey(new Uint8Array(rawKey));
            })
            .then(function (key) {
              groups[name] = key;
            })
            .catch(function () {
              /* a group key that won't unwrap is skipped rather than fatal */
            });
        }, Promise.resolve())
        .then(function () {
          return { username: record.username, label: record.label || record.username, groups: groups };
        });
    });
  }

  global.ZCrypto = {
    ITERATIONS: ITERATIONS,
    bytesToHex: bytesToHex,
    hexToBytes: hexToBytes,
    bytesToBase64: bytesToBase64,
    base64ToBytes: base64ToBytes,
    randomBytes: randomBytes,
    deriveFromPassword: deriveFromPassword,
    encrypt: encrypt,
    decrypt: decrypt,
    encryptText: encryptText,
    decryptText: decryptText,
    importGroupKey: importGroupKey,
    newGroupKey: newGroupKey,
    authenticate: authenticate
  };
})(window);
