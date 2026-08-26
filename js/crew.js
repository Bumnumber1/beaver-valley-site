/* ============================================================
   BEAVER VALLEY — Staff-only crew manifest portal
   Static-site app: trivial login gate, autosaving contract form
   (70 crew characters per the Sept 2026 creative-services
   agreement), optional portraits, Sam's completed prior work
   (50 BVPD/A.S.S. officers pulled from the game records) shown
   read-only for reference, JSON export for hand-off, an
   optional cloud-sync endpoint, and a review/extract console
   for Jeremy.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- accounts (owner's spec; not a security boundary) ---------------- */
  var ACCOUNTS = { SAM: 'Nutsack', JEREMY: 'Nutlick', MALCOLM: 'Dumpster' };
  var REVIEWERS = { JEREMY: true };
  var CONTACT_EMAIL = 'bumnumber1@gmail.com';

  /* ---------------- cloud sync (VITAL storage) ----------------
     When SYNC_URL is set to a deployed Google Apps Script web-app URL
     (see sync/README.md in this repo), every contributor's text data is
     pushed automatically ~60 s after each change and on export — so the
     work is stored server-side in Jeremy's Google Sheet, not only in the
     contributor's browser. Portrait uploads push separately the moment
     they change. Empty string = local + export-file only.

     SHARED LIVE DOCUMENT: all three logins work on ONE shared manifest.
     Every slot carries a last-edited timestamp; pushes merge on the server
     (newest edit per slot wins) and every client pulls the merged copy —
     on login, after each push, when the tab regains focus, and every
     minute. A slot you are actively typing in is never overwritten. */
  var SYNC_URL = 'https://script.google.com/macros/s/AKfycbzDjBaJwX6OwThFY3JI9zlw-cOdHGuBLNv8YGcrjBW5wz2A2Ndv2WYGajWa-S8Gmshf/exec';
  var SYNC_DEBOUNCE_MS = 15000;
  var PULL_MS = 60000;

  /* ---------------- rank vocabularies ---------------- */
  var RANKS = {
    USN: ['Commander (CO)', 'Lieutenant Commander (XO)', 'Lieutenant', 'Lieutenant (JG)',
      'Ensign', 'Chief Warrant Officer', 'Master Chief Petty Officer (COB)',
      'Senior Chief Petty Officer', 'Chief Petty Officer', 'Petty Officer 1st Class',
      'Petty Officer 2nd Class', 'Petty Officer 3rd Class', 'Seaman', 'Seaman Apprentice'],
    RUN: ['Kapitan 1st Rank', 'Kapitan 2nd Rank', 'Kapitan 3rd Rank', 'Kapitan-Leytenant',
      'Senior Leytenant', 'Leytenant', 'Michman', 'Chief Ship Starshina',
      'Starshina 1st Class', 'Starshina 2nd Class', 'Senior Matros', 'Matros'],
    USCG: ['Lieutenant Commander', 'Lieutenant', 'Lieutenant (JG)', 'Ensign',
      'Chief Petty Officer', 'Petty Officer 1st Class', 'Petty Officer 2nd Class',
      'Petty Officer 3rd Class', 'Seaman'],
    CIV: ['Captain (Master)', 'Chief Mate', 'Second Mate', 'Chief Engineer', 'Second Engineer',
      'Bosun', 'Able Seaman', 'Ordinary Seaman', 'Deckhand', 'Cook', 'Steward', 'Purser'],
    SCI: ['Civilian — Lead Scientist', 'Civilian — Scientist', 'Civilian — Research Engineer',
      'Civilian — Lab Technician'],
    AF: ['Colonel', 'Lieutenant Colonel', 'Major', 'Captain', 'First Lieutenant',
      'Second Lieutenant', 'Civilian Test Pilot'],
    /* Band members use the same slot as a crew character — the rank field
       carries the instrument instead. */
    BAND: ['Lead Vocals', 'Vocals & Guitar', 'Vocals & Bass', 'Vocals & Keyboards',
      'Backing Vocals', 'Lead Guitar', 'Rhythm Guitar', 'Bass Guitar', 'Drums',
      'Percussion', 'Keyboards / Piano', 'Organ', 'Synthesizer', 'Accordion',
      'Harmonica', 'Banjo', 'Mandolin', 'Fiddle / Violin', 'Cello', 'Saxophone',
      'Trumpet', 'Trombone', 'Flute', 'Turntables / DJ', 'Sampler / Programming',
      'Bagpipes', 'Kazoo', 'Whatever is lying around']
  };
  var CUSTOM = 'Other / custom…';

  /* ---------------- contract roster (totals must equal 70) ---------------- */
  var GROUPS = [
    { id: 'frigate', label: 'Beaver Valley Frigate — Crew', count: 11, ranks: 'USN' },
    { id: 'bvsub', label: 'Beaver Valley Submarine — Crew', count: 11, ranks: 'USN' },
    { id: 'ferret', label: 'Russian Ferret Destroyer — Crew', count: 11, ranks: 'RUN' },
    { id: 'otter', label: 'Russian Otter Submarine — Crew', count: 11, ranks: 'RUN' },
    { id: 'tankers', label: 'Shit Tankers (Two Ships) — Combined Crews', count: 16, ranks: 'CIV', ship: true },
    { id: 'ferry', label: 'A.S.S. Self-Deportation Ferry — Civilian Crew', count: 4, ranks: 'CIV' },
    { id: 'coastguard', label: 'Beaver Valley Coast Guard', count: 4, ranks: 'USCG' },
    { id: 'scientist', label: 'Experimental Weapons Scientist', count: 1, ranks: 'SCI' },
    { id: 'porcupine', label: 'Porcupine Experimental Fighter Pilot', count: 1, ranks: 'AF' }
  ];

  /* ================= BANDS & ALBUMS =================
     One collapsible block per band: the band's name, front and back album
     art, 3–5 member profiles (identical in shape to a crew character, with
     the instrument in place of the rank), a track list whose length the
     contributor sets, and one lyrics box per track.

     TO ADD ANOTHER BAND: add one entry to BANDS below. Everything else —
     storage, the shared live document, portraits, export, CSV and the
     reviewer console — is derived from it. Two rules for the id:
       • letters only, a–z (the server parses shared portrait filenames as
         <group>-<nn>-<name>.jpg with an [a-z]+ group — a digit would make
         album art invisible to every other signed-in browser), and
       • never reuse or rename an existing id: it is the storage key, so a
         rename orphans everything already written under the old one.

     WHY BAND DATA IS SHAPED LIKE CREW SLOTS: the sync server merges any
     group of {name, rank, role, ship, desc, personality, goal, t} records,
     newest edit per slot winning. Modelling bands on that shape means the
     shared document, the merge, the Drive backups, the Roster sheet and the
     portrait pipeline all handle bands with NO server-side change:
       <id>        → member profiles (rank = instrument)
       <id>meta    → slot 0 only: name = band name, role = member count,
                     ship = track count
       <id>tracks  → slot i: name = track title, personality = lyrics
       <id>cover   → album art only (no text): 0 = front, 1 = back
     The friendly, readable shape is rebuilt for the export and the reviewer
     console by buildPayloadText(); this is only how it travels and stores. */
  var BANDS = [
    { id: 'bandone', label: 'The Band' }
  ];

  var MIN_MEMBERS = 3, MAX_MEMBERS = 5, DEFAULT_MEMBERS = 4;
  var MAX_TRACKS = 30, DEFAULT_TRACKS = 10;

  BANDS.forEach(function (b) {
    GROUPS.push({
      id: b.id, label: b.label + ' — Members', count: MAX_MEMBERS, ranks: 'BAND',
      band: b.id, kind: 'members',
      rankLabel: 'Instrument', rankCustomLabel: 'Other instrument (when "Other" is selected)',
      rankPlaceholder: 'Their instrument', rankEmpty: '— select instrument —',
      roleLabel: 'Role in the band',
      rolePlaceholder: 'e.g., Frontman, Songwriter, Founder, Hired gun',
      persPlaceholder: 'Who are they? Temperament, quirks, history, and how they get on with the rest of the band and the wider Valley.',
      goalHint: 'A member counts as complete once they have a name, personality notes, and a world goal. Portrait, instrument and physical description welcome.'
    });
    GROUPS.push({ id: b.id + 'meta', label: b.label + ' — Details', count: 1,
      ranks: 'BAND', band: b.id, kind: 'meta' });
    GROUPS.push({ id: b.id + 'tracks', label: b.label + ' — Tracks', count: MAX_TRACKS,
      ranks: 'BAND', band: b.id, kind: 'tracks' });
  });

  /* Album art is images with no text record, so it is a portrait-only
     pseudo-group: it never enters `data`, only the portrait pipeline. */
  var COVER_GROUPS = BANDS.map(function (b) {
    return { id: b.id + 'cover', label: b.label + ' — Album Art', count: 2,
      names: ['Front Cover', 'Back Cover'], band: b.id, kind: 'cover' };
  });

  function crewGroups() {
    return GROUPS.filter(function (g) { return !g.band; });
  }
  function portraitGroups() { return GROUPS.concat(COVER_GROUPS); }
  function groupById(id) {
    return GROUPS.filter(function (g) { return g.id === id; })[0];
  }

  /* ---------------- starting structure (pre-filled ranks & billets) ----------------
     Each slot arrives pre-assigned in Beaver Valley Navy rank order — CO down to the
     deck — so Sam has a place to start. These are only suggestions: a slot he has
     touched keeps his data untouched, and every rank and role stays editable. */
  var PREFILL = {
    frigate: [
      { rank: 'Commander (CO)', role: 'Commanding Officer' },
      { rank: 'Lieutenant Commander (XO)', role: 'Executive Officer' },
      { rank: 'Lieutenant', role: 'Weapons Officer (WEPS)' },
      { rank: 'Lieutenant', role: 'ASW Helicopter Pilot' },
      { rank: 'Lieutenant (JG)', role: 'Navigator' },
      { rank: 'Ensign', role: 'Communications Officer' },
      { rank: 'Master Chief Petty Officer (COB)', role: 'Command Master Chief' },
      { rank: 'Chief Petty Officer', role: 'Sonar Chief' },
      { rank: 'Petty Officer 1st Class', role: 'Gunner’s Mate (Deck Gun & CIWS)' },
      { rank: 'Petty Officer 2nd Class', role: 'Radar / CIC Operator' },
      { rank: 'Seaman', role: 'Deckhand & Lookout' }
    ],
    bvsub: [
      { rank: 'Commander (CO)', role: 'Commanding Officer' },
      { rank: 'Lieutenant Commander (XO)', role: 'Executive Officer' },
      { rank: 'Lieutenant', role: 'Weapons Officer (WEPS)' },
      { rank: 'Lieutenant', role: 'Navigator / Operations Officer' },
      { rank: 'Lieutenant (JG)', role: 'Engineering Officer' },
      { rank: 'Ensign', role: 'Sonar Officer' },
      { rank: 'Master Chief Petty Officer (COB)', role: 'Chief of the Boat' },
      { rank: 'Chief Petty Officer', role: 'Sonar Chief' },
      { rank: 'Petty Officer 1st Class', role: 'Torpedoman' },
      { rank: 'Petty Officer 2nd Class', role: 'Helmsman / Planesman' },
      { rank: 'Seaman', role: 'Mess & Auxiliary' }
    ],
    ferret: [
      { rank: 'Kapitan 2nd Rank', role: 'Commanding Officer' },
      { rank: 'Kapitan 3rd Rank', role: 'Executive Officer (Starpom)' },
      { rank: 'Kapitan-Leytenant', role: 'Weapons Officer' },
      { rank: 'Senior Leytenant', role: 'Air-Defense Officer' },
      { rank: 'Senior Leytenant', role: 'Navigator' },
      { rank: 'Leytenant', role: 'Communications Officer' },
      { rank: 'Michman', role: 'Missile Systems Technician' },
      { rank: 'Chief Ship Starshina', role: 'Senior NCO of the Ship' },
      { rank: 'Starshina 1st Class', role: 'Gun Crew Chief' },
      { rank: 'Starshina 2nd Class', role: 'Radar Operator' },
      { rank: 'Matros', role: 'Deckhand' }
    ],
    otter: [
      { rank: 'Kapitan 1st Rank', role: 'Commanding Officer' },
      { rank: 'Kapitan 3rd Rank', role: 'Executive Officer (Starpom)' },
      { rank: 'Kapitan-Leytenant', role: 'Torpedo & Weapons Officer' },
      { rank: 'Senior Leytenant', role: 'Engineering Officer' },
      { rank: 'Leytenant', role: 'Navigator' },
      { rank: 'Leytenant', role: 'Sonar Officer' },
      { rank: 'Michman', role: 'Torpedo Technician' },
      { rank: 'Chief Ship Starshina', role: 'Senior NCO of the Boat' },
      { rank: 'Starshina 1st Class', role: 'Helmsman / Planesman' },
      { rank: 'Starshina 2nd Class', role: 'Electrician' },
      { rank: 'Senior Matros', role: 'Cook & Auxiliary' }
    ],
    tankers: [
      { rank: 'Captain (Master)', role: 'Ship’s Master', ship: 'Tanker 1' },
      { rank: 'Chief Mate', role: 'Cargo & Deck Officer', ship: 'Tanker 1' },
      { rank: 'Second Mate', role: 'Navigation Watch Officer', ship: 'Tanker 1' },
      { rank: 'Chief Engineer', role: 'Chief of the Engine Room', ship: 'Tanker 1' },
      { rank: 'Second Engineer', role: 'Pump & Engine Watch', ship: 'Tanker 1' },
      { rank: 'Bosun', role: 'Deck Boss', ship: 'Tanker 1' },
      { rank: 'Able Seaman', role: 'Helm & Deck Watch', ship: 'Tanker 1' },
      { rank: 'Cook', role: 'Ship’s Cook', ship: 'Tanker 1' },
      { rank: 'Captain (Master)', role: 'Ship’s Master', ship: 'Tanker 2' },
      { rank: 'Chief Mate', role: 'Cargo & Deck Officer', ship: 'Tanker 2' },
      { rank: 'Second Mate', role: 'Navigation Watch Officer', ship: 'Tanker 2' },
      { rank: 'Chief Engineer', role: 'Chief of the Engine Room', ship: 'Tanker 2' },
      { rank: 'Second Engineer', role: 'Pump & Engine Watch', ship: 'Tanker 2' },
      { rank: 'Bosun', role: 'Deck Boss', ship: 'Tanker 2' },
      { rank: 'Able Seaman', role: 'Helm & Deck Watch', ship: 'Tanker 2' },
      { rank: 'Cook', role: 'Ship’s Cook', ship: 'Tanker 2' }
    ],
    ferry: [
      { rank: 'Captain (Master)', role: 'Ferry Master' },
      { rank: 'Chief Mate', role: 'Mate & Loading Officer' },
      { rank: 'Chief Engineer', role: 'Engineer' },
      { rank: 'Deckhand', role: 'Deckhand & Passenger Wrangler' }
    ],
    coastguard: [
      { rank: 'Lieutenant', role: 'Commanding Officer' },
      { rank: 'Chief Petty Officer', role: 'Executive Petty Officer' },
      { rank: 'Petty Officer 2nd Class', role: 'Boatswain’s Mate (Boarding Team)' },
      { rank: 'Seaman', role: 'Crewman' }
    ],
    scientist: [
      { rank: 'Civilian — Lead Scientist', role: 'Experimental Weapons Program Lead' }
    ],
    porcupine: [
      { rank: 'Major', role: 'Porcupine Experimental Test Pilot' }
    ]
  };

  /* ---------------- state ---------------- */
  var user = null;
  var data = null;       // { groupId: [ {name, rank, rankCustom, role, ship, desc, personality, goal, t} ] }
  var messages = [];     // shared dispatch board: [ {id, u, t, text} ]
  var saveTimer = null;

  function dataKey() { return 'bvcrew.v1.' + user + '.data'; }
  function timeKey() { return 'bvcrew.v1.' + user + '.time'; }
  function snapKey() { return 'bvcrew.v1.' + user + '.snapshots'; }
  function msgsKey() { return 'bvcrew.v1.SHARED.msgs'; }

  function blankSlot() {
    return { name: '', rank: '', rankCustom: '', role: '', ship: '', desc: '',
      personality: '', goal: '', t: 0 };
  }

  /* combined text weight — breaks last-write ties (real content beats prefill) */
  function slotWeight(s) {
    return (s.name || '').length + (s.role || '').length + (s.desc || '').length +
      (s.personality || '').length + (s.goal || '').length;
  }
  /* deterministic final tie-break: identical rule on client and server */
  function slotKey(s) {
    return [s.name, s.rank, s.rankCustom, s.role, s.ship, s.desc, s.personality, s.goal]
      .map(function (v) { return v || ''; }).join('\u0001');
  }

  /* ---------------- band accessors ----------------
     A band's three scalars live in its single `<id>meta` slot (see the BANDS
     comment above). Counts are read through a clamp, so a corrupt or
     hand-edited value can never render a negative or absurd number of rows. */
  function metaSlot(b) { return data[b.id + 'meta'][0]; }
  function bandNameOf(b) { return (metaSlot(b).name || '').trim(); }
  function clampCount(raw, min, max, dflt) {
    var n = parseInt(raw, 10);
    if (!isFinite(n)) n = dflt;
    return Math.max(min, Math.min(max, n));
  }
  function memberCountOf(b) {
    return clampCount(metaSlot(b).role, MIN_MEMBERS, MAX_MEMBERS, DEFAULT_MEMBERS);
  }
  function trackCountOf(b) {
    return clampCount(metaSlot(b).ship, 1, MAX_TRACKS, DEFAULT_TRACKS);
  }
  function trackNamed(s) { return (s.name || '').trim() !== ''; }

  function loadData() {
    var raw = null;
    try { raw = localStorage.getItem(dataKey()); } catch (e) { }
    var parsed = null;
    if (raw) { try { parsed = JSON.parse(raw); } catch (e) { parsed = null; } }
    if (!parsed) {
      // main record missing or corrupt — offer the newest local snapshot
      var snaps = loadSnapshots();
      if (snaps.length && confirm('No current entry data was found, but a local backup snapshot from ' +
        new Date(snaps[snaps.length - 1].t).toLocaleString() + ' exists. Restore it?')) {
        parsed = snaps[snaps.length - 1].data;
      }
    }
    data = {};
    GROUPS.forEach(function (g) {
      var arr = (parsed && Array.isArray(parsed[g.id])) ? parsed[g.id] : [];
      data[g.id] = [];
      for (var i = 0; i < g.count; i++) {
        var s = arr[i] || {};
        var slot = blankSlot();
        Object.keys(slot).forEach(function (k) {
          if (typeof slot[k] === 'string' && typeof s[k] === 'string') slot[k] = s[k];
        });
        if (typeof s.t === 'number' && isFinite(s.t)) slot.t = s.t;
        // untouched slot → seed the suggested rank/billet (BV Navy rank order).
        // t must be 0 too: a slot someone deliberately CLEARED (t > 0) stays
        // cleared — otherwise the prefill would resurrect and re-propagate.
        var untouched = slot.t === 0 && Object.keys(slot).every(function (k) {
          return typeof slot[k] !== 'string' || slot[k] === '';
        });
        var pf = PREFILL[g.id] && PREFILL[g.id][i];
        if (untouched && pf) {
          slot.rank = pf.rank || '';
          slot.role = pf.role || '';
          if (pf.ship) slot.ship = pf.ship;
        }
        data[g.id].push(slot);
      }
    });
  }

  function loadSnapshots() {
    try {
      var s = JSON.parse(localStorage.getItem(snapKey()) || '[]');
      return Array.isArray(s) ? s : [];
    } catch (e) { return []; }
  }

  var lastSnapshotAt = 0;
  function maybeSnapshot() {
    var now = Date.now();
    if (now - lastSnapshotAt < 5 * 60 * 1000) return;
    lastSnapshotAt = now;
    var snaps = loadSnapshots();
    snaps.push({ t: now, data: data });
    if (snaps.length > 8) snaps = snaps.slice(-8);
    try { localStorage.setItem(snapKey(), JSON.stringify(snaps)); } catch (e) { }
  }

  function saveData() {
    try { localStorage.setItem(dataKey(), JSON.stringify(data)); } catch (e) { }
    maybeSnapshot();
    var el = document.getElementById('saveState');
    if (el) {
      el.textContent = 'Saved ' + new Date().toLocaleTimeString();
      clearTimeout(saveData._t);
      saveData._t = setTimeout(function () {
        el.textContent = 'All changes save automatically in this browser.';
      }, 4000);
    }
  }

  function queueSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { saveData(); refreshProgress(); }, 400);
    scheduleSync();
  }

  /* ---------------- shared dispatch board (messages) ---------------- */
  function loadMessages() {
    try {
      var m = JSON.parse(localStorage.getItem(msgsKey()) || '[]');
      messages = Array.isArray(m) ? m : [];
    } catch (e) { messages = []; }
  }
  function saveMessages() {
    messages.sort(function (a, b) { return a.t - b.t; });
    if (messages.length > 500) messages = messages.slice(-500);
    try { localStorage.setItem(msgsKey(), JSON.stringify(messages)); } catch (e) { }
  }
  /* union by id; true when anything new arrived */
  function mergeMessages(remote) {
    if (!Array.isArray(remote)) return false;
    var have = {};
    messages.forEach(function (m) { have[m.id] = true; });
    var changed = false;
    remote.forEach(function (m) {
      if (m && m.id && !have[m.id] && typeof m.text === 'string') {
        messages.push({ id: String(m.id), u: String(m.u || '?'),
          t: Number(m.t) || 0, text: String(m.text) });
        changed = true;
      }
    });
    if (changed) saveMessages();
    return changed;
  }
  function postMessage(text) {
    text = String(text || '').trim();
    if (!text) return;
    messages.push({
      id: user + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      u: user, t: Date.now(), text: text
    });
    saveMessages();
    renderDispatches();
    syncNow('dispatch');   // messages are the communication channel — no debounce
  }

  function renderDispatches() {
    var list = document.getElementById('dispatchList');
    if (!list) return;
    list.innerHTML = '';
    if (!messages.length) {
      el('div', { 'class': 'dispatch-empty',
        text: 'No dispatches yet. Anything posted here is seen by everyone who signs in.' }, list);
      return;
    }
    messages.slice(-100).reverse().forEach(function (m) {
      var row = el('div', { 'class': 'dispatch' }, list);
      el('b', { text: m.u }, row);
      el('span', { 'class': 'dispatch-when',
        text: m.t ? new Date(m.t).toLocaleString() : '' }, row);
      el('div', { 'class': 'dispatch-text', text: m.text }, row);
    });
  }

  /* ---------------- portrait store (IndexedDB; too big for localStorage) ---------------- */
  var idb = null;
  function openIdb() {
    return new Promise(function (resolve) {
      if (idb) return resolve(idb);
      if (!window.indexedDB) return resolve(null);
      var req = indexedDB.open('bvcrew', 1);
      req.onupgradeneeded = function () {
        if (!req.result.objectStoreNames.contains('portraits'))
          req.result.createObjectStore('portraits');
      };
      req.onsuccess = function () { idb = req.result; resolve(idb); };
      req.onerror = function () { resolve(null); };
    });
  }
  /* portraits are part of the shared document — one namespace for all logins */
  function portraitKey(groupId, i) { return 'SHARED:' + groupId + ':' + i; }
  function porMapKey() { return 'bvcrew.v1.SHARED.porIds'; }
  function loadPorMap() {
    try {
      var m = JSON.parse(localStorage.getItem(porMapKey()) || '{}');
      return (m && typeof m === 'object') ? m : {};
    } catch (e) { return {}; }
  }
  function savePorMap(m) {
    try { localStorage.setItem(porMapKey(), JSON.stringify(m)); } catch (e) { }
  }
  function idbPut(key, value) {
    return openIdb().then(function (db) {
      if (!db) return;
      return new Promise(function (resolve) {
        var tx = db.transaction('portraits', 'readwrite');
        tx.objectStore('portraits').put(value, key);
        tx.oncomplete = resolve; tx.onerror = resolve;
      });
    });
  }
  function idbGet(key) {
    return openIdb().then(function (db) {
      if (!db) return null;
      return new Promise(function (resolve) {
        var req = db.transaction('portraits').objectStore('portraits').get(key);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { resolve(null); };
      });
    });
  }
  function idbDelete(key) {
    return openIdb().then(function (db) {
      if (!db) return;
      return new Promise(function (resolve) {
        var tx = db.transaction('portraits', 'readwrite');
        tx.objectStore('portraits').delete(key);
        tx.oncomplete = resolve; tx.onerror = resolve;
      });
    });
  }

  /* Downscale an uploaded image to a sane size (JPEG). Portraits are thumbnails
     at 512 px; album art is looked at full-size, so it is given more room. */
  function shrinkImage(file, maxPx) {
    maxPx = maxPx || 512;
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * scale));
        c.height = Math.max(1, Math.round(img.height * scale));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('bad image')); };
      img.src = url;
    });
  }

  /* ---------------- engagement telemetry (session analytics) ----------------
     Counts a 5-second slice as active when the tab has focus AND there was
     keyboard/pointer input within the last 90 seconds. Attributed to the group
     the contributor last touched. Carried inside the export payload (meta.sig)
     and surfaced only in the reviewer console. */
  var tele = null;
  var lastInput = 0;
  var currentGroup = '';
  var TICK = 5, IDLE_MS = 90000;

  function loadTele() {
    var raw = null;
    try { raw = localStorage.getItem(timeKey()); } catch (e) { }
    tele = null;
    if (raw) { try { tele = JSON.parse(raw); } catch (e) { tele = null; } }
    if (!tele || typeof tele !== 'object') tele = { total: 0, byGroup: {}, sessions: [] };
    if (typeof tele.total !== 'number') tele.total = 0;
    if (!tele.byGroup) tele.byGroup = {};
    if (!Array.isArray(tele.sessions)) tele.sessions = [];
    tele.sessions.push({ s: new Date().toISOString(), e: null, a: 0 });
    if (tele.sessions.length > 300) tele.sessions = tele.sessions.slice(-300);
  }

  function saveTele() {
    try { localStorage.setItem(timeKey(), JSON.stringify(tele)); } catch (e) { }
  }

  function teleTick() {
    if (!user || !tele) return;
    if (!document.hasFocus()) return;
    if (Date.now() - lastInput > IDLE_MS) return;
    tele.total += TICK;
    if (currentGroup) tele.byGroup[currentGroup] = (tele.byGroup[currentGroup] || 0) + TICK;
    var s = tele.sessions[tele.sessions.length - 1];
    if (s) { s.a += TICK; s.e = new Date().toISOString(); }
    if (tele.total % 30 === 0) saveTele();
  }

  function encodeTele() {
    var payload = { v: 1, u: user, total: tele.total, byGroup: tele.byGroup,
      sessions: tele.sessions.filter(function (s) { return s.a > 0; }) };
    return b64(JSON.stringify(payload));
  }

  function b64(str) { return btoa(unescape(encodeURIComponent(str))); }
  function unb64(str) { return decodeURIComponent(escape(atob(str))); }

  /* ---------------- login ---------------- */
  function tryAuthFromSession() {
    var u = null;
    try { u = sessionStorage.getItem('bvcrew.auth'); } catch (e) { }
    if (u && ACCOUNTS[u]) enter(u);
  }

  function enter(u) {
    user = u;
    try { sessionStorage.setItem('bvcrew.auth', u); } catch (e) { }
    document.getElementById('gate').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('whoami').textContent = u;
    if (REVIEWERS[u]) document.getElementById('review').classList.remove('hidden');
    loadData();
    loadTele();
    loadMessages();
    renderGroups();   // resets slotEls — bands must register after it
    renderBands();
    renderDispatches();
    renderPrior();
    refreshProgress();
    refreshSyncChip('idle');
    pullShared('login');
    if (!enter._pollArmed) {
      enter._pollArmed = true;
      setInterval(function () {
        if (!document.hidden) pullShared('poll');
      }, PULL_MS);
      window.addEventListener('focus', function () { pullShared('focus'); });
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) pullShared('visible');
      });
    }
  }

  function logout() {
    if (tele) { saveTele(); }
    try { sessionStorage.removeItem('bvcrew.auth'); } catch (e) { }
    location.reload();
  }

  /* ---------------- dom helper ---------------- */
  function el(tag, attrs, parent) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---------------- form rendering ---------------- */
  var slotEls = {};   // slotEls[groupId][i] = {card, fields, showPortrait} for live remote updates

  function renderGroups() {
    var host = document.getElementById('groups');
    slotEls = {};
    host.innerHTML = '';
    /* band groups render in their own section (renderBands) — they are in
       GROUPS only so storage, sync, portraits and export cover them too */
    crewGroups().forEach(function (g, gi) {
      var det = el('details', { 'class': 'group', 'data-group': g.id }, host);
      if (gi === 0) det.setAttribute('open', '');
      var sum = el('summary', null, det);
      el('h2', { text: g.label }, sum);
      el('span', { 'class': 'gcount', text: g.count + (g.count === 1 ? ' character' : ' characters') }, sum);
      el('span', { 'class': 'gdone', id: 'gdone-' + g.id, text: '0 / ' + g.count }, sum);

      var body = el('div', { 'class': 'gbody' }, det);
      var tools = el('div', { 'class': 'gtools' }, body);
      var copyBtn = el('a', { 'class': 'btn-sm', text: 'Copy this group (JSON)' }, tools);
      copyBtn.addEventListener('click', function () { copyText(groupJson(g), copyBtn); });

      for (var i = 0; i < g.count; i++) body.appendChild(renderSlot(g, i));
    });

    host.addEventListener('focusin', function (ev) {
      var d = ev.target.closest('[data-group]');
      if (d) currentGroup = d.getAttribute('data-group');
    });
  }

  function renderSlot(g, i) {
    var s = data[g.id][i];
    var card = el('div', { 'class': 'slot', 'data-group': g.id });

    var row1 = el('div', { 'class': 'row1' }, card);

    /* portrait uploader */
    var porBox = el('div', { 'class': 'porbox' }, row1);
    var porImg = el('img', { 'class': 'por-thumb hidden', alt: 'portrait' }, porBox);
    var porEmpty = el('div', { 'class': 'por-empty', text: '#' + (i + 1) }, porBox);
    var porFile = el('input', { type: 'file', accept: 'image/*', 'class': 'hidden' }, porBox);
    var porBtns = el('div', { 'class': 'porbtns' }, porBox);
    var porAdd = el('a', { 'class': 'btn-xs', text: 'Portrait' }, porBtns);
    var porDel = el('a', { 'class': 'btn-xs hidden', text: 'Remove' }, porBtns);
    function showPortrait(dataUrl) {
      if (dataUrl) {
        porImg.src = dataUrl;
        porImg.classList.remove('hidden');
        porEmpty.classList.add('hidden');
        porDel.classList.remove('hidden');
        porAdd.textContent = 'Replace';
      } else {
        porImg.removeAttribute('src');
        porImg.classList.add('hidden');
        porEmpty.classList.remove('hidden');
        porDel.classList.add('hidden');
        porAdd.textContent = 'Portrait';
      }
    }
    idbGet(portraitKey(g.id, i)).then(showPortrait);
    porAdd.addEventListener('click', function () { porFile.click(); });
    porFile.addEventListener('change', function () {
      var f = porFile.files && porFile.files[0];
      if (!f) return;
      shrinkImage(f).then(function (dataUrl) {
        idbPut(portraitKey(g.id, i), dataUrl).then(function () {
          showPortrait(dataUrl);
          markDirtyPortrait(g.id, i);   // pushed (and emailed) right away
        });
      }).catch(function () { alert('That file could not be read as an image.'); });
      porFile.value = '';
    });
    porDel.addEventListener('click', function () {
      idbDelete(portraitKey(g.id, i)).then(function () {
        showPortrait(null);
        markDirtyPortrait(g.id, i);
      });
    });

    var fields = el('div', { 'class': 'fields' }, row1);
    var line1 = el('div', { 'class': 'line2' }, fields);
    var nameWrap = el('div', null, line1);
    el('label', { text: 'Character name' }, nameWrap);
    var name = el('input', { type: 'text', placeholder: 'Full name', value: s.name }, nameWrap);

    var rankWrap = el('div', null, line1);
    el('label', { text: g.rankLabel || 'Rank' }, rankWrap);
    var rank = el('select', null, rankWrap);
    el('option', { value: '', text: g.rankEmpty || '— select rank —' }, rank);
    RANKS[g.ranks].forEach(function (r) {
      var o = el('option', { value: r, text: r }, rank);
      if (s.rank === r) o.selected = true;
    });
    var oc = el('option', { value: CUSTOM, text: CUSTOM }, rank);
    if (s.rank === CUSTOM) oc.selected = true;

    var line2 = el('div', { 'class': 'line2' }, fields);
    var roleWrap = el('div', null, line2);
    el('label', { text: g.roleLabel || 'Role / billet aboard' }, roleWrap);
    var role = el('input', { type: 'text',
      placeholder: g.rolePlaceholder || 'e.g., Helm, Sonar, Weapons, Cook, Corpsman',
      value: s.role }, roleWrap);

    var extraWrap = el('div', null, line2);
    var rankCustom, ship = null;
    if (g.ship) {
      el('label', { text: 'Which tanker' }, extraWrap);
      ship = el('select', null, extraWrap);
      ['', 'Tanker 1', 'Tanker 2'].forEach(function (v) {
        var o = el('option', { value: v, text: v === '' ? '— assign ship —' : v }, ship);
        if (s.ship === v) o.selected = true;
      });
      var rcWrap = el('div', { 'class': (s.rank === CUSTOM ? '' : 'hidden') }, fields);
      el('label', { text: 'Custom rank' }, rcWrap);
      rankCustom = el('input', { type: 'text', placeholder: 'Custom rank', value: s.rankCustom }, rcWrap);
      rankCustom._wrap = rcWrap;
    } else {
      el('label', { text: g.rankCustomLabel || 'Custom rank (when "Other" is selected)' }, extraWrap);
      rankCustom = el('input', { type: 'text',
        placeholder: g.rankPlaceholder || 'Custom rank', value: s.rankCustom }, extraWrap);
      rankCustom.disabled = s.rank !== CUSTOM;
    }

    var descWrap = el('div', { 'class': 'full' }, card);
    el('label', { text: 'Physical description' }, descWrap);
    var desc = el('textarea', { rows: '2',
      placeholder: 'Build, face, hair, scars, bearing — what the artist and the game should show.' }, descWrap);
    desc.value = s.desc;

    var persWrap = el('div', { 'class': 'full' }, card);
    el('label', { text: 'Personality & relationship notes' }, persWrap);
    var pers = el('textarea', { rows: '7',
      placeholder: g.persPlaceholder ||
        'Who are they? Temperament, quirks, history, and how they relate to their crewmates and the wider Valley.' }, persWrap);
    pers.value = s.personality;

    var goalWrap = el('div', { 'class': 'full' }, card);
    el('label', { text: 'World goal' }, goalWrap);
    var goal = el('textarea', { rows: '3',
      placeholder: 'What do they want out of the world? (Remember the standing orders above.)' }, goalWrap);
    goal.value = s.goal;
    el('div', { 'class': 'hint',
      text: g.goalHint ||
        'A character counts as complete once it has a name, personality notes, and a world goal. Portrait and physical description welcome.' }, goalWrap);

    function sync() {
      s.name = name.value;
      s.rank = rank.value;
      s.rankCustom = rankCustom ? rankCustom.value : '';
      s.role = role.value;
      s.ship = ship ? ship.value : '';
      s.desc = desc.value;
      s.personality = pers.value;
      s.goal = goal.value;
      s.t = Date.now();
      if (rankCustom) {
        if (rankCustom._wrap) rankCustom._wrap.classList.toggle('hidden', s.rank !== CUSTOM);
        else rankCustom.disabled = s.rank !== CUSTOM;
      }
      card.classList.toggle('done', slotDone(s));
      queueSave();
    }
    [name, rank, role, desc, pers, goal].concat(rankCustom ? [rankCustom] : [])
      .concat(ship ? [ship] : [])
      .forEach(function (inp) { inp.addEventListener('input', sync); inp.addEventListener('change', sync); });

    card.classList.toggle('done', slotDone(s));

    /* registry so a pulled remote edit can update this card in place */
    if (!slotEls[g.id]) slotEls[g.id] = {};
    slotEls[g.id][i] = {
      card: card,
      showPortrait: showPortrait,
      apply: function () {
        var v = data[g.id][i];
        name.value = v.name;
        rank.value = v.rank;
        role.value = v.role;
        if (ship) ship.value = v.ship;
        if (rankCustom) {
          rankCustom.value = v.rankCustom;
          if (rankCustom._wrap) rankCustom._wrap.classList.toggle('hidden', v.rank !== CUSTOM);
          else rankCustom.disabled = v.rank !== CUSTOM;
        }
        desc.value = v.desc;
        pers.value = v.personality;
        goal.value = v.goal;
        card.classList.toggle('done', slotDone(v));
      }
    };
    return card;
  }

  function slotDone(s) {
    return s.name.trim() !== '' && s.personality.trim() !== '' && s.goal.trim() !== '';
  }

  function refreshProgress() {
    var total = 0, done = 0;
    /* the contract total counts CREW only — a band is separate work and must
       not quietly inflate or dilute the 70 */
    crewGroups().forEach(function (g) {
      var gd = 0;
      data[g.id].forEach(function (s) { if (slotDone(s)) gd++; });
      total += g.count; done += gd;
      var chip = document.getElementById('gdone-' + g.id);
      if (chip) {
        chip.textContent = gd + ' / ' + g.count;
        chip.classList.toggle('full', gd === g.count);
      }
    });
    var p = document.getElementById('progTotal');
    if (p) p.textContent = done + ' / ' + total;
    BANDS.forEach(refreshBandChips);
    refreshBandProgress();
  }

  /* toolbar chip: band members written / tracks named, across every band */
  function refreshBandProgress() {
    var p = document.getElementById('progBand');
    if (!p || !BANDS.length || !data) return;
    var mDone = 0, mTotal = 0, tNamed = 0, tTotal = 0;
    BANDS.forEach(function (b) {
      var mc = memberCountOf(b), tc = trackCountOf(b);
      mTotal += mc; tTotal += tc;
      for (var i = 0; i < mc; i++) if (slotDone(data[b.id][i])) mDone++;
      for (var j = 0; j < tc; j++) if (trackNamed(data[b.id + 'tracks'][j])) tNamed++;
    });
    p.innerHTML = '';
    p.appendChild(document.createTextNode('Band: '));
    el('b', { text: mDone + ' / ' + mTotal }, p);
    p.appendChild(document.createTextNode(' members · '));
    el('b', { text: tNamed + ' / ' + tTotal }, p);
    p.appendChild(document.createTextNode(' tracks'));
  }

  /* ---------------- bands: rendering ---------------- */
  var bandEls = {};   // bandEls[bandId] = summary chips + redraw handles

  function renderBands() {
    var host = document.getElementById('bands');
    if (!host) return;
    bandEls = {};
    host.innerHTML = '';
    if (!BANDS.length) return;

    el('h2', { 'class': 'prior-title', text: 'Bands & albums' }, host);
    el('p', { 'class': 'prior-sub',
      text: 'Beaver Valley’s bands play real songs on real stages, and the town hears every ' +
        'word. Give the band a name, its members the same treatment as a crew character, ' +
        'and the album a track list with the lyrics to match.' }, host);

    BANDS.forEach(function (b) { renderBand(b, host); });

    /* one delegated listener for the life of the page — the section is
       re-rendered on import, and re-binding here would stack duplicates */
    if (!renderBands._wired) {
      renderBands._wired = true;
      host.addEventListener('focusin', function (ev) {
        var d = ev.target.closest('[data-group]');
        if (d) currentGroup = d.getAttribute('data-group');
      });
    }
  }

  function renderBand(b, host) {
    var det = el('details', { 'class': 'group bandgroup', 'data-group': b.id }, host);
    det.setAttribute('open', '');
    var sum = el('summary', null, det);
    var titleEl = el('h2', { text: bandNameOf(b) || b.label }, sum);
    var countEl = el('span', { 'class': 'gcount' }, sum);
    var doneEl = el('span', { 'class': 'gdone' }, sum);
    var body = el('div', { 'class': 'gbody' }, det);

    var tools = el('div', { 'class': 'gtools' }, body);
    var copyBtn = el('a', { 'class': 'btn-sm', text: 'Copy this band (JSON)' }, tools);
    copyBtn.addEventListener('click', function () { copyText(bandJson(b), copyBtn); });

    /* ---- band name (the collapsed header shows it) ---- */
    var s1 = el('div', { 'class': 'bandsec' }, body);
    el('h3', { text: 'Band name' }, s1);
    var nameInput = el('input', { 'class': 'bandname', type: 'text',
      placeholder: 'What are they called?' }, s1);
    nameInput.value = metaSlot(b).name || '';
    nameInput.addEventListener('input', function () {
      var m = metaSlot(b);
      m.name = nameInput.value;
      m.t = Date.now();
      titleEl.textContent = bandNameOf(b) || b.label;
      refreshBandChips(b);
      queueSave();
    });

    /* ---- album art ---- */
    var s2 = el('div', { 'class': 'bandsec' }, body);
    el('h3', { text: 'Album cover' }, s2);
    var covers = el('div', { 'class': 'covers' }, s2);
    renderCover(b, 0, 'Front cover', covers);
    renderCover(b, 1, 'Back cover', covers);

    /* ---- members ---- */
    var s3 = el('div', { 'class': 'bandsec' }, body);
    el('h3', { text: 'Members' }, s3);
    var mCtl = el('div', { 'class': 'countctl' }, s3);
    el('label', { text: 'How many members' }, mCtl);
    var mSel = el('select', null, mCtl);
    for (var mi = MIN_MEMBERS; mi <= MAX_MEMBERS; mi++)
      el('option', { value: String(mi), text: String(mi) }, mSel);
    mSel.value = String(memberCountOf(b));
    el('span', { 'class': 'hint',
      text: 'Lowering this hides the extra members — anything already written about them is ' +
        'kept, and comes back if you raise it again.' }, mCtl);
    var mHost = el('div', null, s3);

    function drawMembers() {
      var g = groupById(b.id);
      slotEls[g.id] = {};          // drop handles to the cards being replaced
      mHost.innerHTML = '';
      var n = memberCountOf(b);
      for (var i = 0; i < n; i++) mHost.appendChild(renderSlot(g, i));
    }
    mSel.addEventListener('change', function () {
      var m = metaSlot(b);
      m.role = mSel.value;
      m.t = Date.now();
      drawMembers();
      refreshBandChips(b);
      refreshBandProgress();
      queueSave();
    });

    /* ---- track list ---- */
    var s4 = el('div', { 'class': 'bandsec' }, body);
    el('h3', { text: 'Track list' }, s4);
    var tCtl = el('div', { 'class': 'countctl' }, s4);
    el('label', { text: 'How many tracks' }, tCtl);
    var tSel = el('select', null, tCtl);
    for (var ti = 1; ti <= MAX_TRACKS; ti++)
      el('option', { value: String(ti), text: String(ti) }, tSel);
    tSel.value = String(trackCountOf(b));
    var addTrack = el('a', { 'class': 'btn-sm', text: '+ Add a track' }, tCtl);
    el('span', { 'class': 'hint',
      text: 'The lyrics sheet below follows this list. Lowering the count hides the extra ' +
        'tracks — their titles and lyrics are kept, and come back if you raise it again.' }, tCtl);
    var tHost = el('div', null, s4);

    /* ---- lyrics (one box per track above) ---- */
    var s5 = el('div', { 'class': 'bandsec' }, body);
    el('h3', { text: 'Lyrics' }, s5);
    var lHost = el('div', null, s5);

    function drawTracks() {
      var g = groupById(b.id + 'tracks');
      slotEls[g.id] = {};
      tHost.innerHTML = '';
      lHost.innerHTML = '';
      var n = trackCountOf(b);
      for (var i = 0; i < n; i++) renderTrack(b, g, i, tHost, lHost);
    }
    function setTrackCount(n) {
      n = clampCount(n, 1, MAX_TRACKS, DEFAULT_TRACKS);
      var m = metaSlot(b);
      m.ship = String(n);
      m.t = Date.now();
      tSel.value = String(n);
      drawTracks();
      refreshBandChips(b);
      refreshBandProgress();
      queueSave();
    }
    tSel.addEventListener('change', function () { setTrackCount(tSel.value); });
    addTrack.addEventListener('click', function () { setTrackCount(trackCountOf(b) + 1); });

    bandEls[b.id] = { title: titleEl, count: countEl, done: doneEl };

    drawMembers();
    drawTracks();
    refreshBandChips(b);

    /* Registry entry for the meta slot, so a name or count someone else
       changed lands here on the next pull (and redraws the rows it governs). */
    slotEls[b.id + 'meta'] = {
      0: {
        hasFocus: function () {
          return document.activeElement === nameInput ||
            document.activeElement === mSel || document.activeElement === tSel;
        },
        showPortrait: function () { },
        apply: function () {
          var m = metaSlot(b);
          nameInput.value = m.name || '';
          titleEl.textContent = bandNameOf(b) || b.label;
          var mc = String(memberCountOf(b)), tc = String(trackCountOf(b));
          if (mSel.value !== mc) { mSel.value = mc; drawMembers(); }
          if (tSel.value !== tc) { tSel.value = tc; drawTracks(); }
          refreshBandChips(b);
          refreshBandProgress();
        }
      }
    };
  }

  /* Album art rides the shared-portrait pipeline (IndexedDB → Drive → the
     other browsers), so it needs no storage of its own — only a bigger
     downscale, because a cover is looked at rather than thumbnailed. */
  function renderCover(b, idx, title, parent) {
    var gid = b.id + 'cover';
    var box = el('div', { 'class': 'cover-box' }, parent);
    el('div', { 'class': 'cover-label', text: title }, box);
    var img = el('img', { 'class': 'cover-thumb hidden', alt: title }, box);
    var empty = el('div', { 'class': 'cover-empty',
      text: 'No ' + title.toLowerCase() + ' yet' }, box);
    var file = el('input', { type: 'file', accept: 'image/*', 'class': 'hidden' }, box);
    var btns = el('div', { 'class': 'porbtns' }, box);
    var add = el('a', { 'class': 'btn-xs', text: 'Upload' }, btns);
    var del = el('a', { 'class': 'btn-xs hidden', text: 'Remove' }, btns);

    function show(dataUrl) {
      if (dataUrl) {
        img.src = dataUrl;
        img.classList.remove('hidden');
        empty.classList.add('hidden');
        del.classList.remove('hidden');
        add.textContent = 'Replace';
      } else {
        img.removeAttribute('src');
        img.classList.add('hidden');
        empty.classList.remove('hidden');
        del.classList.add('hidden');
        add.textContent = 'Upload';
      }
    }
    idbGet(portraitKey(gid, idx)).then(show);

    add.addEventListener('click', function () { file.click(); });
    file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f) return;
      shrinkImage(f, 1024).then(function (dataUrl) {
        idbPut(portraitKey(gid, idx), dataUrl).then(function () {
          show(dataUrl);
          markDirtyPortrait(gid, idx);   // pushed (and emailed) right away
        });
      }).catch(function () { alert('That file could not be read as an image.'); });
      file.value = '';
    });
    del.addEventListener('click', function () {
      idbDelete(portraitKey(gid, idx)).then(function () {
        show(null);
        markDirtyPortrait(gid, idx);
      });
    });

    if (!slotEls[gid]) slotEls[gid] = {};
    slotEls[gid][idx] = { card: box, showPortrait: show, apply: function () { } };
  }

  /* One track = a title row up in the list and a lyrics box below it. Both
     halves are the same record, so the lyrics heading always names the track
     the contributor just typed. */
  function renderTrack(b, g, i, tHost, lHost) {
    var s = data[g.id][i];

    var row = el('div', { 'class': 'track-row', 'data-group': g.id }, tHost);
    el('div', { 'class': 'track-num', text: (i + 1) + '.' }, row);
    var title = el('input', { 'class': 'bandfield', type: 'text',
      placeholder: 'Title of track ' + (i + 1) }, row);
    title.value = s.name;

    var block = el('div', { 'class': 'lyric-block', 'data-group': g.id }, lHost);
    var head = el('div', { 'class': 'lyric-head' }, block);
    var ta = el('textarea', { 'class': 'bandfield', rows: '10',
      placeholder: 'Lyrics for track ' + (i + 1) + '…' }, block);
    ta.value = s.personality;

    function relabel() {
      head.innerHTML = '';
      head.appendChild(document.createTextNode('Track ' + (i + 1) + ' — '));
      var t = (title.value || '').trim();
      if (t) el('b', { text: t }, head);
      else el('i', { text: 'untitled' }, head);
    }
    function sync() {
      s.name = title.value;
      s.personality = ta.value;
      s.t = Date.now();
      relabel();
      refreshBandChips(b);
      refreshBandProgress();
      queueSave();
    }
    title.addEventListener('input', sync);
    ta.addEventListener('input', sync);
    relabel();

    slotEls[g.id][i] = {
      hasFocus: function () {
        return row.contains(document.activeElement) || block.contains(document.activeElement);
      },
      showPortrait: function () { },
      apply: function () {
        var v = data[g.id][i];
        title.value = v.name;
        ta.value = v.personality;
        relabel();
      }
    };
  }

  function refreshBandChips(b) {
    var refs = bandEls[b.id];
    if (!refs) return;
    var mc = memberCountOf(b), tc = trackCountOf(b);
    var mDone = 0, tNamed = 0, i;
    for (i = 0; i < mc; i++) if (slotDone(data[b.id][i])) mDone++;
    for (i = 0; i < tc; i++) if (trackNamed(data[b.id + 'tracks'][i])) tNamed++;
    refs.count.textContent = mc + (mc === 1 ? ' member · ' : ' members · ') +
      tc + (tc === 1 ? ' track' : ' tracks');
    refs.done.textContent = mDone + ' / ' + mc + ' written · ' + tNamed + ' / ' + tc + ' titled';
    refs.done.classList.toggle('full',
      mDone === mc && tNamed === tc && bandNameOf(b) !== '');
  }

  function bandJson(b) {
    var p = buildPayloadText();
    var bp = (p.bands || []).filter(function (x) { return x.id === b.id; })[0];
    return JSON.stringify(bp, null, 2);
  }

  /* ---------------- prior work (read-only reference, from the game records) ---------------- */
  function renderPrior() {
    var host = document.getElementById('prior');
    if (!host || !window.BV_PRIOR) return;
    host.innerHTML = '';
    el('h2', { 'class': 'prior-title',
      text: 'Delivered prior work — for reference' }, host);
    el('p', { 'class': 'prior-sub',
      text: 'Sam’s 50 completed officers, exactly as they live in the game today. Read-only.' }, host);

    window.BV_PRIOR.forEach(function (g) {
      var det = el('details', { 'class': 'group ref' }, host);
      var sum = el('summary', null, det);
      el('h2', { text: g.label }, sum);
      el('span', { 'class': 'gcount', text: g.characters.length + ' characters' }, sum);
      el('span', { 'class': 'gdone full', text: 'COMPLETED ✓' }, sum);
      var body = el('div', { 'class': 'gbody' }, det);

      g.characters.forEach(function (c, i) {
        var card = el('div', { 'class': 'slot done refslot' }, body);
        var row1 = el('div', { 'class': 'row1' }, card);
        var porBox = el('div', { 'class': 'porbox' }, row1);
        if (c.portrait) el('img', { 'class': 'por-thumb', src: c.portrait, alt: c.name, loading: 'lazy' }, porBox);
        else el('div', { 'class': 'por-empty', text: '#' + (i + 1) }, porBox);

        var fields = el('div', { 'class': 'fields' }, row1);
        var line1 = el('div', { 'class': 'line2' }, fields);
        var nw = el('div', null, line1);
        el('label', { text: 'Character name' }, nw);
        el('input', { type: 'text', value: c.name, disabled: 'disabled' }, nw);
        var rw = el('div', null, line1);
        el('label', { text: 'Rank' + (c.badge ? ' · badge ' + c.badge : '') }, rw);
        el('input', { type: 'text', value: c.rank, disabled: 'disabled' }, rw);
        var line2 = el('div', { 'class': 'line2' }, fields);
        var dw = el('div', null, line2);
        el('label', { text: 'Department' }, dw);
        el('input', { type: 'text', value: c.role, disabled: 'disabled' }, dw);

        var pw = el('div', { 'class': 'full' }, card);
        el('label', { text: 'Personality (as written into the game)' }, pw);
        var pt = el('textarea', { rows: '4', disabled: 'disabled' }, pw);
        pt.value = c.personality;
        var gw = el('div', { 'class': 'full' }, card);
        el('label', { text: 'World goal' }, gw);
        var gt = el('textarea', { rows: '2', disabled: 'disabled' }, gw);
        gt.value = c.goal;
      });
    });
  }

  /* ---------------- export / import ---------------- */
  function effectiveRank(s) {
    return s.rank === CUSTOM ? (s.rankCustom || 'Custom') : s.rank;
  }

  function buildPayloadText() {
    saveData(); saveTele();
    return {
      format: 'beaver-valley-crew-submission',
      version: 2,
      exported: new Date().toISOString(),
      contributor: user,
      groups: crewGroups().map(function (g) {
        return {
          id: g.id, label: g.label, count: g.count,
          slots: data[g.id].map(function (s, i) {
            var out = {
              n: i + 1, name: s.name, rank: effectiveRank(s), role: s.role,
              desc: s.desc, personality: s.personality, goal: s.goal
            };
            if (g.ship) out.ship = s.ship;
            return out;
          })
        };
      }),
      /* Bands leave in the shape a reader expects, not the slot shape they
         are stored and synced in. Only the rows in play are exported: rows
         hidden behind a lowered count stay in the browser and the shared
         document, but a hand-off file should be the album as it stands. */
      bands: BANDS.map(function (b) {
        var mc = memberCountOf(b), tc = trackCountOf(b);
        return {
          id: b.id,
          label: b.label,
          name: bandNameOf(b),
          memberCount: mc,
          trackCount: tc,
          members: data[b.id].slice(0, mc).map(function (s, i) {
            return { n: i + 1, name: s.name, instrument: effectiveRank(s), role: s.role,
              desc: s.desc, personality: s.personality, goal: s.goal };
          }),
          tracks: data[b.id + 'tracks'].slice(0, tc).map(function (s, i) {
            return { n: i + 1, title: s.name, lyrics: s.personality };
          })
        };
      }),
      meta: { sig: encodeTele() }
    };
  }

  /* Full payload including portraits and album art (async: reads IndexedDB). */
  function buildPayloadFull() {
    var p = buildPayloadText();
    var jobs = [];
    p.groups.forEach(function (g) {
      g.slots.forEach(function (s, i) {
        jobs.push(idbGet(portraitKey(g.id, i)).then(function (img) {
          if (img) s.portrait = img;
        }));
      });
    });
    (p.bands || []).forEach(function (bp) {
      bp.members.forEach(function (m, i) {
        jobs.push(idbGet(portraitKey(bp.id, i)).then(function (img) {
          if (img) m.portrait = img;
        }));
      });
      bp.covers = {};
      jobs.push(idbGet(portraitKey(bp.id + 'cover', 0)).then(function (img) {
        if (img) bp.covers.front = img;
      }));
      jobs.push(idbGet(portraitKey(bp.id + 'cover', 1)).then(function (img) {
        if (img) bp.covers.back = img;
      }));
    });
    return Promise.all(jobs).then(function () { return p; });
  }

  function groupJson(g) {
    var p = buildPayloadText();
    var grp = p.groups.filter(function (x) { return x.id === g.id; })[0];
    return JSON.stringify(grp, null, 2);
  }

  function download(nameStr, text) {
    var blob = new Blob([text], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nameStr;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }

  function copyText(text, btn) {
    function ok() {
      if (!btn) return;
      var old = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(function () { btn.textContent = old; }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, function () { fallbackCopy(text); ok(); });
    } else { fallbackCopy(text); ok(); }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta);
    ta.select(); try { document.execCommand('copy'); } catch (e) { }
    ta.remove();
  }

  function exportAll() {
    buildPayloadFull().then(function (p) {
      var stamp = p.exported.slice(0, 10);
      download('beaver-valley-crew-' + user + '-' + stamp + '.json', JSON.stringify(p, null, 2));
      syncNow('export');
      syncPortraitsNow(true);
      setTimeout(function () {
        alert('Your submission file has downloaded (portraits included).\n\nEmail it to Jeremy at ' + CONTACT_EMAIL +
          ' (subject: "Beaver Valley crew — ' + user + '").\n\nYou can keep working and export again any time — the newest file always contains everything.');
      }, 250);
    });
  }

  function importPrevious() {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'application/json,.json';
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var p = JSON.parse(String(r.result));
          if (p.format !== 'beaver-valley-crew-submission') throw new Error('wrong format');
          if (!confirm('Apply "' + f.name + '"?\n\nFilled-in characters in the file will replace those slots of the SHARED manifest (for everyone). Blank slots in the file are ignored, so this cannot wipe newer work with an old file.')) return;
          var portraitJobs = [];
          p.groups.forEach(function (grp) {
            var g = GROUPS.filter(function (x) { return x.id === grp.id; })[0];
            if (!g || !Array.isArray(grp.slots)) return;
            grp.slots.forEach(function (sl, i) {
              if (i >= g.count || !sl) return;
              /* Only slots with real written content apply — a stale export's
                 blanks must never time-warp everyone's newer shared work. */
              var hasContent = ['name', 'desc', 'personality', 'goal']
                .some(function (k) { return String(sl[k] || '').trim() !== ''; });
              if (!hasContent) return;
              var slot = data[g.id][i];
              slot.name = sl.name || '';
              slot.role = sl.role || '';
              slot.desc = sl.desc || '';
              slot.personality = sl.personality || '';
              slot.goal = sl.goal || '';
              slot.ship = sl.ship || '';
              var rk = sl.rank || '';
              if (rk && RANKS[g.ranks].indexOf(rk) === -1) { slot.rank = CUSTOM; slot.rankCustom = rk; }
              else { slot.rank = rk; slot.rankCustom = ''; }
              slot.t = Date.now();   // an explicit import outranks the shared copy
              if (sl.portrait) portraitJobs.push(idbPut(portraitKey(g.id, i), sl.portrait).then(function () {
                markDirtyPortrait(g.id, i);
              }));
            });
          });
          /* Bands (absent from files exported before bands existed). Same
             rule as the crew above: only rows with something written apply. */
          if (Array.isArray(p.bands)) {
            p.bands.forEach(function (bp) {
              var b = BANDS.filter(function (x) { return x.id === bp.id; })[0];
              if (!b || !bp) return;
              var m = metaSlot(b);
              if (String(bp.name || '').trim()) { m.name = bp.name; m.t = Date.now(); }
              if (bp.memberCount) {
                m.role = String(clampCount(bp.memberCount, MIN_MEMBERS, MAX_MEMBERS, DEFAULT_MEMBERS));
                m.t = Date.now();
              }
              if (bp.trackCount) {
                m.ship = String(clampCount(bp.trackCount, 1, MAX_TRACKS, DEFAULT_TRACKS));
                m.t = Date.now();
              }
              (bp.members || []).forEach(function (mm, i) {
                if (i >= MAX_MEMBERS || !mm) return;
                var hasContent = ['name', 'desc', 'personality', 'goal']
                  .some(function (k) { return String(mm[k] || '').trim() !== ''; });
                if (!hasContent) return;
                var slot = data[b.id][i];
                slot.name = mm.name || '';
                slot.role = mm.role || '';
                slot.desc = mm.desc || '';
                slot.personality = mm.personality || '';
                slot.goal = mm.goal || '';
                slot.ship = '';
                var ins = mm.instrument || '';
                if (ins && RANKS.BAND.indexOf(ins) === -1) { slot.rank = CUSTOM; slot.rankCustom = ins; }
                else { slot.rank = ins; slot.rankCustom = ''; }
                slot.t = Date.now();
                if (mm.portrait) portraitJobs.push(idbPut(portraitKey(b.id, i), mm.portrait)
                  .then(function () { markDirtyPortrait(b.id, i); }));
              });
              (bp.tracks || []).forEach(function (tt, i) {
                if (i >= MAX_TRACKS || !tt) return;
                if (String(tt.title || '').trim() === '' &&
                  String(tt.lyrics || '').trim() === '') return;
                var slot = data[b.id + 'tracks'][i];
                slot.name = tt.title || '';
                slot.personality = tt.lyrics || '';
                slot.t = Date.now();
              });
              [['front', 0], ['back', 1]].forEach(function (c) {
                var img = bp.covers && bp.covers[c[0]];
                if (!img) return;
                portraitJobs.push(idbPut(portraitKey(b.id + 'cover', c[1]), img)
                  .then(function () { markDirtyPortrait(b.id + 'cover', c[1]); }));
              });
            });
          }

          Promise.all(portraitJobs).then(function () {
            saveData();
            renderGroups();
            renderBands();
            refreshProgress();
            syncNow('import');
            syncPortraitsNow(true);
          });
        } catch (e) {
          alert('That does not look like a Beaver Valley crew submission file.');
        }
      };
      r.readAsText(f);
    });
    inp.click();
  }

  /* ---------------- cloud sync ---------------- */
  var syncTimer = null;
  var syncPendingSince = 0;   // oldest unpushed edit — enforces a max wait
  function scheduleSync() {
    if (!SYNC_URL) return;
    if (!syncPendingSince) syncPendingSince = Date.now();
    clearTimeout(syncTimer);
    /* debounce, but never postpone past 45 s of continuous typing */
    var wait = Math.min(SYNC_DEBOUNCE_MS,
      Math.max(1000, syncPendingSince + 45000 - Date.now()));
    syncTimer = setTimeout(function () { syncNow('auto'); }, wait);
  }

  /* Portraits push IMMEDIATELY on upload (a 2 s batcher so a burst of uploads
     arrives as one push/one email). Failed pushes stay in the dirty list and
     retry on the next portrait change or export. */
  var porSyncTimer = null;
  function dirtyKey() { return 'bvcrew.v1.' + user + '.dirtyPortraits'; }
  function loadDirty() {
    try {
      var d = JSON.parse(localStorage.getItem(dirtyKey()) || '[]');
      return Array.isArray(d) ? d : [];
    } catch (e) { return []; }
  }
  /* What the image is called in Drive and in the notification email. Album
     art has no text record behind it, so the cover group names its slots. */
  function portraitSlotName(g, idx) {
    if (g.names) return g.names[idx] || ('#' + (idx + 1));
    return (data[g.id] && data[g.id][idx]) ? data[g.id][idx].name : '';
  }

  var porMarkAt = {};   // when each key was last marked — guards in-flight races
  function markDirtyPortrait(groupId, i) {
    var k = groupId + ':' + i;
    porMarkAt[k] = Date.now();
    var d = loadDirty();
    if (d.indexOf(k) === -1) d.push(k);
    try { localStorage.setItem(dirtyKey(), JSON.stringify(d)); } catch (e) { }
    if (!SYNC_URL) return;
    clearTimeout(porSyncTimer);
    porSyncTimer = setTimeout(function () { syncPortraitsNow(false); }, 2000);
  }
  function syncPortraitsNow(all) {
    if (!SYNC_URL || !user) return Promise.resolve();
    var startedAt = Date.now();
    var keys;
    if (all) {
      keys = [];
      portraitGroups().forEach(function (g) {
        for (var i = 0; i < g.count; i++) keys.push(g.id + ':' + i);
      });
    } else {
      keys = loadDirty();
    }
    if (!keys.length) return Promise.resolve();
    var images = [];
    return Promise.all(keys.map(function (k) {
      var parts = k.split(':');
      var gid = parts[0], idx = parseInt(parts[1], 10);
      var g = portraitGroups().filter(function (x) { return x.id === gid; })[0];
      if (!g || isNaN(idx)) return Promise.resolve();
      return idbGet(portraitKey(gid, idx)).then(function (img) {
        if (all && !img) return; // full pushes skip empty slots
        images.push({
          group: gid, label: g.label, n: idx + 1,
          name: portraitSlotName(g, idx),
          data: img || ''
        });
      });
    })).then(function () {
      if (!images.length) return;
      refreshSyncChip('saving');
      return fetch(SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          format: 'beaver-valley-crew-portraits', version: 2, shared: true,
          contributor: user, exported: new Date().toISOString(), images: images
        })
      }).then(function (r) {
        if (r.ok) {
          /* clear ONLY keys this push carried AND not re-marked mid-flight —
             an upload made during the push stays dirty for the next batch */
          try {
            var still = loadDirty().filter(function (k) {
              return keys.indexOf(k) === -1 || (porMarkAt[k] || 0) > startedAt;
            });
            localStorage.setItem(dirtyKey(), JSON.stringify(still));
            if (still.length) {
              clearTimeout(porSyncTimer);
              porSyncTimer = setTimeout(function () { syncPortraitsNow(false); }, 2000);
            }
          } catch (e) { }
          /* the server minted new file ids — forget ours so the next manifest
             pull re-records them (and other clients pick the images up) */
          var m = loadPorMap();
          images.forEach(function (img) { delete m[img.group + ':' + (img.n - 1)]; });
          savePorMap(m);
          refreshSyncChip('saved');
        } else refreshSyncChip('failed');
      }).catch(function () { refreshSyncChip('failed'); });
    });
  }

  /* ---------------- the shared live document ---------------- */
  function buildSharedPayload() {
    saveData(); saveTele();
    return {
      format: 'beaver-valley-crew-shared',
      version: 1,
      exported: new Date().toISOString(),
      contributor: user,
      doc: {
        groups: GROUPS.map(function (g) {
          return { id: g.id, label: g.label, count: g.count,
            slots: data[g.id].map(function (s) {
              return { name: s.name, rank: s.rank, rankCustom: s.rankCustom,
                role: s.role, ship: s.ship, desc: s.desc,
                personality: s.personality, goal: s.goal, t: s.t || 0 };
            }) };
        }),
        messages: messages
      },
      meta: { sig: encodeTele() }
    };
  }

  /* Merge a remote doc into `data`. MUTATES slot objects in place (each card's
     sync() closure holds the original object). A slot whose card currently
     contains the focused element is left alone entirely — it will converge on
     a later pull once the writer moves on. Newest t wins; on a tie the slot
     with more written content wins (so real work beats the prefill). */
  /* A crew card is one element; a track is two (its title row and its lyrics
     box, in different sections), so band entries answer for themselves. */
  function elRefFocused(elRef) {
    if (!elRef) return false;
    if (typeof elRef.hasFocus === 'function') return elRef.hasFocus();
    return !!(elRef.card && elRef.card.contains(document.activeElement));
  }

  function mergeSharedDoc(doc) {
    var changed = [];
    if (doc && Array.isArray(doc.groups)) {
      doc.groups.forEach(function (rg) {
        var local = data[rg.id];
        if (!local || !Array.isArray(rg.slots)) return;
        rg.slots.forEach(function (rs, i) {
          if (i >= local.length || !rs) return;
          var ls = local[i];
          var rt = Number(rs.t) || 0;
          var lt = Number(ls.t) || 0;
          var rw = slotWeight(rs), lw = slotWeight(ls);
          /* newest wins; ties: more content, then a fixed lexicographic order
             (same rule as the server) so replicas always converge */
          var adopt = rt > lt ||
            (rt === lt && (rw > lw || (rw === lw && slotKey(rs) > slotKey(ls))));
          if (!adopt) return;
          var elRef = slotEls[rg.id] && slotEls[rg.id][i];
          if (elRefFocused(elRef)) return;   // being edited here
          ['name', 'rank', 'rankCustom', 'role', 'ship', 'desc', 'personality', 'goal']
            .forEach(function (k) { ls[k] = typeof rs[k] === 'string' ? rs[k] : ''; });
          ls.t = rt;
          changed.push({ gid: rg.id, i: i });
        });
      });
    }
    var msgsChanged = doc ? mergeMessages(doc.messages) : false;
    if (changed.length) {
      saveData();
      changed.forEach(function (c) {
        var elRef = slotEls[c.gid] && slotEls[c.gid][c.i];
        if (elRef) elRef.apply();
      });
      refreshProgress();
    }
    if (msgsChanged) renderDispatches();
    return changed.length > 0 || msgsChanged;
  }

  var lastPushOkAt = 0;   // doc state up to here is known to be on the server
  var retryTimer = null;
  function syncNow(reason) {
    if (!SYNC_URL || !user) return;
    var attemptedAt = Date.now();
    var body = JSON.stringify(buildSharedPayload());
    refreshSyncChip('saving');
    clearTimeout(retryTimer);
    fetch(SYNC_URL, { method: 'POST', body: body,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('http')); })
      .then(function (out) {
        if (out && out.ok) {
          lastPushOkAt = attemptedAt;
          syncPendingSince = 0;
          if (out.doc) mergeSharedDoc(out.doc);   // the push doubles as a pull
          refreshSyncChip('saved');
        } else syncFailed();
      })
      .catch(function () { syncFailed(); });
  }
  /* a failed push MUST retry — otherwise the next pull overwrites the edit */
  function syncFailed() {
    refreshSyncChip('failed');
    clearTimeout(retryTimer);
    retryTimer = setTimeout(function () { syncNow('retry'); }, 30000);
  }

  /* Pull the shared document (and the shared portrait manifest). */
  var pulling = false;
  function pullShared(reason) {
    if (!SYNC_URL || !user || pulling) return;
    pulling = true;
    fetch(SYNC_URL + '?shared=1')
      .then(function (r) { return r.json(); })
      .then(function (out) {
        pulling = false;
        if (out && out.doc) {
          mergeSharedDoc(out.doc);
          refreshSyncChip('saved');
          /* after the login pull, push once: recovers edits stranded by a
             failed/oversized unload beacon in the previous session */
          if (reason === 'login') syncNow('login');
        }
        if (out && Array.isArray(out.portraits)) applyPortraitManifest(out.portraits);
      })
      .catch(function () { pulling = false; refreshSyncChip('failed'); });
  }

  /* Compare the server's portrait file ids with what we last stored; pull
     anything new/replaced, drop anything deleted. Id-based (not clocks).
     Fetches run ONE at a time (a fresh login may need dozens — parallel
     bursts trip Apps Script's simultaneous-execution cap and starve pushes). */
  function applyPortraitManifest(manifest) {
    var map = loadPorMap();
    var seen = {};
    var dirty = loadDirty();
    var queue = Promise.resolve();
    manifest.forEach(function (p) {
      if (!p || !p.group || !p.id) return;
      var idx = Number(p.n) - 1;
      if (isNaN(idx) || idx < 0) return;
      var key = p.group + ':' + idx;
      seen[key] = true;
      if (map[key] === p.id) return;                 // already have this version
      if (dirty.indexOf(key) !== -1) return;         // our own unpushed change wins
      queue = queue.then(function () {
        return fetch(SYNC_URL + '?portrait=' + encodeURIComponent(p.id))
          .then(function (r) { return r.json(); })
          .then(function (out) {
            if (!out || !out.data) return;
            /* re-check: an upload made while this fetch was in flight wins */
            if (loadDirty().indexOf(key) !== -1) return;
            return idbPut(portraitKey(p.group, idx), out.data).then(function () {
              var m2 = loadPorMap(); m2[key] = p.id; savePorMap(m2);
              var elRef = slotEls[p.group] && slotEls[p.group][idx];
              if (elRef) elRef.showPortrait(out.data);
            });
          })
          .catch(function () { });
      });
    });
    /* removals: previously-synced portraits no longer on the server */
    Object.keys(map).forEach(function (key) {
      if (seen[key] || dirty.indexOf(key) !== -1) return;
      var parts = key.split(':');
      var gid = parts[0], idx = parseInt(parts[1], 10);
      idbDelete(portraitKey(gid, idx)).then(function () {
        var m2 = loadPorMap(); delete m2[key]; savePorMap(m2);
        var elRef = slotEls[gid] && slotEls[gid][idx];
        if (elRef) elRef.showPortrait(null);
      });
    });
  }

  function refreshSyncChip(state) {
    var chip = document.getElementById('syncState');
    if (!chip) return;
    if (!SYNC_URL) { chip.textContent = 'Cloud storage: off (use Export to hand work over)'; return; }
    if (state === 'saving') chip.textContent = 'Shared copy: saving…';
    else if (state === 'saved') chip.textContent = 'Shared copy: in sync ' + new Date().toLocaleTimeString();
    else if (state === 'failed') chip.textContent = 'Shared copy: offline (kept locally, will retry)';
    else chip.textContent = 'One shared manifest — everyone sees everyone’s changes.';
  }

  /* ---------------- reviewer console ---------------- */
  function fmtDuration(sec) {
    sec = Math.max(0, Math.round(sec || 0));
    var h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
    return h > 0 ? (h + 'h ' + m + 'm') : (m + 'm');
  }

  function csvEscape(v) {
    v = String(v == null ? '' : v);
    if (/[",\r\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
    return v;
  }

  function buildCsv(p) {
    var rows = [['Group', '#', 'Name', 'Rank', 'Role', 'Ship', 'Physical Description',
      'Personality & Relationships', 'World Goal', 'Has Portrait']];
    p.groups.forEach(function (g) {
      g.slots.forEach(function (s) {
        rows.push([g.label, s.n, s.name, s.rank, s.role, s.ship || '', s.desc || '',
          s.personality, s.goal, s.portrait ? 'yes' : '']);
      });
    });
    /* band members are characters too — same columns, instrument as rank */
    (p.bands || []).forEach(function (b) {
      (b.members || []).forEach(function (m) {
        rows.push([(b.name || b.label) + ' (band)', m.n, m.name, m.instrument, m.role, '',
          m.desc || '', m.personality, m.goal, m.portrait ? 'yes' : '']);
      });
    });
    return rows.map(function (r) { return r.map(csvEscape).join(','); }).join('\r\n');
  }

  function buildLyricsCsv(p) {
    var rows = [['Band', '#', 'Track title', 'Lyrics']];
    (p.bands || []).forEach(function (b) {
      (b.tracks || []).forEach(function (t) {
        rows.push([b.name || b.label, t.n, t.title, t.lyrics]);
      });
    });
    return rows.map(function (r) { return r.map(csvEscape).join(','); }).join('\r\n');
  }

  function renderReview(p, fileName) {
    var out = document.getElementById('reviewOut');
    out.innerHTML = '';
    if (!p || p.format !== 'beaver-valley-crew-submission') {
      el('p', { text: 'That file is not a Beaver Valley crew submission.', 'class': 'err' }, out);
      return;
    }

    var head = el('div', { 'class': 'timepanel' }, out);
    var headLine = el('div', null, head);
    el('b', { text: p.contributor || 'Unknown' }, headLine);
    headLine.appendChild(document.createTextNode(
      ' — exported ' + new Date(p.exported).toLocaleString() + ' '));
    el('span', { 'style': 'color:var(--muted)', text: '(' + (fileName || '') + ')' }, headLine);

    /* engagement time (decoded from meta.sig) */
    if (p.meta && p.meta.sig) {
      try {
        var t = JSON.parse(unb64(p.meta.sig));
        var tp = el('div', { 'class': 'timepanel' }, out);
        el('div', { html: 'Measured active working time on the form: <b>' + fmtDuration(t.total) + '</b>' +
          ' <span style="color:var(--muted)">(tab focused with recent typing/clicking; idle gaps excluded; time drafting elsewhere is not visible)</span>' }, tp);
        var per = Object.keys(t.byGroup || {}).map(function (k) {
          var g = GROUPS.filter(function (x) { return x.id === k; })[0];
          return (g ? g.label : k) + ': ' + fmtDuration(t.byGroup[k]);
        });
        if (per.length) el('div', { 'style': 'color:var(--muted); margin-top:6px', text: per.join('  ·  ') }, tp);
        if (Array.isArray(t.sessions) && t.sessions.length) {
          el('div', { 'style': 'color:var(--muted); margin-top:6px',
            text: t.sessions.length + ' work session(s), first ' +
              new Date(t.sessions[0].s).toLocaleDateString() + ', latest ' +
              new Date(t.sessions[t.sessions.length - 1].s).toLocaleDateString() }, tp);
        }
      } catch (e) { /* no telemetry available */ }
    }

    var bar = el('div', { 'class': 'gtools', 'style': 'justify-content:flex-start' }, out);
    var csvBtn = el('a', { 'class': 'btn-sm gold', text: 'Download CSV (everything)' }, bar);
    csvBtn.addEventListener('click', function () {
      download('beaver-valley-crew-' + (p.contributor || 'unknown') + '.csv', buildCsv(p));
    });
    var jsonBtn = el('a', { 'class': 'btn-sm', text: 'Copy raw JSON' }, bar);
    jsonBtn.addEventListener('click', function () { copyText(JSON.stringify(p, null, 2), jsonBtn); });

    renderReviewBands(p, out);

    p.groups.forEach(function (g) {
      var gh = el('div', { 'class': 'grouphead' }, out);
      el('h3', { text: g.label }, gh);
      var gBtn = el('a', { 'class': 'btn-sm', text: 'Copy group JSON' }, gh);
      gBtn.addEventListener('click', function () { copyText(JSON.stringify(g, null, 2), gBtn); });

      var hasShip = g.slots.some(function (s) { return s.ship; });
      var hasPor = g.slots.some(function (s) { return s.portrait; });
      var table = el('table', null, out);
      var tr = el('tr', null, el('thead', null, table));
      (hasPor ? ['Portrait'] : []).concat(['#', 'Name', 'Rank', 'Role'])
        .concat(hasShip ? ['Ship'] : [])
        .concat(['Physical Description', 'Personality & Relationships', 'World Goal'])
        .forEach(function (h) { el('th', { text: h }, tr); });
      var tbody = el('tbody', null, table);
      g.slots.forEach(function (s) {
        var row = el('tr', null, tbody);
        if (hasPor) {
          var td = el('td', null, row);
          if (s.portrait) el('img', { src: s.portrait, 'class': 'rev-por', alt: s.name }, td);
        }
        el('td', { text: s.n }, row);
        el('td', { 'class': 'namecell', text: s.name || '—' }, row);
        el('td', { text: s.rank || '—' }, row);
        el('td', { text: s.role || '—' }, row);
        if (hasShip) el('td', { text: s.ship || '—' }, row);
        el('td', { text: s.desc || '—' }, row);
        el('td', { text: s.personality || '—' }, row);
        el('td', { text: s.goal || '—' }, row);
      });
    });
  }

  /* Bands in the reviewer console: the album as delivered — art, the line-up,
     then every track with its lyrics in full. */
  function renderReviewBands(p, out) {
    if (!Array.isArray(p.bands) || !p.bands.length) return;

    p.bands.forEach(function (b) {
      var written = (b.members || []).some(function (m) { return (m.name || '').trim(); }) ||
        (b.tracks || []).some(function (t) { return (t.title || '').trim() || (t.lyrics || '').trim(); }) ||
        (b.name || '').trim() || (b.covers && (b.covers.front || b.covers.back));
      if (!written) return;   // an untouched band is not worth a panel

      var gh = el('div', { 'class': 'grouphead' }, out);
      el('h3', { text: (b.name || b.label) + ' — band' }, gh);
      var jb = el('a', { 'class': 'btn-sm', text: 'Copy band JSON' }, gh);
      jb.addEventListener('click', function () { copyText(JSON.stringify(b, null, 2), jb); });
      var lb = el('a', { 'class': 'btn-sm', text: 'Download lyrics (CSV)' }, gh);
      lb.addEventListener('click', function () {
        download('beaver-valley-lyrics-' + (p.contributor || 'unknown') + '.csv',
          buildLyricsCsv({ bands: [b] }));
      });

      if (b.covers && (b.covers.front || b.covers.back)) {
        var art = el('div', { 'class': 'timepanel', 'style': 'display:flex; gap:16px; align-items:center' }, out);
        ['front', 'back'].forEach(function (side) {
          if (!b.covers[side]) return;
          var wrap = el('div', null, art);
          el('img', { src: b.covers[side], 'class': 'rev-cover', alt: side + ' cover' }, wrap);
          el('div', { 'style': 'color:var(--muted); font-size:.78rem; text-align:center',
            text: side + ' cover' }, wrap);
        });
      }

      var mTable = el('table', null, out);
      var mHasPor = (b.members || []).some(function (m) { return m.portrait; });
      var mtr = el('tr', null, el('thead', null, mTable));
      (mHasPor ? ['Portrait'] : []).concat(['#', 'Name', 'Instrument', 'Role in the band',
        'Physical Description', 'Personality & Relationships', 'World Goal'])
        .forEach(function (h) { el('th', { text: h }, mtr); });
      var mtb = el('tbody', null, mTable);
      (b.members || []).forEach(function (m) {
        var row = el('tr', null, mtb);
        if (mHasPor) {
          var td = el('td', null, row);
          if (m.portrait) el('img', { src: m.portrait, 'class': 'rev-por', alt: m.name }, td);
        }
        el('td', { text: m.n }, row);
        el('td', { 'class': 'namecell', text: m.name || '—' }, row);
        el('td', { text: m.instrument || '—' }, row);
        el('td', { text: m.role || '—' }, row);
        el('td', { text: m.desc || '—' }, row);
        el('td', { text: m.personality || '—' }, row);
        el('td', { text: m.goal || '—' }, row);
      });

      var tTable = el('table', null, out);
      var ttr = el('tr', null, el('thead', null, tTable));
      ['#', 'Track', 'Lyrics'].forEach(function (h) { el('th', { text: h }, ttr); });
      var ttb = el('tbody', null, tTable);
      (b.tracks || []).forEach(function (t) {
        var row = el('tr', null, ttb);
        el('td', { text: t.n }, row);
        el('td', { 'class': 'namecell', text: t.title || '—' }, row);
        el('td', { 'class': 'rev-lyrics', text: t.lyrics || '—' }, row);
      });
    });
  }

  function wireReview() {
    var dz = document.getElementById('dropzone');
    var fi = document.getElementById('fileInput');
    if (!dz) return;
    dz.addEventListener('click', function () { fi.click(); });
    dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('hover'); });
    dz.addEventListener('dragleave', function () { dz.classList.remove('hover'); });
    dz.addEventListener('drop', function (e) {
      e.preventDefault(); dz.classList.remove('hover');
      var f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) readReviewFile(f);
    });
    fi.addEventListener('change', function () {
      var f = fi.files && fi.files[0];
      if (f) readReviewFile(f);
    });
  }

  function readReviewFile(f) {
    var r = new FileReader();
    r.onload = function () {
      var p = null;
      try { p = JSON.parse(String(r.result)); } catch (e) { }
      renderReview(p, f.name);
    };
    r.readAsText(f);
  }

  /* ---------------- boot ---------------- */
  document.getElementById('gateForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var u = document.getElementById('gateUser').value.trim().toUpperCase();
    var pw = document.getElementById('gatePass').value;
    if (ACCOUNTS[u] && ACCOUNTS[u] === pw) enter(u);
    else document.getElementById('gateErr').textContent = 'Not on the manifest. Try again.';
  });

  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('exportBtn').addEventListener('click', exportAll);
  document.getElementById('copyAllBtn').addEventListener('click', function () {
    copyText(JSON.stringify(buildPayloadText(), null, 2), document.getElementById('copyAllBtn'));
  });
  document.getElementById('importBtn').addEventListener('click', importPrevious);

  ['keydown', 'pointerdown', 'input', 'change'].forEach(function (ev) {
    document.addEventListener(ev, function () { lastInput = Date.now(); }, true);
  });
  setInterval(teleTick, TICK * 1000);
  window.addEventListener('beforeunload', function () {
    if (tele) saveTele();
    if (SYNC_URL && user && navigator.sendBeacon) {
      try {
        /* sendBeacon has a ~64 KB budget — send only what the server might
           not have (slots edited after the last confirmed push + messages).
           The merge treats null slots as "no opinion". Anything the beacon
           still misses is recovered by the push-after-login. */
        var p = buildSharedPayload();
        p.doc.groups.forEach(function (g) {
          g.slots = g.slots.map(function (s) {
            return (s.t && s.t > lastPushOkAt) ? s : null;
          });
        });
        if (!navigator.sendBeacon(SYNC_URL, JSON.stringify(p))) {
          p.doc.groups = [];   // over budget — at least land the messages
          navigator.sendBeacon(SYNC_URL, JSON.stringify(p));
        }
      } catch (e) { }
    }
  });

  var dispatchBtn = document.getElementById('dispatchSend');
  if (dispatchBtn) dispatchBtn.addEventListener('click', function () {
    var ta = document.getElementById('dispatchInput');
    if (!ta) return;
    postMessage(ta.value);
    ta.value = '';
  });

  wireReview();
  tryAuthFromSession();

  /* verification seam for automated checks (returns a Promise of the full payload) */
  window.__bvcrewExport = function () {
    return user ? buildPayloadFull().then(function (p) { return JSON.stringify(p); }) : null;
  };
})();
