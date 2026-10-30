// Beta password lock, checked on Cloudflare's servers (Pages Functions).
// Nothing on the site (beta page, map, images) is sent until the visitor has unlocked.
//
// The password comes from the BETA_PASSWORD environment variable in Cloudflare
// (Pages project → Settings → Variables and Secrets). Until that is set, a fallback
// hash is used. Unlocking sets a signed, HttpOnly cookie that lasts 30 days.

const FALLBACK_HASH = '1a156e1d7914fd17a78f4397958299d63b79641fe6dc1c02f70ac046ee445059'; // sha256("shs-atlas:" + password)
const COOKIE = 'shs_beta';
// dev console: its code (/_dev/*) is only sent with a second cookie, set by the dev code (DEV_PASSWORD env var, else this hash)
const DEV_FALLBACK_HASH = '0f258daac991ed59d10bf7833b926b60e3319df6e12f67c62987888b84f3d60d'; // sha256("shs-atlas-dev:" + code)
const DEV_COOKIE = 'shs_dev';
const BAN_COOKIE = 'shs_ban';
const BAN_SECS = 2 * 24 * 3600; // wrong dev code = locked out for 2 days (the page says it's permanent)
const OPEN = ['/favicon.png', '/apple-touch-icon.png', '/logo.png'];

const enc = new TextEncoder();
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const sha = async s => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

async function secretHash(env) {
  return env.BETA_PASSWORD ? sha('shs-atlas:' + env.BETA_PASSWORD) : FALLBACK_HASH;
}
// cookie value = HMAC of "unlocked" keyed by the password hash, so it can't be forged without the password
async function token(env) {
  const key = await crypto.subtle.importKey('raw', enc.encode(await secretHash(env)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode('unlocked')));
}
function same(a, b) { // constant-time compare
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
function cookieOf(req, name = COOKIE) {
  const m = (req.headers.get('Cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([a-f0-9]+)'));
  return m ? m[1] : '';
}
async function devHash(env) { return env.DEV_PASSWORD ? sha('shs-atlas-dev:' + env.DEV_PASSWORD) : DEV_FALLBACK_HASH; }
async function devToken(env) {
  const key = await crypto.subtle.importKey('raw', enc.encode(await devHash(env)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode('dev')));
}

async function banSig(env, exp) {
  const key = await crypto.subtle.importKey('raw', enc.encode('ban:' + await devHash(env)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, enc.encode(String(exp))));
}
async function banned(req, env) {
  const m = (req.headers.get('Cookie') || '').match(/(?:^|;\s*)shs_ban=(\d+)\.([a-f0-9]+)/);
  if (!m || Number(m[1]) < Date.now()) return false;
  return same(m[2], await banSig(env, m[1]));
}
const clearBan = `${BAN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

export async function onRequest(ctx) {
  const { request, env, next } = ctx;
  const url = new URL(request.url);

  // hidden way back in: the ban page's secret trigger posts the dev code here
  if (url.pathname === '/__unban' && request.method === 'POST') {
    const code = String((await request.formData()).get('code') || '').trim();
    if (!same(await sha('shs-atlas-dev:' + code), await devHash(env))) { await new Promise(r => setTimeout(r, 1500)); return new Response('no', { status: 403 }); }
    return new Response('ok', { headers: { 'Set-Cookie': clearBan, 'Cache-Control': 'no-store' } });
  }
  if (!OPEN.includes(url.pathname) && await banned(request, env)) return banPage();

  if (url.pathname === '/__lock') { // sign out of the beta (and dev) on this device
    return new Response(null, { status: 303, headers: [['Location', '/'], ['Set-Cookie', `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`], ['Set-Cookie', `${DEV_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`]] });
  }
  if (url.pathname === '/__dev') {
    if (request.method !== 'POST' || !same(cookieOf(request), await token(env))) return new Response('no', { status: 403 });
    const code = String((await request.formData()).get('code') || '').trim();
    if (!same(await sha('shs-atlas-dev:' + code), await devHash(env))) {
      await new Promise(r => setTimeout(r, 1500));
      const exp = Date.now() + BAN_SECS * 1000;
      return new Response('no', { status: 403, headers: { 'Set-Cookie': `${BAN_COOKIE}=${exp}.${await banSig(env, exp)}; Path=/; Max-Age=${BAN_SECS}; HttpOnly; Secure; SameSite=Lax`, 'Cache-Control': 'no-store' } });
    }
    return new Response('ok', { headers: { 'Set-Cookie': `${DEV_COOKIE}=${await devToken(env)}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Strict`, 'Cache-Control': 'no-store' } });
  }
  if (url.pathname.startsWith('/_dev/')) {
    if (!same(cookieOf(request), await token(env)) || !same(cookieOf(request, DEV_COOKIE), await devToken(env))) return new Response('Not found', { status: 404 });
    const res = await next(); const o = new Response(res.body, res); o.headers.set('Cache-Control', 'private, no-store'); return o;
  }
  if (url.pathname === '/__unlock' && request.method === 'POST') {
    const form = await request.formData();
    const pw = String(form.get('pw') || '').trim();
    const back = String(form.get('back') || '/');
    const dest = back.startsWith('/') && !back.startsWith('//') ? back : '/';
    if (same(await sha('shs-atlas:' + pw), await secretHash(env))) {
      return new Response(null, { status: 303, headers: {
        Location: dest,
        'Set-Cookie': `${COOKIE}=${await token(env)}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
        'Cache-Control': 'no-store' } });
    }
    await new Promise(r => setTimeout(r, 800)); // slow down guessing
    return lockPage(dest, true);
  }

  if (OPEN.includes(url.pathname)) return next();
  if (same(cookieOf(request), await token(env))) {
    const res = await next();
    const out = new Response(res.body, res);
    out.headers.set('Cache-Control', 'private, no-store');
    return out;
  }
  return lockPage(url.pathname + url.search, false);
}

