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
     they change. Empty string = local + export-file only. */
  var SYNC_URL = 'https://script.google.com/macros/s/AKfycbzDjBaJwX6OwThFY3JI9zlw-cOdHGuBLNv8YGcrjBW5wz2A2Ndv2WYGajWa-S8Gmshf/exec';
  var SYNC_DEBOUNCE_MS = 60000;

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
      'Second Lieutenant', 'Civilian Test Pilot']
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

  /* ---------------- state ---------------- */
  var user = null;
  var data = null;       // { groupId: [ {name, rank, rankCustom, role, ship, desc, personality, goal} ] }
  var saveTimer = null;

  function dataKey() { return 'bvcrew.v1.' + user + '.data'; }
  function timeKey() { return 'bvcrew.v1.' + user + '.time'; }
  function snapKey() { return 'bvcrew.v1.' + user + '.snapshots'; }

  function blankSlot() {
    return { name: '', rank: '', rankCustom: '', role: '', ship: '', desc: '',
      personality: '', goal: '' };
  }

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
        Object.keys(slot).forEach(function (k) { if (typeof s[k] === 'string') slot[k] = s[k]; });
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
  function portraitKey(groupId, i) { return user + ':' + groupId + ':' + i; }
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

  /* Downscale an uploaded image to a sane portrait (max 512 px, JPEG). */
  function shrinkImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, 512 / Math.max(img.width, img.height));
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
    renderGroups();
    renderPrior();
    refreshProgress();
    refreshSyncChip('idle');
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
  function renderGroups() {
    var host = document.getElementById('groups');
    host.innerHTML = '';
    GROUPS.forEach(function (g, gi) {
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
    el('label', { text: 'Rank' }, rankWrap);
    var rank = el('select', null, rankWrap);
    el('option', { value: '', text: '— select rank —' }, rank);
    RANKS[g.ranks].forEach(function (r) {
      var o = el('option', { value: r, text: r }, rank);
      if (s.rank === r) o.selected = true;
    });
    var oc = el('option', { value: CUSTOM, text: CUSTOM }, rank);
    if (s.rank === CUSTOM) oc.selected = true;

    var line2 = el('div', { 'class': 'line2' }, fields);
    var roleWrap = el('div', null, line2);
    el('label', { text: 'Role / billet aboard' }, roleWrap);
    var role = el('input', { type: 'text',
      placeholder: 'e.g., Helm, Sonar, Weapons, Cook, Corpsman', value: s.role }, roleWrap);

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
      el('label', { text: 'Custom rank (when "Other" is selected)' }, extraWrap);
      rankCustom = el('input', { type: 'text', placeholder: 'Custom rank', value: s.rankCustom }, extraWrap);
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
      placeholder: 'Who are they? Temperament, quirks, history, and how they relate to their crewmates and the wider Valley.' }, persWrap);
    pers.value = s.personality;

    var goalWrap = el('div', { 'class': 'full' }, card);
    el('label', { text: 'World goal' }, goalWrap);
    var goal = el('textarea', { rows: '3',
      placeholder: 'What do they want out of the world? (Remember the standing orders above.)' }, goalWrap);
    goal.value = s.goal;
    el('div', { 'class': 'hint',
      text: 'A character counts as complete once it has a name, personality notes, and a world goal. Portrait and physical description welcome.' }, goalWrap);

    function sync() {
      s.name = name.value;
      s.rank = rank.value;
      s.rankCustom = rankCustom ? rankCustom.value : '';
      s.role = role.value;
      s.ship = ship ? ship.value : '';
      s.desc = desc.value;
      s.personality = pers.value;
      s.goal = goal.value;
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
    return card;
  }

  function slotDone(s) {
    return s.name.trim() !== '' && s.personality.trim() !== '' && s.goal.trim() !== '';
  }

  function refreshProgress() {
    var total = 0, done = 0;
    GROUPS.forEach(function (g) {
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
      groups: GROUPS.map(function (g) {
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
      meta: { sig: encodeTele() }
    };
  }

  /* Full payload including portraits (async: reads IndexedDB). */
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
          if (!confirm('Replace everything currently in this browser with the contents of "' + f.name + '"?')) return;
          var portraitJobs = [];
          p.groups.forEach(function (grp) {
            var g = GROUPS.filter(function (x) { return x.id === grp.id; })[0];
            if (!g || !Array.isArray(grp.slots)) return;
            grp.slots.forEach(function (sl, i) {
              if (i >= g.count) return;
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
              if (sl.portrait) portraitJobs.push(idbPut(portraitKey(g.id, i), sl.portrait));
              else portraitJobs.push(idbDelete(portraitKey(g.id, i)));
            });
          });
          Promise.all(portraitJobs).then(function () {
            saveData();
            renderGroups();
            refreshProgress();
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
  function scheduleSync() {
    if (!SYNC_URL) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function () { syncNow('auto'); }, SYNC_DEBOUNCE_MS);
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
  function markDirtyPortrait(groupId, i) {
    var k = groupId + ':' + i;
    var d = loadDirty();
    if (d.indexOf(k) === -1) d.push(k);
    try { localStorage.setItem(dirtyKey(), JSON.stringify(d)); } catch (e) { }
    if (!SYNC_URL) return;
    clearTimeout(porSyncTimer);
    porSyncTimer = setTimeout(function () { syncPortraitsNow(false); }, 2000);
  }
  function syncPortraitsNow(all) {
    if (!SYNC_URL || !user) return Promise.resolve();
    var keys;
    if (all) {
      keys = [];
      GROUPS.forEach(function (g) {
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
      var g = GROUPS.filter(function (x) { return x.id === gid; })[0];
      if (!g || isNaN(idx)) return Promise.resolve();
      return idbGet(portraitKey(gid, idx)).then(function (img) {
        if (all && !img) return; // full pushes skip empty slots
        images.push({
          group: gid, label: g.label, n: idx + 1,
          name: (data[gid] && data[gid][idx]) ? data[gid][idx].name : '',
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
          format: 'beaver-valley-crew-portraits', version: 1,
          contributor: user, exported: new Date().toISOString(), images: images
        })
      }).then(function (r) {
        if (r.ok) {
          try { localStorage.setItem(dirtyKey(), '[]'); } catch (e) { }
          refreshSyncChip('saved');
        } else refreshSyncChip('failed');
      }).catch(function () { refreshSyncChip('failed'); });
    });
  }

  function syncNow(reason) {
    if (!SYNC_URL || !user) return;
    var body = JSON.stringify(buildPayloadText());
    refreshSyncChip('saving');
    fetch(SYNC_URL, { method: 'POST', body: body,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' } })
      .then(function (r) {
        refreshSyncChip(r.ok ? 'saved' : 'failed');
      })
      .catch(function () { refreshSyncChip('failed'); });
  }

  function refreshSyncChip(state) {
    var chip = document.getElementById('syncState');
    if (!chip) return;
    if (!SYNC_URL) { chip.textContent = 'Cloud storage: off (use Export to hand work over)'; return; }
    if (state === 'saving') chip.textContent = 'Cloud: saving…';
    else if (state === 'saved') chip.textContent = 'Cloud: saved ' + new Date().toLocaleTimeString();
    else if (state === 'failed') chip.textContent = 'Cloud: offline (kept locally, will retry)';
    else chip.textContent = 'Cloud storage: on';
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
    el('div', { html: '<b>' + (p.contributor || 'Unknown') + '</b> &mdash; exported ' +
      new Date(p.exported).toLocaleString() + ' <span style="color:var(--muted)">(' + (fileName || '') + ')</span>' }, head);

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
      try { navigator.sendBeacon(SYNC_URL, JSON.stringify(buildPayloadText())); } catch (e) { }
    }
  });

  wireReview();
  tryAuthFromSession();

  /* verification seam for automated checks (returns a Promise of the full payload) */
  window.__bvcrewExport = function () {
    return user ? buildPayloadFull().then(function (p) { return JSON.stringify(p); }) : null;
  };
})();
