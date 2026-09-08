/* Immense Blip Map — read-only blip viewer with optional group logins. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Coordinate maths (GTA V game coords <-> map pixels)
   * ------------------------------------------------------------------ */

  var IMG_WIDTH = 4096;
  var IMG_HEIGHT = 6144;
  var SCALE_X = 0.454685;
  var SCALE_Y = -0.45483;
  var OFFSET_X = 1882.72;
  var OFFSET_Y = 3826.58;

  function gtaToLatLng(x, y) {
    return [IMG_HEIGHT - (y * SCALE_Y + OFFSET_Y), x * SCALE_X + OFFSET_X];
  }

  function latLngToGta(lat, lng) {
    return {
      x: (lng - OFFSET_X) / SCALE_X,
      y: (IMG_HEIGHT - lat - OFFSET_Y) / SCALE_Y
    };
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var CONFIG = window.CONFIG || {};
  var CATEGORIES = CONFIG.categories || {};
  var GROUPS = CONFIG.groups || { public: { label: 'Public', color: '#22c55e' } };
  var SESSION_KEY = 'blipmap:session';

  /* ------------------------------------------------------------------ *
   * State
   * ------------------------------------------------------------------ */

  var state = {
    user: null,
    blips: [],
    unlockedGroups: ['public'],
    hiddenCategories: {},
    hiddenGroups: {},
    search: '',
    selectedId: null
  };

  Object.keys(CATEGORIES).forEach(function (key) {
    if (CATEGORIES[key].hidden) state.hiddenCategories[key] = true;
  });

  var markers = {};

  /* ------------------------------------------------------------------ *
   * Blip loading
   * ------------------------------------------------------------------ */

  function normalise(blip, group, index) {
    return {
      id: group + '-' + index,
      name: blip.name || 'Unnamed',
      category: CATEGORIES[blip.category] ? blip.category : Object.keys(CATEGORIES)[0],
      description: blip.description || '',
      x: Number(blip.x) || 0,
      y: Number(blip.y) || 0,
      z: blip.z == null ? null : Number(blip.z),
      group: group
    };
  }

  function loadPublicBlips() {
    var source = (window.BLIPS && window.BLIPS.public) || [];
    state.blips = source.map(function (b, i) {
      return normalise(b, 'public', i);
    });
  }

  function addGroupBlips(group, list) {
    if (state.unlockedGroups.indexOf(group) === -1) state.unlockedGroups.push(group);
    state.blips = state.blips.filter(function (b) {
      return b.group !== group;
    });
    list.forEach(function (b, i) {
      state.blips.push(normalise(b, group, i));
    });
  }

  /* Groups stored as plain text in blips.js need no key — they're visible to
   * anyone reading the file, and are only useful while you're setting things
   * up. Encrypted groups are the ones that actually stay hidden. */
  function loadPlaintextGroups() {
    var groups = (window.BLIPS && window.BLIPS.groups) || {};
    Object.keys(groups).forEach(function (name) {
      if (groups[name] && Array.isArray(groups[name].blips) && groups[name].plaintextPublic) {
        addGroupBlips(name, groups[name].blips);
      }
    });
  }

  function unlockGroupsFor(session) {
    var groups = (window.BLIPS && window.BLIPS.groups) || {};
    var names = Object.keys(session.groups);

    return names.reduce(function (chain, name) {
      var entry = groups[name];
      if (!entry) return chain;

      if (Array.isArray(entry.blips)) {
        addGroupBlips(name, entry.blips);
        return chain;
      }
      if (!entry.encrypted) return chain;

      return chain
        .then(function () {
          return window.ZCrypto.decryptText(session.groups[name], entry.encrypted);
        })
        .then(function (json) {
          addGroupBlips(name, JSON.parse(json));
        })
        .catch(function (err) {
          console.warn('Could not decrypt group "' + name + '":', err);
        });
    }, Promise.resolve());
  }

  /* ------------------------------------------------------------------ *
   * Map
   * ------------------------------------------------------------------ */

  var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 4,
    zoomControl: false,
    attributionControl: false,
    zoomSnap: 0.1,
    zoomDelta: 0.15,
    wheelPxPerZoomLevel: 120,
    inertia: true,
    maxBoundsViscosity: 0.8
  });

  L.control.zoom({ position: 'topright' }).addTo(map);

  var imageBounds = [[0, 0], [IMG_HEIGHT, IMG_WIDTH]];
  L.imageOverlay('assets/gta_map.jpg', imageBounds).addTo(map);
  map.setMaxBounds(imageBounds);

  var view = CONFIG.defaultView || { x: 0, y: 0, zoom: -1 };
  map.setView(gtaToLatLng(view.x, view.y), view.zoom == null ? -1 : view.zoom);

  var blipLayer = L.layerGroup().addTo(map);

  function visibleBlips() {
    var term = state.search.trim().toLowerCase();
    return state.blips.filter(function (b) {
      if (state.hiddenCategories[b.category]) return false;
      if (state.hiddenGroups[b.group]) return false;
      if (state.unlockedGroups.indexOf(b.group) === -1) return false;
      if (!term) return true;
      return (
        b.name.toLowerCase().indexOf(term) !== -1 ||
        b.description.toLowerCase().indexOf(term) !== -1
      );
    });
  }

  function renderMarkers() {
    blipLayer.clearLayers();
    markers = {};

    visibleBlips().forEach(function (blip) {
      var cat = CATEGORIES[blip.category] || {};
      var color = cat.color || '#22c55e';
      var isSelected = state.selectedId === blip.id;

      var marker = L.marker(gtaToLatLng(blip.x, blip.y), {
        icon: L.divIcon({
          className: 'blip-marker' + (isSelected ? ' selected' : ''),
          html:
            '<div class="blip-pin" style="background:' +
            color +
            '">' +
            window.Icons.icon(cat.icon || 'map-pin', 14) +
            '</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(blipLayer);

      marker.bindPopup(popupHtml(blip), { className: 'blip-popup', closeButton: true, offset: [0, -8] });
      marker.on('click', function () {
        state.selectedId = blip.id;
        renderList();
      });

      markers[blip.id] = marker;
    });
  }

  function popupHtml(blip) {
    var cat = CATEGORIES[blip.category] || {};
    var grp = GROUPS[blip.group] || {};
    var coords = blip.x + ', ' + blip.y + (blip.z == null ? '' : ', ' + blip.z);
    return (
      '<div class="blip-popup-inner">' +
      '<div class="blip-popup-head"><span class="blip-dot" style="background:' +
      (cat.color || '#22c55e') +
      '"></span><strong>' +
      escapeHtml(blip.name) +
      '</strong></div>' +
      (blip.description ? '<p>' + escapeHtml(blip.description) + '</p>' : '') +
      '<div class="blip-popup-meta">' +
      '<span>' + escapeHtml(cat.label || blip.category) + '</span>' +
      (blip.group !== 'public'
        ? '<span class="blip-group-tag" style="color:' + (grp.color || '#888') + '">' +
          escapeHtml(grp.label || blip.group) +
          '</span>'
        : '') +
      '</div>' +
      '<button class="blip-copy-btn" data-coords="' + escapeHtml(coords) + '">' +
      window.Icons.icon('copy', 12) +
      '<span>' + escapeHtml(coords) + '</span></button>' +
      '</div>'
    );
  }

  /* ------------------------------------------------------------------ *
   * Sidebar
   * ------------------------------------------------------------------ */

  var filterEl = document.getElementById('filters');
  var listEl = document.getElementById('blip-list');
  var countEl = document.getElementById('blip-count');

  function renderFilters() {
    var html = '<div class="filter-section"><div class="filter-title">Categories</div><div class="filter-chips">';

    Object.keys(CATEGORIES).forEach(function (key) {
      var cat = CATEGORIES[key];
      var count = state.blips.filter(function (b) {
        return b.category === key && state.unlockedGroups.indexOf(b.group) !== -1;
      }).length;
      var off = state.hiddenCategories[key];
      html +=
        '<button class="filter-chip' + (off ? ' off' : '') + '" data-category="' + key + '" ' +
        'style="--chip-color:' + cat.color + '">' +
        '<span class="chip-dot" style="background:' + cat.color + '"></span>' +
        escapeHtml(cat.label) + '<span class="chip-count">' + count + '</span></button>';
    });

    html += '</div></div>';

    var extraGroups = state.unlockedGroups.filter(function (g) {
      return g !== 'public';
    });

    if (extraGroups.length) {
      html += '<div class="filter-section"><div class="filter-title">Groups</div><div class="filter-chips">';
      html += groupChip('public');
      extraGroups.forEach(function (g) {
        html += groupChip(g);
      });
      html += '</div></div>';
    }

    filterEl.innerHTML = html;

    filterEl.querySelectorAll('[data-category]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-category');
        if (state.hiddenCategories[key]) delete state.hiddenCategories[key];
        else state.hiddenCategories[key] = true;
        renderAll();
      });
    });

    filterEl.querySelectorAll('[data-group]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-group');
        if (state.hiddenGroups[key]) delete state.hiddenGroups[key];
        else state.hiddenGroups[key] = true;
        renderAll();
      });
    });
  }

  function groupChip(name) {
    var grp = GROUPS[name] || { label: name, color: '#888' };
    var count = state.blips.filter(function (b) {
      return b.group === name;
    }).length;
    var off = state.hiddenGroups[name];
    return (
      '<button class="filter-chip' + (off ? ' off' : '') + '" data-group="' + name + '">' +
      '<span class="chip-dot" style="background:' + grp.color + '"></span>' +
      escapeHtml(grp.label) + '<span class="chip-count">' + count + '</span></button>'
    );
  }

  function renderList() {
    var blips = visibleBlips().sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });

    countEl.textContent = blips.length + (blips.length === 1 ? ' location' : ' locations');

    if (!blips.length) {
      listEl.innerHTML =
        '<div class="list-empty">' +
        window.Icons.icon('map-pin', 28) +
        '<span>No locations match</span></div>';
      return;
    }

    var html = '';
    blips.forEach(function (blip) {
      var cat = CATEGORIES[blip.category] || {};
      var grp = GROUPS[blip.group] || {};
      html +=
        '<button class="blip-row' + (state.selectedId === blip.id ? ' active' : '') + '" data-id="' + blip.id + '">' +
        '<span class="blip-row-icon" style="background:' + (cat.color || '#22c55e') + '22;color:' + (cat.color || '#22c55e') + '">' +
        window.Icons.icon(cat.icon || 'map-pin', 14) +
        '</span>' +
        '<span class="blip-row-text">' +
        '<span class="blip-row-name">' + escapeHtml(blip.name) + '</span>' +
        '<span class="blip-row-sub">' + escapeHtml(cat.label || blip.category) +
        (blip.group !== 'public'
          ? ' &middot; <span style="color:' + (grp.color || '#888') + '">' + escapeHtml(grp.label || blip.group) + '</span>'
          : '') +
        '</span></span>' +
        '<span class="blip-row-coords">' + blip.x + ', ' + blip.y + '</span>' +
        '</button>';
    });

    listEl.innerHTML = html;

    listEl.querySelectorAll('[data-id]').forEach(function (row) {
      row.addEventListener('click', function () {
        var id = row.getAttribute('data-id');
        var blip = state.blips.filter(function (b) {
          return b.id === id;
        })[0];
        if (!blip) return;
        state.selectedId = id;
        map.setView(gtaToLatLng(blip.x, blip.y), Math.max(map.getZoom(), 1), { animate: true });
        if (markers[id]) markers[id].openPopup();
        renderList();
        renderMarkers();
      });
    });
  }

  function renderAccount() {
    var box = document.getElementById('account');
    if (!CONFIG.loginEnabled) {
      box.innerHTML = '';
      return;
    }

    if (state.user) {
      var groupNames = state.unlockedGroups
        .filter(function (g) {
          return g !== 'public';
        })
        .map(function (g) {
          return (GROUPS[g] || {}).label || g;
        });

      box.innerHTML =
        '<div class="account-info">' +
        '<span class="account-icon">' + window.Icons.icon('user', 14) + '</span>' +
        '<span class="account-text"><strong>' + escapeHtml(state.user.label) + '</strong>' +
        '<span>' + (groupNames.length ? escapeHtml(groupNames.join(', ')) : 'No extra groups') + '</span></span>' +
        '<button class="account-btn" id="btn-logout" title="Sign out">' +
        window.Icons.icon('log-out', 14) + '</button></div>';
      document.getElementById('btn-logout').addEventListener('click', logout);
    } else {
      box.innerHTML =
        '<button class="login-btn" id="btn-login">' +
        window.Icons.icon('log-in', 14) + '<span>Member sign in</span></button>';
      document.getElementById('btn-login').addEventListener('click', function () {
        openLogin();
      });
    }
  }

  function renderAll() {
    renderFilters();
    renderList();
    renderMarkers();
    renderAccount();
  }

  /* ------------------------------------------------------------------ *
   * Login
   * ------------------------------------------------------------------ */

  var loginModal = document.getElementById('modal-login');
  var loginError = document.getElementById('login-error');

  function openLogin() {
    loginModal.hidden = false;
    loginError.hidden = true;
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
    setTimeout(function () {
      document.getElementById('login-user').focus();
    }, 50);
  }

  function closeLogin() {
    loginModal.hidden = true;
  }

  function submitLogin() {
    var username = document.getElementById('login-user').value.trim();
    var password = document.getElementById('login-pass').value;
    var btn = document.getElementById('btn-do-login');

    if (!username || !password) {
      showLoginError('Enter a username and password.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Checking...';
    loginError.hidden = true;

    window.ZCrypto.authenticate(window.USERS || [], username, password)
      .then(function (session) {
        if (!session) {
          showLoginError('Incorrect username or password.');
          return null;
        }
        return unlockGroupsFor(session).then(function () {
          state.user = { username: session.username, label: session.label };
          if (CONFIG.rememberSession !== false) saveSession(session);
          closeLogin();
          renderAll();
          toast('Signed in as ' + session.label);
        });
      })
      .catch(function (err) {
        console.error(err);
        showLoginError('Something went wrong signing in.');
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = 'Sign in';
      });
  }

  function showLoginError(message) {
    loginError.textContent = message;
    loginError.hidden = false;
  }

  function logout() {
    state.user = null;
    state.unlockedGroups = ['public'];
    state.hiddenGroups = {};
    state.selectedId = null;
    loadPublicBlips();
    loadPlaintextGroups();
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (err) {
      /* ignore */
    }
    renderAll();
    toast('Signed out');
  }

  /* Session storage keeps the decrypted blips for the tab's lifetime so a
   * refresh doesn't force a re-login. Closing the tab clears it. */
  function saveSession(session) {
    try {
      var payload = {
        username: session.username,
        label: session.label,
        groups: {}
      };
      state.unlockedGroups.forEach(function (g) {
        if (g === 'public') return;
        payload.groups[g] = state.blips.filter(function (b) {
          return b.group === g;
        });
      });
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    } catch (err) {
      /* ignore */
    }
  }

  function restoreSession() {
    if (CONFIG.rememberSession === false) return false;
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      var payload = JSON.parse(raw);
      Object.keys(payload.groups || {}).forEach(function (g) {
        addGroupBlips(g, payload.groups[g]);
      });
      state.user = { username: payload.username, label: payload.label };
      return true;
    } catch (err) {
      return false;
    }
  }

  /* ------------------------------------------------------------------ *
   * Misc UI
   * ------------------------------------------------------------------ */

  function toast(message) {
    var root = document.getElementById('toasts');
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = window.Icons.icon('check', 14) + '<span>' + escapeHtml(message) + '</span>';
    root.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
    }, 2400);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 2800);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(function () {
        fallbackCopy(text);
      });
      return;
    }
    fallbackCopy(text);
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Copy failed:', err);
    }
    document.body.removeChild(ta);
  }

  /* ------------------------------------------------------------------ *
   * Wiring
   * ------------------------------------------------------------------ */

  document.getElementById('search').addEventListener('input', function (e) {
    state.search = e.target.value;
    renderList();
    renderMarkers();
  });

  document.getElementById('btn-do-login').addEventListener('click', submitLogin);
  document.getElementById('login-pass').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') submitLogin();
  });
  document.getElementById('login-user').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('login-pass').focus();
  });

  document.querySelectorAll('[data-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.getElementById(btn.getAttribute('data-close')).hidden = true;
    });
  });

  loginModal.addEventListener('mousedown', function (e) {
    if (e.target === loginModal) closeLogin();
  });

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLogin();
  });

  /* Copy button inside marker popups. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.blip-copy-btn');
    if (!btn) return;
    copyText(btn.getAttribute('data-coords'));
    toast('Coordinates copied');
  });

  var coordsEl = document.getElementById('coords');
  if (CONFIG.showCoords !== false) {
    map.on('mousemove', function (e) {
      var gta = latLngToGta(e.latlng.lat, e.latlng.lng);
      coordsEl.hidden = false;
      coordsEl.textContent = 'X: ' + round2(gta.x) + '   Y: ' + round2(gta.y);
    });
    map.on('mouseout', function () {
      coordsEl.hidden = true;
    });
  }

  if (CONFIG.copyCoordsOnRightClick) {
    map.on('contextmenu', function (e) {
      var gta = latLngToGta(e.latlng.lat, e.latlng.lng);
      copyText(round2(gta.x) + ', ' + round2(gta.y));
      toast('Copied ' + round2(gta.x) + ', ' + round2(gta.y));
    });
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */

  document.title = CONFIG.siteName || 'Blip Map';
  document.getElementById('site-name').textContent = CONFIG.siteName || 'Blip Map';
  var taglineEl = document.getElementById('tagline');
  if (CONFIG.tagline) taglineEl.textContent = CONFIG.tagline;
  else taglineEl.hidden = true;

  var footerEl = document.getElementById('footer-note');
  if (CONFIG.footerNote) footerEl.textContent = CONFIG.footerNote;
  else footerEl.hidden = true;

  var headerLink = document.getElementById('header-link');
  if (CONFIG.headerLink) headerLink.href = CONFIG.headerLink;
  else headerLink.hidden = true;

  window.Icons.hydrate(document);
  loadPublicBlips();
  loadPlaintextGroups();
  restoreSession();
  renderAll();
})();
