(() => {
'use strict';
const { $, $$, esc, eur, store, uid, TYPES, CATALOG, CATS, GENRES, SUPPLIERS, FEE, PALETTE, mock, products, events, artists, tip, addTip, toast } = TOMA;
const opt = o => o.map(v => `<option>${v}</option>`).join('');
const AVATAR = window.AVATAR || (() => '');
const ensureArtist = (name, genre) => { const l = artists(); if (!l.some(a => a.name === name)) store.set('artists', [...l, { id: uid('a'), name, genre, city: '', bio: '', avatar: '' }]); };
const pf = $('#pf'), ef = $('#ef'), el = pf.elements, key = () => store.get('artist-key', '');
let design = '', cur = null, touched = false, step = 0;

$('#p-genre').innerHTML = $('#e-genre').innerHTML = opt(GENRES);
$('#types').innerHTML = CATS.map(c => `<fieldset class="cat"><legend>${c}</legend>${Object.entries(CATALOG).filter(([, v]) => v[1] === c).map(([k, v]) => `<label class="pick"><input type="radio" name="type" value="${k}"${k === 'tee' ? ' checked' : ''}><span>${mock({ type: k }, '#E3E6F2')}${v[0]}</span></label>`).join('')}</fieldset>`).join('');
$('#swatches').innerHTML = PALETTE.map((c, i) => `<label class="swc"><input type="checkbox" name="colors" value="${c}"${i < 2 ? ' checked' : ''}><i style="background:${c}"></i><span class="sr-only">Color ${i + 1}</span></label>`).join('');
el.artist.value = ef.elements.artist.value = store.get('artist', '');
ef.elements.date.min = new Date().toISOString().slice(0, 10);
$('#key').value = key(); $('#key').addEventListener('input', e => store.set('artist-key', e.target.value));
// Con servidor (server.js) los cambios se guardan también allí; sin él quedan en este navegador.
const sync = (method, path, item) => fetch('/api/' + path, { method, headers: { 'Content-Type': 'application/json', 'x-artist-key': key() }, body: item && JSON.stringify(item) })
  .then(r => { if (r.status === 401) toast('Clave de artista incorrecta: el cambio solo se guardó en este navegador'); }).catch(() => {});

const val = () => ({ artist: el.artist.value.trim(), genre: el.genre.value, type: el.type.value, name: el.name.value.trim(), colors: $$('[name=colors]:checked', pf).map(i => i.value), text: el.text.value.trim().toUpperCase(), textColor: touched ? el.textColor.value : '', design, scale: +el.scale.value, dy: +el.dy.value, supplier: el.supplier.value, price: parseFloat(el.price.value) || 0, motif: el.motif.checked ? undefined : '' });
// Proveedores de este producto, del más barato al más caro; por defecto el más barato.
const fillSup = reset => {
  const was = el.supplier.value, t = el.type.value, l = Object.keys(SUPPLIERS).filter(s => SUPPLIERS[s][t] != null).sort((a, b) => SUPPLIERS[a][t] - SUPPLIERS[b][t]);
  $('#p-sup').innerHTML = l.map((s, i) => `<option value="${s}">${s} (${eur(SUPPLIERS[s][t])}${i ? '' : ', el más barato'})</option>`).join('');
  if (!reset && l.includes(was)) el.supplier.value = was;
};
fillSup(true);
const preview = () => {
  const v = val(), c = v.colors.includes(cur) ? cur : v.colors[0] || '#FFFFFF', cost = SUPPLIERS[v.supplier]?.[v.type] ?? 0, fee = v.price * FEE, net = v.price - cost - fee;
  cur = c;
  $('#prev').innerHTML = mock(v, c, true);
  $('#prev-sw').innerHTML = v.colors.length > 1 ? v.colors.map((k, i) => `<button class="sw" type="button" data-c="${k}" aria-pressed="${k === c}" aria-label="Ver color ${i + 1}" style="background:${k}"></button>`).join('') : '';
  $('#econ').innerHTML = `<dt>Coste del proveedor${tip('Lo que cobra el proveedor por fabricar y preparar una unidad. Es una estimación.')}</dt><dd>${eur(cost)}</dd><dt>Comisión de TOMA (${FEE * 100} %)${tip('Porcentaje de cada venta que se queda TOMA.')}</dt><dd>${eur(fee)}</dd><dt><b>Tú ganas por venta</b>${tip('Precio de venta menos el coste del proveedor y la comisión de TOMA.')}</dt><dd class="${net <= 0 ? 'neg' : ''}"><b>${eur(net)}</b></dd>`;
  const all = Object.keys(SUPPLIERS).filter(s => SUPPLIERS[s][v.type] != null).sort((a, b) => SUPPLIERS[a][v.type] - SUPPLIERS[b][v.type]);
  $('#save').textContent = all.length > 1 ? `Más barato para este producto: ${all[0]} (${eur(SUPPLIERS[all[0]][v.type])}). Frente al más caro (${all[all.length - 1]}) ahorras ${eur(SUPPLIERS[all[all.length - 1]][v.type] - SUPPLIERS[all[0]][v.type])} por unidad.` : '';
  return { v, net };
};

// Asistente de 3 pasos: producto, diseño, precio.
const steps = $$('.stepbox'), dots = $$('.steps li');
const show = n => { step = n; steps.forEach((s, i) => s.hidden = i !== n); dots.forEach((d, i) => d.setAttribute('aria-current', i === n ? 'step' : 'false')); $('#back').hidden = !n; $('#next').hidden = n === 2; $('#publish').hidden = n !== 2; };
const check = n => {
  if (n === 0 && !val().colors.length) return toast('Elige al menos un color'), false;
  if (n === 1 && !design && !el.text.value.trim()) return toast('Sube una imagen o escribe un texto'), false;
  return $$('input:not([type=file]):not([type=radio]):not([type=checkbox]),select', steps[n]).every(i => i.checkValidity() || (i.reportValidity(), false));
};
pf.addEventListener('input', e => { if (e.target.name === 'type') fillSup(true); if (e.target === el.textColor) touched = true; preview(); });
$('#next').onclick = () => { if (check(step)) show(step + 1); };
$('#back').onclick = () => show(step - 1);
$('#prev-sw').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) { cur = b.dataset.c; preview(); } });
el.file.addEventListener('change', () => {
  const f = el.file.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 420 / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      design = c.toDataURL(f.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', .85);
      if (design.length > 380000) { design = ''; toast('La imagen pesa demasiado: prueba con una más simple'); }
      preview();
    };
    img.onerror = () => toast('No se pudo leer la imagen'); img.src = r.result;
  };
  r.readAsDataURL(f);
});
$('#rm-design').onclick = () => { design = ''; el.file.value = ''; preview(); };
$('#suggest').onclick = () => { const v = val(), cost = SUPPLIERS[v.supplier]?.[v.type] ?? 0; el.price.value = (Math.ceil(cost / (1 - FEE - .3) * 2) / 2).toFixed(1); preview(); };
pf.addEventListener('submit', e => {
  e.preventDefault();
  if (step < 2) { if (check(step)) show(step + 1); return; }
  for (let n = 0; n < 3; n++) if (!(show(n), check(n))) return;
  const { v, net } = preview();
  if (net <= 0) return toast('El precio no cubre el coste y la comisión');
  const item = { id: uid('p'), artist: v.artist, genre: v.genre, color: v.colors.find(c => !['#FFFFFF', '#0B0B0B', '#8D8D95'].includes(c)) || '#C9A24B', colors: v.colors, type: v.type, name: v.name, text: v.text, textColor: v.textColor, design: v.design, scale: v.scale, dy: v.dy, price: v.price, supplier: v.supplier, motif: v.motif };
  if (!store.set('products', [...products(), item])) return toast('No hay espacio en el navegador: usa una imagen más ligera');
  sync('POST', 'products', item); ensureArtist(v.artist, v.genre); store.set('artist', v.artist);
  pf.reset(); design = ''; cur = null; touched = false; el.artist.value = ef.elements.artist.value = v.artist; fillSup(); show(0); preview(); list(); toast('Producto publicado en la tienda');
});

