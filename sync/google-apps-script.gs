/**
 * BEAVER VALLEY — crew portal storage receiver + SHARED LIVE DOCUMENT.
 *
 * Deploy this as a Google Apps Script *web app* in Jeremy's Google account
 * (see sync/README.md). All three portal logins (SAM / JEREMY / MALCOLM)
 * work on ONE shared manifest:
 *
 *   - POST format 'beaver-valley-crew-shared' merges the sender's copy into
 *     the stored shared document (per-slot: newest edit wins; messages are a
 *     union) under a script lock, and returns the merged document.
 *   - GET ?shared=1 returns the shared document + the portrait manifest.
 *   - GET ?portrait=<fileId> returns one shared portrait as a data URL.
 *   - POST format 'beaver-valley-crew-portraits' stores portrait image files
 *     (shared folder) and EMAILS them to Jeremy immediately.
 *   - The legacy per-user submission format still works (old cached clients).
 *
 * Everything lands in Jeremy's Drive:
 *   - Sheet "Log"    — one row per push (timestamp, user, full JSON) — history.
 *   - Sheet "Roster" — the shared document unpacked to one row per character.
 *   - Sheet "Portraits" — one row per uploaded portrait with its Drive link.
 *   - Folder "Beaver Valley Crew Data" — bvcrew-shared-doc.json (the document).
 *   - Folder "Beaver Valley Crew Portraits/SHARED/" — the image files,
 *     named <group>-<nn>-<character name>.jpg, always the newest version.
 */
var SHEET_NAME = 'Beaver Valley Crew Submissions';
var PORTRAIT_FOLDER = 'Beaver Valley Crew Portraits';
var DATA_FOLDER = 'Beaver Valley Crew Data';
var SHARED_SUBFOLDER = 'SHARED';
var DOC_FILE = 'bvcrew-shared-doc.json';
/** Every portrait push is also emailed here immediately, images attached. */
var NOTIFY_EMAIL = 'bumnumber1@gmail.com';

function doPost(e) {
  var out = { ok: false };
  try {
    var payload = JSON.parse(e.postData.contents);
    if (payload.format === 'beaver-valley-crew-shared') {
      out.doc = mergeSharedPush_(payload);
      out.ok = true;
    } else if (payload.format === 'beaver-valley-crew-portraits') {
      out.saved = savePortraits_(payload);
      out.ok = true;
    } else if (payload.format === 'beaver-valley-crew-admin') {
      out.done = adminOp_(payload);
      out.ok = true;
    } else if (payload.format === 'beaver-valley-crew-submission') {
      // legacy per-user path (old cached clients / hand-run tools)
      var ss = getSpreadsheet_();
      appendLog_(ss, payload);
      upsertLatest_(ss, payload);
      out.ok = true;
    } else {
      throw new Error('wrong format');
    }
  } catch (err) {
    out.error = String(err);
  }
  return jsonOut_(out);
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.shared) {
    return jsonOut_({ doc: readSharedDoc_(false), portraits: portraitManifest_() });
  }
  if (p.portrait) {
    return jsonOut_(readPortrait_(String(p.portrait)));
  }
  // legacy: ?user=SAM returns that user's latest pushed JSON
  var user = (p.user || 'SAM').toUpperCase();
  var ss = getSpreadsheet_();
  var latest = getSheet_(ss, 'Latest', ['User', 'Received', 'JSON']);
  var rows = latest.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === user) {
      return ContentService.createTextOutput(String(rows[i][2]))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  return jsonOut_({ error: 'no data for ' + user });
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Maintenance ops for Jeremy. POST {"format":"beaver-valley-crew-admin",
 *  "key":"<JEREMY's portal password>","op":"clear-messages"} to wipe the
 *  dispatch board. (The key is deliberately just his password — this whole
 *  portal is, per the owner, not a security boundary.) */
function adminOp_(payload) {
  if (String(payload.key) !== 'Nutlick') throw new Error('bad key');
  if (payload.op === 'clear-messages') {
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var d = readSharedDoc_(true);
      d.messages = [];
      docFile_(true).setContent(JSON.stringify(d));
      return 'messages cleared';
    } finally {
      lock.releaseLock();
    }
  }
  throw new Error('unknown op');
}

/* ---------------- the shared document ---------------- */

/* Find-only lookups for GET paths: unlocked reads must NEVER create folders
   or files — two concurrent creates would fork the document (Drive happily
   holds two same-name items). Creation happens only inside the merge lock. */
function findFolder_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : null;
}

