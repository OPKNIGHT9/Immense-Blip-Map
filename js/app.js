/* Zone Creator — vanilla JS. No build step, no framework. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Constants & coordinate maths
   * ------------------------------------------------------------------ */

  var IMG_WIDTH = 4096;
  var IMG_HEIGHT = 6144;
  var GRID_SIZE = 10;

  var SCALE_X = 0.454685;
  var SCALE_Y = -0.45483;
  var OFFSET_X = 1882.72;
  var OFFSET_Y = 3826.58;

  var GTA_BOUNDS = { minX: -4000, maxX: 4500, minY: -4000, maxY: 8000 };

  var ZONE_COLORS = [
    '#22c55e', '#3b82f6', '#f59e0b', '#ef4444',
    '#06b6d4', '#ec4899', '#8b5cf6', '#a855f7'
  ];

  var STORAGE_KEY = 'zonecreator:zones';
  var MAX_HISTORY = 60;

  function gtaToLatLng(x, y) {
    return [IMG_HEIGHT - (y * SCALE_Y + OFFSET_Y), x * SCALE_X + OFFSET_X];
  }

  function latLngToGta(lat, lng) {
    return {
      x: (lng - OFFSET_X) / SCALE_X,
      y: (IMG_HEIGHT - lat - OFFSET_Y) / SCALE_Y
    };
  }

  function snap(value) {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function distance(a, b) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  }

  function uid(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------------------------------------------ *
   * State
   * ------------------------------------------------------------------ */

  function loadZones() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  var state = {
    zones: loadZones(),
    activeZoneId: null,
    editingZoneId: null,
    creatingZone: false,
    expanded: {},
    selected: {},
    snapToGrid: false,
    showDistances: false,
    preview: null,
    previewMinimized: false,
    history: [],
    historyIndex: -1
  };

  state.history = [{ zones: clone(state.zones), activeZoneId: null }];
  state.historyIndex = 0;

  function activeZone() {
    return findZone(state.activeZoneId);
  }

  function findZone(id) {
    for (var i = 0; i < state.zones.length; i++) {
      if (state.zones[i].id === id) return state.zones[i];
    }
    return null;
  }

  function selectedCount() {
    return Object.keys(state.selected).length;
  }

  /* ------------------------------------------------------------------ *
   * History + persistence
   * ------------------------------------------------------------------ */

  var saveTimer = null;

  function persist() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.zones));
        flashSaved();
      } catch (err) {
        console.error('Failed to save zones:', err);
      }
    }, 400);
  }

  function pushHistory() {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push({ zones: clone(state.zones), activeZoneId: state.activeZoneId });
    if (state.history.length > MAX_HISTORY) state.history.shift();
    state.historyIndex = state.history.length - 1;
    persist();
  }

  function undo() {
    if (state.historyIndex <= 0) return;
    state.historyIndex--;
    var snapshot = state.history[state.historyIndex];
    state.zones = clone(snapshot.zones);
    state.activeZoneId = snapshot.activeZoneId;
    state.selected = {};
    persist();
    render();
  }

  function redo() {
    if (state.historyIndex >= state.history.length - 1) return;
    state.historyIndex++;
    var snapshot = state.history[state.historyIndex];
    state.zones = clone(snapshot.zones);
    state.activeZoneId = snapshot.activeZoneId;
    state.selected = {};
    persist();
    render();
  }

  /* ------------------------------------------------------------------ *
   * Notifications
   * ------------------------------------------------------------------ */

  var notifyRoot = document.getElementById('notifications');

  function notify(message, type) {
    type = type || 'success';
    var el = document.createElement('div');
    el.className = 'notification notification-' + type;
    el.innerHTML =
      '<div class="notification-icon">' +
      window.Icons.icon(type === 'success' ? 'check' : type === 'error' ? 'alert' : 'info', 16) +
      '</div><span class="notification-message">' +
      escapeHtml(message) +
      '</span>';
    notifyRoot.appendChild(el);
    setTimeout(function () {
      el.classList.add('notification-exit');
    }, 2700);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3000);
  }

  var saveIndicator = document.getElementById('save-indicator');
  var saveHideTimer = null;

  function flashSaved() {
    saveIndicator.hidden = false;
    saveIndicator.classList.remove('visible');
    void saveIndicator.offsetWidth;
    saveIndicator.classList.add('visible');
    if (saveHideTimer) clearTimeout(saveHideTimer);
    saveHideTimer = setTimeout(function () {
      saveIndicator.hidden = true;
    }, 2400);
  }

  /* ------------------------------------------------------------------ *
   * Map setup
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
    maxBoundsViscosity: 0.8,
    preferCanvas: true
  });

  L.control.zoom({ position: 'topright' }).addTo(map);

  var imageBounds = [[0, 0], [IMG_HEIGHT, IMG_WIDTH]];
  L.imageOverlay('assets/gta_map.jpg', imageBounds).addTo(map);
  map.fitBounds(imageBounds);
  map.setZoom(-1);
  map.setMaxBounds(imageBounds);

  var drawLayer = L.layerGroup().addTo(map);
  var gridLayer = L.layerGroup().addTo(map);
  var previewLayer = L.layerGroup().addTo(map);
  var rubberBand = null;

  /* ------------------------------------------------------------------ *
   * Zone helpers
   * ------------------------------------------------------------------ */

  function createZone(name, points) {
    return {
      id: uid('zone'),
      name: name || 'Zone ' + (state.zones.length + 1),
      points: points || [],
      color: ZONE_COLORS[state.zones.length % ZONE_COLORS.length],
      visible: true,
      thickness: 150,
      groundZ: 0
    };
  }

  function makePoint(x, y) {
    return { id: uid('pt'), x: round2(x), y: round2(y) };
  }

  function addPointToActive(x, y) {
    var zone = activeZone();
    if (!zone) {
      notify('Create or select a zone first', 'info');
      return;
    }
    if (state.snapToGrid) {
      x = snap(x);
      y = snap(y);
    }
    zone.points.push(makePoint(x, y));
    pushHistory();
    render();
  }

  function deletePoint(zoneId, pointId) {
    var zone = findZone(zoneId);
    if (!zone) return;
    zone.points = zone.points.filter(function (p) {
      return p.id !== pointId;
    });
    delete state.selected[pointId];
    pushHistory();
    render();
  }

  /* Insert a point on the polygon edge closest to the click. */
  function insertPointOnEdge(zone, x, y) {
    if (zone.points.length < 2) return;
    var best = { index: 0, dist: Infinity };
    for (var i = 0; i < zone.points.length; i++) {
      var a = zone.points[i];
      var b = zone.points[(i + 1) % zone.points.length];
      var d = pointToSegment({ x: x, y: y }, a, b);
      if (d < best.dist) best = { index: i, dist: d };
    }
    if (state.snapToGrid) {
      x = snap(x);
      y = snap(y);
    }
    zone.points.splice(best.index + 1, 0, makePoint(x, y));
    pushHistory();
    render();
    notify('Point inserted on edge', 'info');
  }

  function pointToSegment(p, a, b) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return distance(p, a);
    var t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
    return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
  }

  /* ------------------------------------------------------------------ *
   * Map rendering
   * ------------------------------------------------------------------ */

  function renderMap() {
    drawLayer.clearLayers();

    state.zones.forEach(function (zone) {
      if (!zone.visible) return;
      var isActive = zone.id === state.activeZoneId;
      var latlngs = zone.points.map(function (p) {
        return gtaToLatLng(p.x, p.y);
      });

      var shape = null;

      if (zone.points.length >= 3) {
        var polygon = L.polygon(latlngs, {
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: isActive ? 0.35 : 0.2,
          weight: isActive ? 3 : 2,
          dashArray: isActive ? null : '5, 5'
        }).addTo(drawLayer);
        shape = polygon;

        polygon.on('click', function (e) {
          if (!isActive) {
            setActiveZone(zone.id);
            L.DomEvent.stopPropagation(e);
            return;
          }
          L.DomEvent.stopPropagation(e);
          var gta = latLngToGta(e.latlng.lat, e.latlng.lng);
          insertPointOnEdge(zone, gta.x, gta.y);
        });
      } else if (zone.points.length === 2) {
        shape = L.polyline(latlngs, { color: zone.color, weight: 2, dashArray: '5, 5' }).addTo(drawLayer);
      }

      zone.points.forEach(function (point, index) {
        var size = isActive ? 28 : 22;
        var isSelected = !!state.selected[point.id];
        var marker = L.marker(gtaToLatLng(point.x, point.y), {
          draggable: isActive,
          bubblingMouseEvents: false,
          icon: L.divIcon({
            className: 'zone-point-marker' + (isActive ? ' active' : '') + (isSelected ? ' selected' : ''),
            html:
              '<div class="zone-point-inner" style="background:' +
              zone.color +
              ';border-color:' +
              (isActive ? '#ffffff' : zone.color) +
              '">' +
              (index + 1) +
              '</div>',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          })
        }).addTo(drawLayer);

        marker.bindTooltip(
          '<div class="point-tooltip-content">' +
            '<div class="point-tooltip-header">Point ' + (index + 1) + '</div>' +
            '<div class="point-tooltip-coords">X: ' + point.x + '</div>' +
            '<div class="point-tooltip-coords">Y: ' + point.y + '</div>' +
            (isActive ? '<div class="point-tooltip-hint">Drag to move &bull; Right-click to delete</div>' : '') +
            '</div>',
          { direction: 'top', offset: [0, -12], className: 'zone-point-tooltip-enhanced' }
        );

        marker.on('drag', function (e) {
          var gta = latLngToGta(e.latlng.lat, e.latlng.lng);
          point.x = round2(state.snapToGrid ? snap(gta.x) : gta.x);
          point.y = round2(state.snapToGrid ? snap(gta.y) : gta.y);
          if (shape) {
            shape.setLatLngs(
              zone.points.map(function (p) {
                return gtaToLatLng(p.x, p.y);
              })
            );
          }
        });

        marker.on('dragend', function () {
          if (state.snapToGrid) marker.setLatLng(gtaToLatLng(point.x, point.y));
          pushHistory();
          render();
        });

        marker.on('contextmenu', function (e) {
          L.DomEvent.stopPropagation(e);
          deletePoint(zone.id, point.id);
        });

        marker.on('click', function (e) {
          L.DomEvent.stopPropagation(e);
          if (e.originalEvent && (e.originalEvent.ctrlKey || e.originalEvent.metaKey)) {
            if (state.selected[point.id]) delete state.selected[point.id];
            else state.selected[point.id] = true;
            render();
          }
        });
      });

      if (state.showDistances && zone.points.length >= 2) {
        var count = zone.points.length >= 3 ? zone.points.length : zone.points.length - 1;
        for (var i = 0; i < count; i++) {
          var p1 = zone.points[i];
          var p2 = zone.points[(i + 1) % zone.points.length];
          var mid = gtaToLatLng((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
          L.marker(mid, {
            interactive: false,
            icon: L.divIcon({
              className: 'distance-label',
              html: '<span>' + distance(p1, p2).toFixed(1) + 'm</span>',
              iconSize: [50, 20],
              iconAnchor: [25, 10]
            })
          }).addTo(drawLayer);
        }
      }
    });
  }

  function renderGrid() {
    gridLayer.clearLayers();
    if (!state.snapToGrid) return;
    var spacing = GRID_SIZE * 5;
    var i;
    for (i = Math.floor(GTA_BOUNDS.minX / spacing) * spacing; i <= GTA_BOUNDS.maxX; i += spacing) {
      L.polyline([gtaToLatLng(i, GTA_BOUNDS.minY), gtaToLatLng(i, GTA_BOUNDS.maxY)], {
        color: '#ffffff',
        weight: 0.5,
        opacity: 0.12,
        interactive: false
      }).addTo(gridLayer);
    }
    for (i = Math.floor(GTA_BOUNDS.minY / spacing) * spacing; i <= GTA_BOUNDS.maxY; i += spacing) {
      L.polyline([gtaToLatLng(GTA_BOUNDS.minX, i), gtaToLatLng(GTA_BOUNDS.maxX, i)], {
        color: '#ffffff',
        weight: 0.5,
        opacity: 0.12,
        interactive: false
      }).addTo(gridLayer);
    }
  }

  /* ------------------------------------------------------------------ *
   * Panel rendering
   * ------------------------------------------------------------------ */

  var zoneListEl = document.getElementById('zone-list');
  var createSectionEl = document.getElementById('create-section');

  function renderCreateSection() {
    if (state.creatingZone) {
      createSectionEl.innerHTML =
        '<div class="zone-create-form">' +
        '<input type="text" class="zone-name-input" id="new-zone-name" placeholder="Zone name..." />' +
        '<div class="zone-create-actions">' +
        '<button class="zone-btn zone-btn-confirm" id="confirm-create">' + window.Icons.icon('check', 14) + '</button>' +
        '<button class="zone-btn zone-btn-cancel" id="cancel-create">' + window.Icons.icon('x', 14) + '</button>' +
        '</div></div>';
      var input = document.getElementById('new-zone-name');
      input.focus();
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') commitCreateZone();
        if (e.key === 'Escape') {
          state.creatingZone = false;
          renderCreateSection();
        }
      });
      document.getElementById('confirm-create').addEventListener('click', commitCreateZone);
      document.getElementById('cancel-create').addEventListener('click', function () {
        state.creatingZone = false;
        renderCreateSection();
      });
    } else {
      createSectionEl.innerHTML =
        '<button class="zone-create-btn" id="start-create">' +
        window.Icons.icon('plus', 16) +
        '<span>Create New Zone</span></button>';
      document.getElementById('start-create').addEventListener('click', function () {
        state.creatingZone = true;
        renderCreateSection();
      });
    }
  }

  function commitCreateZone() {
    var input = document.getElementById('new-zone-name');
    var name = input ? input.value.trim() : '';
    var zone = createZone(name || null, []);
    state.zones.push(zone);
    state.activeZoneId = zone.id;
    state.expanded[zone.id] = true;
    state.creatingZone = false;
    pushHistory();
    render();
    notify('Created ' + zone.name);
  }

  function renderZoneList() {
    if (state.zones.length === 0) {
      zoneListEl.innerHTML =
        '<div class="zone-empty">' +
        window.Icons.icon('map-pin', 32) +
        '<span>No zones created</span><p>Click "Create New Zone" to start</p></div>';
      return;
    }

    var html = '';
    state.zones.forEach(function (zone) {
      var isActive = zone.id === state.activeZoneId;
      var isExpanded = !!state.expanded[zone.id];
      var isEditing = state.editingZoneId === zone.id;

      html += '<div class="zone-item ' + (isActive ? 'active' : '') + '" data-zone="' + zone.id + '">';
      html += '<div class="zone-item-header" data-action="toggle-active">';
      html += '<div class="zone-item-left">';
      html +=
        '<button class="zone-expand-btn" data-action="toggle-expand">' +
        window.Icons.icon(isExpanded ? 'chevron-down' : 'chevron-right', 14) +
        '</button>';
      html += '<div class="zone-color-dot" style="background:' + zone.color + '"></div>';
      html += isEditing
        ? '<input type="text" class="zone-edit-input" data-role="rename" value="' + escapeHtml(zone.name) + '" />'
        : '<span class="zone-item-name">' + escapeHtml(zone.name) + '</span>';
      html += '<span class="zone-point-count">' + zone.points.length + ' pts</span>';
      html += '</div>';
      html += '<div class="zone-item-actions">';
      html +=
        '<button class="zone-action-btn" data-action="visibility" title="' +
        (zone.visible ? 'Hide' : 'Show') +
        '">' +
        window.Icons.icon(zone.visible ? 'eye' : 'eye-off', 14) +
        '</button>';
      html +=
        '<button class="zone-action-btn" data-action="rename" title="Rename">' +
        window.Icons.icon('edit', 14) +
        '</button>';
      html +=
        '<button class="zone-action-btn zone-action-delete" data-action="delete" title="Delete">' +
        window.Icons.icon('trash', 14) +
        '</button>';
      html += '</div></div>';

      if (isExpanded) {
        html += '<div class="zone-item-content">';
        html += '<div class="zone-height-controls">';
        html += numberField('Ground Z', zone.groundZ, 'groundZ', 0.5);
        html += numberField('Thickness', zone.thickness, 'thickness', 0.5);
        html += '</div>';

        html += '<div class="zone-export-grid">';
        html += exportBtn('polyzone', 'PolyZone', zone.points.length < 3);
        html += exportBtn('oxlib', 'ox_lib', zone.points.length < 3);
        html += exportBtn('vec2', 'vec2', zone.points.length === 0);
        html += exportBtn('vec3', 'vec3', zone.points.length === 0);
        html += '</div>';

        if (zone.points.length) {
          html += '<div class="zone-points-label">Points</div><div class="zone-points-list">';
          zone.points.forEach(function (p, i) {
            html +=
              '<div class="zone-point-item" data-point="' + p.id + '">' +
              '<span class="zone-point-index">' + (i + 1) + '</span>' +
              '<span class="zone-point-coords">' + p.x + ', ' + p.y + '</span>' +
              '<button class="zone-point-delete-btn" data-action="delete-point">' +
              window.Icons.icon('x', 12) +
              '</button></div>';
          });
          html += '</div>';
        }
        html += '</div>';
      }
      html += '</div>';
    });

    zoneListEl.innerHTML = html;
    wireZoneList();
  }

  function numberField(label, value, field, step) {
    return (
      '<div class="number-input-container">' +
      '<label class="number-input-label">' + label + '</label>' +
      '<div class="number-input-wrapper">' +
      '<input type="text" class="number-input-field" data-field="' + field + '" data-step="' + step + '" value="' + value + '" />' +
      '<div class="number-input-buttons">' +
      '<button type="button" class="number-input-btn increment" data-action="step-up" tabindex="-1">' +
      window.Icons.icon('chevron-up', 12) +
      '</button>' +
      '<button type="button" class="number-input-btn decrement" data-action="step-down" tabindex="-1">' +
      window.Icons.icon('chevron-down', 12) +
      '</button>' +
      '</div></div></div>'
    );
  }

  function exportBtn(format, label, disabled) {
    return (
      '<button class="zone-export-btn" data-action="export" data-format="' + format + '"' +
      (disabled ? ' disabled' : '') + ' title="Copy ' + label + ' code">' +
      window.Icons.icon('copy', 12) +
      '<span>' + label + '</span></button>'
    );
  }

  function wireZoneList() {
    zoneListEl.querySelectorAll('.zone-item').forEach(function (item) {
      var zoneId = item.getAttribute('data-zone');

      item.querySelector('.zone-item-header').addEventListener('click', function (e) {
        var action = e.target.closest('[data-action]');
        var name = action ? action.getAttribute('data-action') : null;
        if (name === 'toggle-expand') {
          state.expanded[zoneId] = !state.expanded[zoneId];
          renderZoneList();
          return;
        }
        if (name === 'visibility') {
          var z = findZone(zoneId);
          z.visible = !z.visible;
          renderZoneList();
          renderMap();
          return;
        }
        if (name === 'rename') {
          state.editingZoneId = zoneId;
          renderZoneList();
          var input = item.querySelector('[data-role="rename"]');
          if (input) {
            input.focus();
            input.select();
          }
          return;
        }
        if (name === 'delete') {
          var zone = findZone(zoneId);
          state.zones = state.zones.filter(function (z) {
            return z.id !== zoneId;
          });
          if (state.activeZoneId === zoneId) state.activeZoneId = null;
          pushHistory();
          render();
          notify('Deleted zone "' + zone.name + '"', 'info');
          return;
        }
        setActiveZone(state.activeZoneId === zoneId ? null : zoneId);
        state.expanded[zoneId] = true;
        render();
      });

      var renameInput = item.querySelector('[data-role="rename"]');
      if (renameInput) {
        var commit = function () {
          var zone = findZone(zoneId);
          var value = renameInput.value.trim();
          if (zone && value) zone.name = value;
          state.editingZoneId = null;
          pushHistory();
          renderZoneList();
        };
        renameInput.addEventListener('blur', commit);
        renameInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            state.editingZoneId = null;
            renderZoneList();
          }
        });
      }

      item.querySelectorAll('[data-field]').forEach(function (input) {
        var field = input.getAttribute('data-field');
        var step = parseFloat(input.getAttribute('data-step')) || 1;

        var apply = function (value) {
          var zone = findZone(zoneId);
          if (!zone || isNaN(value)) return;
          if (field === 'thickness') value = Math.max(0.5, value);
          zone[field] = round2(value);
          input.value = zone[field];
        };

        input.addEventListener('change', function () {
          apply(parseFloat(input.value));
          pushHistory();
        });
        input.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            apply(parseFloat(input.value) + step);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            apply(parseFloat(input.value) - step);
          }
        });

        var wrapper = input.parentNode;
        wrapper.querySelector('[data-action="step-up"]').addEventListener('click', function () {
          apply(parseFloat(input.value) + step);
          pushHistory();
        });
        wrapper.querySelector('[data-action="step-down"]').addEventListener('click', function () {
          apply(parseFloat(input.value) - step);
          pushHistory();
        });
      });

      item.querySelectorAll('[data-action="export"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          copyExport(findZone(zoneId), btn.getAttribute('data-format'));
        });
      });

      item.querySelectorAll('[data-action="delete-point"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          deletePoint(zoneId, btn.closest('[data-point]').getAttribute('data-point'));
        });
      });
    });
  }

  function setActiveZone(id) {
    state.activeZoneId = id;
    state.selected = {};
  }

  /* ------------------------------------------------------------------ *
   * Indicators
   * ------------------------------------------------------------------ */

  var activeIndicator = document.getElementById('active-indicator');
  var noActive = document.getElementById('no-active');
  var selectionActions = document.getElementById('selection-actions');

  function renderIndicators() {
    var zone = activeZone();
    activeIndicator.hidden = !zone;
    noActive.hidden = !!zone;
    if (zone) {
      document.getElementById('active-color').style.background = zone.color;
      document.getElementById('active-name').textContent = 'Editing: ' + zone.name;
    }

    var count = selectedCount();
    selectionActions.hidden = count === 0;
    document.getElementById('selection-count').textContent = 'Delete ' + count + ' selected';

    document.getElementById('btn-snap').classList.toggle('active', state.snapToGrid);
    document.getElementById('btn-distances').classList.toggle('active', state.showDistances);
    document.getElementById('snap-indicator').hidden = !state.snapToGrid;
    document.getElementById('btn-undo').disabled = state.historyIndex <= 0;
    document.getElementById('btn-redo').disabled = state.historyIndex >= state.history.length - 1;
    document.getElementById('btn-clear').disabled = state.zones.length === 0;
  }

  function render() {
    renderCreateSection();
    renderZoneList();
    renderIndicators();
    renderMap();
    renderGrid();
  }

  /* ------------------------------------------------------------------ *
   * Export / import
   * ------------------------------------------------------------------ */

  function polyzoneCode(zone) {
    var pts = zone.points
      .map(function (p) {
        return '    vector2(' + p.x + ', ' + p.y + ')';
      })
      .join(',\n');
    var base = zone.groundZ || 0;
    return (
      'local ' + zone.name.replace(/\s+/g, '_') + ' = PolyZone:Create({\n' + pts + '\n}, {\n' +
      '    name = "' + zone.name + '",\n' +
      '    minZ = ' + base + ',\n' +
      '    maxZ = ' + round2(base + zone.thickness) + '\n})'
    );
  }

  function oxlibCode(zone) {
    var base = zone.groundZ || 0;
    var pts = zone.points
      .map(function (p) {
        return '        vec3(' + p.x + ', ' + p.y + ', ' + base + ')';
      })
      .join(',\n');
    return (
      "lib.zones.poly({\n    name = '" + zone.name.replace(/\s+/g, '_') + "',\n" +
      '    points = {\n' + pts + '\n    },\n' +
      '    thickness = ' + zone.thickness + ',\n    debug = true\n})'
    );
  }

  function vec2Code(zone) {
    return zone.points
      .map(function (p) {
        return 'vector2(' + p.x + ', ' + p.y + ')';
      })
      .join(',\n');
  }

  function vec3Code(zone) {
    var base = zone.groundZ || 0;
    return zone.points
      .map(function (p) {
        return 'vector3(' + p.x + ', ' + p.y + ', ' + base + ')';
      })
      .join(',\n');
  }

  function copyExport(zone, format) {
    if (!zone) return;
    var map = {
      polyzone: [polyzoneCode, 'PolyZone'],
      oxlib: [oxlibCode, 'ox_lib'],
      vec2: [vec2Code, 'vector2'],
      vec3: [vec3Code, 'vector3']
    };
    var entry = map[format];
    if (!entry) return;
    copyText(entry[0](zone));
    notify('Copied "' + zone.name + '" ' + entry[1] + ' data to clipboard');
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

  function importZone(code) {
    var points = [];
    var re = /vec(?:tor)?([23])\s*\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)(?:\s*,\s*(-?[\d.]+))?\s*\)/gi;
    var match;
    var groundZ = null;

    while ((match = re.exec(code)) !== null) {
      points.push(makePoint(parseFloat(match[2]), parseFloat(match[3])));
      if (match[4] !== undefined && groundZ === null) groundZ = parseFloat(match[4]);
    }

    if (points.length < 3) {
      notify('Could not find at least 3 points in that code', 'error');
      return;
    }

    var nameMatch = code.match(/name\s*=\s*['"]([^'"]+)['"]/);
    var thicknessMatch = code.match(/thickness\s*=\s*(-?[\d.]+)/);
    var minZMatch = code.match(/minZ\s*=\s*(-?[\d.]+)/);
    var maxZMatch = code.match(/maxZ\s*=\s*(-?[\d.]+)/);

    var zone = createZone(nameMatch ? nameMatch[1] : 'Imported Zone', points);
    if (thicknessMatch) zone.thickness = parseFloat(thicknessMatch[1]);
    if (minZMatch) {
      zone.groundZ = parseFloat(minZMatch[1]);
      if (maxZMatch) zone.thickness = round2(parseFloat(maxZMatch[1]) - zone.groundZ);
    } else if (groundZ !== null) {
      zone.groundZ = groundZ;
    }

    state.zones.push(zone);
    state.activeZoneId = zone.id;
    state.expanded[zone.id] = true;
    pushHistory();
    render();
    map.fitBounds(
      L.latLngBounds(
        zone.points.map(function (p) {
          return gtaToLatLng(p.x, p.y);
        })
      ),
      { padding: [80, 80] }
    );
    notify('Imported ' + points.length + ' points');
  }

  /* ------------------------------------------------------------------ *
   * Template shapes
   * ------------------------------------------------------------------ */

  var SHAPES = {
    rectangle: function () {
      return [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    },
    circle: function () {
      var pts = [];
      for (var i = 0; i < 16; i++) {
        var a = (i / 16) * Math.PI * 2;
        pts.push([Math.cos(a), Math.sin(a)]);
      }
      return pts;
    },
    triangle: function () {
      return regular(3);
    },
    pentagon: function () {
      return regular(5);
    },
    hexagon: function () {
      return regular(6);
    },
    star: function () {
      var pts = [];
      for (var i = 0; i < 10; i++) {
        var r = i % 2 === 0 ? 1 : 0.45;
        var a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        pts.push([Math.cos(a) * r, Math.sin(a) * r]);
      }
      return pts;
    },
    'l-shape': function () {
      return [[-1, -1], [1, -1], [1, -0.2], [-0.2, -0.2], [-0.2, 1], [-1, 1]];
    }
  };

  function regular(sides) {
    var pts = [];
    for (var i = 0; i < sides; i++) {
      var a = (i / sides) * Math.PI * 2 - Math.PI / 2;
      pts.push([Math.cos(a), Math.sin(a)]);
    }
    return pts;
  }

  var previewControls = document.getElementById('preview-controls');
  var previewMinimizedBtn = document.getElementById('preview-minimized');

  function startPreview(type) {
    var center = map.getCenter();
    var gta = latLngToGta(center.lat, center.lng);
    var size = parseFloat(document.getElementById('template-size').value) || 50;

    state.preview = {
      type: type,
      centerX: round2(gta.x),
      centerY: round2(gta.y),
      scale: Math.max(5, Math.min(3000, size)),
      rotation: 0
    };
    state.previewMinimized = false;

    document.getElementById('preview-title').textContent = type.replace('-', ' ');
    document.getElementById('preview-scale').value = state.preview.scale;
    document.getElementById('preview-rotation').value = 0;
    closeModal('modal-template');
    renderPreview();
  }

  function previewPoints() {
    var p = state.preview;
    var rad = (p.rotation * Math.PI) / 180;
    return SHAPES[p.type]().map(function (unit) {
      var x = unit[0] * p.scale;
      var y = unit[1] * p.scale;
      var rx = x * Math.cos(rad) - y * Math.sin(rad);
      var ry = x * Math.sin(rad) + y * Math.cos(rad);
      return makePoint(p.centerX + rx, p.centerY + ry);
    });
  }

  function renderPreview() {
    previewLayer.clearLayers();
    previewControls.hidden = !state.preview || state.previewMinimized;
    previewMinimizedBtn.hidden = !state.preview || !state.previewMinimized;
    if (!state.preview) return;

    var pts = previewPoints();
    L.polygon(
      pts.map(function (p) {
        return gtaToLatLng(p.x, p.y);
      }),
      { color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.25, weight: 2, dashArray: '6, 4' }
    ).addTo(previewLayer);

    var centerMarker = L.marker(gtaToLatLng(state.preview.centerX, state.preview.centerY), {
      draggable: true,
      icon: L.divIcon({ className: 'preview-center-marker', html: '<div></div>', iconSize: [20, 20], iconAnchor: [10, 10] })
    }).addTo(previewLayer);

    centerMarker.on('drag', function (e) {
      var gta = latLngToGta(e.latlng.lat, e.latlng.lng);
      state.preview.centerX = round2(state.snapToGrid ? snap(gta.x) : gta.x);
      state.preview.centerY = round2(state.snapToGrid ? snap(gta.y) : gta.y);
      updatePreviewReadout();
      renderPreviewShapeOnly();
    });
    centerMarker.on('dragend', renderPreview);

    updatePreviewReadout();
  }

  var previewShapeLayer = null;
  function renderPreviewShapeOnly() {
    if (!state.preview) return;
    if (previewShapeLayer) previewLayer.removeLayer(previewShapeLayer);
    previewShapeLayer = L.polygon(
      previewPoints().map(function (p) {
        return gtaToLatLng(p.x, p.y);
      }),
      { color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.25, weight: 2, dashArray: '6, 4' }
    ).addTo(previewLayer);
  }

  function updatePreviewReadout() {
    if (!state.preview) return;
    document.getElementById('preview-x').textContent = state.preview.centerX;
    document.getElementById('preview-y').textContent = state.preview.centerY;
    document.getElementById('preview-scale-value').textContent = state.preview.scale;
    document.getElementById('preview-rotation-value').textContent = state.preview.rotation + '\u00b0';
  }

  function confirmPreview() {
    var zone = createZone(
      state.preview.type.charAt(0).toUpperCase() + state.preview.type.slice(1).replace('-', ' '),
      previewPoints()
    );
    state.zones.push(zone);
    state.activeZoneId = zone.id;
    state.expanded[zone.id] = true;
    state.preview = null;
    previewLayer.clearLayers();
    previewShapeLayer = null;
    pushHistory();
    renderPreview();
    render();
    notify('Created ' + zone.name);
  }

  function cancelPreview() {
    state.preview = null;
    previewShapeLayer = null;
    previewLayer.clearLayers();
    renderPreview();
    notify('Template cancelled', 'info');
  }

  /* ------------------------------------------------------------------ *
   * Modals
   * ------------------------------------------------------------------ */

  function openModal(id) {
    document.getElementById(id).hidden = false;
  }

  function closeModal(id) {
    document.getElementById(id).hidden = true;
  }

  function closeAllModals() {
    ['modal-import', 'modal-search', 'modal-template'].forEach(closeModal);
  }

  document.querySelectorAll('[data-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      closeModal(btn.getAttribute('data-close'));
    });
  });

  document.querySelectorAll('.zone-modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) overlay.hidden = true;
    });
  });

  /* ------------------------------------------------------------------ *
   * Map interactions
   * ------------------------------------------------------------------ */

  var coordsDisplay = document.getElementById('coords-display');

  map.on('mousemove', function (e) {
    var gta = latLngToGta(e.latlng.lat, e.latlng.lng);
    if (state.snapToGrid) {
      gta.x = snap(gta.x);
      gta.y = snap(gta.y);
    }
    coordsDisplay.hidden = false;
    document.getElementById('coord-x').textContent = 'X: ' + round2(gta.x);
    document.getElementById('coord-y').textContent = 'Y: ' + round2(gta.y);

    if (rubberBand && rubberBand.start) {
      rubberBand.layer.setBounds(L.latLngBounds(rubberBand.start, e.latlng));
    }
  });

  map.on('mouseout', function () {
    coordsDisplay.hidden = true;
  });

  map.on('zoomend', function () {
    document.getElementById('zoom-value').textContent = Math.round((map.getZoom() + 2) * 33) + '%';
  });

  map.on('click', function (e) {
    if (state.preview) return;
    var gta = latLngToGta(e.latlng.lat, e.latlng.lng);
    addPointToActive(gta.x, gta.y);
  });

  /* Shift + drag = box select points in the active zone. */
  map.on('mousedown', function (e) {
    if (!e.originalEvent.shiftKey || !state.activeZoneId) return;
    map.dragging.disable();
    rubberBand = {
      start: e.latlng,
      layer: L.rectangle(L.latLngBounds(e.latlng, e.latlng), {
        color: '#3b82f6',
        weight: 1,
        dashArray: '4, 4',
        fillOpacity: 0.1
      }).addTo(map)
    };
  });

  map.on('mouseup', function (e) {
    if (!rubberBand) return;
    var bounds = L.latLngBounds(rubberBand.start, e.latlng);
    var zone = activeZone();
    if (zone) {
      zone.points.forEach(function (p) {
        var ll = gtaToLatLng(p.x, p.y);
        if (bounds.contains(L.latLng(ll[0], ll[1]))) state.selected[p.id] = true;
      });
      var count = selectedCount();
      if (count) notify(count + ' point' + (count === 1 ? '' : 's') + ' selected', 'info');
    }
    map.removeLayer(rubberBand.layer);
    rubberBand = null;
    map.dragging.enable();
    render();
  });

  /* ------------------------------------------------------------------ *
   * Toolbar + global shortcuts
   * ------------------------------------------------------------------ */

  document.getElementById('btn-snap').addEventListener('click', function () {
    state.snapToGrid = !state.snapToGrid;
    renderIndicators();
    renderGrid();
  });

  document.getElementById('btn-distances').addEventListener('click', function () {
    state.showDistances = !state.showDistances;
    renderIndicators();
    renderMap();
  });

  document.getElementById('btn-undo').addEventListener('click', undo);
  document.getElementById('btn-redo').addEventListener('click', redo);
  document.getElementById('btn-import').addEventListener('click', function () {
    openModal('modal-import');
  });
  document.getElementById('btn-templates').addEventListener('click', function () {
    openModal('modal-template');
  });
  document.getElementById('btn-search').addEventListener('click', function () {
    openModal('modal-search');
  });

  document.getElementById('btn-clear').addEventListener('click', function () {
    if (!state.zones.length) return;
    if (!window.confirm('Delete all zones? This cannot be undone.')) return;
    state.zones = [];
    state.activeZoneId = null;
    state.selected = {};
    pushHistory();
    render();
    notify('Cleared all zones', 'info');
  });

  document.getElementById('btn-delete-selected').addEventListener('click', function () {
    var zone = activeZone();
    if (!zone) return;
    var before = zone.points.length;
    zone.points = zone.points.filter(function (p) {
      return !state.selected[p.id];
    });
    state.selected = {};
    pushHistory();
    render();
    notify('Deleted ' + (before - zone.points.length) + ' points', 'info');
  });

  document.getElementById('btn-do-import').addEventListener('click', function () {
    var code = document.getElementById('import-code').value;
    if (!code.trim()) return;
    importZone(code);
    document.getElementById('import-code').value = '';
    closeModal('modal-import');
  });

  document.getElementById('btn-do-search').addEventListener('click', function () {
    var x = parseFloat(document.getElementById('search-x').value);
    var y = parseFloat(document.getElementById('search-y').value);
    if (isNaN(x) || isNaN(y)) {
      notify('Enter valid X and Y coordinates', 'error');
      return;
    }
    map.setView(gtaToLatLng(x, y), 1, { animate: true });
    closeModal('modal-search');
    notify('Jumped to ' + x + ', ' + y, 'info');
  });

  document.querySelectorAll('[data-template]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      startPreview(btn.getAttribute('data-template'));
    });
  });

  document.getElementById('preview-scale').addEventListener('input', function (e) {
    state.preview.scale = parseFloat(e.target.value);
    updatePreviewReadout();
    renderPreviewShapeOnly();
  });

  document.getElementById('preview-rotation').addEventListener('input', function (e) {
    state.preview.rotation = parseFloat(e.target.value);
    updatePreviewReadout();
    renderPreviewShapeOnly();
  });

  document.getElementById('btn-preview-confirm').addEventListener('click', confirmPreview);
  document.getElementById('btn-preview-cancel').addEventListener('click', cancelPreview);
  document.getElementById('btn-preview-hide').addEventListener('click', function () {
    state.previewMinimized = true;
    previewControls.hidden = true;
    previewMinimizedBtn.hidden = false;
  });
  previewMinimizedBtn.addEventListener('click', function () {
    state.previewMinimized = false;
    previewControls.hidden = false;
    previewMinimizedBtn.hidden = true;
  });

  window.addEventListener('keydown', function (e) {
    var tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      } else if (e.key === 'f') {
        e.preventDefault();
        openModal('modal-search');
      }
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      var zone = activeZone();
      if (zone && zone.points.length) {
        zone.points.pop();
        pushHistory();
        render();
      }
    } else if (e.key === 'g' || e.key === 'G') {
      document.getElementById('btn-snap').click();
    } else if (e.key === 'd' || e.key === 'D') {
      document.getElementById('btn-distances').click();
    } else if (e.key === 'Escape') {
      closeAllModals();
      if (state.preview) cancelPreview();
    }
  });

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */

  window.Icons.hydrate(document);
  render();
  document.getElementById('zoom-value').textContent = Math.round((map.getZoom() + 2) * 33) + '%';

  if (state.zones.length) {
    notify('Restored ' + state.zones.length + ' zone' + (state.zones.length === 1 ? '' : 's') + ' from this browser', 'info');
  }
})();