ef.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(ef), artist = f.get('artist').trim(), known = products().find(p => p.artist === artist);
  const item = { id: uid('e'), artist, genre: f.get('genre'), color: known ? known.color : '#C9A24B', city: f.get('city').trim(), venue: f.get('venue').trim(), date: f.get('date'), price: parseFloat(f.get('price')), stock: parseInt(f.get('stock'), 10) };
  store.set('events', [...events(), item]); sync('POST', 'events', item); ensureArtist(artist, item.genre);
  store.set('artist', artist); ef.reset(); ef.elements.artist.value = artist; list(); toast('Concierto publicado');
});

const row = (k, id, t, s, th = '') => `<div class="item">${th ? `<div class="th">${th}</div>` : ''}<div class="grow"><b>${t}</b><p class="mu">${s}</p></div><button class="del" type="button" data-k="${k}" data-id="${id}">Eliminar</button></div>`;
const draw = so => { $('#so').innerHTML = so.length ? so.map(o => `<tr><td>${esc(o.id)}</td><td>${esc(o.supplier)}</td><td>${o.items.map(i => `${i.qty}× ${esc(i.name)}${i.size ? ' (' + esc(i.size) + ')' : ''}`).join(', ')}</td><td>${esc(o.status)}</td></tr>`).join('') : '<tr><td colspan="4">Aún no hay pedidos. Cuando alguien compre merch, aparecerá aquí agrupado por proveedor.</td></tr>'; };
const list = () => {
  $('#mine').innerHTML = products().map(p => row('p', p.id, esc(p.name), `${TYPES[p.type] || ''} de ${esc(p.artist)}, ${eur(p.price)}`, mock(p, p.colors?.[0])))
    .concat(events().map(x => row('e', x.id, `${esc(x.artist)} en ${esc(x.city)}`, `${esc(x.venue)}, ${esc(x.date)}, ${eur(x.price)}, ${x.stock} entradas`))).join('') || '<p class="empty">Aún no has publicado nada. Empieza creando tu primer producto.</p>';
  draw(store.get('supplier-orders', []));
  fetch('/api/orders', { headers: { 'x-artist-key': key() } }).then(r => r.ok ? r.json() : null).then(os => { if (os) draw(os.flatMap(o => (o.supplierOrders || []).map((s, i) => ({ id: `${o.id}-${i + 1}`, ...s })))); }).catch(() => {});
};
$('#mine').addEventListener('click', e => {
  const b = e.target.closest('.del'); if (!b || !confirm('¿Eliminar este elemento de la tienda?')) return;
  const prod = b.dataset.k === 'p';
  store.set(prod ? 'products' : 'events', (prod ? products() : events()).filter(x => x.id !== b.dataset.id));
  sync('DELETE', (prod ? 'products/' : 'events/') + b.dataset.id); list();
});
$('#vbtn').onclick = () => {
  const c = $('#vcode').value.trim(); if (!c) return;
  fetch(`/api/ticket/${encodeURIComponent(c)}/use`, { method: 'POST', headers: { 'x-artist-key': key() } })
    .then(r => toast(r.ok ? 'Entrada válida: puede pasar' : r.status === 409 ? 'Esta entrada ya se usó' : r.status === 404 ? 'No existe esa entrada' : 'Sin permiso o sin servidor')).catch(() => toast('No hay conexión con el servidor'));
};
$$('[data-tab]').forEach(b => b.onclick = () => {
  $$('[data-tab]').forEach(x => x.setAttribute('aria-selected', x === b));
  $$('.panel').forEach(p => p.hidden = p.id !== b.dataset.tab);
});
// Iconos de información en los apartados más técnicos
const legendOf = n => n.closest('fieldset')?.querySelector('legend');
addTip(legendOf($('#types')), 'El tipo decide qué proveedores lo fabrican, su coste base y la zona donde se imprime.');
addTip(legendOf($('#swatches')), 'Los compradores podrán elegir entre los colores que marques. Cada color se fabrica bajo demanda.');
addTip(el.file.closest('label'), 'La línea punteada de la vista previa marca la zona que imprime el proveedor: lo que quede fuera no se imprime. Mejor un PNG con fondo transparente y buena resolución.');
addTip(el.motif.closest('label'), 'Dibujo propio de tu género (rayo para rock, abanico para flamenco...). Se muestra si no subes imagen.');
addTip(el.supplier.closest('label'), 'Quien fabrica y envía cada pedido. Se ordenan del más barato al más caro; los costes son estimaciones.');
addTip(el.price.closest('label'), 'Lo que paga el comprador por el artículo, sin envío. Debe cubrir el coste del proveedor y la comisión de TOMA.');
addTip(ef.elements.stock.closest('label'), 'Entradas que pones a la venta. Cada una recibe un código QR único.');
addTip($('#key').closest('label'), 'Protege la publicación y los pedidos en el servidor. Se define con la variable ARTIST_KEY al arrancarlo.');
addTip($('#vcode').closest('label'), 'Pega el código de la entrada o el que lea tu lector de QR. Se marca como usada y avisa si ya se usó.');

