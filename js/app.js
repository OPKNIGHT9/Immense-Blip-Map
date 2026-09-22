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
    hiddenBlips: {},
    navOpen: {},
    lastPick: null,
    activeTags: {},
    sortBy: 'name',
    search: '',
    selectedId: null,
    connectors: [],
    showConnections: CONFIG.connectionsOn !== false,
    showPins: CONFIG.showPins !== false,
    showZones: CONFIG.showZones !== false,
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

  /* Area centroid. Averaging the vertices instead skews towards whichever
   * side has more of them, which is why labels sat off centre. */
  function centroid(points) {
    var a = 0, cx = 0, cy = 0;
    for (var i = 0; i < points.length; i++) {
      var p1 = points[i];
      var p2 = points[(i + 1) % points.length];
      var cross = p1.x * p2.y - p2.x * p1.y;
      a += cross;
      cx += (p1.x + p2.x) * cross;
      cy += (p1.y + p2.y) * cross;
    }
    a = a / 2;
    if (Math.abs(a) < 1e-9) {
      var sx = 0, sy = 0;
      points.forEach(function (p) { sx += p.x; sy += p.y; });
      return { x: sx / points.length, y: sy / points.length };
    }
    return { x: cx / (6 * a), y: cy / (6 * a) };
  }

  function pointInPolygon(x, y, points) {
    var inside = false;
    for (var i = 0, j = points.length - 1; i < points.length; j = i++) {
      var xi = points[i].x, yi = points[i].y;
      var xj = points[j].x, yj = points[j].y;
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }

  /* A concave zone can have its centroid outside itself — Alamo Sea wraps
   * around a shoreline. Fall back to the middle of the widest horizontal
   * slice through the shape, which is always inside it. */
  function labelAnchor(points) {
    var c = centroid(points);
    if (pointInPolygon(c.x, c.y, points)) return c;

    var ys = points.map(function (p) { return p.y; });
    var minY = Math.min.apply(null, ys);
    var maxY = Math.max.apply(null, ys);
    var best = null;

    for (var step = 1; step < 20; step++) {
      var y = minY + ((maxY - minY) * step) / 20;
      var xs = [];
      for (var i = 0, j = points.length - 1; i < points.length; j = i++) {
        var yi = points[i].y, yj = points[j].y;
        if ((yi > y) !== (yj > y)) {
          xs.push(points[j].x + ((y - yj) / (yi - yj)) * (points[i].x - points[j].x));
        }
      }
      xs.sort(function (a, b) { return a - b; });
      for (var k = 0; k + 1 < xs.length; k += 2) {
        var span = xs[k + 1] - xs[k];
        if (!best || span > best.span) {
          best = { span: span, x: (xs[k] + xs[k + 1]) / 2, y: y };
        }
      }
    }

    return best ? { x: best.x, y: best.y } : c;
  }

  /* Accepts "0, 0, 0", "vector4(1.0, 2.0, 3.0, 90.0)", "vec3(1,2,3)" or an
   * array [x, y, z, heading]. Returns nulls for anything not supplied, so
   * a heading of 0 stays distinguishable from no heading at all. */
  function parseCoords(value) {
    if (value == null) return null;

    var nums;
    if (Array.isArray(value)) {
      nums = value.map(Number);
    } else if (typeof value === 'number') {
      return null;
    } else {
      /* Strip the vec/vector prefix first, or the digit in "vector4("
       * gets read as a coordinate. */
      var cleaned = String(value).replace(/vec(?:tor)?\s*[0-9]*/gi, ' ');
      var found = cleaned.match(/-?\d+(?:\.\d+)?/g);
      if (!found) return null;
      nums = found.map(Number);
    }

    nums = nums.filter(function (n) {
      return !isNaN(n);
    });
    if (nums.length < 2) return null;

    return {
      x: nums[0],
      y: nums[1],
      z: nums.length > 2 ? nums[2] : null,
      heading: nums.length > 3 ? nums[3] : null
    };
  }

  function normaliseHeading(value) {
    if (value === '' || value === undefined || value === null) return null;
    var h = Number(value);
    if (isNaN(h)) return null;
    return ((h % 360) + 360) % 360;
  }

  function normalise(blip, group, index) {
    /* A compact `coords` field is shorthand for x/y/z/heading. Any of
     * those written out individually still wins. */
    var short = parseCoords(blip.coords) || {};

    var heading = normaliseHeading(blip.heading != null ? blip.heading : short.heading);

    var z =
      blip.z != null ? Number(blip.z) : short.z != null ? Number(short.z) : null;
    var zoneZ = z == null ? 0 : z;

    var points = Array.isArray(blip.points)
      ? blip.points
          .map(function (p) {
            /* Points take the same shorthand: "0, 0, 0" or [x, y, z]. */
            if (typeof p === 'string') {
              var parsed = parseCoords(p);
              if (!parsed) return { x: NaN, y: NaN, z: zoneZ };
              return { x: parsed.x, y: parsed.y, z: parsed.z == null ? zoneZ : parsed.z };
            }
            if (Array.isArray(p)) {
              return { x: Number(p[0]), y: Number(p[1]), z: p[2] == null ? zoneZ : Number(p[2]) };
            }
            if (p && p.coords != null) {
              var fromCoords = parseCoords(p.coords);
              if (fromCoords) {
                return {
                  x: fromCoords.x,
                  y: fromCoords.y,
                  z: fromCoords.z == null ? zoneZ : fromCoords.z
                };
              }
            }
            return { x: Number(p.x), y: Number(p.y), z: p.z == null ? zoneZ : Number(p.z) };
          })
          .filter(function (p) {
            return !isNaN(p.x) && !isNaN(p.y);
          })
      : [];

    var isZone = points.length >= 3;

    var pinnedX = blip.x != null ? Number(blip.x) : short.x != null ? short.x : null;
    var pinnedY = blip.y != null ? Number(blip.y) : short.y != null ? short.y : null;

    /* A zone's marker sits at its centroid unless the author pinned it. */
    var anchor =
      pinnedX != null && pinnedY != null
        ? { x: pinnedX, y: pinnedY }
        : isZone
        ? centroid(points)
        : { x: 0, y: 0 };

    var tags = (Array.isArray(blip.tags) ? blip.tags : blip.tags ? [blip.tags] : [])
      .map(function (t) {
        return String(t).trim();
      })
      .filter(Boolean);

    return {
      id: blip.id || group + '-' + index,
      name: blip.name || 'Unnamed',
      type: isZone ? 'zone' : 'blip',
      tags: tags,
      disabled: blip.enabled === false || blip.disabled === true,
      points: points,
      section: SECTIONS[blip.section] ? blip.section : Object.keys(SECTIONS)[0],
      subsection: blip.subsection || null,
      icon: blip.icon || null,
      color: blip.color || null,
      description: blip.description || '',
      x: anchor.x,
      y: anchor.y,
      z: z,
      fillOpacity: blip.fillOpacity == null ? 0.25 : Number(blip.fillOpacity),
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

  function normaliseConnector(c, group, index) {
    return {
      id: c.id || group + '-conn-' + index,
      name: c.name || 'Connector',
      color: c.color || null,
      mode: c.mode === 'chain' || c.mode === 'hub' ? c.mode : 'mesh',
      members: Array.isArray(c.members) ? c.members.slice() : [],
      group: group
    };
  }

  /* A group's payload may be a plain array of blips, or an object with
   * separate blips and connectors. */
  function splitPayload(payload) {
    if (Array.isArray(payload)) return { blips: payload, connectors: [] };
    return {
      blips: (payload && payload.blips) || [],
      connectors: (payload && payload.connectors) || []
    };
  }

  /* A blip with enabled:false (or disabled:true) is skipped entirely —
   * it never reaches the map, the list or any count. */
  function notDisabled(b) {
    return !b.disabled;
  }

  function loadPublicBlips() {
    var source = (window.BLIPS && window.BLIPS.public) || [];
    state.blips = source
      .map(function (b, i) {
        return normalise(b, 'public', i);
      })
      .filter(notDisabled);
    state.connectors = ((window.BLIPS && window.BLIPS.connectors) || []).map(function (c, i) {
      return normaliseConnector(c, 'public', i);
    });
    reindex();
  }

  function addGroupBlips(group, payload) {
    var data = splitPayload(payload);
    if (state.unlockedGroups.indexOf(group) === -1) state.unlockedGroups.push(group);

    state.blips = state.blips.filter(function (b) {
      return b.group !== group;
    });
    state.connectors = state.connectors.filter(function (c) {
      return c.group !== group;
    });

    data.blips.forEach(function (b, i) {
      var normalised = normalise(b, group, i);
      if (notDisabled(normalised)) state.blips.push(normalised);
    });
    data.connectors.forEach(function (c, i) {
      state.connectors.push(normaliseConnector(c, group, i));
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
      if (Array.isArray(entry.blips) || entry.payload) {
        addGroupBlips(name, entry.payload || entry.blips);
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

  var zoneLayer = L.layerGroup().addTo(map);
  var vertexLayer = L.layerGroup().addTo(map);
  var connectionLayer = L.layerGroup().addTo(map);
  var blipLayer = L.layerGroup().addTo(map);
  var pingLayer = L.layerGroup().addTo(map);

  function isVisible(blip) {
    if (state.unlockedGroups.indexOf(blip.group) === -1) return false;
    if (state.hiddenGroups[blip.group]) return false;
    if (state.hiddenBlips[blip.id]) return false;
    if (blip.type === 'zone' && !state.showZones) return false;
    if (blip.type !== 'zone' && !state.showPins) return false;
    if (state.hiddenSections[blip.section]) return false;
    /* Blips with no subsection sit in the "section/" bucket, shown as "Other". */
    var subKey = blip.section + '/' + (blip.subsection || '');
    if (state.hiddenSubsections[subKey]) return false;
    var active = Object.keys(state.activeTags);
    if (active.length) {
      var matched = blip.tags.some(function (t) {
        return state.activeTags[t];
      });
      if (!matched) return false;
    }

    var term = state.search.trim().toLowerCase();
    if (!term) return true;
    return (
      blip.name.toLowerCase().indexOf(term) !== -1 ||
      blip.description.toLowerCase().indexOf(term) !== -1 ||
      blip.tags.join(' ').toLowerCase().indexOf(term) !== -1
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

  /* The label is sized from the zone's own extent, so a big district gets
   * big type and a small one small type. Recomputed on zoom, since the
   * same zone covers more screen as you zoom in. */
  function addZoneLabel(blip, style) {
    var xs = blip.points.map(function (p) { return p.x; });
    var ys = blip.points.map(function (p) { return p.y; });
    var widthUnits = Math.max.apply(null, xs) - Math.min.apply(null, xs);
    var heightUnits = Math.max.apply(null, ys) - Math.min.apply(null, ys);

    var anchor = labelAnchor(blip.points);

    var label = L.marker(gtaToLatLng(anchor.x, anchor.y), {
      interactive: false,
      keyboard: false,
      icon: L.divIcon({
        className: 'zone-label',
        html: '<span style="color:' + style.color + '">' + escapeHtml(blip.name) + '</span>',
        iconSize: [0, 0]
      })
    }).addTo(zoneLayer);

    zoneLabels.push({
      marker: label,
      width: widthUnits,
      height: heightUnits,
      name: blip.name
    });
  }

  /* Screen pixels per game unit at the current zoom: one image pixel is
   * 2^zoom screen pixels, and one game unit is SCALE_X image pixels. */
  function pxPerUnit() {
    return SCALE_X * Math.pow(2, map.getZoom());
  }

  function longestWord(name) {
    return name.split(/\s+/).reduce(function (n, w) {
      return Math.max(n, w.length);
    }, 1);
  }

  /* Default mode: type size comes from the zone's real-world size alone,
   * so Grand Senora Desert always reads larger than Calafia Bridge and
   * neither changes as you zoom. Mapped on a log scale because zone areas
   * span two orders of magnitude.
   *
   * Set zoneLabelMode: 'fit' in config.js for the alternative, where the
   * label is sized to fill the zone on screen and so grows with zoom. */
  function labelSizeForZone(entry) {
    var extent = Math.sqrt(Math.max(entry.width, 1) * Math.max(entry.height, 1));
    var t = (Math.log(extent) / Math.LN10 - 2) / 1.6;
    return Math.max(9, Math.min(30, 9 + t * 21));
  }

  function labelSizeToFit(entry) {
    var scale = pxPerUnit();
    var byWidth = (entry.width * scale * 0.86) / (longestWord(entry.name) * 0.55);
    var byHeight = (entry.height * scale) / 3;
    return Math.min(byWidth, byHeight);
  }

  function updateZoneLabels() {
    var fitMode = CONFIG.zoneLabelMode === 'fit';
    var scale = pxPerUnit();

    zoneLabels.forEach(function (entry) {
      var el = entry.marker.getElement();
      if (!el) return;

      /* zoneLabelScale multiplies the computed size, so you can tune the
       * whole set without touching the sizing maths. */
      var scaleFactor = CONFIG.zoneLabelScale == null ? 1 : CONFIG.zoneLabelScale;
      var size = (fitMode ? labelSizeToFit(entry) : labelSizeForZone(entry)) * scaleFactor;
      if (fitMode && size < 7) {
        el.style.display = 'none';
        return;
      }
      size = Math.min(size, 42);

      /* How much room the zone actually offers on screen right now. The
       * type is a fixed size, so zooming out eventually leaves the name
       * wider than its zone — hide it rather than let it spill out. */
      var zoneWidthPx = entry.width * scale;
      var zoneHeightPx = entry.height * scale;

      var longest = longestWord(entry.name) * size * 0.55;
      var lines = Math.max(1, Math.ceil((entry.name.length * size * 0.55) / Math.max(longest, 1)));
      var textHeight = lines * size * 1.15;

      if (!fitMode && (longest > zoneWidthPx * 0.95 || textHeight > zoneHeightPx * 0.95)) {
        el.style.display = 'none';
        return;
      }

      el.style.display = '';
      el.style.fontSize = size.toFixed(1) + 'px';

      /* The wrap width belongs on the span — the marker element itself is
       * a zero-width point, so a percentage there collapses to nothing. */
      var span = el.firstElementChild;
      if (span) {
        span.style.maxWidth = fitMode
          ? Math.max(40, zoneWidthPx * 0.9).toFixed(0) + 'px'
          : Math.max(longest * 1.05, zoneWidthPx * 0.92).toFixed(0) + 'px';
      }
    });
  }

  function renderVertices(blip, style) {
    blip.points.forEach(function (point, index) {
      var vertex = L.marker(gtaToLatLng(point.x, point.y), {
        icon: L.divIcon({
          className: 'zone-vertex',
          html: '<div style="border-color:' + style.color + '">' + (index + 1) + '</div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(vertexLayer);

      var coords = f(point.x) + ', ' + f(point.y) + ', ' + f(point.z);
      var vec3 = 'vector3(' + coords + ')';
      var tpCmd = (CONFIG.tpCommand || '/tp') + ' ' + f(point.x) + ' ' + f(point.y) + ' ' + f(point.z);

      vertex.bindPopup(
        '<div class="blip-popup-inner">' +
          '<div class="blip-popup-head">' +
          '<span class="blip-dot" style="background:' + style.color + '"></span>' +
          '<strong>' + escapeHtml(blip.name) + ' &mdash; point ' + (index + 1) + '</strong></div>' +
          '<button class="fmt-value" data-copy="' + escapeHtml(coords) + '">' +
          '<span>' + escapeHtml(coords) + '</span>' + window.Icons.icon('copy', 12) + '</button>' +
          '<button class="fmt-value" data-copy="' + escapeHtml(vec3) + '">' +
          '<span>' + escapeHtml(vec3) + '</span>' + window.Icons.icon('copy', 12) + '</button>' +
          '<button class="fmt-value" data-copy="' + escapeHtml(tpCmd) + '">' +
          '<span>' + escapeHtml(tpCmd) + '</span>' + window.Icons.icon('copy', 12) + '</button>' +
          '</div>',
        { className: 'blip-popup', closeButton: true, minWidth: 210, autoPan: false }
      );

      vertex.bindTooltip('Point ' + (index + 1), {
        direction: 'top',
        offset: [0, -12],
        className: 'blip-tooltip',
        opacity: 1
      });

      vertex.on('click', function (e) {
        L.DomEvent.stopPropagation(e);
      });

      vertexMarkers[blip.id + ':' + index] = vertex;
    });
  }

  var vertexMarkers = {};
  var zoneLabels = [];

  function renderMarkers() {
    blipLayer.clearLayers();
    zoneLayer.clearLayers();
    vertexLayer.clearLayers();
    markers = {};
    vertexMarkers = {};
    zoneLabels = [];

    visibleBlips().forEach(function (blip) {
      var style = resolveStyle(blip);
      var isSelected = state.selectedId === blip.id;

      if (blip.type === 'zone') {
        var polygon = L.polygon(
          blip.points.map(function (p) {
            return gtaToLatLng(p.x, p.y);
          }),
          {
            color: style.color,
            fillColor: style.color,
            fillOpacity: isSelected ? Math.min(blip.fillOpacity + 0.15, 0.7) : blip.fillOpacity,
            weight: isSelected ? 3 : 2,
            opacity: isSelected ? 1 : 0.8
          }
        ).addTo(zoneLayer);

        /* The zone itself is the click target — no centre pin. */
        polygon.bindPopup(popupHtml(blip), {
          className: 'blip-popup',
          closeButton: true,
          minWidth: 250,
          autoPan: false
        });

        polygon.bindTooltip(escapeHtml(blip.name), {
          sticky: true,
          direction: 'top',
          className: 'blip-tooltip',
          opacity: 1
        });

        polygon.on('click', function (e) {
          L.DomEvent.stopPropagation(e);
          var wasSelected = state.selectedId === blip.id;
          state.selectedId = blip.id;
          renderList();
          if (!wasSelected) {
            renderMarkers();
            if (markers[blip.id]) markers[blip.id].openPopup(e.latlng);
          } else {
            renderConnections();
          }
        });

        markers[blip.id] = polygon;

        if (CONFIG.zoneLabels !== false) addZoneLabel(blip, style);

        /* Selecting a zone exposes its vertices. */
        if (isSelected) renderVertices(blip, style);
        return;
      }

      var marker = L.marker(gtaToLatLng(blip.x, blip.y), {
        icon: L.divIcon({
          className: 'blip-marker',
          html: markerHtml(blip, style, isSelected),
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        })
      }).addTo(blipLayer);

      /* autoPan shoves the map to fit the popup, which at high zoom
       * throws the blip you just centred out to the edge. Off. */
      marker.bindPopup(popupHtml(blip), {
        className: 'blip-popup',
        closeButton: true,
        offset: [0, -14],
        minWidth: 250,
        autoPan: false
      });

      marker.bindTooltip(escapeHtml(blip.name), {
        direction: 'top',
        offset: [0, -18],
        className: 'blip-tooltip',
        opacity: 1
      });

      marker.on('click', function () {
        state.selectedId = blip.id;
        renderList();
        renderConnections();
      });

      markers[blip.id] = marker;
    });

    renderConnections();
  }

  /* Every line to draw, resolved from both per-blip connections and
   * connector groups. One entry per drawn line. */
  function buildEdges() {
    var edges = [];
    var seen = {};

    function add(aId, bId, color, groupRef) {
      var a = state.byId[aId];
      var b = state.byId[bId];
      if (!a || !b || a.id === b.id) return;
      if (!isVisible(a) || !isVisible(b)) return;

      var key = [aId, bId].sort().join('::') + '|' + (groupRef ? groupRef.id : '');
      if (seen[key]) return;
      seen[key] = true;

      edges.push({
        a: a,
        b: b,
        color: color || resolveStyle(a).color,
        connector: groupRef || null
      });
    }

    state.blips.forEach(function (blip) {
      if (!isVisible(blip)) return;
      blip.connections.forEach(function (targetId) {
        add(blip.id, targetId, resolveStyle(blip).color, null);
      });
    });

    state.connectors.forEach(function (conn) {
      var members = conn.members.filter(function (id) {
        var b = state.byId[id];
        return b && isVisible(b);
      });
      if (members.length < 2) return;

      var i, j;
      if (conn.mode === 'chain') {
        for (i = 0; i < members.length - 1; i++) add(members[i], members[i + 1], conn.color, conn);
      } else if (conn.mode === 'hub') {
        for (i = 1; i < members.length; i++) add(members[0], members[i], conn.color, conn);
      } else {
        for (i = 0; i < members.length; i++) {
          for (j = i + 1; j < members.length; j++) add(members[i], members[j], conn.color, conn);
        }
      }
    });

    return edges;
  }

  function edgeIsLit(edge) {
    if (!state.selectedId) return false;
    if (edge.a.id === state.selectedId || edge.b.id === state.selectedId) return true;
    return !!(edge.connector && edge.connector.members.indexOf(state.selectedId) !== -1);
  }

  function edgeMembers(edge) {
    if (!edge.connector) return [edge.a.id, edge.b.id];
    return edge.connector.members.filter(function (id) {
      var b = state.byId[id];
      return b && isVisible(b);
    });
  }

  function edgePopupHtml(edge) {
    var members = edgeMembers(edge);
    var title = edge.connector ? edge.connector.name : 'Connection';

    var items = members
      .map(function (id) {
        var target = state.byId[id];
        if (!target) return '';
        var style = resolveStyle(target);
        return (
          '<button class="conn-link" data-goto="' + escapeHtml(id) + '">' +
          '<span class="conn-dot" style="background:' + style.color + '"></span>' +
          '<span>' + escapeHtml(target.name) + '</span>' +
          window.Icons.icon('chevron-right', 11) +
          '</button>'
        );
      })
      .join('');

    return (
      '<div class="blip-popup-inner">' +
      '<div class="blip-popup-head">' +
      '<span class="blip-dot" style="background:' + edge.color + '"></span>' +
      '<strong>' + escapeHtml(title) + '</strong></div>' +
      '<div class="blip-popup-meta"><span>' + members.length + ' connected</span>' +
      (edge.connector ? '<span class="blip-zone-tag">' + escapeHtml(edge.connector.mode) + '</span>' : '') +
      '</div>' +
      '<div class="conn-scroll">' + items + '</div>' +
      '</div>'
    );
  }

  function renderConnections() {
    connectionLayer.clearLayers();
    if (!state.showConnections) return;

    buildEdges().forEach(function (edge) {
      var line = [gtaToLatLng(edge.a.x, edge.a.y), gtaToLatLng(edge.b.x, edge.b.y)];
      var lit = edgeIsLit(edge);

      if (lit) {
        /* A wide, faint line under the real one reads as a glow. */
        L.polyline(line, {
          color: edge.color,
          weight: 11,
          opacity: 0.22,
          interactive: false,
          className: 'connector-glow'
        }).addTo(connectionLayer);
      }

      var stroke = L.polyline(line, {
        color: edge.color,
        weight: lit ? 3 : 2,
        opacity: lit ? 1 : 0.45,
        dashArray: lit ? null : '6, 6',
        interactive: true,
        bubblingMouseEvents: false
      }).addTo(connectionLayer);

      /* A fat invisible line makes the thin one realistic to click. */
      var hitbox = L.polyline(line, {
        color: '#000',
        weight: 14,
        opacity: 0,
        interactive: true,
        bubblingMouseEvents: false
      }).addTo(connectionLayer);

      [stroke, hitbox].forEach(function (layer) {
        layer.bindPopup(edgePopupHtml(edge), {
          className: 'blip-popup',
          closeButton: true,
          minWidth: 210,
          autoPan: false
        });
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
        return (
          f(blip.x) + ', ' + f(blip.y) + ', ' + f(z) +
          (blip.heading === null ? '' : ', ' + f(blip.heading))
        );
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
      '<div class="blip-popup-path">' + escapeHtml(sectionPath(blip)) + '</div>' +
      badgesHtml(blip) +
      '<div class="fmt-row">' + buttons + '</div>' +
      '<button class="fmt-value" data-copy="' + escapeHtml(formatValue(blip, chosen)) + '" title="Click to copy">' +
      '<span>' + escapeHtml(formatValue(blip, chosen)) + '</span>' +
      window.Icons.icon('copy', 12) +
      '</button>' +
      zonePointsHtml(blip) +
      connectionListHtml(blip) +
      (canSuggest()
        ? '<button class="suggest-link" data-suggest="' + escapeHtml(blip.id) + '">' +
          window.Icons.icon('edit', 11) + '<span>Suggest an edit</span></button>'
        : '') +
      '</div>'
    );
  }

  /* Tags, the zone marker and the access group, as one wrapping row of
   * pills below the section path. */
  function badgesHtml(blip) {
    var grp = GROUPS[blip.group] || {};
    var pills = [];

    if (blip.type === 'zone') {
      pills.push('<span class="popup-badge is-zone">Zone</span>');
    }

    blip.tags.forEach(function (t) {
      var color = tagColor(t);
      pills.push(
        '<span class="popup-badge" style="border-color:' + color + '66;color:' + color +
        ';background:' + color + '1a">' + escapeHtml(t) + '</span>'
      );
    });

    if (blip.group !== 'public') {
      var gc = grp.color || '#888';
      pills.push(
        '<span class="popup-badge is-group" style="border-color:' + gc + '66;color:' + gc +
        ';background:' + gc + '1a">' + escapeHtml(grp.label || blip.group) + '</span>'
      );
    }

    if (!pills.length) return '';
    return '<div class="blip-popup-badges">' + pills.join('') + '</div>';
  }

  function zonePointsHtml(blip) {
    if (blip.type !== 'zone') return '';

    var items = blip.points
      .map(function (point, i) {
        return (
          '<button class="conn-link vertex-link" data-vertex="' + escapeHtml(blip.id) + ':' + i + '">' +
          '<span class="vertex-index">' + (i + 1) + '</span>' +
          '<span>' + f(point.x) + ', ' + f(point.y) + ', ' + f(point.z) + '</span>' +
          window.Icons.icon('copy', 11) +
          '</button>'
        );
      })
      .join('');

    return (
      '<div class="conn-block">' +
      '<div class="conn-title">' + window.Icons.icon('map-pin', 11) +
      '<span>' + blip.points.length + ' points</span></div>' +
      '<div class="conn-scroll">' + items + '</div></div>'
    );
  }

  /* Every blip this one links to, in either direction. */
  function linkedBlips(blip) {
    var seen = {};
    var out = [];

    blip.connections.forEach(function (id) {
      var target = state.byId[id];
      if (target && !seen[id] && isVisible(target)) {
        seen[id] = true;
        out.push(target);
      }
    });

    state.blips.forEach(function (other) {
      if (other.id === blip.id || seen[other.id]) return;
      if (other.connections.indexOf(blip.id) === -1) return;
      if (!isVisible(other)) return;
      seen[other.id] = true;
      out.push(other);
    });

    /* Anyone sharing a connector group counts as linked. */
    state.connectors.forEach(function (conn) {
      if (conn.members.indexOf(blip.id) === -1) return;
      conn.members.forEach(function (id) {
        if (id === blip.id || seen[id]) return;
        var target = state.byId[id];
        if (!target || !isVisible(target)) return;
        seen[id] = true;
        out.push(target);
      });
    });

    return out;
  }

  function connectionListHtml(blip) {
    var linked = linkedBlips(blip);
    if (!linked.length) return '';

    var items = linked
      .map(function (target) {
        var style = resolveStyle(target);
        return (
          '<button class="conn-link" data-goto="' + escapeHtml(target.id) + '">' +
          '<span class="conn-dot" style="background:' + style.color + '"></span>' +
          '<span>' + escapeHtml(target.name) + '</span>' +
          window.Icons.icon('chevron-right', 11) +
          '</button>'
        );
      })
      .join('');

    return (
      '<div class="conn-block">' +
      '<div class="conn-title">' + window.Icons.icon('link', 11) +
      '<span>Connected to ' + linked.length + '</span></div>' +
      '<div class="conn-scroll">' + items + '</div></div>'
    );
  }

  function gotoBlip(id) {
    var blip = state.byId[id];
    if (!blip) return;
    state.selectedId = id;
    map.setView(gtaToLatLng(blip.x, blip.y), Math.max(map.getZoom(), 1), { animate: true });
    renderList();
    renderMarkers();
    openBlipPopup(blip);
  }

  /* Polygons have no single anchor, so tell the popup where to sit. */
  function openBlipPopup(blip) {
    var layer = markers[blip.id];
    if (!layer) return;
    if (blip.type === 'zone') layer.openPopup(gtaToLatLng(blip.x, blip.y));
    else layer.openPopup();
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

    var suggestBtn = e.target.closest && e.target.closest('[data-suggest]');
    if (suggestBtn) {
      openSuggest(suggestBtn.getAttribute('data-suggest'));
      return;
    }

    var vertexBtn = e.target.closest && e.target.closest('[data-vertex]');
    if (vertexBtn) {
      var ref = vertexBtn.getAttribute('data-vertex');
      var parts = ref.split(':');
      var zone = state.byId[parts[0]];
      var point = zone && zone.points[parseInt(parts[1], 10)];
      if (point) {
        copyText(f(point.x) + ', ' + f(point.y) + ', ' + f(point.z));
        toast('Copied point ' + (parseInt(parts[1], 10) + 1));
        map.panTo(gtaToLatLng(point.x, point.y), { animate: true });
        if (vertexMarkers[ref]) vertexMarkers[ref].openPopup();
      }
      return;
    }

    var goto = e.target.closest && e.target.closest('[data-goto]');
    if (goto) {
      gotoBlip(goto.getAttribute('data-goto'));
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

  var tagFilterEl = document.getElementById('tag-filter');

  /* Tags are collected from the blips themselves — nothing to declare
   * in config.js. */
  function allTags() {
    var counts = {};
    accessibleBlips().forEach(function (b) {
      b.tags.forEach(function (t) {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.keys(counts)
      .sort(function (a, b) {
        return a.localeCompare(b);
      })
      .map(function (name) {
        return { name: name, count: counts[name] };
      });
  }

  function tagColor(name) {
    var configured = (CONFIG.tagColors || {})[name];
    if (configured) return configured;
    /* Stable colour per tag name, so they don't shuffle between loads. */
    var hash = 0;
    for (var i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 360;
    return 'hsl(' + hash + ', 65%, 60%)';
  }

  function renderTags() {
    var tags = allTags();
    if (!tags.length) {
      tagFilterEl.innerHTML = '';
      tagFilterEl.hidden = true;
      return;
    }
    tagFilterEl.hidden = false;

    var activeCount = Object.keys(state.activeTags).length;

    var html =
      '<div class="tag-head">' +
      '<span>' + window.Icons.icon('tag', 11) + 'Tags</span>' +
      (activeCount ? '<button class="tag-clear" data-clear-tags>Clear ' + activeCount + '</button>' : '') +
      '</div><div class="filter-chips">';

    tags.forEach(function (tag) {
      var on = !!state.activeTags[tag.name];
      html +=
        '<button class="filter-chip tag-chip' + (on ? ' on' : '') + '" data-tag="' + escapeHtml(tag.name) + '"' +
        ' style="--tag-color:' + tagColor(tag.name) + '">' +
        '<span class="chip-dot" style="background:' + tagColor(tag.name) + '"></span>' +
        escapeHtml(tag.name) + '<span class="chip-count">' + tag.count + '</span></button>';
    });

    tagFilterEl.innerHTML = html + '</div>';

    tagFilterEl.querySelectorAll('[data-tag]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.getAttribute('data-tag');
        if (state.activeTags[name]) delete state.activeTags[name];
        else state.activeTags[name] = true;
        renderAll();
      });
    });

    var clearBtn = tagFilterEl.querySelector('[data-clear-tags]');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        state.activeTags = {};
        renderAll();
      });
    }
  }

  /* Blips filed under a section, optionally narrowed to one subsection.
   * subKey === null means "no subsection" (the Other bucket). */
  function blipsIn(sectionKey, subKey) {
    return accessibleBlips()
      .filter(function (b) {
        if (b.section !== sectionKey) return false;
        if (subKey === undefined) return true;
        return (b.subsection || null) === subKey;
      })
      .sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
  }

  /* One row per blip, so any single location can be switched off from
   * the sidebar without touching the data file. */
  function leafRows(list) {
    if (!list.length) return '';
    return (
      '<div class="nav-leaves">' +
      list
        .map(function (blip) {
          var style = resolveStyle(blip);
          var off = !!state.hiddenBlips[blip.id];
          return (
            '<button class="nav-leaf' + (off ? ' off' : '') + '" data-toggle-blip="' + escapeHtml(blip.id) + '"' +
            ' title="' + (off ? 'Show' : 'Hide') + ' ' + escapeHtml(blip.name) + '">' +
            '<span class="nav-leaf-icon" style="color:' + style.color + '">' +
            window.Icons.icon(off ? 'eye-off' : style.icon, 12) + '</span>' +
            '<span class="nav-name">' + escapeHtml(blip.name) + '</span>' +
            '</button>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function caret(key, isOpen, attr) {
    return (
      '<button class="nav-caret' + (isOpen ? ' open' : '') + '" ' + (attr || 'data-toggle-collapse') +
      '="' + escapeHtml(key) + '" title="Expand or fold">' +
      window.Icons.icon('chevron-right', 13) + '</button>'
    );
  }

  function renderNav() {
    var html = '';

    Object.keys(SECTIONS).forEach(function (key) {
      var sec = SECTIONS[key];
      var subKeys = sec.subsections ? Object.keys(sec.subsections) : [];
      var total = countIn(key);

      /* A section with nothing in it is noise — a group's section stays
       * hidden until someone signs in and its blips load. Set
       * showEmptySections: true in config.js to keep them listed. */
      if (!total && !CONFIG.showEmptySections) return;

      var off = !!state.hiddenSections[key];
      var isCollapsed = !!state.collapsed[key];
      var color = sec.color || DEFAULT_COLOR;

      html += '<div class="nav-section' + (off ? ' off' : '') + '">';
      html += '<div class="nav-row">';
      html += total ? caret(key, !isCollapsed) : '<span class="nav-caret-spacer"></span>';
      html +=
        '<button class="nav-label" data-toggle-section="' + key + '" title="Show or hide this section">' +
        '<span class="nav-icon" style="color:' + color + '">' +
        window.Icons.icon(sec.icon || DEFAULT_ICON, 14) + '</span>' +
        '<span class="nav-name">' + escapeHtml(sec.label || key) + '</span>' +
        '<span class="nav-count">' + total + '</span>' +
        '</button>';
      html += '</div>';

      if (total && !isCollapsed) {
        html += '<div class="nav-children">';

        subKeys.forEach(function (subKey) {
          var sub = sec.subsections[subKey];
          var path = key + '/' + subKey;
          var members = blipsIn(key, subKey);
          if (!members.length) return;

          var subOff = !!state.hiddenSubsections[path];
          var subOpen = !!state.navOpen[path];

          html += '<div class="nav-subsection">';
          html += '<div class="nav-row">';
          html += caret(path, subOpen, 'data-toggle-open');
          html +=
            '<button class="nav-child' + (subOff ? ' off' : '') + '" data-toggle-sub="' + path + '"' +
            ' title="Show or hide this subsection">' +
            '<span class="nav-child-dot" style="background:' + (sub.color || color) + '"></span>' +
            '<span class="nav-name">' + escapeHtml(sub.label || subKey) + '</span>' +
            '<span class="nav-count">' + members.length + '</span>' +
            '</button>';
          html += '</div>';
          if (subOpen) html += leafRows(members);
          html += '</div>';
        });

        /* Blips in this section that name no subsection. */
        var loose = blipsIn(key, null);
        if (loose.length) {
          if (subKeys.length) {
            var otherPath = key + '/';
            var otherOpen = !!state.navOpen[otherPath];
            html += '<div class="nav-subsection">';
            html += '<div class="nav-row">';
            html += caret(otherPath, otherOpen, 'data-toggle-open');
            html +=
              '<button class="nav-child' + (state.hiddenSubsections[otherPath] ? ' off' : '') + '"' +
              ' data-toggle-sub="' + otherPath + '" title="Show or hide these">' +
              '<span class="nav-child-dot" style="background:' + color + '"></span>' +
              '<span class="nav-name">Other</span>' +
              '<span class="nav-count">' + loose.length + '</span></button>';
            html += '</div>';
            if (otherOpen) html += leafRows(loose);
            html += '</div>';
          } else {
            /* Section has no subsections at all — list its blips directly. */
            html += leafRows(loose);
          }
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

    navEl.querySelectorAll('[data-toggle-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-toggle-open');
        if (state.navOpen[key]) delete state.navOpen[key];
        else state.navOpen[key] = true;
        renderNav();
      });
    });

    navEl.querySelectorAll('[data-toggle-blip]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-toggle-blip');
        if (state.hiddenBlips[id]) delete state.hiddenBlips[id];
        else state.hiddenBlips[id] = true;
        if (state.selectedId === id) state.selectedId = null;
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

  function sortBlips(list) {
    var byName = function (a, b) {
      return a.name.localeCompare(b.name);
    };

    if (state.sortBy === 'section') {
      return list.sort(function (a, b) {
        return sectionPath(a).localeCompare(sectionPath(b)) || byName(a, b);
      });
    }

    if (state.sortBy === 'tag') {
      /* Untagged blips sort last rather than first. */
      var key = function (b) {
        return b.tags.length ? b.tags.slice().sort()[0].toLowerCase() : '\uffff';
      };
      return list.sort(function (a, b) {
        return key(a).localeCompare(key(b)) || byName(a, b);
      });
    }

    return list.sort(byName);
  }

  function renderList() {
    var blips = sortBlips(visibleBlips());

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
        '<span class="blip-row-sub">' +
        blip.tags
          .map(function (t) {
            return '<span class="row-tag" style="color:' + tagColor(t) + '">' + escapeHtml(t) + '</span>';
          })
          .join('') +
        escapeHtml(sectionPath(blip)) +
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
        /* Clicking the highlighted row again clears it. */
        if (state.selectedId === blip.id) {
          clearSelection();
          return;
        }
        state.selectedId = blip.id;
        map.setView(gtaToLatLng(blip.x, blip.y), Math.max(map.getZoom(), 1), { animate: true });
        renderList();
        renderMarkers();
        openBlipPopup(blip);
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Account
   * ------------------------------------------------------------------ */

  function suggestButtonHtml() {
    if (!canSuggest()) return '';
    return (
      '<button class="suggest-btn" id="btn-suggest">' +
      window.Icons.icon('plus', 14) + '<span>Suggest a blip</span></button>'
    );
  }

  function wireSuggestButton() {
    var btn = document.getElementById('btn-suggest');
    if (!btn) return;
    btn.addEventListener('click', function () {
      openSuggest(null);
    });
  }

  function renderAccount() {
    var box = document.getElementById('account');
    if (!CONFIG.loginEnabled) {
      box.innerHTML = suggestButtonHtml();
      wireSuggestButton();
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
        suggestButtonHtml() +
        '<div class="account-info">' +
        '<span class="account-icon">' + window.Icons.icon('user', 14) + '</span>' +
        '<span class="account-text"><strong>' + escapeHtml(state.user.label) + '</strong>' +
        '<span>' + (groupNames.length ? escapeHtml(groupNames.join(', ')) : 'No extra groups') + '</span></span>' +
        '<button class="account-btn" id="btn-logout" title="Sign out">' + window.Icons.icon('log-out', 14) + '</button></div>';
      document.getElementById('btn-logout').addEventListener('click', logout);
      wireSuggestButton();
    } else {
      box.innerHTML =
        suggestButtonHtml() +
        '<button class="login-btn" id="btn-login">' +
        window.Icons.icon('log-in', 14) + '<span>Member sign in</span></button>';
      document.getElementById('btn-login').addEventListener('click', openLogin);
      wireSuggestButton();
    }
  }

  function renderAll() {
    renderTags();
    renderNav();
    renderList();
    renderMarkers();
    updateZoneLabels();
    renderAccount();
    document.getElementById('btn-connections').classList.toggle('active', state.showConnections);
    document.getElementById('btn-pins').classList.toggle('active', state.showPins);
    document.getElementById('btn-zones').classList.toggle('active', state.showZones);
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
        payload.groups[g] = {
          blips: state.blips.filter(function (b) {
            return b.group === g;
          }),
          connectors: state.connectors.filter(function (c) {
            return c.group === g;
          })
        };
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
   * Zoom readout — editable
   *
   * Each whole zoom level doubles the scale, so 0 is 100%, 1 is 200%,
   * -1 is 50%. With minZoom -2 and maxZoom 4 that's 25% to 1600%.
   * ------------------------------------------------------------------ */

  var MIN_PCT = Math.round(Math.pow(2, map.getMinZoom()) * 100);
  var MAX_PCT = Math.round(Math.pow(2, map.getMaxZoom()) * 100);

  var zoomValueEl = document.getElementById('zoom-value');
  var zoomInputEl = document.getElementById('zoom-input');

  function zoomToPercent(zoom) {
    return Math.round(Math.pow(2, zoom) * 100);
  }

  function percentToZoom(pct) {
    return Math.log(pct / 100) / Math.LN2;
  }

  function renderZoom() {
    zoomValueEl.textContent = zoomToPercent(map.getZoom()) + '%';
  }

  function openZoomInput() {
    zoomInputEl.value = zoomToPercent(map.getZoom());
    zoomValueEl.hidden = true;
    zoomInputEl.hidden = false;
    zoomInputEl.focus();
    zoomInputEl.select();
  }

  function closeZoomInput() {
    zoomInputEl.hidden = true;
    zoomValueEl.hidden = false;
    renderZoom();
  }

  function applyZoomInput() {
    var pct = parseFloat(String(zoomInputEl.value).replace('%', ''));
    if (isNaN(pct)) {
      closeZoomInput();
      return;
    }
    var clamped = Math.max(MIN_PCT, Math.min(MAX_PCT, pct));
    if (clamped !== pct) toast('Zoom is limited to ' + MIN_PCT + '-' + MAX_PCT + '%');
    map.setZoom(percentToZoom(clamped));
    closeZoomInput();
  }

  zoomValueEl.addEventListener('click', openZoomInput);
  zoomInputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') applyZoomInput();
    if (e.key === 'Escape') closeZoomInput();
  });
  zoomInputEl.addEventListener('blur', closeZoomInput);
  map.on('zoomend', function () {
    renderZoom();
    /* The size is fixed, but whether it still fits its zone is not. */
    updateZoneLabels();
  });
  document.getElementById('zoom-box').title = 'Zoom (' + MIN_PCT + '-' + MAX_PCT + '%) — click to type a value';

  /* ------------------------------------------------------------------ *
   * Resizable split between the section tree and the location list
   * ------------------------------------------------------------------ */

  var SPLIT_KEY = 'blipmap:navHeight';
  var navPane = document.getElementById('nav-tree');
  var handle = document.getElementById('split-handle');

  function setNavHeight(px) {
    var sidebar = document.querySelector('.sidebar');
    var max = Math.max(120, sidebar.clientHeight - 300);
    var clamped = Math.max(90, Math.min(max, px));
    navPane.style.height = clamped + 'px';
    try {
      localStorage.setItem(SPLIT_KEY, String(clamped));
    } catch (err) {
      /* ignore */
    }
  }

  try {
    var storedHeight = parseInt(localStorage.getItem(SPLIT_KEY), 10);
    if (storedHeight) navPane.style.height = storedHeight + 'px';
  } catch (err) {
    /* ignore */
  }

  var dragging = false;

  handle.addEventListener('mousedown', function (e) {
    dragging = true;
    document.body.classList.add('resizing');
    e.preventDefault();
  });

  window.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    setNavHeight(e.clientY - navPane.getBoundingClientRect().top);
  });

  window.addEventListener('mouseup', function () {
    if (!dragging) return;
    dragging = false;
    document.body.classList.remove('resizing');
  });

  handle.addEventListener('dblclick', function () {
    navPane.style.height = '';
    try {
      localStorage.removeItem(SPLIT_KEY);
    } catch (err) {
      /* ignore */
    }
  });

  /* ------------------------------------------------------------------ *
   * Suggestions — hand off to a prefilled Google Form
   * ------------------------------------------------------------------ */

  var SUGGEST = CONFIG.suggestions || {};

  function canSuggest() {
    if (!SUGGEST.enabled || !SUGGEST.formUrl) return false;
    if (SUGGEST.requireLogin !== false && !state.user) return false;
    return true;
  }

  /* Where a new blip would go: the last right-click, else the map centre. */
  function pickedCoords() {
    if (state.lastPick) return state.lastPick;
    var c = map.getCenter();
    var gta = latLngToGta(c.lat, c.lng);
    return { x: round2(gta.x), y: round2(gta.y) };
  }

  /* One line describing what the member was looking at, copied to the
   * clipboard so they can paste it straight into the form. */
  function suggestionContext(blipId) {
    var blip = blipId ? state.byId[blipId] : null;
    var who = state.user ? state.user.username : 'anonymous';

    if (blip) {
      return (
        'Correction — ' + blip.name + ' [' + blip.id + '] — ' +
        sectionPath(blip) + ' — ' +
        f(blip.x) + ', ' + f(blip.y) + ', ' + f(blip.z == null ? 0 : blip.z) +
        ' — from ' + who
      );
    }

    var pick = pickedCoords();
    return 'New blip — ' + f(pick.x) + ', ' + f(pick.y) + ' — from ' + who;
  }

  function openSuggest(blipId) {
    if (!canSuggest()) return;

    if (SUGGEST.copyContext !== false) {
      copyText(suggestionContext(blipId));
      toast('Details copied — paste them into the form');
    } else {
      toast('Form opened in a new tab');
    }

    window.open(SUGGEST.formUrl, '_blank', 'noopener');
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

  /* Clearing the selection. Markers, polygons and connector lines all stop
   * propagation, so a map click only lands on bare ground. */
  function clearSelection() {
    if (!state.selectedId) return;
    state.selectedId = null;
    map.closePopup();
    renderList();
    renderMarkers();
  }

  map.on('click', clearSelection);

  /* Closing a popup with its X should deselect too — but switching
   * straight to another blip fires popupclose before popupopen, so check
   * on the next tick whether a popup is actually gone. */
  map.on('popupclose', function () {
    setTimeout(function () {
      if (!document.querySelector('.leaflet-popup')) clearSelection();
    }, 0);
  });

  document.getElementById('sort-by').addEventListener('change', function (e) {
    state.sortBy = e.target.value;
    renderList();
  });

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

  document.getElementById('btn-pins').addEventListener('click', function () {
    state.showPins = !state.showPins;
    renderAll();
    toast(state.showPins ? 'Blips shown' : 'Blips hidden');
  });

  document.getElementById('btn-zones').addEventListener('click', function () {
    state.showZones = !state.showZones;
    renderAll();
    toast(state.showZones ? 'Zones shown' : 'Zones hidden');
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
      clearSelection();
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
      state.lastPick = { x: round2(gta.x), y: round2(gta.y) };
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
  renderZoom();
  loadPublicBlips();
  loadPlaintextGroups();
  restoreSession();
  renderAll();
})();
