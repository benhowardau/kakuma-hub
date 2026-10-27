// Sign-up, login and profiles with no server: every member holds a Nostr key on their phone and publishes
// their own profile to public relays. The site reads the hub's members back from those relays.
// Library pinned to one version so nothing changes under the site.
import { generateSecretKey, getPublicKey, finalizeEvent, SimplePool, nip19 } from 'https://cdn.jsdelivr.net/npm/nostr-tools@2.25.2/+esm';

export const RELAYS = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://relay.primal.net', 'wss://relay.nostr.band'];
export const TAG = 'bitcoinkakuma';          // every hub listing carries this tag
export const KIND = 30078;                    // app-specific replaceable data (NIP-78)
const D_MEMBER = 'bitcoin-kakuma-hub/member';
const D_PRODUCT = 'bitcoin-kakuma-hub/product/';
const KEY = 'bkh-nsec';
const pool = new SimplePool();

export function loadKey() {
  try { const n = localStorage.getItem(KEY); if (!n) return null; const d = nip19.decode(n); return d.type === 'nsec' ? d.data : null; } catch (e) { return null; }
}
export function createKey() { const sk = generateSecretKey(); localStorage.setItem(KEY, nip19.nsecEncode(sk)); return sk; }
export function importKey(nsec) { const d = nip19.decode(nsec.trim()); if (d.type !== 'nsec') throw new Error('That is not an nsec key'); localStorage.setItem(KEY, nsec.trim()); return d.data; }
export function forgetKey() { localStorage.removeItem(KEY); }
export function nsecOf(sk) { return nip19.nsecEncode(sk); }
export function npubOf(sk) { return nip19.npubEncode(getPublicKey(sk)); }
export function pubkeyOf(sk) { return getPublicKey(sk); }
export function npubFromHex(hex) { return nip19.npubEncode(hex); }
export function hexFromNpub(npub) { try { const d = nip19.decode(npub); return d.type === 'npub' ? d.data : null; } catch (e) { return null; } }

async function publish(sk, template) {
  const ev = finalizeEvent(template, sk);
  const results = await Promise.allSettled(pool.publish(RELAYS, ev));
  const ok = results.filter((r) => r.status === 'fulfilled').length;
  if (!ok) throw new Error('No relay accepted the event. Check the internet connection and try again.');
  return { event: ev, relays: ok };
}

export async function publishMember(sk, data, tag = TAG) {
  const now = Math.floor(Date.now() / 1000);
  const listing = await publish(sk, { kind: KIND, created_at: now, tags: [['d', D_MEMBER], ['t', tag]], content: JSON.stringify(data) });
  // also the ordinary Nostr profile, so the member shows up in every Nostr app with a zap button
  const meta = { name: data.name, display_name: data.name, about: [data.role, data.about].filter(Boolean).join('. '), lud16: data.lightning || undefined, picture: data.photo || undefined, website: (data.work && data.work[0] && data.work[0].url) || undefined };
  try { await publish(sk, { kind: 0, created_at: now, tags: [], content: JSON.stringify(meta) }); } catch (e) { /* the listing is what the site needs */ }
  return listing;
}
export async function removeMember(sk, tag = TAG) {
  return publish(sk, { kind: KIND, created_at: Math.floor(Date.now() / 1000), tags: [['d', D_MEMBER], ['t', tag]], content: JSON.stringify({ removed: true }) });
}
export function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'item'; }
export async function publishProduct(sk, data, tag = TAG) {
  const d = D_PRODUCT + slug(data.name);
  return publish(sk, { kind: KIND, created_at: Math.floor(Date.now() / 1000), tags: [['d', d], ['t', tag]], content: JSON.stringify(data) });
}
export async function removeProduct(sk, d, tag = TAG) {
  return publish(sk, { kind: KIND, created_at: Math.floor(Date.now() / 1000), tags: [['d', d], ['t', tag]], content: JSON.stringify({ removed: true }) });
}