// Perfil del artista: ciudad, biografía y foto
const af = $('#af'), aSel = $('#a-sel'); let photo;
const curA = () => artists().find(a => a.id === aSel.value);
const loadA = () => { const a = curA(); photo = undefined; af.elements.city.value = a?.city || ''; af.elements.bio.value = a?.bio || ''; af.elements.photo.value = ''; $('#a-prev').innerHTML = a ? AVATAR(a) : ''; };
const fillA = () => { aSel.innerHTML = artists().map(a => `<option value="${esc(a.id)}">${esc(a.name)}</option>`).join('') || '<option value="">Aún no hay artistas</option>'; loadA(); };
aSel.addEventListener('change', loadA);
af.elements.photo.addEventListener('change', () => {
  const f = af.elements.photo.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const img = new Image();
    img.onload = () => {
      const sz = Math.min(img.width, img.height), c = document.createElement('canvas'); c.width = c.height = Math.min(240, sz);
      c.getContext('2d').drawImage(img, (img.width - sz) / 2, (img.height - sz) / 2, sz, sz, 0, 0, c.width, c.height);
      photo = c.toDataURL('image/jpeg', .85); $('#a-prev').innerHTML = AVATAR({ ...curA(), avatar: photo });
    };
    img.onerror = () => toast('No se pudo leer la imagen'); img.src = r.result;
  };
  r.readAsDataURL(f);
});
af.addEventListener('submit', e => {
  e.preventDefault(); const a = curA(); if (!a) return toast('Publica primero un producto o un concierto');
  const upd = { ...a, city: af.elements.city.value.trim(), bio: af.elements.bio.value.trim(), avatar: photo === undefined ? a.avatar : photo };
  if (!store.set('artists', artists().map(x => x.id === a.id ? upd : x))) return toast('No hay espacio en el navegador: usa una foto más ligera');
  sync('POST', 'artists', upd); toast('Perfil guardado');
});
$('[data-tab=t-perfil]').addEventListener('click', fillA);
fillA();
preview(); list();
})();
