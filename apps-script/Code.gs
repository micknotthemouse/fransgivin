/**
 * @OnlyCurrentDoc
 * (Limits the permission Google asks for to THIS spreadsheet only.)
 *
 * Fransgivin backend: Google Sheet + Apps Script web app.
 * Deploy: Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone.
 * Protocol (see architecture.md):
 *   GET  ?action=list                      -> {ok:true, dishes:[...], count}
 *   POST text/plain JSON {action:'add', id, name, dish, category, note, token}
 *   POST text/plain JSON {action:'remove', id, token}
 * Rows are appended under a script lock (no overwrite race). Tokens are never returned.
 * The sheet owner may edit or delete any row by hand; set column "removed" to TRUE to hide a row.
 */

var SHEET_NAME = 'Dishes';
var HEADERS = ['id', 'name', 'dish', 'category', 'note', 'createdAt', 'token', 'removed'];
var CATEGORIES = ['Main/Ham', 'Sides', 'Apps', 'Desserts', 'Booze', 'Other'];
var MAX_ROWS = 150;
var MAX_PER_TOKEN = 12;
var LIMITS = { name: 40, dish: 80, note: 120 };

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
  }
  if (sh.getLastRow() < 1) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
    // Plain text everywhere so "=1+1" typed by a guest is stored as text, not run as a formula.
    sh.getRange(1, 1, sh.getMaxRows(), HEADERS.length).setNumberFormat('@');
  }
  return sh;
}

/** Run once from the editor to create the sheet and authorize the script. */
function setup() {
  sheet_();
}

/** Sheets runs text starting with = + - @ as a formula. A leading zero-width space keeps it plain text; the page strips it. */
function safeCell_(s) {
  return /^[=+\-@]/.test(s) ? '​' + s : s;
}

function unsafeCell_(s) {
  return String(s).replace(/^​/, '');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function clean_(value, max) {
  var s = String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  return s.length > max ? s.slice(0, max) : s;
}

function readAll_(sh) {
  var last = sh.getLastRow();
  if (last < 2) return [];
  var vals = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var rows = [];
  for (var i = 0; i < vals.length; i++) {
    var r = {};
    for (var c = 0; c < HEADERS.length; c++) r[HEADERS[c]] = vals[i][c];
    r._row = i + 2;
    rows.push(r);
  }
  return rows;
}

function isRemoved_(r) {
  return String(r.removed).toUpperCase() === 'TRUE';
}

function publicDish_(r) {
  return {
    id: String(r.id),
    name: unsafeCell_(r.name),
    dish: unsafeCell_(r.dish),
    category: String(r.category),
    note: unsafeCell_(r.note || ''),
    createdAt: String(r.createdAt)
  };
}

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'list';
    if (action === 'ping') return json_({ ok: true, pong: true });
    if (action !== 'list') return json_({ ok: false, error: 'unknown_action' });
    var rows = readAll_(sheet_()).filter(function (r) { return r.id && !isRemoved_(r); });
    return json_({ ok: true, count: rows.length, dishes: rows.map(publicDish_) });
  } catch (err) {
    return json_({ ok: false, error: 'server_error' });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action === 'add') return add_(body, lock);
    if (body.action === 'remove') return remove_(body, lock);
    return json_({ ok: false, error: 'unknown_action' });
  } catch (err) {
    return json_({ ok: false, error: 'bad_request' });
  }
}

function add_(b, lock) {
  var id = String(b.id || '');
  if (!/^[A-Za-z0-9_-]{6,40}$/.test(id)) return json_({ ok: false, error: 'bad_id' });
  var token = String(b.token || '');
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) return json_({ ok: false, error: 'bad_token' });
  var name = clean_(b.name, LIMITS.name);
  var dish = clean_(b.dish, LIMITS.dish);
  var note = clean_(b.note, LIMITS.note);
  var category = CATEGORIES.indexOf(b.category) >= 0 ? b.category : 'Other';
  // 'dish' is allowed to be empty (a "mystery" dish) but the name is required.
  if (!name) return json_({ ok: false, error: 'missing_fields' });
  // Honeypot: real people never fill this hidden field.
  if (b.hp) return json_({ ok: true, dish: { id: id, name: name, dish: dish, category: category, note: note, createdAt: new Date().toISOString() } });

  lock.waitLock(20000);
  try {
    var sh = sheet_();
    var rows = readAll_(sh);
    var mine = 0;
    for (var i = 0; i < rows.length; i++) {
      // Retry-safe: the same id twice is a success, not a duplicate row.
      if (String(rows[i].id) === id) return json_({ ok: true, duplicate: true, dish: publicDish_(rows[i]) });
      if (String(rows[i].token) === token && !isRemoved_(rows[i])) mine++;
    }
    if (rows.length >= MAX_ROWS || mine >= MAX_PER_TOKEN) return json_({ ok: false, error: 'full' });
    var createdAt = new Date().toISOString();
    // Set text format on the new row BEFORE writing so values like "=1+1" stay plain text.
    var target = sh.getRange(sh.getLastRow() + 1, 1, 1, HEADERS.length);
    target.setNumberFormat('@');
    target.setValues([[id, safeCell_(name), safeCell_(dish), category, safeCell_(note), createdAt, token, 'FALSE']]);
    return json_({ ok: true, dish: { id: id, name: name, dish: dish, category: category, note: note, createdAt: createdAt } });
  } finally {
    lock.releaseLock();
  }
}

function remove_(b, lock) {
  var id = String(b.id || '');
  var token = String(b.token || '');
  if (!id || !token) return json_({ ok: false, error: 'bad_request' });
  lock.waitLock(20000);
  try {
    var sh = sheet_();
    var rows = readAll_(sh);
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i].id) === id) {
        if (String(rows[i].token) !== token) return json_({ ok: false, error: 'not_yours' });
        sh.getRange(rows[i]._row, HEADERS.indexOf('removed') + 1).setValue('TRUE');
        return json_({ ok: true });
      }
    }
    return json_({ ok: true, missing: true });
  } finally {
    lock.releaseLock();
  }
}
