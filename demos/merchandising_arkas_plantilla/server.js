// Servidor de TOMA (Node 18+, sin dependencias): sirve la web, guarda catálogo y pedidos,
// cobra con Stripe Checkout y reenvía el merch pagado a cada proveedor por webhook.
// Variables: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, ARTIST_KEY, SITE_URL, PORT,
// SUPPLIER_HOOKS='{"PrintLab Madrid":"https://hook.eu1.make.com/...","Press Sonido":"https://..."}'
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { PORT = 3000, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, ARTIST_KEY, RESEND_API_KEY, MAIL_FROM = 'TOMA <onboarding@resend.dev>' } = process.env;
const HOOKS = JSON.parse(process.env.SUPPLIER_HOOKS || '{}'), SITE = process.env.SITE_URL || `http://localhost:${PORT}`;
const DB = path.join(__dirname, 'data.json'), FILES = ['index.html', 'artista.html', 'style.css', 'script.js', 'artista.js', 'entrada.html', 'qr.js', 'stats.js', 'genero.html', 'perfil.html', 'seed.js', 'avatar.js'];
const MIME = { html: 'text/html; charset=utf-8', css: 'text/css', js: 'text/javascript' };
const load = () => { try { return JSON.parse(fs.readFileSync(DB, 'utf8')); } catch { return { products: [], events: [], orders: [] }; } };
const save = d => fs.writeFileSync(DB, JSON.stringify(d, null, 1));
const SEED = require('./seed.js'); // artistas, productos y conciertos de ejemplo (el mismo archivo que usa la web)
{ // Primer arranque, o datos antiguos sin artistas: se añade el catálogo de ejemplo y se conservan los productos propios
  const d = load();
  if (!d.artists) {
    d.products = d.products.filter(p => !/^p\d+$/.test(p.id)).concat(SEED.products);
    d.events = d.events.filter(e => !/^e\d+$/.test(e.id)).concat(SEED.events);
    d.artists = SEED.artists; save(d);
  }
}
const send = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
const readBody = req => new Promise((ok, ko) => { const b = []; let n = 0; req.on('data', c => { n += c.length; if (n > 1e6) { ko(new Error('big')); req.destroy(); } else b.push(c); }); req.on('end', () => ok(Buffer.concat(b))); });
const S = (v, n) => String(v ?? '').slice(0, n), N = v => Number.isFinite(+v) ? +v : 0, today = () => new Date().toISOString().slice(0, 10);
const color = c => /^#[0-9a-f]{6}$/i.test(c) ? c : '#C9A24B', rid = (p, id) => new RegExp(`^${p}[a-z0-9]{4,24}$`).test(id) ? id : p + crypto.randomBytes(4).toString('hex');
const CLEAN = {
  products: b => ({ id: rid('p', b.id), artist: S(b.artist, 40), genre: S(b.genre, 20), color: color(b.color), type: S(b.type, 20), name: S(b.name, 50), text: S(b.text, 12), price: Math.max(1, N(b.price)), supplier: S(b.supplier, 40), colors: (Array.isArray(b.colors) ? b.colors : []).slice(0, 8).map(color), textColor: b.textColor ? color(b.textColor) : '', design: /^data:image\/(png|jpeg);base64,[A-Za-z0-9+\/=]+$/.test(b.design) && b.design.length <= 400000 ? b.design : '', scale: Math.min(100, Math.max(30, N(b.scale) || 80)), dy: Math.min(30, Math.max(-30, N(b.dy))), motif: b.motif === '' ? '' : /^[a-z]{2,12}$/.test(b.motif || '') ? b.motif : undefined }),
  events: b => ({ id: rid('e', b.id), artist: S(b.artist, 40), genre: S(b.genre, 20), color: color(b.color), city: S(b.city, 40), venue: S(b.venue, 60), date: S(b.date, 10), price: Math.max(0, N(b.price)), stock: Math.max(0, Math.floor(N(b.stock))) })
};

