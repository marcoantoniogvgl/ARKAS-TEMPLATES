// Generador de códigos QR sin dependencias (versiones 1 a 5, corrección L, modo byte). window.QR(texto) devuelve un SVG.
(() => {
'use strict';
const exp = [], log = [];
for (let i = 0, x = 1; i < 255; i++) { exp[i] = x; log[x] = i; x <<= 1; if (x > 255) x ^= 285; }
const mul = (a, b) => a && b ? exp[(log[a] + log[b]) % 255] : 0;
const DC = [19, 34, 55, 80, 108], EC = [7, 10, 15, 20, 26];
const matrix = text => {
  const bytes = [...new TextEncoder().encode(text)], v = DC.findIndex(d => bytes.length <= d - 2) + 1;
  if (!v) return null;
  const dc = DC[v - 1], ec = EC[v - 1], n = 17 + 4 * v;
  let bits = '0100' + bytes.length.toString(2).padStart(8, '0') + bytes.map(b => b.toString(2).padStart(8, '0')).join('');
  bits += '0'.repeat(Math.min(4, dc * 8 - bits.length)); bits += '0'.repeat((8 - bits.length % 8) % 8);
  const data = bits.match(/.{8}/g).map(b => parseInt(b, 2));
  for (let i = 0; data.length < dc; i++) data.push(i % 2 ? 17 : 236);
  let g = [1];
  for (let i = 0; i < ec; i++) { const h = new Array(g.length + 1).fill(0); g.forEach((c, j) => { h[j] ^= c; h[j + 1] ^= mul(c, exp[i]); }); g = h; }
  const rem = new Array(ec).fill(0);
  data.forEach(d => { const f = d ^ rem.shift(); rem.push(0); g.slice(1).forEach((c, j) => rem[j] ^= mul(c, f)); });
  const cw = [...data, ...rem];
  const m = Array.from({ length: n }, () => new Array(n).fill(false)), fn = Array.from({ length: n }, () => new Array(n).fill(false));
  const set = (x, y, d) => { if (x >= 0 && y >= 0 && x < n && y < n) { m[y][x] = d; fn[y][x] = true; } };
  for (let i = 0; i < n; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  for (const [cx, cy] of [[3, 3], [n - 4, 3], [3, n - 4]]) for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)); set(cx + dx, cy + dy, d !== 2 && d !== 4); }
  if (v > 1) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(n - 7 + dx, n - 7 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  let r = 8; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537); // formato: nivel L y máscara 0
  const f = ((8 << 10) | r) ^ 0x5412, bit = i => ((f >>> i) & 1) === 1;
  for (let i = 0; i <= 5; i++) set(8, i, bit(i));
  set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
  for (let i = 0; i < 8; i++) set(n - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) set(8, n - 15 + i, bit(i));
  set(8, n - 8, true);
  let k = 0;
  for (let right = n - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < n; vert++) for (let j = 0; j < 2; j++) {
      const x = right - j, y = ((right + 1) & 2) === 0 ? n - 1 - vert : vert;
      if (!fn[y][x] && k < cw.length * 8) { m[y][x] = ((cw[k >> 3] >>> (7 - (k & 7))) & 1) === 1; k++; }
    }
  }
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!fn[y][x] && (x + y) % 2 === 0) m[y][x] = !m[y][x];
  return m;
};
const QR = text => {
  const m = matrix(text); if (!m) return '';
  const n = m.length; let d = '';
  m.forEach((row, y) => row.forEach((on, x) => { if (on) d += `M${x + 4} ${y + 4}h1v1h-1z`; }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + 8} ${n + 8}" shape-rendering="crispEdges" role="img" aria-label="Código QR de la entrada"><rect width="100%" height="100%" fill="#fff"/><path d="${d}"/></svg>`;
};
QR.matrix = matrix;
(typeof window !== 'undefined' ? window : globalThis).QR = QR;
})();
