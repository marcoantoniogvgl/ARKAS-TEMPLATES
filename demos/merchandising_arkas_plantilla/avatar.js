// Retratos ilustrados generados a partir del nombre y el género del artista, o la foto que suba el propio artista.
(() => {
'use strict';
const SKIN = ['#F3D5B5', '#E0AC83', '#C68642', '#8D5524', '#5C3A21'], HAIR = ['#0B0B0B', '#3B2416', '#7A4B24', '#C9A24B', '#D9D9D9', '#6B2D2D'];
const CLOTH = ['#0B0B0B', '#FFFFFF', '#C9A24B', '#BFE3C8', '#2F4F3A'];
const BG = [['#0B0B0B', '#3A3320'], ['#C9A24B', '#F3E3B3'], ['#BFE3C8', '#F4FBF6'], ['#FFFFFF', '#E7E2D3'], ['#1F3D2B', '#BFE3C8']];
const hash = s => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');
// Dibujo de fondo propio de cada género
const PAT = {
  Pop: () => rep(12, i => `<path d="M60 60L${(60 + 90 * Math.cos(i * Math.PI / 6)).toFixed(1)} ${(60 + 90 * Math.sin(i * Math.PI / 6)).toFixed(1)}"/>`),
  Rock: () => rep(8, i => `<path d="M${-40 + i * 22} 130L${50 + i * 22} -10"/>`),
  Urbano: () => rep(6, i => `<path d="M${i * 24} 0V120M0 ${i * 24}H120"/>`),
  'Electrónica': () => rep(6, i => `<circle cx="60" cy="125" r="${18 + i * 18}"/>`),
  Flamenco: () => rep(4, i => rep(5, j => `<path d="M${j * 30 - 15} ${i * 26 + 26}a15 15 0 0 1 30 0"/>`)),
  Indie: () => rep(5, i => rep(5, j => `<circle cx="${12 + j * 24 + (i % 2) * 12}" cy="${12 + i * 24}" r="4"/>`)),
  Jazz: () => rep(10, i => `<path d="M${6 + i * 12} 0V120"/>`),
  Folk: () => rep(4, i => rep(4, j => `<path d="M${15 + j * 30} ${10 + i * 30}l6 8-6 8-6-8z"/>`)),
  'Clásica': () => rep(5, i => `<path d="M0 ${20 + i * 8}H120"/>`)
};
// Complemento propio de cada género
const ACC = {
  Pop: '<circle cx="41" cy="63" r="3" fill="#C9A24B"/><circle cx="79" cy="63" r="3" fill="#C9A24B"/>',
  Rock: '<rect x="42" y="49" width="15" height="9" fill="#000"/><rect x="63" y="49" width="15" height="9" fill="#000"/><path d="M57 52h6" stroke="#000" stroke-width="2"/>',
  Urbano: '<path d="M39 42c0-14 9-20 21-20s21 6 21 20z" fill="#0B0B0B"/><path d="M39 42h50" stroke="#C9A24B" stroke-width="4"/>',
  'Electrónica': '<path d="M38 56V50c0-14 10-24 22-24s22 10 22 24v6" fill="none" stroke="#111" stroke-width="4"/><rect x="33" y="52" width="8" height="16" fill="#C9A24B"/><rect x="79" y="52" width="8" height="16" fill="#C9A24B"/>',
  Flamenco: '<circle cx="82" cy="34" r="8" fill="#C9A24B"/><circle cx="82" cy="34" r="3" fill="#fff"/>',
  Indie: '<circle cx="50" cy="54" r="8" fill="none" stroke="#222" stroke-width="2"/><circle cx="70" cy="54" r="8" fill="none" stroke="#222" stroke-width="2"/><path d="M58 54h4" stroke="#222" stroke-width="2"/>',
  Jazz: '<path d="M38 38h44l-3-15H41z" fill="#222"/><rect x="30" y="36" width="60" height="5" fill="#222"/><rect x="40" y="32" width="40" height="3" fill="#C9A24B"/>',
  Folk: '<path d="M44 84c10 9 22 9 32 0l4 10c-12 9-28 9-40 0z" fill="#BFE3C8"/>',
  'Clásica': '<path d="M60 92l-11-6v12zM60 92l11-6v12z" fill="#0B0B0B"/>'
};
let n = 0;
window.AVATAR = a => {
  if (/^data:image\/(png|jpeg);base64,[A-Za-z0-9+\/=]+$/.test(a.avatar || '')) return `<img src="${a.avatar}" alt="Foto de ${esc(a.name)}">`;
  const h = hash(a.name), p = (arr, k) => arr[(h >>> k) % arr.length], id = 'av' + ++n;
  const skin = p(SKIN, 1), hair = p(HAIR, 4), cloth = p(CLOTH, 7), [b1, b2] = p(BG, 10), st = (h >>> 13) % 6;
  const HS = [
    ['', `<path d="M40 50c0-17 8-26 20-26s20 9 20 26c-5-8-12-11-20-11s-15 3-20 11z" fill="${hair}"/>`],
    [`<path d="M36 52c0-24 10-32 24-32s24 8 24 32v28H36z" fill="${hair}"/>`, `<path d="M40 50c0-14 8-22 20-22s20 8 20 22c-6-6-12-9-20-9s-14 3-20 9z" fill="${hair}"/>`],
    [`<circle cx="60" cy="42" r="28" fill="${hair}"/>`, ''],
    ['', ''],
    [`<circle cx="60" cy="22" r="9" fill="${hair}"/>`, `<path d="M41 48c0-16 8-24 19-24s19 8 19 24c-5-7-11-10-19-10s-14 3-19 10z" fill="${hair}"/>`],
    ['', `<path d="M40 48l4-22 8 12 8-18 8 18 8-12 4 22c-6-7-12-9-20-9s-14 2-20 9z" fill="${hair}"/>`]
  ];
  const line = b1 === '#0B0B0B' || b1 === '#1F3D2B' ? '#fff' : '#000';
  return `<svg viewBox="0 0 120 120" role="img" aria-label="Foto de ${esc(a.name)}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b1}"/><stop offset="1" stop-color="${b2}"/></linearGradient></defs><rect width="120" height="120" fill="url(#${id})"/><g fill="none" stroke="${line}" stroke-opacity=".16" stroke-width="1.5">${(PAT[a.genre] || (() => ''))()}</g>${HS[st][0]}<path d="M14 120c4-27 22-38 46-38s42 11 46 38z" fill="${cloth}"/><rect x="52" y="70" width="16" height="18" fill="${skin}"/><ellipse cx="60" cy="54" rx="19" ry="23" fill="${skin}"/>${HS[st][1]}<circle cx="52" cy="55" r="1.8" fill="#222"/><circle cx="68" cy="55" r="1.8" fill="#222"/><path d="M54 67q6 4 12 0" fill="none" stroke="#7A3B2E" stroke-width="1.6" stroke-linecap="round"/>${ACC[a.genre] || ''}</svg>`;
};
})();
