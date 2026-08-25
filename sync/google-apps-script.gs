/**
 * BEAVER VALLEY — crew portal storage receiver.
 *
 * Deploy this as a Google Apps Script *web app* in Jeremy's Google account
 * (see sync/README.md). The crew portal POSTs each contributor's full text
 * data here (~60 s after every change and on export). Everything lands in a
 * Google Sheet in Jeremy's Drive:
 *
 *   - "Log"    — one row per push (timestamp, user, full JSON) — history.
 *   - "Latest" — one row per user, always their newest data — the live copy.
 *   - "Roster" — the newest data unpacked to one row per character, ready to
 *                read or export from Sheets directly.
 */
var SHEET_NAME = 'Beaver Valley Crew Submissions';

function doPost(e) {
  var out = { ok: false };
  try {
    var payload = JSON.parse(e.postData.contents);
    if (payload.format !== 'beaver-valley-crew-submission') throw new Error('wrong format');
    var ss = getSpreadsheet_();

    var log = getSheet_(ss, 'Log', ['Received', 'User', 'Exported', 'JSON']);
    log.appendRow([new Date(), payload.contributor, payload.exported,
      JSON.stringify(payload)]);

    upsertLatest_(ss, payload);
    rebuildRoster_(ss, payload);
    out.ok = true;
  } catch (err) {
    out.error = String(err);
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
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