function lockPage(back, wrong) {
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>SHS Atlas (beta)</title><meta name="robots" content="noindex">
<link rel="icon" type="image/png" href="/favicon.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@700&display=swap">
<style>
  :root { --bg:#fff; --fg:#111; --green:#007236; --ink:#fff; --edge:#004d24; --line:#bbb; --err:#d01c1c;
    --fun:"Comic Sans MS","Comic Sans","Comic Neue","Chalkboard SE",cursive; color-scheme:light; }
  @media (prefers-color-scheme: dark) { :root { --bg:#161616; --fg:#eee; --green:#2fbf62; --ink:#04170b; --edge:#7fe0a3; --line:#444; --err:#ff7a7a; color-scheme:dark; } }
  body { margin:0; background:var(--bg); color:var(--fg); font:17px/1.5 Verdana,Geneva,Tahoma,sans-serif; }
  .page { max-width:640px; margin:0 auto; padding:24px 16px 48px; }
  header { display:flex; align-items:center; gap:14px; }
  header img { width:58px; height:auto; }
  h1 { font-family:var(--fun); color:var(--green); font-size:42px; line-height:1; margin:0; }
  .beta { display:inline-block; vertical-align:middle; font-family:var(--fun); font-size:15px; font-weight:700; color:#111; background:#ffd400; border:1px solid #111; padding:1px 7px; margin-left:6px; transform:rotate(-4deg); position:relative; top:-4px; }
  form { margin:22px 0; padding:14px; border:1px solid var(--line); }
  label { display:block; font-family:var(--fun); font-weight:700; font-size:19px; margin-bottom:8px; }
  input { font:22px Verdana,sans-serif; width:8em; padding:6px 8px; border:2px solid var(--line); background:var(--bg); color:var(--fg); letter-spacing:.2em; }
  button { font-family:var(--fun); font-weight:700; font-size:18px; padding:7px 16px; margin-left:6px; color:var(--ink); background:var(--green); border:2px solid var(--edge); border-radius:6px; cursor:pointer; }
  :focus-visible { outline:3px solid var(--green); outline-offset:2px; }
  .err { color:var(--err); font-weight:700; margin:8px 0 0; min-height:1.4em; }
</style></head>
<body><div class="page">
  <header><img src="/logo.png" alt="Stevenson Patriots logo"><h1>SHS Atlas <span class="beta">BETA</span></h1></header>
  <form method="post" action="/__unlock" autocomplete="off">
    <label for="pw">Beta password</label>
    <input id="pw" name="pw" type="password" inputmode="numeric" maxlength="32" autofocus required>
    <input type="hidden" name="back" id="back" value="${esc(back)}">
    <button type="submit">Unlock</button>
    <p class="err" aria-live="polite">${wrong ? 'Wrong password. Ask whoever sent you the link.' : ''}</p>
  </form>
</div>
<script>/* keep #room=… links working after unlocking */ var b=document.getElementById('back'); if(location.hash) b.value=b.value.split('#')[0]+location.hash;</script>
</body></html>`;
  return new Response(html, { status: wrong ? 401 : 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

function banPage() {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Access denied</title><meta name="robots" content="noindex"><link rel="icon" type="image/png" href="/favicon.png">
<style>
  body { margin:0; min-height:100vh; display:grid; place-items:center; background:#0b0b0b; color:#eee; font:17px/1.5 Verdana,Geneva,Tahoma,sans-serif; text-align:center; padding:24px; box-sizing:border-box; }
  h1 { color:#ff3b3b; font-size:34px; margin:0 0 12px; letter-spacing:.02em; }
  p { margin:6px 0; color:#bbb; } code { color:#888; font-size:13px; }
  #dot { cursor:default; user-select:none; -webkit-user-select:none; -webkit-tap-highlight-color:transparent; }
</style></head>
<body><div>
  <h1>&#9940; ACCESS PERMANENTLY REVOKED</h1>
  <p>This device has been banned from SHS Atlas for attempting unauthorized access.</p>
  <p>This action is permanent and cannot be appealed<span id="dot">.</span></p>
  <p><code>ERR_DEVICE_BLACKLISTED</code></p>
</div>
<script>
// secret: tap the period after "appealed" 5 times quickly, then enter the dev code
(function(){ var t=[]; document.getElementById('dot').addEventListener('click', async function(){
  var n=Date.now(); t=t.filter(function(x){return n-x<2500}); t.push(n); if(t.length<5) return; t=[];
  var c=prompt(''); if(!c) return; var f=new FormData(); f.set('code',c);
  var r=await fetch('/__unban',{method:'POST',body:f,credentials:'same-origin'}).catch(function(){return null});
  if(r&&r.ok) location.href='/'; }); })();
</script></body></html>`;
  return new Response(html, { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
