/**
 * BEAVER VALLEY — crew portal storage receiver.
 *
 * Deploy this as a Google Apps Script *web app* in Jeremy's Google account
 * (see sync/README.md). The crew portal POSTs each contributor's full text
 * data here (~60 s after every change and on export), and their character
 * PORTRAITS as they upload them. Everything lands in Jeremy's Drive:
 *
 *   - Sheet "Log"    — one row per push (timestamp, user, full JSON) — history.
 *   - Sheet "Latest" — one row per user, always their newest data — the live copy.
 *   - Sheet "Roster" — the newest data unpacked to one row per character.
 *   - Sheet "Portraits" — one row per uploaded portrait with its Drive link.
 *   - Folder "Beaver Valley Crew Portraits/<USER>/" — the actual image files,
 *     named <group>-<nn>-<character name>.jpg, always the newest version.
 */
var SHEET_NAME = 'Beaver Valley Crew Submissions';
var PORTRAIT_FOLDER = 'Beaver Valley Crew Portraits';
/** Every portrait push is also emailed here immediately, images attached. */
var NOTIFY_EMAIL = 'bumnumber1@gmail.com';

function doPost(e) {
  var out = { ok: false };
  try {
    var payload = JSON.parse(e.postData.contents);
    if (payload.format === 'beaver-valley-crew-submission') {
      var ss = getSpreadsheet_();
      var log = getSheet_(ss, 'Log', ['Received', 'User', 'Exported', 'JSON']);
      log.appendRow([new Date(), payload.contributor, payload.exported,
        JSON.stringify(payload)]);
      upsertLatest_(ss, payload);
      rebuildRoster_(ss, payload);
      out.ok = true;
    } else if (payload.format === 'beaver-valley-crew-portraits') {
      out.saved = savePortraits_(payload);
      out.ok = true;
    } else {
      throw new Error('wrong format');
    }
  } catch (err) {
    out.error = String(err);
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Stores/updates each pushed portrait as a real image file in Drive. */
function savePortraits_(payload) {
  var userFolder = getOrCreateFolder_(
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
          + '/' + payload.contributor + '".',
        attachments: mailBlobs
      });
    } catch (mailErr) { /* quota or mail failure never blocks storage */ }
  }
  return saved;
}

function upsertPortraitRow_(sheet, user, img, url) {
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === user && rows[i][2] === img.label && rows[i][3] === img.n) {
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

/** GET ?user=SAM returns that user's latest JSON (handy for scripts). */
function doGet(e) {
  var user = ((e && e.parameter && e.parameter.user) || 'SAM').toUpperCase();
  var ss = getSpreadsheet_();
  var latest = getSheet_(ss, 'Latest', ['User', 'Received', 'JSON']);
  var rows = latest.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === user) {
      return ContentService.createTextOutput(String(rows[i][2]))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput('{"error":"no data for ' + user + '"}')
    .setMimeType(ContentService.MimeType.JSON);
}

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

function rebuildRoster_(ss, payload) {
  var name = 'Roster ' + payload.contributor;
  var old = ss.getSheetByName(name);
  if (old) ss.deleteSheet(old);
  var sh = ss.insertSheet(name);
  sh.appendRow(['Group', '#', 'Name', 'Rank', 'Role', 'Ship', 'Physical Description',
    'Personality & Relationships', 'World Goal']);
  sh.setFrozenRows(1);
  var rows = [];
  payload.groups.forEach(function (g) {
    g.slots.forEach(function (s) {
      rows.push([g.label, s.n, s.name || '', s.rank || '', s.role || '', s.ship || '',
        s.desc || '', s.personality || '', s.goal || '']);
    });
  });
  if (rows.length) sh.getRange(2, 1, rows.length, 9).setValues(rows);
}