// Returns the newest listing per (author, d). Members: what === 'member'. Products: what === 'product'.
export async function fetchListings(what = 'member', { tag = TAG, authors, maxWait = 6000 } = {}) {
  const filter = { kinds: [KIND], '#t': [tag], limit: 500 };
  if (authors) filter.authors = authors;
  let events = [];
  try { events = await pool.querySync(RELAYS, filter, { maxWait }); } catch (e) { events = []; }
  const latest = new Map();
  for (const ev of events) {
    const d = (ev.tags.find((t) => t[0] === 'd') || [])[1] || '';
    const isMember = d === D_MEMBER, isProduct = d.startsWith(D_PRODUCT);
    if ((what === 'member' && !isMember) || (what === 'product' && !isProduct)) continue;
    const k = ev.pubkey + '|' + d;
    if (!latest.has(k) || latest.get(k).created_at < ev.created_at) latest.set(k, ev);
  }
  const out = [];
  for (const ev of latest.values()) {
    let data; try { data = JSON.parse(ev.content); } catch (e) { continue; }
    if (!data || data.removed || typeof data !== 'object') continue;
    out.push({ pubkey: ev.pubkey, npub: nip19.npubEncode(ev.pubkey), d: (ev.tags.find((t) => t[0] === 'd') || [])[1], created_at: ev.created_at, data });
  }
  return out.sort((a, b) => b.created_at - a.created_at);
}

// ---- Passkey login: the phone is the login, nothing to write down ----
// The browser's passkey (fingerprint or face) derives the profile key through the WebAuthn PRF extension.
// Passkeys sync through Google Password Manager and iCloud Keychain, so a new phone signed into the same account gets the same key.
const PRF_SALT = new TextEncoder().encode('bitcoin-kakuma-hub/profile-key/v1');
const RP_NAME = 'Bitcoin Kakuma Hub';
const rand = (n) => crypto.getRandomValues(new Uint8Array(n));

export async function passkeySupported() {
  try {
    if (!window.PublicKeyCredential || !navigator.credentials) return false;
    if (!(await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())) return false;
    return true; // PRF itself is only knowable after a create() or get(); callers fall back when it is missing
  } catch (e) { return false; }
}

async function keyFromPrf(buf) {
  const base = await crypto.subtle.importKey('raw', buf, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: new TextEncoder().encode('nostr-secret-key') }, base, 256);
  const sk = new Uint8Array(bits);
  localStorage.setItem(KEY, nip19.nsecEncode(sk));
  return sk;
}

// Returning person: any passkey for this site, chosen by the phone. Resolves to the key, or null when there is none or PRF is unsupported.
export async function passkeyLogin() {
  const cred = await navigator.credentials.get({ publicKey: { challenge: rand(32), rpId: location.hostname, userVerification: 'required', extensions: { prf: { eval: { first: PRF_SALT } } } } });
  const ext = cred.getClientExtensionResults();
  if (!ext.prf || !ext.prf.results || !ext.prf.results.first) return null;
  return keyFromPrf(ext.prf.results.first);
}

// New person: make a passkey, then derive the key from it. Returns null when the phone cannot do PRF, so the caller uses a plain key instead.
export async function passkeyCreate(label) {
  const cred = await navigator.credentials.create({ publicKey: {
    challenge: rand(32), rp: { name: RP_NAME, id: location.hostname },
    user: { id: rand(16), name: label || 'My profile', displayName: label || 'My profile' },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
    extensions: { prf: { eval: { first: PRF_SALT } } } } });
  const ext = cred.getClientExtensionResults();
  if (!ext.prf || !ext.prf.enabled) return null;
  if (ext.prf.results && ext.prf.results.first) return keyFromPrf(ext.prf.results.first);
  return passkeyLogin(); // some phones only evaluate PRF on get()
}

// Backup file: one tap to save, one tap to restore. For phones without passkey sync.
export function backupText(sk) {
  return `Bitcoin Kakuma Hub profile backup\n\nThis file brings your profile back on a new phone.\nOpen the hub website, go to My profile, choose "Restore from backup file" and pick this file.\n\nKeep it somewhere that survives a lost phone: your Google Drive, your email, or a memory card.\nAnyone with this file can edit your profile, so do not share it.\n\n${nip19.nsecEncode(sk)}\n`;
}
export function restoreFromText(text) {
  const m = String(text || '').match(/nsec1[02-9ac-hj-np-z]{58}/);
  if (!m) throw new Error('No profile key found in that file.');
  return importKey(m[0]);
}
