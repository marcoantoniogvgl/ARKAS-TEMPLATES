(() => {
'use strict';
const { $, $$, esc, eur, store, SUPPLIERS, FEE, CATALOG, products, events, tip, toast } = TOMA;
const key = () => store.get('artist-key', '');
const auth = () => ({ 'Content-Type': 'application/json', 'x-artist-key': key() });
const STATUS = ['pagado', 'en producción', 'enviado', 'entregado'];
const day = d => d.toISOString().slice(0, 10), sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
const KT = { 'Ventas': 'Total cobrado a los compradores por tus artículos en el periodo, sin contar el envío.', 'Ganancia neta': 'Ventas menos la comisión de TOMA y el coste estimado del proveedor.', 'Ticket medio': 'Ventas divididas entre el número de pedidos.' };
let all = [], remote = false, denied = false;

// Los pedidos vienen del servidor si lo hay; si no, de este navegador.
const load = async () => {
  denied = false; remote = false;
  try {
    const r = await fetch('/api/orders', { headers: auth() });
    if (r.ok) { all = await r.json(); remote = true; return; }
    denied = r.status === 401;
  } catch { /* sin servidor */ }
  all = store.get('orders', []).filter(o => o.items && typeof o.buyer === 'object');
};
// Ventas del artista en el periodo. Ganancia = ventas - comisión de TOMA - coste del proveedor (estimado).
const calc = (artist, days) => {
  const from = day(new Date(Date.now() - days * 864e5)), lines = [], os = [];
  for (const o of all) {
    if (o.status === 'pendiente de pago' || o.date < from) continue;
    let mine = 0;
    for (const i of o.items) {
      if (artist && i.artist !== artist) continue;
      const gross = i.price * i.qty, cost = i.kind === 'p' ? (SUPPLIERS[i.supplier]?.[i.type] ?? 0) * i.qty : 0;
      lines.push({ ...i, order: o.id, date: o.date, status: o.status, gross, net: gross * (1 - FEE) - cost, cat: i.kind === 'e' ? 'Entradas' : CATALOG[i.type]?.[1] || 'Otros' });
      mine += gross;
    }
    if (mine) os.push({ ...o, mine });
  }
  return { lines, os };
};
const chart = (lines, days) => {
  const step = days > 30 ? 7 : 1, n = Math.ceil(days / step), b = Array(n).fill(0), now = Date.parse(day(new Date()));
  lines.forEach(l => { const k = n - 1 - Math.floor(Math.floor((now - Date.parse(l.date)) / 864e5) / step); if (k >= 0 && k < n) b[k] += l.gross; });
  const max = Math.max(...b, 1), w = 600 / n;
  return `<svg viewBox="0 0 600 160" role="img" aria-label="Ventas por ${step > 1 ? 'semana' : 'día'}">${b.map((v, i) => { const h = v / max * 130; return `<rect x="${(i * w + w * .15).toFixed(1)}" y="${(150 - h).toFixed(1)}" width="${(w * .7).toFixed(1)}" height="${(v ? Math.max(h, 2) : 0).toFixed(1)}" rx="3"><title>${eur(v)}</title></rect>`; }).join('')}<line x1="0" y1="150.5" x2="600" y2="150.5" stroke="currentColor" opacity=".2"/></svg>`;
};
const group = (a, f) => Object.entries(a.reduce((m, l) => (m[f(l)] = (m[f(l)] || 0) + l.gross, m), {})).sort((x, y) => y[1] - x[1]);
const bars = rows => { const max = Math.max(...rows.map(r => r[1]), 1); return rows.map(([k, v]) => `<div class="brow"><span>${esc(k)}</span><div class="meter"><i style="width:${(v / max * 100).toFixed(0)}%"></i></div><b>${eur(v)}</b></div>`).join('') || '<p class="mu">Sin datos en este periodo.</p>'; };

const render = () => {
  const artist = $('#st-artist').value, days = +$('#st-range').value, { lines, os } = calc(artist, days), now = day(new Date());
  const gross = sum(lines, l => l.gross), net = sum(lines, l => l.net), merch = lines.filter(l => l.kind === 'p'), demoN = all.filter(o => o.demo).length;
  const sold = {}; all.forEach(o => o.status !== 'pendiente de pago' && o.items.forEach(i => { if (i.kind === 'e') sold[i.id] = (sold[i.id] || 0) + i.qty; }));
  const evs = events().filter(e => !artist || e.artist === artist).sort((a, b) => (a.date < now) - (b.date < now) || (a.date < b.date ? -1 : 1));
  const concerts = evs.map(e => {
    const s = sold[e.id] || 0, cap = e.stock + s, left = Math.ceil((Date.parse(e.date) - Date.parse(now)) / 864e5);
    const tag = e.date < now ? 'Celebrado' : !e.stock ? 'Agotado' : e.stock / cap <= .15 ? 'Casi agotado' : `Faltan ${left} días`;
    return `<div class="conc"><div><b>${esc(e.artist)} en ${esc(e.city)}</b><small class="mu">${esc(e.venue)}, ${esc(e.date)}</small></div><span class="pill${tag === 'Casi agotado' ? ' warn' : ''}">${tag}</span><div class="meter"><i style="width:${cap ? (s / cap * 100).toFixed(0) : 0}%"></i></div><small>${s} de ${cap} entradas vendidas, ${eur(s * e.price)}</small></div>`;
  }).join('') || '<p class="mu">No hay conciertos publicados.</p>';
  const rows = os.sort((a, b) => a.date < b.date ? 1 : -1).slice(0, 12).map(o => `<tr><td>${esc(o.id)}</td><td>${esc(o.date)}</td><td>${esc(o.buyer.name || '')}${o.buyer.city ? ', ' + esc(o.buyer.city) : ''}</td><td>${esc(o.items.filter(i => !artist || i.artist === artist).map(i => `${i.qty}× ${i.name}`).join(', '))}</td><td>${eur(o.mine)}</td><td><select data-st="${esc(o.id)}" aria-label="Estado del pedido ${esc(o.id)}">${STATUS.map(s => `<option${s === o.status ? ' selected' : ''}>${s}</option>`).join('')}</select>${o.tracking ? `<small class="mu"> Seguimiento: ${esc(o.tracking)}</small>` : ''}</td></tr>`).join('');
  $('#stats').innerHTML = (denied ? '<p class="empty">El servidor pide la clave de artista: escríbela en «Mi catálogo» para ver los pedidos reales.</p>' : '')
    + `<div class="kpis">${[['Ventas', eur(gross)], ['Ganancia neta', eur(net)], ['Pedidos', os.length], ['Productos vendidos', sum(merch, l => l.qty)], ['Entradas vendidas', sum(lines.filter(l => l.kind === 'e'), l => l.qty)], ['Ticket medio', eur(os.length ? gross / os.length : 0)]].map(([k, v]) => `<div class="kpi"><span>${k}${KT[k] ? tip(KT[k]) : ''}</span><b>${v}</b></div>`).join('')}</div>`
    + `<div class="grid2"><div class="card chart"><h3>Ventas por ${days > 30 ? 'semana' : 'día'}</h3>${chart(lines, days)}</div><div class="card"><h3>Por categoría</h3>${bars(group(lines, l => l.cat))}</div></div>`
    + `<div class="grid2"><div class="card"><h3>Más vendidos</h3>${bars(group(merch, l => l.name).slice(0, 5))}</div><div class="card"><h3>Conciertos${tip('Aparece «casi agotado» cuando quedan el 15 % de las entradas o menos.')}</h3>${concerts}</div></div>`
    + `<div class="card"><h3>Seguimiento de pedidos${tip('Estados: pagado, en producción, enviado y entregado. Al marcar «enviado» puedes anotar el número de seguimiento.')}</h3><div class="scroll"><table><thead><tr><th>Pedido</th><th>Fecha</th><th>Cliente</th><th>Artículos</th><th>Importe</th><th>Estado</th></tr></thead><tbody>${rows || '<tr><td colspan="6">Aún no hay pedidos en este periodo.</td></tr>'}</tbody></table></div></div>`
    + `<p class="demo">${demoN ? `Estás viendo ${demoN} pedidos de ejemplo. <button class="del" data-act="nodemo" type="button">Borrar datos de ejemplo</button>` : '<button class="btn btn-s" data-act="demo" type="button">Añadir datos de ejemplo</button>'}</p>`;
};
const fillArtists = () => {
  const cur = $('#st-artist').value || store.get('artist', ''), names = [...new Set([...products().map(p => p.artist), ...events().map(e => e.artist), ...all.flatMap(o => o.items.map(i => i.artist))].filter(Boolean))].sort();
  $('#st-artist').innerHTML = '<option value="">Todos los artistas</option>' + names.map(n => `<option${n === cur ? ' selected' : ''}>${esc(n)}</option>`).join('');
};
const refresh = async () => { await load(); fillArtists(); render(); };

const setStatus = async (id, status, tracking) => {
  if (remote) { const r = await fetch(`/api/orders/${encodeURIComponent(id)}/status`, { method: 'POST', headers: auth(), body: JSON.stringify({ status, tracking }) }); if (!r.ok) return toast('No se pudo actualizar el estado'); }
  else store.set('orders', store.get('orders', []).map(o => o.id === id ? { ...o, status, tracking } : o));
  toast('Estado actualizado'); refresh();
};
const demo = () => { // Pedidos inventados de los últimos 60 días para ver cómo se ven las estadísticas
  const ps = products(), es = events(); if (!ps.length && !es.length) return toast('Publica algún producto primero');
  const rnd = n => Math.floor(Math.random() * n), os = [];
  for (let k = 0; k < 45; k++) {
    const age = rnd(60), items = [];
    for (let j = 0, m = 1 + rnd(2); j < m; j++) {
      const p = ps.length && (!es.length || Math.random() < .75) ? ps[rnd(ps.length)] : null, e = p ? null : es[rnd(es.length)];
      items.push(p ? { kind: 'p', id: p.id, artist: p.artist, name: p.name, type: p.type, supplier: p.supplier, qty: 1 + rnd(3), price: p.price } : { kind: 'e', id: e.id, artist: e.artist, name: `${e.artist} en ${e.city}`, qty: 1 + rnd(4), price: e.price });
    }
    os.push({ id: 'DEMO-' + (k + 1), demo: true, date: day(new Date(Date.now() - age * 864e5)), buyer: { name: ['Ana', 'Luis', 'Marta', 'Pablo', 'Irene'][rnd(5)], city: ['Madrid', 'Sevilla', 'Valencia', 'Bilbao', 'Málaga'][rnd(5)] }, items, ship: 0, total: sum(items, i => i.price * i.qty), status: age < 3 ? 'pagado' : age < 8 ? 'en producción' : age < 14 ? 'enviado' : 'entregado' });
  }
  return os;
};

$('#st-artist').addEventListener('change', render); $('#st-range').addEventListener('change', render);
$('[data-tab=t-stats]').addEventListener('click', refresh);
$('#stats').addEventListener('change', e => { const id = e.target.dataset.st; if (id) setStatus(id, e.target.value, e.target.value === 'enviado' ? (prompt('Número de seguimiento (opcional)') || '') : ''); });
$('#stats').addEventListener('click', async e => {
  const a = e.target.dataset.act; if (!a) return;
  if (a === 'demo') {
    const orders = demo(); if (!orders) return;
    if (remote) { const r = await fetch('/api/demo', { method: 'POST', headers: auth(), body: JSON.stringify({ orders }) }); if (!r.ok) return toast('No se pudieron crear los datos de ejemplo'); }
    else store.set('orders', [...store.get('orders', []), ...orders]);
  } else {
    if (remote) await fetch('/api/demo', { method: 'DELETE', headers: auth() });
    store.set('orders', store.get('orders', []).filter(o => !o.demo));
  }
  refresh();
});
$('#st-csv').onclick = () => {
  const { lines } = calc($('#st-artist').value, +$('#st-range').value), q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [['Fecha', 'Pedido', 'Artista', 'Tipo', 'Producto', 'Unidades', 'Ventas', 'Ganancia neta', 'Estado'], ...lines.map(l => [l.date, l.order, l.artist, l.kind === 'e' ? 'Entrada' : 'Merch', l.name, l.qty, l.gross.toFixed(2), l.net.toFixed(2), l.status])].map(r => r.map(q).join(';')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })); a.download = 'ventas-toma.csv'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
refresh();
})();
