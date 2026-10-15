(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eur = n => Number(n).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('toma-' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('toma-' + k, JSON.stringify(v)); return true; } catch { return false; } }
};
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const norm = t => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const hex = c => /^#[0-9a-f]{6}$/i.test(c) ? c : '#C9A24B';
// id: [nombre, categoría, ¿lleva talla?]
const CATALOG = {
  tee: ['Camiseta', 'Ropa', 1], hoodie: ['Sudadera', 'Ropa', 1], cap: ['Gorra', 'Ropa'], beanie: ['Gorro', 'Ropa'], socks: ['Calcetines', 'Ropa'],
  vinyl: ['Vinilo', 'Música'], cd: ['CD', 'Música'], cassette: ['Casete', 'Música'],
  tote: ['Tote bag', 'Accesorios'], pin: ['Chapa', 'Accesorios'], sticker: ['Pegatinas', 'Accesorios'], patch: ['Parche', 'Accesorios'], keychain: ['Llavero', 'Accesorios'], phonecase: ['Funda de móvil', 'Accesorios'],
  strap: ['Correa de guitarra', 'Instrumentos'], pick: ['Púas', 'Instrumentos'], drumsticks: ['Baquetas', 'Instrumentos'],
  mug: ['Taza', 'Hogar'], bottle: ['Botella', 'Hogar'], poster: ['Póster', 'Hogar']
};
const TYPES = Object.fromEntries(Object.entries(CATALOG).map(([k, v]) => [k, v[0]]));
const CATS = [...new Set(Object.values(CATALOG).map(v => v[1]))];
const SIZED = Object.keys(CATALOG).filter(k => CATALOG[k][2]);
const GENRES = ['Pop', 'Rock', 'Urbano', 'Electrónica', 'Flamenco', 'Indie', 'Jazz', 'Folk', 'Clásica'];
// Costes base estimados (EUR por unidad, sin envío). Camisetas y sudaderas siguen comparativas de 2026
// (Printify es el más barato; Gelato produce cerca del cliente); el resto son estimaciones: usa los precios reales de tu cuenta.
const SUPPLIERS = {
  Printify: { tee: 6.5, hoodie: 18, cap: 8, beanie: 8.5, socks: 7, tote: 6, phonecase: 7.5, mug: 5.5, bottle: 9, poster: 5, pin: 1.3, sticker: .6, patch: 1.5, keychain: 2, strap: 11, pick: .5, drumsticks: 7 },
  Gelato: { tee: 7.5, hoodie: 17.5, cap: 8.5, tote: 6.5, mug: 5, poster: 4.5, phonecase: 8, bottle: 9.5, sticker: .7 },
  SPOD: { tee: 7, hoodie: 18.5, cap: 7.5, beanie: 8, socks: 6.5, tote: 6.5, mug: 5.5, poster: 5 },
  Printful: { tee: 9, hoodie: 21, cap: 11, beanie: 11, socks: 10, tote: 9, phonecase: 10, mug: 7, bottle: 11, poster: 7, sticker: 1, pin: 2.5, patch: 3 },
  'Fábrica de discos': { vinyl: 8, cd: 1.6, cassette: 2.5 } // tiradas mínimas de 300 unidades o más
};
const FEE = .1;
const SHAPES = {
  tee: 'M40 18L18 30 6 52l22 11 6-9v48h52V54l6 9 22-11-12-22-22-12C76 27 68 31 60 31S44 27 40 18Z',
  hoodie: 'M44 14C46 24 53 28 60 28S74 24 76 14L92 20 112 62 96 70 88 56V104H32V56L24 70 8 62 28 20Z',
  cap: 'M24 78C24 48 40 30 62 30S98 48 98 78ZM18 80H98C108 80 117 86 117 93 96 86 46 87 18 90Z',
  beanie: 'M26 82C26 46 42 28 60 28S94 46 94 82ZM22 82H98V98H22Z',
  socks: 'M40 10H80V66L98 84C106 94 100 108 86 108H52C40 108 34 98 40 88Z',
  vinyl: 'M8 60a52 52 0 1 0 104 0 52 52 0 1 0-104 0Z', cd: 'M16 60a44 44 0 1 0 88 0 44 44 0 1 0-88 0Z',
  cassette: 'M10 28H110V94H92L86 80H34L28 94H10Z', tote: 'M26 44H94L100 108H20Z',
  pin: 'M30 60a30 30 0 1 0 60 0 30 30 0 1 0-60 0Z', sticker: 'M60 6L75 34 106 38 83 60 90 92 60 77 30 92 37 60 14 38 45 34Z',
  patch: 'M26 30H94C102 30 108 36 108 44V76C108 84 102 90 94 90H26C18 90 12 84 12 76V44C12 36 18 30 26 30Z',
  keychain: 'M34 40H86V108H34Z',
  phonecase: 'M34 8H86C92 8 96 12 96 18V102C96 108 92 112 86 112H34C28 112 24 108 24 102V18C24 12 28 8 34 8Z',
  strap: 'M8 36H112V84H8Z', pick: 'M60 10C92 10 106 40 98 64 90 90 72 110 60 110S30 90 22 64C14 40 28 10 60 10Z',
  drumsticks: 'M16 98L84 30 92 38 24 106ZM104 98L36 30 28 38 96 106Z',
  mug: 'M20 30H84V98C84 104 80 108 74 108H30C24 108 20 104 20 98ZM84 44H98C110 44 110 78 90 78H84V70H92C100 70 100 52 90 52H84Z',
  bottle: 'M48 8H72V24L84 40V104C84 108 80 112 76 112H44C40 112 36 108 36 104V40L48 24Z', poster: 'M24 10H96V110H24Z'
};
const EXTRA = { tote: 'M44 46V34C44 12 76 12 76 34V46', keychain: 'M46 42C42 6 78 6 74 42' };
// Zona de impresión [x, y, ancho, alto] de cada producto (viewBox 120x120)
const PA = { tee: [38, 38, 44, 44], hoodie: [40, 44, 40, 36], cap: [44, 38, 36, 28], beanie: [40, 46, 40, 30], socks: [44, 18, 32, 40], vinyl: [40, 40, 40, 40], cd: [44, 44, 32, 32], cassette: [20, 34, 80, 40], tote: [34, 56, 52, 46], pin: [40, 40, 40, 40], sticker: [38, 36, 44, 44], patch: [20, 38, 80, 44], keychain: [38, 52, 44, 48], phonecase: [32, 34, 56, 60], strap: [20, 42, 80, 36], pick: [38, 34, 44, 52], drumsticks: [40, 40, 40, 40], mug: [28, 42, 48, 50], bottle: [40, 46, 36, 50], poster: [28, 18, 64, 84] };
const PALETTE = ['#FFFFFF', '#0B0B0B', '#C9A24B', '#BFE3C8', '#8D8D95', '#1E3A8A', '#B91C1C', '#15803D'];
const lum = c => (parseInt(c.slice(1, 3), 16) * 299 + parseInt(c.slice(3, 5), 16) * 587 + parseInt(c.slice(5, 7), 16) * 114) / 1000;
const IMG = /^data:image\/(png|jpeg);base64,[A-Za-z0-9+\/=]+$/;
const GENRE_MOTIF = { Pop: 'burst', Rock: 'bolt', Urbano: 'crown', 'Electrónica': 'rings', Flamenco: 'fan', Indie: 'sun', Jazz: 'keys', Folk: 'leaf', 'Clásica': 'staff' };
// Dibujo propio de cada género (caja de 100x100)
const MOTIFS = {
  burst: '<path d="M50 4l9 25 24-12-9 26 26 4-21 16 16 21-26-3 2 26-21-15-21 15 2-26-26 3 16-21L4 47l26-4-9-26 24 12z"/>',
  bolt: '<path d="M60 2L20 58h26l-8 40 42-58H54z"/>',
  crown: '<path d="M8 74V28l24 22 18-34 18 34 24-22v46zM8 82h84v10H8z"/>',
  rings: '<g fill="none" stroke-width="6"><circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="29"/><circle cx="50" cy="50" r="14"/></g>',
  fan: '<g fill="none" stroke-width="5" stroke-linecap="round"><path d="M50 92L10 40M50 92L28 26M50 92V20M50 92L72 26M50 92L90 40M10 40A56 56 0 0 1 90 40"/></g>',
  sun: '<circle cx="50" cy="50" r="18"/><g stroke-width="5" stroke-linecap="round"><path d="M50 6v14M50 80v14M6 50h14M80 50h14M19 19l10 10M71 71l10 10M81 19L71 29M29 71L19 81"/></g>',
  keys: '<g fill="none" stroke-width="5"><path d="M8 18h84v64H8zM29 18v64M50 18v64M71 18v64"/></g><path d="M23 18h12v36H23zM44 18h12v36H44zM65 18h12v36H65z"/>',
  leaf: '<path d="M50 94C18 72 12 36 50 6c38 30 32 66 0 88z"/>',
  staff: '<g fill="none" stroke-width="3"><path d="M6 28h88M6 40h88M6 52h88M6 64h88M6 76h88"/></g><ellipse cx="36" cy="68" rx="11" ry="8"/><path d="M45 66V18" stroke-width="5" fill="none"/><path d="M45 18c16 4 22 16 17 30" stroke-width="5" fill="none"/>'
};
let mid = 0;
// Maqueta: producto en su color, estampado dentro de su zona de impresión y luces y sombras de tejido.
const mock = (p, base, guide = false) => {
  const t = SHAPES[p.type] ? p.type : 'tee', c = hex(base || p.base || p.color), [x, y, w, h] = PA[t], id = 'm' + ++mid;
  const tc = hex(p.textColor || (lum(c) > 150 ? '#0B0B0B' : '#FFFFFF')), txt = String(p.text || ''), k = (p.scale || 85) / 100;
  const cx = x + w / 2, cy = y + h / 2 + (p.dy || 0) * h / 100;
  const m = MOTIFS[p.motif === undefined ? GENRE_MOTIF[p.genre] : p.motif];
  let print = '';
  if (IMG.test(p.design || '')) print = `<image href="${p.design}" x="${(cx - w * k / 2).toFixed(1)}" y="${(cy - h * k / 2).toFixed(1)}" width="${(w * k).toFixed(1)}" height="${(h * k).toFixed(1)}" preserveAspectRatio="xMidYMid meet"/>`;
  else {
    const ms = m ? Math.min(w * k, h * k * (txt ? .68 : 1)) : 0, top = cy - h * k / 2;
    if (m) print += `<g transform="translate(${(cx - ms / 2).toFixed(1)} ${top.toFixed(1)}) scale(${(ms / 100).toFixed(3)})" fill="${tc}" stroke="${tc}">${m}</g>`;
    if (txt) { const fs = Math.min(w * k / (.62 * txt.length), h * k * (m ? .24 : .8)), ty = m ? top + ms + fs * 1.05 : cy + fs * .35; print += `<text x="${cx}" y="${ty.toFixed(1)}" text-anchor="middle" textLength="${(.62 * fs * txt.length).toFixed(1)}" lengthAdjust="spacingAndGlyphs" font-family="Playfair Display,Georgia,serif" font-weight="700" font-size="${fs.toFixed(1)}" fill="${tc}">${esc(txt)}</text>`; }
  }
  return `<svg viewBox="0 0 120 120" role="img" aria-label="${esc(TYPES[t])}"><defs><clipPath id="${id}c"><path d="${SHAPES[t]}"/></clipPath><linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient></defs>${EXTRA[t] ? `<path d="${EXTRA[t]}" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>` : ''}<path d="${SHAPES[t]}" fill="${c}"/><g clip-path="url(#${id}c)">${print}</g><path d="${SHAPES[t]}" fill="url(#${id}s)" stroke="#000" stroke-opacity=".12"/>${guide ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="none" stroke="#B8923A" stroke-width=".8" stroke-dasharray="2 2"/>` : ''}</svg>`;
};

const SEED = window.SEED; // artistas, productos y conciertos de ejemplo (seed.js)
if (SEED && store.get('seeded') !== 2) { // se conservan los productos y conciertos creados por el usuario
  const own = (k, re) => store.get(k, []).filter(x => !re.test(x.id));
  store.set('products', [...own('products', /^p\d+$/), ...SEED.products]);
  store.set('events', [...own('events', /^e\d+$/), ...SEED.events]);
  store.set('artists', SEED.artists); store.set('seeded', 2);
}
const products = () => store.get('products', []), events = () => store.get('events', []);
const artists = () => store.get('artists', []);
// Icono de información: al pasar el ratón o enfocarlo con el teclado muestra la explicación
const tip = t => `<span class="tip" tabindex="0" role="img" aria-label="${esc(t)}" data-tip="${esc(t)}">i</span>`;
const addTip = (el, t) => { if (!el) return; const n = [...el.childNodes].find(x => x.nodeType === 3 && x.textContent.trim()), s = document.createElement('template'); s.innerHTML = tip(t); n ? n.after(s.content) : el.append(s.content); };
let tt;
const toast = m => { const t = $('#toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2200); };
window.TOMA = { $, $$, esc, eur, store, uid, hex, TYPES, CATALOG, CATS, GENRES, SUPPLIERS, FEE, PALETTE, mock, products, events, artists, toast, tip, addTip };
document.documentElement.dataset.theme = store.get('theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
const tb = $('#theme');
if (tb) tb.addEventListener('click', () => { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; store.set('theme', t); });

const QR = window.QR || (() => '');
if ($('#ticket')) { // entrada.html: muestra la entrada con su QR
  const code = new URLSearchParams(location.search).get('c') || '';
  fetch('/api/ticket/' + encodeURIComponent(code)).then(r => r.ok ? r.json() : Promise.reject()).then(t => {
    $('#ticket').innerHTML = `<div class="qr big">${QR(code)}</div><h1>${esc(t.title)}</h1><p>${esc(t.venue)}, ${esc(t.date)}</p><p class="mu">${esc(code)}</p><p><b>${t.used ? 'Entrada ya utilizada' : 'Entrada válida'}</b></p>`;
  }).catch(() => { $('#ticket').innerHTML = '<p class="empty">No encontramos esta entrada. Revisa el enlace del email.</p>'; });
  return;
}
if (!$('#grid')) return; // El resto es solo de la tienda (index.html)

const today = new Date().toISOString().slice(0, 10);
const page = document.body.dataset.page || 'home', qs = new URLSearchParams(location.search);
const AVATAR = window.AVATAR || (() => '');
const artist0 = artists().find(a => a.id === qs.get('a'));
let genre = page === 'genre' ? qs.get('g') || '' : artist0 ? artist0.genre : '', who = artist0 ? artist0.name : '';
const aid = n => artists().find(a => a.name === n)?.id;
const GENRE_INFO = {
  Pop: 'Estribillos, color y escenarios que brillan. Merch para cantar en primera fila.',
  Rock: 'Guitarras, carretera y directos que tiemblan. Camisetas y discos con carácter.',
  Urbano: 'Rimas, bases y calle. Gorras, sudaderas y piezas con actitud.',
  'Electrónica': 'Pulso, luz y sesiones largas. Pósters y piezas pensadas para la pista.',
  Flamenco: 'Cante, guitarra y palmas. Duende en cada pieza.',
  Indie: 'Canciones pequeñas y mucha atmósfera. Piezas suaves, de tirada corta.',
  Jazz: 'Improvisación, club y luz baja. Vinilos y objetos para escuchar despacio.',
  Folk: 'Cuerda, voz y tradición. Tejidos y objetos que cuentan historias.',
  'Clásica': 'Cámara, orquesta y repertorio. Ediciones cuidadas para quien escucha con atención.'
};
const fav = () => store.get('fav', []);
const toggleFav = id => { const f = fav(); store.set('fav', f.includes(id) ? f.filter(x => x !== id) : [...f, id]); };
const cart = () => store.get('cart', []);
const sellable = id => {
  const p = products().find(x => x.id === id);
  if (p) return { kind: 'p', name: p.name, price: p.price, artist: p.artist, p };
  const e = events().find(x => x.id === id);
  return e && { kind: 'e', name: `${e.artist} en ${e.city}`, price: e.price, artist: e.artist, e };
};
const lines = () => cart().map((l, i) => { const s = sellable(l.id); return s && { ...l, ...s, i }; }).filter(Boolean);
const totals = ls => {
  const sub = ls.reduce((a, l) => a + l.price * l.qty, 0), merch = ls.filter(l => l.kind === 'p').reduce((a, l) => a + l.price * l.qty, 0);
  const phys = merch > 0, ship = phys && merch < 60 ? 4.9 : 0;
  return { sub, phys, ship, total: sub + ship };
};
const paint = () => {
  const ls = lines(), t = totals(ls);
  $('#count').textContent = ls.reduce((a, l) => a + l.qty, 0);
  $('#lines').innerHTML = ls.length ? ls.map(l => `<div class="line"><div><b>${esc(l.name)}</b><small>${l.color ? `<i class="dot" style="background:${hex(l.color)}"></i>` : ''}${l.size ? 'Talla ' + esc(l.size) : esc(l.artist)}</small></div><div class="qty"><button type="button" data-q="-1" data-i="${l.i}" aria-label="Quitar uno">−</button><span>${l.qty}</span><button type="button" data-q="1" data-i="${l.i}" aria-label="Añadir uno">+</button></div><b>${eur(l.price * l.qty)}</b></div>`).join('')
    : '<p class="empty">Tu carrito está vacío. Elige algo del merch o reserva una entrada.</p>';
  $('#tot').innerHTML = `<dt>Subtotal</dt><dd>${eur(t.sub)}</dd>` + (t.phys ? `<dt>Envío${tip('Las entradas no llevan gastos de envío. El merch se envía gratis a partir de 60 € en artículos.')}</dt><dd>${t.ship ? eur(t.ship) : 'Gratis'}</dd>` : '') + `<dt><b>Total</b></dt><dd><b>${eur(t.total)}</b></dd>`;
};
const saveCart = c => { store.set('cart', c); paint(); };
const add = (id, size, color = null) => {
  const c = cart(), k = c.find(l => l.id === id && l.size === size && l.color === color), e = events().find(x => x.id === id);
  if (e && (k ? k.qty : 0) >= Math.min(e.stock, 8)) return toast('Has alcanzado el máximo de entradas');
  k ? k.qty++ : c.push({ id, size, color, qty: 1 });
  saveCart(c); toast('Añadido al carrito');
};

const chips = () => { const c = $('#chips'); if (!c) return; c.innerHTML = ['Todos', ...GENRES].map(g => `<button class="chip" type="button" data-g="${g === 'Todos' ? '' : g}" aria-pressed="${g === 'Todos' ? !genre : g === genre}">${g}</button>`).join(''); };
const empty = w => `<p class="empty">Todavía no hay ${w} en este género. <a href="artista.html">Publica el tuyo</a>.</p>`;
const renderP = () => {
  const q = norm($('#q').value), c = $('#cat').value, o = $('#sort').value, fv = $('#favs').checked;
  const l = products().filter(p => (!genre || p.genre === genre) && (!who || p.artist === who) && (!fv || fav().includes(p.id)) && (!c || CATALOG[p.type]?.[1] === c) && norm(`${p.name} ${p.artist} ${TYPES[p.type]}`).includes(q))
    .sort((a, b) => o === 'a' ? a.price - b.price : o === 'd' ? b.price - a.price : 0);
  $('#grid').innerHTML = l.length ? l.map(p => { const cs = (p.colors?.length ? p.colors : [p.base || p.color]).map(hex); return `<article class="pcard" data-genre="${esc(p.genre)}" style="--c:${hex(p.color)}"><div class="tile">${mock(p, cs[0])}<button class="fav" type="button" data-fav="${p.id}" aria-pressed="${fav().includes(p.id)}" aria-label="Favorito: ${esc(p.name)}">♥</button></div>${cs.length > 1 ? `<div class="sws" data-for="${p.id}">${cs.map((c, i) => `<button class="sw" type="button" data-c="${c}" aria-pressed="${!i}" aria-label="Color ${i + 1}" style="background:${c}"></button>`).join('')}</div>` : ''}<h3>${esc(p.name)}</h3><p class="mu">${aid(p.artist) ? `<a href="perfil.html?a=${aid(p.artist)}">${esc(p.artist)}</a>` : esc(p.artist)}, ${TYPES[p.type] || ''}</p><div class="buy"><b>${eur(p.price)}</b>${SIZED.includes(p.type) ? `<select aria-label="Talla de ${esc(p.name)}">${['S', 'M', 'L', 'XL'].map(s => `<option${s === 'M' ? ' selected' : ''}>${s}</option>`).join('')}</select>` : ''}<button class="btn btn-p" type="button" data-add="${p.id}">Añadir</button></div></article>`; }).join('') : empty('merch');
};
const renderE = () => {
  const l = events().filter(e => (!genre || e.genre === genre) && (!who || e.artist === who) && e.date >= today).sort((a, b) => a.date < b.date ? -1 : 1);
  $('#events').innerHTML = l.length ? l.map(e => { const d = new Date(e.date + 'T00:00:00'), ymd = e.date.replace(/-/g, ''), end = new Date(Date.parse(e.date) + 864e5).toISOString().slice(0, 10).replace(/-/g, ''), place = encodeURIComponent(e.venue + ', ' + e.city); return `<article class="ev" data-genre="${esc(e.genre)}" style="--c:${hex(e.color)}"><div class="stub"><b>${d.getDate()}</b>${d.toLocaleDateString('es-ES', { month: 'short' })}</div><div class="info"><h3>${aid(e.artist) ? `<a href="perfil.html?a=${aid(e.artist)}">${esc(e.artist)}</a>` : esc(e.artist)}</h3><p class="mu">${esc(e.venue)}, ${esc(e.city)}</p><p class="links"><a href="https://www.google.com/maps/search/?api=1&amp;query=${place}" target="_blank" rel="noopener">Cómo llegar</a><a href="https://calendar.google.com/calendar/render?action=TEMPLATE&amp;text=${encodeURIComponent(e.artist)}&amp;dates=${ymd}/${end}&amp;location=${place}" target="_blank" rel="noopener">Añadir al calendario</a></p></div><div class="buy"><b>${eur(e.price)}</b>${e.stock > 0 ? `<button class="btn btn-s" type="button" data-add="${e.id}">Comprar entrada</button>` : '<span class="mu">Agotadas</span>'}</div></article>`; }).join('') : empty('conciertos');
};

const renderHero = () => {
  const h = $('#hero'); if (!h) return;
  if (genre) h.dataset.genre = genre; else delete h.dataset.genre;
  const art = $('#hero-art'); if (!art) return;
  art.innerHTML = [['tee', '#0B0B0B', 'TOMA'], ['hoodie', '#BFE3C8', 'ARTE'], ['vinyl', '#C9A24B', 'SONIDO'], ['cap', '#FFFFFF', 'ESTILO']].map(([type, c, text], i) => `<div class="bento fx b${i}">${mock({ type, text: genre ? '' : text, genre, scale: 85 }, c)}</div>`).join('');
};
const renderA = () => {
  const box = $('#artists'); if (!box) return;
  const l = artists().filter(a => (!genre || a.genre === genre) && (!who || a.name === who));
  box.innerHTML = l.length ? l.map(a => `<a class="acard" href="perfil.html?a=${esc(a.id)}" data-genre="${esc(a.genre)}"><div class="av">${AVATAR(a)}</div><b>${esc(a.name)}</b><span>${esc(a.genre)}${a.city ? ', ' + esc(a.city) : ''}</span></a>`).join('') : empty('artistas');
};
const renderHead = () => {
  if (page === 'genre') {
    const a = artists().filter(x => !genre || x.genre === genre).length, p = products().filter(x => !genre || x.genre === genre).length, e = events().filter(x => (!genre || x.genre === genre) && x.date >= today).length;
    $('#g-title').textContent = genre || 'Todos los géneros'; $('#g-blurb').textContent = GENRE_INFO[genre] || 'Artistas de todos los estilos.';
    $('#g-stats').textContent = [[a, 'artista', 'artistas'], [p, 'producto', 'productos'], [e, 'concierto', 'conciertos']].map(([n, o, m]) => `${n} ${n === 1 ? o : m}`).join(', ').replace(/, ([^,]+)$/, ' y $1'); document.title = `${genre || 'Géneros'} | TOMA`;
  }
  if (page === 'profile') {
    if (!artist0) { $('#p-name').textContent = 'Artista no encontrado'; return; }
    $('#p-avatar').innerHTML = AVATAR(artist0); $('#p-name').textContent = artist0.name;
    $('#p-meta').textContent = artist0.genre + (artist0.city ? ', ' + artist0.city : ''); $('#p-bio').textContent = artist0.bio || '';
    $('#p-genre-link').href = 'genero.html?g=' + encodeURIComponent(artist0.genre); $('#p-genre-link').textContent = artist0.genre; document.title = `${artist0.name} | TOMA`;
  }
};
// La cinta de géneros lleva a la página de cada género
if ($('#mq')) $('#mq').innerHTML = Array(4).fill(GENRES).flat().map(g => `<a href="genero.html?g=${encodeURIComponent(g)}">${g}</a>`).join('');

$('#cat').innerHTML = '<option value="">Todas las categorías</option>' + CATS.map(c => `<option>${c}</option>`).join('');
['q', 'cat', 'sort', 'favs'].forEach(i => $('#' + i).addEventListener('input', renderP));
document.addEventListener('click', e => {
  const a = e.target.closest('[data-add]');
  if (a) { const s = $('select', a.parentElement); const sw = $('.sws .sw[aria-pressed=true]', a.closest('.pcard') || document.createElement('i')); add(a.dataset.add, s ? s.value : null, sw ? sw.dataset.c : null); }
  const g = e.target.closest('[data-g]');
  if (g) { genre = g.dataset.g; chips(); renderP(); renderE(); renderA(); renderHero(); }
  const sw = e.target.closest('.sws .sw');
  if (sw) { const box = sw.parentElement, p = products().find(x => x.id === box.dataset.for); $$('.sw', box).forEach(b => b.setAttribute('aria-pressed', b === sw)); box.closest('.pcard').querySelector('.tile svg').outerHTML = mock(p, sw.dataset.c); }
  const fv = e.target.closest('[data-fav]');
  if (fv) { toggleFav(fv.dataset.fav); fv.setAttribute('aria-pressed', fav().includes(fv.dataset.fav)); if ($('#favs').checked) renderP(); }
});
$$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); }));
$('#open-cart').onclick = () => $('#cart').showModal();
$('#lines').addEventListener('click', e => {
  const b = e.target.closest('[data-q]'); if (!b) return;
  const c = cart(); c[b.dataset.i].qty += +b.dataset.q; saveCart(c.filter(x => x.qty > 0));
});
$('#go').onclick = () => {
  const t = totals(lines()); if (!t.sub) return toast('Tu carrito está vacío');
  $('#cart').close(); $('#co').hidden = false; $('#done').hidden = true;
  $('#ship').hidden = !t.phys; $$('#ship input:not([name=zip])').forEach(i => i.required = t.phys);
  $('#checkout').showModal();
};
const done = (id, tix = []) => {
  $('#co').hidden = true; $('#done').hidden = false; $('#done-id').textContent = id;
  $('#tix').innerHTML = tix.map(t => `<div class="tix"><div class="qr">${QR(t.code)}</div><div><b>${esc(t.title)}</b><small>${esc(t.code)}</small></div></div>`).join('');
};
$('#co').addEventListener('submit', async e => {
  e.preventDefault();
  try { // Con servidor (server.js): precios y stock se validan allí y el pago pasa por Stripe.
    const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart(), buyer: Object.fromEntries(new FormData(e.target)) }) });
    if (r.ok) { const d = await r.json(); if (d.url) return location.assign(d.url); saveCart([]); e.target.reset(); return done(d.id, d.tickets); }
    if (![404, 405].includes(r.status)) return toast((await r.json()).error || 'No se pudo completar el pedido');
  } catch { /* sin servidor: pedido local de demostración */ }
  const f = new FormData(e.target), ls = lines(), t = totals(ls), orders = store.get('orders', []), id = 'TM-' + (1001 + orders.length), by = {};
  // Cada artículo de merch se agrupa por proveedor: un pedido por proveedor.
  ls.filter(l => l.kind === 'p').forEach(l => { const s = l.p.supplier; (by[s] = by[s] || []).push({ name: l.p.name, size: l.size, qty: l.qty, cost: SUPPLIERS[s][l.p.type] * l.qty }); });
  store.set('orders', [...orders, { id, date: today, buyer: { name: f.get('name'), email: f.get('email'), city: f.get('city') || '' }, items: ls.map(l => ({ kind: l.kind, id: l.id, artist: l.artist, name: l.name, type: l.p?.type, supplier: l.p?.supplier, size: l.size, color: l.color, qty: l.qty, price: l.price })), ship: t.ship, total: t.total, status: 'pagado' }]);
  store.set('supplier-orders', [...store.get('supplier-orders', []), ...Object.entries(by).map(([supplier, items], i) => ({ id: `${id}-${i + 1}`, supplier, items, cost: items.reduce((a, x) => a + x.cost, 0), status: 'Pendiente de enviar al proveedor' }))]);
  const evs = events(); ls.filter(l => l.kind === 'e').forEach(l => { const x = evs.find(y => y.id === l.id); if (x) x.stock = Math.max(0, x.stock - l.qty); });
  store.set('events', evs); saveCart([]); renderE(); e.target.reset();
  const rnd = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), b => b.toString(16).padStart(2, '0')).join('');
  done(id, ls.filter(l => l.kind === 'e').flatMap(l => Array.from({ length: l.qty }, () => ({ code: `${id}-${rnd()}`, title: l.name }))));
});

chips(); renderP(); renderE(); renderA(); renderHero(); renderHead(); paint();
if (location.search.includes('pedido=')) { saveCart([]); toast('¡Pago recibido! Te enviaremos el resumen y las entradas por email.'); history.replaceState(null, '', location.pathname); }
fetch('/api/catalog').then(r => r.ok ? r.json() : null).then(d => { if (d) { store.set('products', d.products); store.set('events', d.events); if (d.artists) store.set('artists', d.artists); renderP(); renderE(); renderA(); renderHead(); paint(); } }).catch(() => {});
})();