function dataFolder_(create) {
  if (create) return getOrCreateFolder_(DriveApp.getRootFolder(), DATA_FOLDER);
  return findFolder_(DriveApp.getRootFolder(), DATA_FOLDER);
}

function docFile_(create) {
  var folder = dataFolder_(create);
  if (!folder) return null;
  var it = folder.getFilesByName(DOC_FILE);
  if (it.hasNext()) return it.next();
  if (!create) return null;
  return folder.createFile(DOC_FILE, JSON.stringify({ groups: [], messages: [] }),
    'application/json');
}

/** strict=true (the merge): a read/parse FAILURE throws so a push can never
 *  silently rebuild from empty and wipe the document. strict=false (GET):
 *  a missing file is a normal empty doc. */
function readSharedDoc_(strict) {
  var file = docFile_(false);
  if (!file) {
    return { groups: [], messages: [] };
  }
  var raw = file.getBlob().getDataAsString();
  try {
    var doc = JSON.parse(raw);
    if (!doc || typeof doc !== 'object' || !Array.isArray(doc.groups)) throw new Error('bad shape');
    if (!Array.isArray(doc.messages)) doc.messages = [];
    return doc;
  } catch (e) {
    if (strict) throw new Error('shared doc unreadable — push refused: ' + e);
    return { groups: [], messages: [] };
  }
}

function slotWeight_(s) {
  if (!s) return 0;
  return String(s.name || '').length + String(s.role || '').length +
    String(s.desc || '').length + String(s.personality || '').length +
    String(s.goal || '').length;
}

/* deterministic final tie-break — must match crew.js slotKey exactly */
function slotKey_(s) {
  if (!s) return '';
  return [s.name, s.rank, s.rankCustom, s.role, s.ship, s.desc, s.personality, s.goal]
    .map(function (v) { return v || ''; }).join('\u0001');
}

/** Per-slot last-write-wins merge (ties: more written content wins,
 *  then a fixed lexicographic order — identical rule to crew.js). */
function mergeSharedPush_(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var stored = readSharedDoc_(true);   // strict: unreadable doc REFUSES the push
    var incoming = (payload.doc && typeof payload.doc === 'object') ? payload.doc : {};
    var inGroups = Array.isArray(incoming.groups) ? incoming.groups : [];
    /* clamp client timestamps: a machine with a fast clock must not be able
       to stamp far-future edits that freeze slots for everyone */
    var tCap = Date.now() + 120000;

    var byId = {};
    stored.groups.forEach(function (g) { if (g && g.id) byId[g.id] = g; });

    inGroups.forEach(function (ig) {
      if (!ig || !ig.id || !Array.isArray(ig.slots)) return;
      var sg = byId[ig.id];
      if (!sg) {
        sg = { id: ig.id, label: ig.label || ig.id, count: ig.count || ig.slots.length, slots: [] };
        byId[ig.id] = sg;
        stored.groups.push(sg);
      }
      if (ig.label) sg.label = ig.label;
      if (!Array.isArray(sg.slots)) sg.slots = [];
      ig.slots.forEach(function (is, i) {
        if (!is) return;
        var ss = sg.slots[i];
        var it2 = Math.min(Number(is.t) || 0, tCap);
        var st = ss ? (Number(ss.t) || 0) : -1;
        var iw = slotWeight_(is), sw = slotWeight_(ss);
        var adopt = it2 > st ||
          (it2 === st && (iw > sw || (iw === sw && slotKey_(is) > slotKey_(ss))));
        if (adopt) {
          sg.slots[i] = {
            name: String(is.name || ''), rank: String(is.rank || ''),
            rankCustom: String(is.rankCustom || ''), role: String(is.role || ''),
            ship: String(is.ship || ''), desc: String(is.desc || ''),
            personality: String(is.personality || ''), goal: String(is.goal || ''),
            t: it2
          };
        }
      });
    });

    // messages: union by id, oldest→newest, capped
    var have = {};
    stored.messages.forEach(function (m) { if (m && m.id) have[m.id] = true; });
    (Array.isArray(incoming.messages) ? incoming.messages : []).forEach(function (m) {
      if (m && m.id && !have[m.id] && typeof m.text === 'string') {
        stored.messages.push({ id: String(m.id), u: String(m.u || '?'),
          t: Number(m.t) || 0, text: String(m.text).slice(0, 4000) });
        have[m.id] = true;
      }
    });
    stored.messages.sort(function (a, b) { return a.t - b.t; });
    if (stored.messages.length > 500) stored.messages = stored.messages.slice(-500);

    var json = JSON.stringify(stored);
    docFile_(true).setContent(json);
    maybeBackupDoc_(json);

    var ss2 = getSpreadsheet_();
    appendLog_(ss2, payload);
    maybeRebuildRoster_(ss2, stored);
    return stored;
  } finally {
    lock.releaseLock();
  }
}

