/* Immense Blip Map — read-only blip viewer with group logins. */
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

  var CONFIG = window.CONFIG || {};
  var SECTIONS = CONFIG.sections || {};
  var GROUPS = CONFIG.groups || { public: { label: 'Public', color: '#22c55e' } };
  var DECIMALS = CONFIG.decimals == null ? 2 : CONFIG.decimals;
  var DEFAULT_COLOR = '#22c55e';
  var DEFAULT_ICON = 'map-pin';
  var SESSION_KEY = 'blipmap:session';

  /* Always prints a decimal point, so 25 becomes "25.00" not "25". */
  function f(n) {
    return Number(n || 0).toFixed(DECIMALS);
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------------------------------------------ *
   * State
   * ------------------------------------------------------------------ */

  var state = {
    user: null,
    blips: [],
    byId: {},
    unlockedGroups: ['public'],
    hiddenSections: {},
    hiddenSubsections: {},
    collapsed: {},
    hiddenGroups: {},
    search: '',
    selectedId: null,
    showConnections: CONFIG.connectionsOn !== false,
    formatChoice: {}
  };

  Object.keys(SECTIONS).forEach(function (key) {
    if (SECTIONS[key].hidden) state.hiddenSections[key] = true;
    if (SECTIONS[key].collapsed) state.collapsed[key] = true;
  });

  var markers = {};

  /* ------------------------------------------------------------------ *
   * Section helpers
   * ------------------------------------------------------------------ */

  function sectionOf(key) {
    return SECTIONS[key] || {};
  }

  function subsectionOf(sectionKey, subKey) {
    var sec = sectionOf(sectionKey);
    return (sec.subsections && sec.subsections[subKey]) || null;
  }

  /* Blip -> subsection -> section -> default */
  function resolveStyle(blip) {
    var sec = sectionOf(blip.section);
    var sub = subsectionOf(blip.section, blip.subsection);
    return {
      color: blip.color || (sub && sub.color) || sec.color || DEFAULT_COLOR,
      icon: blip.icon || (sub && sub.icon) || sec.icon || DEFAULT_ICON
    };
  }

  function sectionPath(blip) {
    var sec = sectionOf(blip.section);
    var sub = subsectionOf(blip.section, blip.subsection);
    var label = sec.label || blip.section || 'Uncategorised';
    return sub ? label + ' / ' + (sub.label || blip.subsection) : label;
  }

  /* ------------------------------------------------------------------ *
   * Blip loading
   * ------------------------------------------------------------------ */

  function normalise(blip, group, index) {
    var heading = blip.heading;
    if (heading === '' || heading === undefined) heading = null;
    if (heading !== null) {
      heading = Number(heading);
      if (isNaN(heading)) heading = null;
      else heading = ((heading % 360) + 360) % 360;
    }

    return {
      id: blip.id || group + '-' + index,
      name: blip.name || 'Unnamed',
      section: SECTIONS[blip.section] ? blip.section : Object.keys(SECTIONS)[0],
      subsection: blip.subsection || null,
      icon: blip.icon || null,
      color: blip.color || null,
      description: blip.description || '',
      x: Number(blip.x) || 0,
      y: Number(blip.y) || 0,
      z: blip.z == null ? null : Number(blip.z),
      heading: heading,
      connections: Array.isArray(blip.connections) ? blip.connections.slice() : [],
      group: group
    };
  }

  function reindex() {
    state.byId = {};
    state.blips.forEach(function (b) {
      state.byId[b.id] = b;
    });
  }

  function loadPublicBlips() {
    var source = (window.BLIPS && window.BLIPS.public) || [];
    state.blips = source.map(function (b, i) {
      return normalise(b, 'public', i);
    });
    reindex();
  }

  function addGroupBlips(group, list) {
    if (state.unlockedGroups.indexOf(group) === -1) state.unlockedGroups.push(group);
    state.blips = state.blips.filter(function (b) {
      return b.group !== group;
    });
    list.forEach(function (b, i) {
      state.blips.push(normalise(b, group, i));
    });
    reindex();
  }

  function loadPlaintextGroups() {
    var groups = (window.BLIPS && window.BLIPS.groups) || {};
    Object.keys(groups).forEach(function (name) {
      var entry = groups[name];
      if (entry && Array.isArray(entry.blips) && entry.plaintextPublic) {
        addGroupBlips(name, entry.blips);
      }
    });
  }

  function unlockGroupsFor(session) {
    var groups = (window.BLIPS && window.BLIPS.groups) || {};
    return Object.keys(session.groups).reduce(function (chain, name) {
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

  var connectionLayer = L.layerGroup().addTo(map);
  var blipLayer = L.layerGroup().addTo(map);
  var pingLayer = L.layerGroup().addTo(map);

  function isVisible(blip) {
    if (state.unlockedGroups.indexOf(blip.group) === -1) return false;
    if (state.hiddenGroups[blip.group]) return false;
    if (state.hiddenSections[blip.section]) return false;
    /* Blips with no subsection sit in the "section/" bucket, shown as "Other". */
    var subKey = blip.section + '/' + (blip.subsection || '');
    if (state.hiddenSubsections[subKey]) return false;
    var term = state.search.trim().toLowerCase();
    if (!term) return true;
    return (
      blip.name.toLowerCase().indexOf(term) !== -1 ||
      blip.description.toLowerCase().indexOf(term) !== -1
    );
  }

  function visibleBlips() {
    return state.blips.filter(isVisible);
  }

  /* ------------------------------------------------------------------ *
   * Markers
   * ------------------------------------------------------------------ */

  var ARROW_SVG =
    '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">' +
    '<path d="M12 2 18 14H6Z"/></svg>';

  function markerHtml(blip, style, isSelected) {
    var arrow = '';
    if (blip.heading !== null) {
      /* Game headings run counter-clockwise from north, screen rotation
       * runs clockwise, so the sign flips. */
      arrow =
        '<div class="blip-heading" style="transform: rotate(' + -blip.heading + 'deg); color:' + style.color + '">' +
        '<span class="blip-heading-arrow">' + ARROW_SVG + '</span></div>';
    }
    return (
      '<div class="blip-marker-inner' + (isSelected ? ' selected' : '') + '">' +
      arrow +
      '<div class="blip-pin" style="background:' + style.color + '">' +
      window.Icons.icon(style.icon, 14) +
      '</div></div>'
    );
  }

  function renderMarkers() {
    blipLayer.clearLayers();
    markers = {};

    visibleBlips().forEach(function (blip) {
      var style = resolveStyle(blip);
      var isSelected = state.selectedId === blip.id;

      var marker = L.marker(gtaToLatLng(blip.x, blip.y), {
        icon: L.divIcon({
          className: 'blip-marker',
          html: markerHtml(blip, style, isSelected),
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        })
      }).addTo(blipLayer);

      marker.bindPopup(popupHtml(blip), {
        className: 'blip-popup',
        closeButton: true,
        offset: [0, -14],
        minWidth: 232,
        autoPan: true
      });

      marker.on('click', function () {
        state.selectedId = blip.id;
        renderList();
      });

      markers[blip.id] = marker;
    });

    renderConnections();
  }

  function renderConnections() {
    connectionLayer.clearLayers();
    if (!state.showConnections) return;

    var drawn = {};

    visibleBlips().forEach(function (blip) {
      blip.connections.forEach(function (targetId) {
        var target = state.byId[targetId];
        if (!target || !isVisible(target)) return;

        var pairKey = [blip.id, targetId].sort().join('::');
        if (drawn[pairKey]) return;
        drawn[pairKey] = true;

        L.polyline([gtaToLatLng(blip.x, blip.y), gtaToLatLng(target.x, target.y)], {
          color: resolveStyle(blip).color,
          weight: 2,
          opacity: 0.55,
          dashArray: '6, 6',
          interactive: false
        }).addTo(connectionLayer);
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Popup with the coord-format menu
   * ------------------------------------------------------------------ */

  var FORMATS = ['coords', 'vec3', 'vec4', 'tp'];
  var FORMAT_LABELS = { coords: 'Coords', vec3: 'vec3', vec4: 'vec4', tp: 'TP' };

  function formatValue(blip, format) {
    var z = blip.z == null ? 0 : blip.z;
    switch (format) {
      case 'vec3':
        return 'vector3(' + f(blip.x) + ', ' + f(blip.y) + ', ' + f(z) + ')';
      case 'vec4':
        if (blip.heading === null) return '';
        return 'vector4(' + f(blip.x) + ', ' + f(blip.y) + ', ' + f(z) + ', ' + f(blip.heading) + ')';
      case 'tp':
        /* Heading is deliberately left off the teleport command. */
        return (CONFIG.tpCommand || '/tp') + ' ' + f(blip.x) + ' ' + f(blip.y) + ' ' + f(z);
      default:
        return f(blip.x) + ', ' + f(blip.y) + ', ' + f(z);
    }
  }

  function popupHtml(blip) {
    var style = resolveStyle(blip);
    var grp = GROUPS[blip.group] || {};
    var chosen = state.formatChoice[blip.id] || 'coords';
    if (chosen === 'vec4' && blip.heading === null) chosen = 'coords';

    var buttons = FORMATS.map(function (key) {
      var disabled = key === 'vec4' && blip.heading === null;
      return (
        '<button class="fmt-btn' + (key === chosen ? ' active' : '') + '"' +
        ' data-blip="' + escapeHtml(blip.id) + '" data-format="' + key + '"' +
        (disabled ? ' disabled title="This blip has no heading"' : '') +
        '>' + FORMAT_LABELS[key] + '</button>'
      );
    }).join('');

    return (
      '<div class="blip-popup-inner">' +
      '<div class="blip-popup-head">' +
      '<span class="blip-dot" style="background:' + style.color + '"></span>' +
      '<strong>' + escapeHtml(blip.name) + '</strong>' +
      '</div>' +
      (blip.description ? '<p>' + escapeHtml(blip.description) + '</p>' : '') +
      '<div class="blip-popup-meta">' +
      '<span>' + escapeHtml(sectionPath(blip)) + '</span>' +
      (blip.heading !== null ? '<span class="blip-heading-tag">' + f(blip.heading) + '&deg;</span>' : '') +
      (blip.group !== 'public'
        ? '<span class="blip-group-tag" style="color:' + (grp.color || '#888') + '">' +
          escapeHtml(grp.label || blip.group) + '</span>'
        : '') +
      '</div>' +
      '<div class="fmt-row">' + buttons + '</div>' +
      '<button class="fmt-value" data-copy="' + escapeHtml(formatValue(blip, chosen)) + '" title="Click to copy">' +
      '<span>' + escapeHtml(formatValue(blip, chosen)) + '</span>' +
      window.Icons.icon('copy', 12) +
      '</button>' +
      '</div>'
    );
  }

  /* Popups are rebuilt as HTML strings, so wire them by delegation. */
  document.addEventListener('click', function (e) {
    var fmtBtn = e.target.closest && e.target.closest('.fmt-btn');
    if (fmtBtn && !fmtBtn.disabled) {
      var id = fmtBtn.getAttribute('data-blip');
      state.formatChoice[id] = fmtBtn.getAttribute('data-format');
      var blip = state.byId[id];
      var marker = markers[id];
      if (blip && marker && marker.getPopup()) {
        marker.setPopupContent(popupHtml(blip));
      }
      return;
    }

    var copyBtn = e.target.closest && e.target.closest('.fmt-value');
    if (copyBtn) {
      var text = copyBtn.getAttribute('data-copy');
      if (!text) return;
      copyText(text);
      toast('Copied to clipboard');
    }
  });

  /* ------------------------------------------------------------------ *
   * Sidebar — section tree
   * ------------------------------------------------------------------ */

  var navEl = document.getElementById('nav-tree');
  var listEl = document.getElementById('blip-list');
  var countEl = document.getElementById('blip-count');

  function accessibleBlips() {
    return state.blips.filter(function (b) {
      return state.unlockedGroups.indexOf(b.group) !== -1;
    });
  }

  function countIn(sectionKey, subKey) {
    return accessibleBlips().filter(function (b) {
      if (b.section !== sectionKey) return false;
      if (subKey === undefined) return true;
      return b.subsection === subKey;
    }).length;
  }

  function renderNav() {
    var html = '';

    Object.keys(SECTIONS).forEach(function (key) {
      var sec = SECTIONS[key];
      var subKeys = sec.subsections ? Object.keys(sec.subsections) : [];
      var total = countIn(key);
      var off = !!state.hiddenSections[key];
      var isCollapsed = !!state.collapsed[key];
      var color = sec.color || DEFAULT_COLOR;

      html += '<div class="nav-section' + (off ? ' off' : '') + '">';
      html += '<div class="nav-row">';

      if (subKeys.length) {
        html +=
          '<button class="nav-caret' + (isCollapsed ? '' : ' open') + '" data-toggle-collapse="' + key + '"' +
          ' title="Expand or fold">' + window.Icons.icon('chevron-right', 13) + '</button>';
      } else {
        html += '<span class="nav-caret-spacer"></span>';
      }

      html +=
        '<button class="nav-label" data-toggle-section="' + key + '">' +
        '<span class="nav-icon" style="color:' + color + '">' +
        window.Icons.icon(sec.icon || DEFAULT_ICON, 14) + '</span>' +
        '<span class="nav-name">' + escapeHtml(sec.label || key) + '</span>' +
        '<span class="nav-count">' + total + '</span>' +
        '</button>';

      html += '</div>';

      if (subKeys.length && !isCollapsed) {
        html += '<div class="nav-children">';
        subKeys.forEach(function (subKey) {
          var sub = sec.subsections[subKey];
          var subOff = !!state.hiddenSubsections[key + '/' + subKey];
          html +=
            '<button class="nav-child' + (subOff ? ' off' : '') + '"' +
            ' data-toggle-sub="' + key + '/' + subKey + '">' +
            '<span class="nav-child-dot" style="background:' + (sub.color || color) + '"></span>' +
            '<span class="nav-name">' + escapeHtml(sub.label || subKey) + '</span>' +
            '<span class="nav-count">' + countIn(key, subKey) + '</span>' +
            '</button>';
        });

        var looseCount = countIn(key, null);
        if (looseCount) {
          html +=
            '<button class="nav-child' + (state.hiddenSubsections[key + '/'] ? ' off' : '') + '"' +
            ' data-toggle-sub="' + key + '/">' +
            '<span class="nav-child-dot" style="background:' + color + '"></span>' +
            '<span class="nav-name">Other</span>' +
            '<span class="nav-count">' + looseCount + '</span></button>';
        }
        html += '</div>';
      }

      html += '</div>';
    });

    var extraGroups = state.unlockedGroups.filter(function (g) {
      return g !== 'public';
    });

    if (extraGroups.length) {
      html += '<div class="nav-groups"><div class="nav-groups-title">Access groups</div><div class="filter-chips">';
      ['public'].concat(extraGroups).forEach(function (name) {
        var grp = GROUPS[name] || { label: name, color: '#888' };
        var count = accessibleBlips().filter(function (b) {
          return b.group === name;
        }).length;
        html +=
          '<button class="filter-chip' + (state.hiddenGroups[name] ? ' off' : '') + '" data-group="' + name + '">' +
          '<span class="chip-dot" style="background:' + grp.color + '"></span>' +
          escapeHtml(grp.label) + '<span class="chip-count">' + count + '</span></button>';
      });
      html += '</div></div>';
    }

    navEl.innerHTML = html;

    navEl.querySelectorAll('[data-toggle-collapse]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-toggle-collapse');
        if (state.collapsed[key]) delete state.collapsed[key];
        else state.collapsed[key] = true;
        renderNav();
      });
    });

    navEl.querySelectorAll('[data-toggle-section]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-toggle-section');
        if (state.hiddenSections[key]) delete state.hiddenSections[key];
        else state.hiddenSections[key] = true;
        renderAll();
      });
    });

    navEl.querySelectorAll('[data-toggle-sub]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-toggle-sub');
        if (state.hiddenSubsections[key]) delete state.hiddenSubsections[key];
        else state.hiddenSubsections[key] = true;
        renderAll();
      });
    });

    navEl.querySelectorAll('[data-group]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-group');
        if (state.hiddenGroups[key]) delete state.hiddenGroups[key];
        else state.hiddenGroups[key] = true;
        renderAll();
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Sidebar — list
   * ------------------------------------------------------------------ */

  function renderList() {
    var blips = visibleBlips().sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });

    countEl.textContent = blips.length + (blips.length === 1 ? ' location' : ' locations');

    if (!blips.length) {
      listEl.innerHTML =
        '<div class="list-empty">' + window.Icons.icon('map-pin', 28) + '<span>No locations match</span></div>';
      return;
    }

    var html = '';
    blips.forEach(function (blip) {
      var style = resolveStyle(blip);
      var grp = GROUPS[blip.group] || {};
      html +=
        '<button class="blip-row' + (state.selectedId === blip.id ? ' active' : '') + '" data-id="' + escapeHtml(blip.id) + '">' +
        '<span class="blip-row-icon" style="background:' + style.color + '22;color:' + style.color + '">' +
        window.Icons.icon(style.icon, 14) + '</span>' +
        '<span class="blip-row-text">' +
        '<span class="blip-row-name">' + escapeHtml(blip.name) +
        (blip.heading !== null ? '<span class="row-heading" title="Heading">&#9650;</span>' : '') +
        '</span>' +
        '<span class="blip-row-sub">' + escapeHtml(sectionPath(blip)) +
        (blip.group !== 'public'
          ? ' &middot; <span style="color:' + (grp.color || '#888') + '">' + escapeHtml(grp.label || blip.group) + '</span>'
          : '') +
        '</span></span>' +
        '<span class="blip-row-coords">' + round2(blip.x) + ', ' + round2(blip.y) + '</span>' +
        '</button>';
    });

    listEl.innerHTML = html;

    listEl.querySelectorAll('[data-id]').forEach(function (row) {
      row.addEventListener('click', function () {
        var blip = state.byId[row.getAttribute('data-id')];
        if (!blip) return;
        state.selectedId = blip.id;
        map.setView(gtaToLatLng(blip.x, blip.y), Math.max(map.getZoom(), 1), { animate: true });
        renderList();
        renderMarkers();
        if (markers[blip.id]) markers[blip.id].openPopup();
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Account
   * ------------------------------------------------------------------ */

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
        '<button class="account-btn" id="btn-logout" title="Sign out">' + window.Icons.icon('log-out', 14) + '</button></div>';
      document.getElementById('btn-logout').addEventListener('click', logout);
    } else {
      box.innerHTML =
        '<button class="login-btn" id="btn-login">' +
        window.Icons.icon('log-in', 14) + '<span>Member sign in</span></button>';
      document.getElementById('btn-login').addEventListener('click', openLogin);
    }
  }

  function renderAll() {
    renderNav();
    renderList();
    renderMarkers();
    renderAccount();
    document.getElementById('btn-connections').classList.toggle('active', state.showConnections);
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

  function saveSession(session) {
    try {
      var payload = { username: session.username, label: session.label, groups: {} };
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
   * Jump to coordinates
   * ------------------------------------------------------------------ */

  var jumpModal = document.getElementById('modal-jump');

  function openJump() {
    jumpModal.hidden = false;
    setTimeout(function () {
      document.getElementById('jump-x').focus();
      document.getElementById('jump-x').select();
    }, 50);
  }

  /* Accepts "123, -456", "vector3(1.0, 2.0, 3.0)" or two separate fields. */
  function parseCoordInput(a, b) {
    var combined = (a + ' ' + b).trim();
    var nums = combined.match(/-?\d+(?:\.\d+)?/g);
    if (!nums || nums.length < 2) return null;
    return { x: parseFloat(nums[0]), y: parseFloat(nums[1]) };
  }

  function submitJump() {
    var parsed = parseCoordInput(
      document.getElementById('jump-x').value,
      document.getElementById('jump-y').value
    );
    if (!parsed) {
      toast('Enter valid X and Y coordinates');
      return;
    }
    jumpModal.hidden = true;
    map.setView(gtaToLatLng(parsed.x, parsed.y), Math.max(map.getZoom(), 1), { animate: true });
    dropPing(parsed.x, parsed.y);
    toast('Jumped to ' + round2(parsed.x) + ', ' + round2(parsed.y));
  }

  function dropPing(x, y) {
    pingLayer.clearLayers();
    var ping = L.marker(gtaToLatLng(x, y), {
      interactive: false,
      icon: L.divIcon({ className: 'coord-ping', html: '<div></div>', iconSize: [28, 28], iconAnchor: [14, 14] })
    }).addTo(pingLayer);
    setTimeout(function () {
      pingLayer.removeLayer(ping);
    }, 4000);
  }

  /* ------------------------------------------------------------------ *
   * Misc
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

  document.getElementById('btn-connections').addEventListener('click', function () {
    state.showConnections = !state.showConnections;
    document.getElementById('btn-connections').classList.toggle('active', state.showConnections);
    renderConnections();
    toast(state.showConnections ? 'Connectors shown' : 'Connectors hidden');
  });

  document.getElementById('btn-jump').addEventListener('click', openJump);
  document.getElementById('btn-do-jump').addEventListener('click', submitJump);

  ['jump-x', 'jump-y'].forEach(function (id) {
    document.getElementById(id).addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submitJump();
    });
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

  [loginModal, jumpModal].forEach(function (overlay) {
    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) overlay.hidden = true;
    });
  });

  window.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
      e.preventDefault();
      openJump();
      return;
    }
    if (e.key === 'Escape') {
      loginModal.hidden = true;
      jumpModal.hidden = true;
    }
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
      copyText(f(gta.x) + ', ' + f(gta.y));
      toast('Copied ' + f(gta.x) + ', ' + f(gta.y));
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