CLEAN.artists = b => ({ id: rid('a', b.id), name: S(b.name, 40), genre: S(b.genre, 20), city: S(b.city, 40), bio: S(b.bio, 240), avatar: /^data:image\/(png|jpeg);base64,[A-Za-z0-9+\/=]+$/.test(b.avatar) && b.avatar.length <= 150000 ? b.avatar : '' });
const ensureArtist = (d, it) => { if (!d.artists.some(a => a.name === it.artist)) d.artists.push({ id: rid('a', ''), name: it.artist, genre: it.genre, city: '', bio: '', avatar: '' }); };
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
async function mail(o) { // Email de confirmación con Resend (resend.com). Sin RESEND_API_KEY no se envía.
  if (!RESEND_API_KEY || !o.buyer.email) return;
  const html = `<h2>¡Gracias, ${esc(o.buyer.name)}!</h2><p>Pedido ${o.id}: ${o.items.map(i => `${i.qty}× ${esc(i.name)}`).join(', ')}. Total ${o.total.toFixed(2)} €.</p>`
    + (o.tickets?.length ? '<p>Tus entradas:</p>' + o.tickets.map(t => `<p><a href="${SITE}/entrada.html?c=${t.code}">${esc(t.title)}</a></p>`).join('') : '')
    + (o.supplierOrders?.length ? '<p>Tu merch ya está en producción.</p>' : '');
  try { await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: MAIL_FROM, to: o.buyer.email, subject: `Tu pedido ${o.id} en TOMA`, html }) }); } catch { /* el pedido sigue adelante */ }
}
async function fulfil(d, o) { // Pedido pagado: descuenta entradas y envía el merch a cada proveedor.
  o.status = 'pagado'; const by = {};
  for (const i of o.items) {
    if (i.kind === 'e') { const e = d.events.find(x => x.id === i.id); if (e) e.stock = Math.max(0, e.stock - i.qty); for (let k = 0; k < i.qty; k++) (o.tickets ??= []).push({ code: `${o.id}-${crypto.randomBytes(8).toString('hex')}`, eventId: i.id, title: i.name, used: false }); }
    else (by[i.supplier] ??= []).push(i);
  }
  o.supplierOrders = [];
  for (const [supplier, items] of Object.entries(by)) {
    let status = 'sin conexión con el proveedor';
    if (HOOKS[supplier]) try {
      const r = await fetch(HOOKS[supplier], { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: o.id, shipTo: o.buyer, items }) });
      status = r.ok ? 'enviado' : 'error ' + r.status;
    } catch { status = 'error de red'; }
    o.supplierOrders.push({ supplier, items, status });
  }
  o.status = !o.supplierOrders.length ? 'entregado' : o.supplierOrders.every(s => s.status === 'enviado') ? 'en producción' : 'pagado';
  await mail(o);
}

