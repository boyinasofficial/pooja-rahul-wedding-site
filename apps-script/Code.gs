/**
 * Pooja & Rahul wedding · backend (Google Apps Script)
 * Stores RSVPs in this Google Sheet and photo-booth pictures in a Drive folder.
 * Serves the password-protected admin data.
 *
 * Setup: see SETUP.md. The admin password lives in Script Properties
 * (ADMIN_PASSWORD), never in this file.
 */

const RSVP_SHEET = 'RSVPs';
const PHOTO_SHEET = 'Photos';
const FOLDER_NAME = 'Pooja-Rahul Photo Booth';
const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
const EVENTS = ['vindu', 'muhurtham', 'vratham', 'reception'];

function doGet() {
  return json_({ ok: true, service: 'pooja-rahul-wedding' });
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: 'bad_request' });
  }
  try {
    switch (body.action) {
      case 'rsvp': return json_(saveRsvp_(body));
      case 'photo': return json_(savePhoto_(body));
      case 'admin': return json_(adminData_(body));
      default: return json_({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server_error' });
  }
}

/* ---------------- RSVP ---------------- */
function saveRsvp_(b) {
  if (b.website) return { ok: true }; // honeypot: silently ignore bots
  const name = clean_(b.name, 80);
  if (!name) return { ok: false, error: 'name_required' };
  const events = (Array.isArray(b.events) ? b.events : []).filter(x => EVENTS.indexOf(x) >= 0);
  if (!events.length) return { ok: false, error: 'events_required' };
  const guests = Math.max(1, Math.min(8, parseInt(b.guests, 10) || 1));
  const side = b.side === 'groom' ? 'groom' : 'bride';

  const sh = sheet_(RSVP_SHEET, ['Timestamp', 'Name', 'Phone', 'Side', 'Guests', 'Vindu', 'Muhurtham', 'Vratham', 'Reception', 'Blessing', 'Language']);
  withLock_(() => sh.appendRow([
    new Date(), name, clean_(b.phone, 20), side, guests,
    events.indexOf('vindu') >= 0 ? 'Yes' : '',
    events.indexOf('muhurtham') >= 0 ? 'Yes' : '',
    events.indexOf('vratham') >= 0 ? 'Yes' : '',
    events.indexOf('reception') >= 0 ? 'Yes' : '',
    clean_(b.blessing, 500), b.lang === 'en' ? 'en' : 'te'
  ]));
  return { ok: true };
}

/* ---------------- PHOTO BOOTH ---------------- */
function savePhoto_(b) {
  const m = String(b.image || '').match(/^data:image\/(jpeg|png|webp);base64,(.+)$/);
  if (!m) return { ok: false, error: 'bad_image' };
  const bytes = Utilities.base64Decode(m[2]);
  if (bytes.length > MAX_PHOTO_BYTES) return { ok: false, error: 'too_large' };
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const guest = clean_(b.name, 60) || 'guest';
  const stamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyyMMdd-HHmmss');
  const blob = Utilities.newBlob(bytes, 'image/' + m[1], stamp + '_' + guest.replace(/[^\wఀ-౿-]+/g, '_') + '.' + ext);
  const file = folder_().createFile(blob);
  // Link-only access so the admin page can show thumbnails. IDs are unguessable.
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const sh = sheet_(PHOTO_SHEET, ['Timestamp', 'Name', 'File ID', 'Frame']);
  withLock_(() => sh.appendRow([new Date(), guest, file.getId(), clean_(b.frame, 30)]));
  return { ok: true, id: file.getId() };
}

/* ---------------- ADMIN ---------------- */
function adminData_(b) {
  const cache = CacheService.getScriptCache();
  const fails = parseInt(cache.get('admin_fails') || '0', 10);
  if (fails >= 10) return { ok: false, error: 'locked' }; // 10 wrong tries → 15 min lock

  const real = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  if (!real) return { ok: false, error: 'not_configured' };
  if (!safeEqual_(String(b.password || ''), real)) {
    cache.put('admin_fails', String(fails + 1), 900);
    Utilities.sleep(800);
    return { ok: false, error: 'wrong_password' };
  }
  cache.remove('admin_fails');

  const rsvps = rows_(RSVP_SHEET).map(r => ({
    time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
    name: r[1], phone: r[2], side: r[3], guests: Number(r[4]) || 0,
    events: EVENTS.filter((_, i) => r[5 + i] === 'Yes'),
    blessing: r[9], lang: r[10]
  }));
  const photos = rows_(PHOTO_SHEET).map(r => ({
    time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
    name: r[1], id: r[2], frame: r[3]
  }));
  return { ok: true, rsvps: rsvps.reverse(), photos: photos.reverse() };
}

/* ---------------- helpers ---------------- */
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function clean_(v, max) {
  let s = String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
  if (/^[=+\-@\t]/.test(s)) s = "'" + s; // stop spreadsheet formula injection
  return s;
}
function sheet_(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(header); sh.setFrozenRows(1); }
  return sh;
}
function rows_(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
}
function folder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { /* recreate below */ } }
  const f = DriveApp.createFolder(FOLDER_NAME);
  props.setProperty('FOLDER_ID', f.getId());
  return f;
}
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { fn(); } finally { lock.releaseLock(); }
}
function safeEqual_(a, b) {
  const ha = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, a);
  const hb = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, b);
  let d = 0;
  for (let i = 0; i < ha.length; i++) d |= ha[i] ^ hb[i];
  return d === 0;
}

/** Run once from the editor to create the sheets and the Drive folder. */
function setup() {
  sheet_(RSVP_SHEET, ['Timestamp', 'Name', 'Phone', 'Side', 'Guests', 'Vindu', 'Muhurtham', 'Vratham', 'Reception', 'Blessing', 'Language']);
  sheet_(PHOTO_SHEET, ['Timestamp', 'Name', 'File ID', 'Frame']);
  folder_();
  if (!PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD')) {
    console.warn('Set ADMIN_PASSWORD in Project Settings → Script properties');
  }
}