/** Rolling document backups (every 30 min of activity, keep the newest 20)
 *  — real disaster recovery for the shared doc, since the Log sheet can
 *  truncate very large payloads. Runs inside the merge lock. */
function maybeBackupDoc_(json) {
  try {
    var props = PropertiesService.getScriptProperties();
    var last = Number(props.getProperty('docBackupAt') || 0);
    if (Date.now() - last < 30 * 60 * 1000) return;
    props.setProperty('docBackupAt', String(Date.now()));
    var folder = dataFolder_(true);
    var stamp = Utilities.formatDate(new Date(), 'UTC', "yyyy-MM-dd'T'HH-mm-ss");
    folder.createFile('bvcrew-shared-doc.backup-' + stamp + '.json', json,
      'application/json');
    // prune: keep the 20 newest backups
    var backups = [];
    var it = folder.getFiles();
    while (it.hasNext()) {
      var f = it.next();
      if (f.getName().indexOf('bvcrew-shared-doc.backup-') === 0) backups.push(f);
    }
    backups.sort(function (a, b) { return a.getName() < b.getName() ? 1 : -1; });
    for (var i = 20; i < backups.length; i++) backups[i].setTrashed(true);
  } catch (e) { /* backups must never block a save */ }
}

function appendLog_(ss, payload) {
  var log = getSheet_(ss, 'Log', ['Received', 'User', 'Exported', 'JSON']);
  var json = JSON.stringify(payload);
  if (json.length > 49000) json = json.slice(0, 49000) + '…';
  log.appendRow([new Date(), payload.contributor, payload.exported, json]);
  if (log.getLastRow() > 4000) log.deleteRows(2, 500);
}

/** Rebuild the Roster sheet from the shared doc, at most every 2 minutes. */
function maybeRebuildRoster_(ss, doc) {
  var props = PropertiesService.getScriptProperties();
  var last = Number(props.getProperty('rosterAt') || 0);
  if (Date.now() - last < 120000) return;
  props.setProperty('rosterAt', String(Date.now()));
  var old = ss.getSheetByName('Roster');
  if (old) ss.deleteSheet(old);
  var sh = ss.insertSheet('Roster');
  sh.appendRow(['Group', '#', 'Name', 'Rank', 'Role', 'Ship', 'Physical Description',
    'Personality & Relationships', 'World Goal', 'Last edited']);
  sh.setFrozenRows(1);
  var rows = [];
  doc.groups.forEach(function (g) {
    (g.slots || []).forEach(function (s, i) {
      if (!s) return;
      var rank = s.rank === 'Other / custom…' ? (s.rankCustom || 'Custom') : s.rank;
      rows.push([g.label, i + 1, s.name || '', rank || '', s.role || '', s.ship || '',
        s.desc || '', s.personality || '', s.goal || '',
        s.t ? new Date(s.t) : '']);
    });
  });
  if (rows.length) sh.getRange(2, 1, rows.length, 10).setValues(rows);
}

/* ---------------- shared portraits ---------------- */

function sharedPortraitFolder_(create) {
  if (create) {
    return getOrCreateFolder_(
      getOrCreateFolder_(DriveApp.getRootFolder(), PORTRAIT_FOLDER), SHARED_SUBFOLDER);
  }
  var top = findFolder_(DriveApp.getRootFolder(), PORTRAIT_FOLDER);
  return top ? findFolder_(top, SHARED_SUBFOLDER) : null;
}

/** Stores/updates each pushed portrait as a real image file in Drive.
 *  Runs under the script lock: concurrent uploads to the same slot must not
 *  leave two files with one prefix (the manifest would flip-flop forever),
 *  and folder creation must never race into duplicates. */
function savePortraits_(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    return savePortraitsLocked_(payload);
  } finally {
    lock.releaseLock();
  }
}