async function checkout(b) { // El servidor recalcula precios y stock: nunca se fía de los del navegador.
  const d = load(), items = [], buyer = b.buyer || {}; let merch = 0;
  for (const l of Array.isArray(b.items) ? b.items : []) {
    const qty = Math.min(8, Math.max(1, Math.floor(N(l.qty)))), p = d.products.find(x => x.id === l.id), e = d.events.find(x => x.id === l.id);
    if (p) { items.push({ kind: 'p', id: p.id, artist: p.artist, name: p.name, type: p.type, supplier: p.supplier, size: S(l.size, 3), color: l.color ? color(l.color) : '', qty, price: p.price }); merch += p.price * qty; }
    else if (e && e.stock >= qty && e.date >= today()) items.push({ kind: 'e', id: e.id, artist: e.artist, name: `Entrada: ${e.artist} en ${e.city}`, qty, price: e.price });
    else return [400, { error: 'Algún artículo ya no está disponible' }];
  }
  if (!items.length) return [400, { error: 'El carrito está vacío' }];
  const ship = merch > 0 && merch < 60 ? 4.9 : 0, id = 'TM-' + (1001 + d.orders.filter(x => !x.demo).length);
  const o = { id, date: today(), buyer: { name: S(buyer.name, 80), email: S(buyer.email, 120), address: S(buyer.address, 120), city: S(buyer.city, 60), zip: S(buyer.zip, 12) }, items, ship, total: items.reduce((a, i) => a + i.price * i.qty, 0) + ship, status: 'pendiente de pago' };
  d.orders.push(o);
  if (!STRIPE_SECRET_KEY) { await fulfil(d, o); save(d); return [200, { id, tickets: (o.tickets || []).map(({ code, title }) => ({ code, title })) }]; } // modo demostración
  const f = new URLSearchParams({ mode: 'payment', success_url: `${SITE}/?pedido=${id}`, cancel_url: SITE, customer_email: o.buyer.email, 'metadata[order]': id });
  (ship ? [...items, { name: 'Envío', qty: 1, price: ship }] : items).forEach((i, n) => {
    f.set(`line_items[${n}][quantity]`, i.qty); f.set(`line_items[${n}][price_data][currency]`, 'eur');
    f.set(`line_items[${n}][price_data][unit_amount]`, Math.round(i.price * 100));
    f.set(`line_items[${n}][price_data][product_data][name]`, i.name + (i.size ? ` (talla ${i.size})` : ''));
  });
  if (merch > 0) ['ES', 'PT', 'FR', 'IT', 'DE'].forEach((c, n) => f.set(`shipping_address_collection[allowed_countries][${n}]`, c));
  const r = await fetch('https://api.stripe.com/v1/checkout/sessions', { method: 'POST', headers: { Authorization: 'Bearer ' + STRIPE_SECRET_KEY }, body: f });
  const s = await r.json();
  if (!r.ok) return [502, { error: s.error?.message || 'No se pudo iniciar el pago' }];
  save(d); return [200, { url: s.url }];
}

const valid = (req, buf) => { // Comprueba la firma de Stripe (HMAC-SHA256) antes de fiarse del aviso.
  const s = Object.fromEntries(String(req.headers['stripe-signature'] || '').split(',').map(p => p.split('=')));
  if (!STRIPE_WEBHOOK_SECRET || !s.t || !s.v1 || Math.abs(Date.now() / 1000 - s.t) > 300) return false;
  const h = crypto.createHmac('sha256', STRIPE_WEBHOOK_SECRET).update(s.t + '.').update(buf).digest('hex');
  return h.length === s.v1.length && crypto.timingSafeEqual(Buffer.from(h), Buffer.from(s.v1));
};