function savePortraitsLocked_(payload) {
  var userFolder = payload.shared
    ? sharedPortraitFolder_(true)
    : getOrCreateFolder_(
        getOrCreateFolder_(DriveApp.getRootFolder(), PORTRAIT_FOLDER),
        String(payload.contributor || 'UNKNOWN'));
  var ss = getSpreadsheet_();
  var sheet = getSheet_(ss, 'Portraits',
    ['Updated', 'User', 'Group', '#', 'Character', 'File']);
  var saved = 0;
  var mailBlobs = [];
  var mailLines = [];

  (payload.images || []).forEach(function (img) {
    var nn = ('0' + img.n).slice(-2);
    var prefix = img.group + '-' + nn + '-';
    // one file per slot: clear any previous version first
    var it = userFolder.getFiles();
    while (it.hasNext()) {
      var f = it.next();
      if (f.getName().indexOf(prefix) === 0) f.setTrashed(true);
    }
    if (!img.data) { upsertPortraitRow_(sheet, payload.contributor, img, ''); return; }
    var m = String(img.data).match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
    if (!m) return;
    var safeName = String(img.name || 'unnamed')
      .replace(/[^\w \-.]/g, '').trim() || 'unnamed';
    var ext = m[1] === 'image/png' ? '.png' : '.jpg';
    var blob = Utilities.newBlob(
      Utilities.base64Decode(m[2]), m[1], prefix + safeName + ext);
    var file = userFolder.createFile(blob);
    upsertPortraitRow_(sheet, payload.contributor, img, file.getUrl());
    mailBlobs.push(blob);
    mailLines.push(img.label + ' #' + img.n + ' — ' + (img.name || 'unnamed'));
    saved++;
  });

  // Immediate notification: the new portrait(s) arrive in Jeremy's inbox as
  // attachments the moment they are uploaded.
  if (mailBlobs.length && NOTIFY_EMAIL) {
    try {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: 'BV crew portrait' + (mailBlobs.length > 1 ? 's' : '') + ' — '
          + payload.contributor + ' (' + mailBlobs.length + ' new)',
        body: 'New character portrait uploads from ' + payload.contributor + ':\n\n'
          + mailLines.join('\n')
          + '\n\nAll current portraits live in Drive under "' + PORTRAIT_FOLDER
          + '/' + (payload.shared ? SHARED_SUBFOLDER : payload.contributor) + '".',
        attachments: mailBlobs
      });
    } catch (mailErr) { /* quota or mail failure never blocks storage */ }
  }
  return saved;
}

/** Lists the shared portrait files: [{group, n, name, id}]. Read-only. */
function portraitManifest_() {
  var out = [];
  var folder = sharedPortraitFolder_(false);
  if (!folder) return out;
  var it = folder.getFiles();
  while (it.hasNext()) {
    var f = it.next();
    var m = f.getName().match(/^([a-z]+)-(\d{2})-(.*)\.(jpg|jpeg|png)$/i);
    if (!m) continue;
    out.push({ group: m[1], n: parseInt(m[2], 10), name: m[3], id: f.getId() });
  }
  return out;
}

/** Returns one shared portrait as {data: dataURL}. Only files that actually
 *  live in the shared portrait folder are served. */
function readPortrait_(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    var ok = false;
    var parents = file.getParents();
    var shared = sharedPortraitFolder_(false);
    if (!shared) return { error: 'no shared portraits yet' };
    while (parents.hasNext()) {
      if (parents.next().getId() === shared.getId()) { ok = true; break; }
    }
    if (!ok) return { error: 'not a shared portrait' };
    var blob = file.getBlob();
    return { data: 'data:' + blob.getContentType() + ';base64,'
      + Utilities.base64Encode(blob.getBytes()) };
  } catch (e) {
    return { error: String(e) };
  }
}

function upsertPortraitRow_(sheet, user, img, url) {
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][2] === img.label && rows[i][3] === img.n) {
      sheet.getRange(i + 1, 1, 1, 6).setValues(
        [[new Date(), user, img.label, img.n, img.name || '', url]]);
      return;
    }
  }
  sheet.appendRow([new Date(), user, img.label, img.n, img.name || '', url]);
}

function getOrCreateFolder_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

/* ---------------- spreadsheet plumbing ---------------- */

function getSpreadsheet_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('sheetId');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (e) { }
  }
  var ss = SpreadsheetApp.create(SHEET_NAME);
  props.setProperty('sheetId', ss.getId());
  return ss;
}

function getSheet_(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

function upsertLatest_(ss, payload) {
  var sh = getSheet_(ss, 'Latest', ['User', 'Received', 'JSON']);
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === payload.contributor) {
      sh.getRange(i + 1, 2, 1, 2).setValues([[new Date(), JSON.stringify(payload)]]);
      return;
    }
  }
  sh.appendRow([payload.contributor, new Date(), JSON.stringify(payload)]);
}