http.createServer(async (req, res) => {
  try {
    const p = new URL(req.url, SITE).pathname, file = p === '/' ? 'index.html' : p.slice(1);
    if (req.method === 'GET' && FILES.includes(file)) { res.writeHead(200, { 'Content-Type': MIME[file.split('.').pop()] }); return res.end(fs.readFileSync(path.join(__dirname, file))); }
    if (p === '/api/catalog') { const d = load(); return send(res, 200, { products: d.products, events: d.events, artists: d.artists || [] }); }
    if (p === '/api/checkout' && req.method === 'POST') { const [code, body] = await checkout(JSON.parse(await readBody(req))); return send(res, code, body); }
    if (p === '/api/stripe-webhook' && req.method === 'POST') {
      const buf = await readBody(req); if (!valid(req, buf)) return send(res, 400, { error: 'Firma no válida' });
      const ev = JSON.parse(buf), d = load(), o = d.orders.find(x => x.id === ev.data?.object?.metadata?.order);
      if (ev.type === 'checkout.session.completed' && o?.status === 'pendiente de pago') { await fulfil(d, o); save(d); }
      return send(res, 200, { ok: true });
    }
    const keyOk = !ARTIST_KEY || req.headers['x-artist-key'] === ARTIST_KEY;
    if (p === '/api/orders' && req.method === 'GET') return keyOk ? send(res, 200, load().orders) : send(res, 401, { error: 'Clave de artista incorrecta' });
    const st = p.match(/^\/api\/orders\/([\w-]+)\/status$/);
    if (st && req.method === 'POST') { // Seguimiento: el artista cambia el estado del pedido y anota el envío
      if (!keyOk) return send(res, 401, { error: 'Clave de artista incorrecta' });
      const d = load(), o = d.orders.find(x => x.id === st[1]), b = JSON.parse(await readBody(req));
      if (!o || !['pagado', 'en producción', 'enviado', 'entregado'].includes(b.status)) return send(res, 400, { error: 'Estado no válido' });
      o.status = b.status; if (b.tracking) o.tracking = S(b.tracking, 40); save(d); return send(res, 200, { ok: true });
    }
    if (p === '/api/demo' && ['POST', 'DELETE'].includes(req.method)) { // Pedidos de ejemplo para ver las estadísticas
      if (!keyOk) return send(res, 401, { error: 'Clave de artista incorrecta' });
      const d = load(); d.orders = d.orders.filter(o => !o.demo);
      if (req.method === 'POST') (JSON.parse(await readBody(req)).orders || []).slice(0, 300).forEach((o, n) => d.orders.push({ id: 'DEMO-' + (n + 1), demo: true, date: S(o.date, 10), buyer: { name: S(o.buyer?.name, 40), city: S(o.buyer?.city, 40) }, items: (o.items || []).slice(0, 6).map(i => ({ kind: i.kind === 'e' ? 'e' : 'p', id: S(i.id, 24), artist: S(i.artist, 40), name: S(i.name, 60), type: S(i.type, 20), supplier: S(i.supplier, 40), qty: Math.min(8, Math.max(1, N(i.qty) | 0)), price: Math.max(0, N(i.price)) })), ship: 0, total: Math.max(0, N(o.total)), status: ['pagado', 'en producción', 'enviado', 'entregado'].includes(o.status) ? o.status : 'entregado' }));
      save(d); return send(res, 200, { ok: true });
    }
    const tk = p.match(/^\/api\/ticket\/([\w-]+)(\/use)?$/);
    if (tk) { // Entradas: consulta pública con el código (imposible de adivinar) y validación en puerta solo para el artista
      const d = load(), t = d.orders.flatMap(o => o.tickets || []).find(x => x.code === tk[1]), e = t && d.events.find(x => x.id === t.eventId);
      if (!t) return send(res, 404, { error: 'Entrada no encontrada' });
      if (!tk[2]) return send(res, 200, { title: t.title, venue: e ? `${e.venue}, ${e.city}` : '', date: e ? e.date : '', used: t.used });
      if (req.method !== 'POST' || !keyOk) return send(res, 401, { error: 'Clave de artista incorrecta' });
      if (t.used) return send(res, 409, { error: 'Entrada ya utilizada' });
      t.used = true; save(d); return send(res, 200, { ok: true, title: t.title });
    }
    const m = p.match(/^\/api\/(products|events|artists)(?:\/(\w+))?$/);
    if (m && ['POST', 'DELETE'].includes(req.method)) {
      if (ARTIST_KEY && req.headers['x-artist-key'] !== ARTIST_KEY) return send(res, 401, { error: 'Clave de artista incorrecta' });
      const d = load();
      if (req.method === 'POST') {
        const it = CLEAN[m[1]](JSON.parse(await readBody(req)));
        if (m[1] === 'artists') { const old = d.artists.find(a => a.name === it.name); old ? Object.assign(old, { ...it, id: old.id }) : d.artists.push(it); }
        else { d[m[1]].push(it); ensureArtist(d, it); }
        save(d); return send(res, 201, it);
      }
      d[m[1]] = d[m[1]].filter(x => x.id !== m[2]); save(d); return send(res, 200, { ok: true });
    }
    send(res, 404, { error: 'No encontrado' });
  } catch { send(res, 400, { error: 'Solicitud no válida' }); }
}).listen(PORT, () => console.log(`TOMA en ${SITE}` + (STRIPE_SECRET_KEY ? '' : ' (sin STRIPE_SECRET_KEY: pagos en modo demostración)') + (ARTIST_KEY ? '' : ' (sin ARTIST_KEY: cualquiera puede publicar y ver pedidos; defínela en producción)')));
