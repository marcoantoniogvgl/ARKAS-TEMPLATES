/* ==========================================================================
   TOMA — script.js
   Todo el comportamiento de la web en un solo archivo.

   Organización:
    0. Configuración y datos de ejemplo (catálogo, eventos)
    1. Utilidades
    2. Almacenamiento local
    3. API SIMULADA  ← aquí se sustituirá por llamadas reales al backend
    4. Fondo de estrellas
    5. Avisos, modales y formularios
    6. Catálogo, favoritos y eventos
    7. Carrito
    8. Checkout
    9. Vista rápida y buscador
   10. Cuenta y perfil
   11. Personalizador
   12. Router y arranque
   ========================================================================== */
(() => {
    'use strict';

    /* ======================================================================
       0. CONFIGURACIÓN Y DATOS
       Los valores de envío, IVA y códigos son de EJEMPLO: cuando exista el
       backend deben venir del servidor (nunca se confía en el navegador).
    ====================================================================== */
    const CONFIG = {
        vat: 0.21,
        shipping: { cost: 4.9, freeFrom: 60 },
        promos: { TOMA10: { percent: 10, label: 'TOMA10 (−10 %)' } },
        maxLogoBytes: 1.5 * 1024 * 1024
    };

    const CATALOG = [
        { id: 'tee-essential', code: '001', category: 'ropa', name: 'Camiseta Essential', detail: 'Algodón pesado · Tallas XS–XL', price: 32, tone: 'star', icon: 'tee', sizes: ['XS', 'S', 'M', 'L', 'XL'], tag: 'Más vendido' },
        { id: 'hoodie-studio', code: '002', category: 'ropa', name: 'Sudadera Studio', detail: 'Felpa suave · Tallas S–XL', price: 58, tone: 'void', icon: 'hoodie', sizes: ['S', 'M', 'L', 'XL'] },
        { id: 'cap-logo', code: '003', category: 'ropa', name: 'Gorra Logo', detail: 'Algodón lavado · Ajustable', price: 24, tone: 'dusk', icon: 'cap' },
        { id: 'tote-toma', code: '004', category: 'objetos', name: 'Tote Bag TOMA', detail: 'Lona reciclada · Edición limitada', price: 18, tone: 'gold', icon: 'tote', tag: 'Nuevo' },
        { id: 'desk-clock', code: '005', category: 'objetos', name: 'Reloj de sobremesa', detail: 'Aluminio · Mecanismo silencioso', price: 42, tone: 'noir', icon: 'watch' },
        { id: 'print-manifiesto', code: '006', category: 'objetos', name: 'Lámina Manifiesto', detail: 'Serigrafía · 30 × 40 cm', price: 16, tone: 'star', icon: 'print' }
    ];

    const EVENTS = [
        { id: 'toma-night-madrid', code: '012', date: '2026-10-12', city: 'Madrid', venue: 'Sala El Sol', title: 'TOMA Night', desc: 'Una noche de música, visuales y piezas nuevas con artistas invitados.', price: 15 },
        { id: 'studio-sessions-barcelona', code: '013', date: '2026-11-07', city: 'Barcelona', venue: 'Razzmatazz', title: 'Studio Sessions', desc: 'Directos íntimos y una edición especial de merchandising del estudio.', price: 18 },
        { id: 'objects-sounds-valencia', code: '014', date: '2026-11-21', city: 'Valencia', venue: 'La Mutant', title: 'Objects & Sounds', desc: 'Mercado de creadores, charla abierta y música durante toda la tarde.', price: 0 }
    ];

    const COLORS = {
        black: { name: 'Negro', hex: '#0c0c0e', dark: true },
        white: { name: 'Blanco', hex: '#f4f1e8', dark: false },
        gold: { name: 'Oro', hex: '#d6ae54', dark: false },
        graphite: { name: 'Grafito', hex: '#3b3b41', dark: true }
    };

    const PRODUCT_LABELS = { 'Camiseta': 'Camiseta Essential', 'Sudadera': 'Sudadera Studio', 'Tote Bag': 'Tote Bag' };
    const PRODUCT_ICONS = { 'Camiseta': 'tee', 'Sudadera': 'hoodie', 'Tote Bag': 'tote' };

    // Ideas rápidas del personalizador: puntos de partida, no productos reales.
    const DESIGN_PRESETS = [
        { label: 'Eclipse', product: 'Camiseta', color: 'black', text: 'ECLIPSE', font: 'display', size: 'M', textScale: 100, style: 'outline', printColor: 'gold' },
        { label: 'Aurora', product: 'Sudadera', color: 'white', text: 'AURORA', font: 'sans', size: 'M', textScale: 90, style: 'solid', printColor: 'black' },
        { label: 'Nova', product: 'Tote Bag', color: 'gold', text: 'NOVA', font: 'italic', size: 'M', textScale: 110, style: 'solid', printColor: 'black' },
        { label: 'Cometa', product: 'Camiseta', color: 'graphite', text: 'COMETA', font: 'display', size: 'M', textScale: 95, style: 'solid', printColor: 'white' }
    ];
    const DEFAULT_DESIGN = { product: 'Camiseta', color: 'black', text: 'TOMA', font: 'display', size: 'M', textScale: 100, style: 'solid', printColor: 'auto' };

    const DEMO_USER = { name: 'Lucía Martín', email: 'lucia@ejemplo.com', city: 'Madrid', username: 'luciamartin', demo: true };
    const DEMO_ORDERS = [{ id: 'TM-1048', createdAt: '2026-09-15', status: 'Enviado', items: [{ name: 'Camiseta Essential', price: 32, quantity: 1, kind: 'product' }], totals: { total: 32 } }];
    const DEMO_SALES = [
        { name: 'Tote Bag “Noche Lenta”', meta: '3 unidades · última venta 14 sep 2026', amount: '54,00 €' },
        { name: 'Lámina “Ritmo”', meta: '1 unidad · última venta 02 sep 2026', amount: '16,00 €' }
    ];
    const DEMO_PRODUCTS = [
        { name: 'Noche Lenta / Tote', meta: 'Publicado · 12 unidades disponibles', state: 'Publicado' },
        { name: 'Ritmo / Lámina', meta: 'Borrador · falta añadir imagen', state: 'Borrador' }
    ];

    /* ======================================================================
       1. UTILIDADES
    ====================================================================== */
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const money = (value) => Number(value).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    const round2 = (value) => Math.round(value * 100) / 100;

    const esc = (text) => String(text ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

    const normalize = (text) => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const firstName = (name) => String(name || '').trim().split(/\s+/)[0] || 'tú';
    const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
    const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

    const parseDate = (iso) => new Date(String(iso).slice(0, 10) + 'T00:00:00');
    const formatDate = (iso) => parseDate(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    const daysUntil = (iso) => Math.round((parseDate(iso) - new Date(new Date().toDateString())) / 86400000);

    const iconSVG = (icon, className = 'pi') => `<svg class="${className}" viewBox="0 0 120 120" aria-hidden="true"><use href="#i-${icon}"/></svg>`;

    // Retrasa la llamada hasta que pasen `wait` ms sin nuevas invocaciones (para el buscador, el resize, etc.)
    function debounce(fn, wait) {
        let timer;
        return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); };
    }

    // Texto ⇄ base64 seguro con acentos y emoji, sin depender de escape()/unescape() (obsoletas).
    function utf8ToBase64(text) {
        const bytes = new TextEncoder().encode(text);
        let binary = '';
        bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
        return btoa(binary);
    }
    function base64ToUtf8(base64) {
        const binary = atob(base64);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    }

    /* ======================================================================
       2. ALMACENAMIENTO LOCAL (solo mientras no exista backend)
    ====================================================================== */
    const store = {
        get(key, fallback) {
            try {
                const raw = localStorage.getItem('toma-' + key);
                return raw === null ? fallback : JSON.parse(raw);
            } catch { return fallback; }
        },
        set(key, value) {
            try { localStorage.setItem('toma-' + key, JSON.stringify(value)); } catch { /* sin almacenamiento */ }
        },
        remove(key) {
            try { localStorage.removeItem('toma-' + key); } catch { /* sin almacenamiento */ }
        }
    };

    /* ======================================================================
       3. API SIMULADA
       Cada función devuelve una Promesa, igual que lo hará fetch().
       Para conectar el backend basta con reescribir cada método; el resto
       de la web no cambia. Endpoint sugerido en el comentario de cada uno.
    ====================================================================== */
    async function hashPassword(email, password) {
        // DEMO: en producción el hash lo hace el servidor (Argon2 o bcrypt), nunca el navegador.
        const text = `toma:${email}:${password}`;
        try {
            const bytes = new TextEncoder().encode(text);
            const digest = await crypto.subtle.digest('SHA-256', bytes);
            return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
        } catch { return utf8ToBase64(text); }
    }

    const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, city: user.city || '', username: user.username || '' });

    const api = {
        /** GET /api/products */
        async getProducts() { return CATALOG; },
        /** GET /api/events */
        async getEvents() { return EVENTS; },

        /** POST /api/auth/register */
        async register({ name, email, password }) {
            const users = store.get('users', []);
            const key = email.trim().toLowerCase();
            if (users.some((u) => u.email === key)) throw new Error('Ya existe una cuenta con ese email.');
            const user = { id: 'u' + Date.now(), name: name.trim(), email: key, passHash: await hashPassword(key, password), createdAt: new Date().toISOString() };
            users.push(user);
            store.set('users', users);
            store.set('session', publicUser(user));
            return publicUser(user);
        },
        /** POST /api/auth/login */
        async login({ email, password }) {
            const key = email.trim().toLowerCase();
            const user = store.get('users', []).find((u) => u.email === key);
            if (!user || user.passHash !== await hashPassword(key, password)) throw new Error('Email o contraseña incorrectos.');
            store.set('session', publicUser(user));
            return publicUser(user);
        },
        /** POST /api/auth/logout */
        async logout() { store.remove('session'); },
        /** PATCH /api/me */
        async updateProfile(patch) {
            const session = store.get('session', null);
            if (!session) throw new Error('Sin sesión.');
            const users = store.get('users', []);
            const record = users.find((u) => u.id === session.id);
            const updated = { ...session, ...patch };
            if (record) { Object.assign(record, patch, { email: (patch.email || record.email).toLowerCase() }); store.set('users', users); }
            store.set('session', updated);
            return updated;
        },

        /** GET /api/me/orders */
        async getOrders() {
            const session = store.get('session', null);
            const orders = store.get('orders', []);
            return session ? orders.filter((o) => o.userEmail === session.email) : orders.filter((o) => !o.userEmail || !store.get('users', []).some((u) => u.email === o.userEmail));
        },
        /** POST /api/orders (el servidor recalcula precios, stock y totales) */
        async createOrder({ items, totals, customer, payment, promo }) {
            const seq = store.get('order-seq', 1048) + 1;
            store.set('order-seq', seq);
            const session = store.get('session', null);
            const order = {
                id: 'TM-' + seq, createdAt: new Date().toISOString(),
                status: items.every((i) => i.kind === 'event') ? 'Confirmada' : 'Recibido',
                items, totals, customer, payment, promo: promo || null,
                userEmail: session ? session.email : null
            };
            const orders = store.get('orders', []);
            orders.unshift(order);
            store.set('orders', orders);
            return order;
        },

        /** GET /api/me/designs */
        async getDesigns() { return store.get('designs', []); },
        /** POST /api/me/designs */
        async saveDesign(design) {
            const designs = store.get('designs', []);
            const saved = { ...design, id: 'd' + Date.now(), createdAt: new Date().toISOString() };
            designs.unshift(saved);
            store.set('designs', designs.slice(0, 30));
            return saved;
        },
        /** DELETE /api/me/designs/:id */
        async deleteDesign(id) { store.set('designs', store.get('designs', []).filter((d) => d.id !== id)); },

        /** GET / POST /api/me/products (borradores del creador) */
        async getDrafts() { return store.get('drafts', []); },
        async saveDraft(draft) {
            const drafts = store.get('drafts', []);
            drafts.unshift({ ...draft, id: 'p' + Date.now(), createdAt: new Date().toISOString() });
            store.set('drafts', drafts);
        },
        async deleteDraft(id) { store.set('drafts', store.get('drafts', []).filter((d) => d.id !== id)); },

        /** POST /api/newsletter */
        async subscribe(email) {
            const list = store.get('newsletter', []);
            if (!list.includes(email.toLowerCase())) list.push(email.toLowerCase());
            store.set('newsletter', list);
        },
        /** POST /api/events/proposals */
        async proposeEvent(data) {
            const list = store.get('event-proposals', []);
            list.push({ ...data, createdAt: new Date().toISOString() });
            store.set('event-proposals', list);
        },
        /** POST /api/events/:id/rsvp */
        async rsvp(eventId) {
            const list = store.get('rsvps', []);
            if (!list.includes(eventId)) list.push(eventId);
            store.set('rsvps', list);
        }
    };

    /* ======================================================================
       4. FONDO DE ESTRELLAS
    ====================================================================== */
    function initStarfield() {
        const canvas = $('#starfield');
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let w = 0, h = 0, lastW = 0, stars = [], scroll = 0, mx = 0, raf = 0;

        const draw = (t) => {
            ctx.clearRect(0, 0, w, h);
            for (const s of stars) {
                const y = (((s.y - scroll * s.z * 0.35) % h) + h) % h;
                const x = s.x + mx * s.z * 14;
                ctx.globalAlpha = s.a * (reduce ? 1 : 0.65 + 0.35 * Math.sin((t / 1000) * s.sp + s.ph));
                ctx.fillStyle = s.gold ? '#f4dc9a' : '#f6f3ea';
                ctx.beginPath();
                ctx.arc(x, y, s.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = window.innerWidth; h = window.innerHeight;
            canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            if (w !== lastW) {
                lastW = w;
                const count = Math.min(240, Math.round((w * h) / 8500));
                stars = Array.from({ length: count }, () => {
                    const z = Math.random();
                    return { x: Math.random() * w, y: Math.random() * h, z, r: 0.4 + z * 1.2, a: 0.25 + z * 0.6, gold: Math.random() < 0.16, ph: Math.random() * 6.28, sp: 0.5 + Math.random() * 1.5 };
                });
            }
            draw(0);
        };

        const loop = (t) => { draw(t); raf = requestAnimationFrame(loop); };

        window.addEventListener('resize', resize);
        window.addEventListener('scroll', () => { scroll = window.scrollY; if (reduce) draw(0); }, { passive: true });
        window.addEventListener('pointermove', (e) => { mx = e.clientX / w - 0.5; }, { passive: true });
        document.addEventListener('visibilitychange', () => {
            if (reduce) return;
            if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(loop);
        });

        resize();
        if (!reduce) raf = requestAnimationFrame(loop);
    }

    /* ======================================================================
       5. AVISOS, MODALES Y FORMULARIOS
    ====================================================================== */
    let toastTimer;
    function toast(message) {
        const el = $('.toast');
        if (!el) return;
        el.textContent = message;
        el.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3000);
    }

    const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])';
    const visibleFocusables = (root) => $$(FOCUSABLE, root).filter((el) => !el.closest('[hidden]') && el.offsetParent !== null);

    const cartDrawer = $('.cart-drawer');
    const drawerOverlay = $('.drawer-overlay');
    const modalEls = Object.fromEntries($$('.modal-backdrop').map((el) => [el.dataset.modal, el]));
    const AUTOFOCUS = { search: '#search-input', auth: 'form:not([hidden]) input', checkout: 'form:not([hidden]) input, .checkout-done a', quick: '#qv-add' };
    let activeModal = null;
    let returnFocus = null;
    let drawerReturn = null;

    function toggleDrawer(isOpen, silent = false) {
        if (!cartDrawer) return;
        if (isOpen) drawerReturn = document.activeElement;
        cartDrawer.classList.toggle('is-open', isOpen);
        drawerOverlay?.classList.toggle('is-visible', isOpen);
        cartDrawer.setAttribute('aria-hidden', String(!isOpen));
        cartDrawer.inert = !isOpen;
        if (isOpen) $('.drawer-close', cartDrawer)?.focus();
        else if (!silent) drawerReturn?.focus?.();
    }

    function openModal(name) {
        const el = modalEls[name];
        if (!el) return;
        if (cartDrawer?.classList.contains('is-open')) toggleDrawer(false, true);
        if (activeModal && activeModal !== name) closeModal(true);
        if (!activeModal) returnFocus = document.activeElement;
        activeModal = name;
        el.inert = false;
        el.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        requestAnimationFrame(() => {
            el.classList.add('is-visible');
            (AUTOFOCUS[name] && $(AUTOFOCUS[name], el) || visibleFocusables(el)[0])?.focus();
        });
    }

    function closeModal(silent = false) {
        if (!activeModal) return;
        const el = modalEls[activeModal];
        el.classList.remove('is-visible');
        el.setAttribute('aria-hidden', 'true');
        el.inert = true;
        activeModal = null;
        document.body.classList.remove('no-scroll');
        if (!silent) returnFocus?.focus?.();
    }

    // Validación de formularios: <input data-rules="required email min:8 postal price checked">
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function validateField(input) {
        const rules = (input.dataset.rules || '').split(/\s+/).filter(Boolean);
        const value = input.type === 'checkbox' ? input.checked : input.value.trim();
        let message = '';
        for (const rule of rules) {
            const [name, arg] = rule.split(':');
            if (name === 'required' && !value) { message = 'Este campo es obligatorio.'; break; }
            if (name === 'checked' && !value) { message = 'Debes aceptar para continuar.'; break; }
            if (!value) continue;
            if (name === 'email' && !EMAIL_RE.test(value)) { message = 'Introduce un email válido (nombre@dominio.com).'; break; }
            if (name === 'min' && value.length < Number(arg)) { message = `Usa al menos ${arg} caracteres.`; break; }
            if (name === 'postal' && !/^\d{5}$/.test(value)) { message = 'Introduce un código postal de 5 dígitos.'; break; }
            if (name === 'price' && !(parseFloat(value.replace(',', '.')) > 0)) { message = 'Introduce un precio válido, por ejemplo 24,90.'; break; }
        }
        const field = input.closest('.field');
        field?.classList.toggle('has-error', Boolean(message));
        const error = field?.querySelector('.field-error');
        if (error) error.textContent = message;
        input.setAttribute('aria-invalid', message ? 'true' : 'false');
        return !message;
    }

    function validateForm(form) {
        const inputs = $$('[data-rules]', form).filter((input) => !input.closest('[hidden]'));
        const results = inputs.map((input) => [input, validateField(input)]);
        const firstBad = results.find(([, ok]) => !ok);
        firstBad?.[0].focus();
        return !firstBad;
    }

    function resetForm(form) {
        form.reset();
        $$('.field.has-error', form).forEach((field) => field.classList.remove('has-error'));
    }

    document.addEventListener('focusout', (event) => {
        const input = event.target;
        if (!input.matches?.('[data-rules]')) return;
        if (input.value.trim() || input.closest('.field')?.classList.contains('has-error')) validateField(input);
    });

    document.addEventListener('input', (event) => {
        const input = event.target;
        if (input.matches?.('[data-rules]') && input.closest('.field')?.classList.contains('has-error')) validateField(input);
    });

    /* ======================================================================
       6. CATÁLOGO, FAVORITOS Y EVENTOS
    ====================================================================== */
    const eventProduct = (ev) => ({
        id: ev.id, kind: 'event', code: ev.code, category: 'eventos',
        name: `${ev.title} — ${ev.city}`, detail: `${formatDate(ev.date)} · ${ev.venue}`,
        price: ev.price, tone: 'noir', icon: 'ticket'
    });

    const findSellable = (id) => CATALOG.find((p) => p.id === id) || (EVENTS.find((e) => e.id === id) ? eventProduct(EVENTS.find((e) => e.id === id)) : null);

    const getWishlist = () => store.get('wishlist', []);
    const isWished = (id) => getWishlist().includes(id);

    function toggleWish(id) {
        const list = getWishlist();
        const index = list.indexOf(id);
        if (index >= 0) list.splice(index, 1); else list.push(id);
        store.set('wishlist', list);
        syncWishUI();
        toast(index >= 0 ? 'Quitado de favoritos.' : 'Guardado en favoritos.');
        if ($('.profile-block[data-panel="favoritos"]') && location.hash.startsWith('#/perfil')) renderProfile();
        if (productState.filter === 'favoritos') renderProducts();
    }

    function syncWishUI() {
        const list = getWishlist();
        $$('[data-wish]').forEach((button) => button.setAttribute('aria-pressed', String(list.includes(button.dataset.wish))));
        $$('.wish-count').forEach((el) => { el.textContent = list.length; });
        const qvWish = $('#qv-wish');
        if (qvWish && quickState.product) {
            const pressed = list.includes(quickState.product.id);
            qvWish.setAttribute('aria-pressed', String(pressed));
            qvWish.textContent = pressed ? 'Quitar de favoritos' : 'Guardar en favoritos';
        }
    }

    function productCard(p, { withTag = true } = {}) {
        const isEvent = p.kind === 'event';
        const tag = withTag && p.tag ? `<span class="product-tag">${esc(p.tag)}</span>` : '';
        const wish = isEvent ? '' : `<button class="wish" type="button" data-wish="${p.id}" aria-pressed="${isWished(p.id)}" aria-label="Guardar ${esc(p.name)} en favoritos"><svg class="icon" aria-hidden="true"><use href="#i-heart"/></svg></button>`;
        const quick = isEvent ? '' : `<button class="quick" type="button" data-quick="${p.id}">Vista rápida</button>`;
        const label = isEvent ? 'Comprar entrada' : p.sizes ? 'Elegir talla' : 'Añadir al carrito';
        const category = isEvent ? 'Evento' : capitalize(p.category);
        return `<article class="product-card reveal" data-id="${p.id}">
            <div class="product-image tone-${p.tone}">${tag}${wish}${quick}${iconSVG(p.icon)}</div>
            <div class="product-info"><div><span class="product-category">${category} / ${p.code}</span><h3>${esc(p.name)}</h3><p>${esc(p.detail)}</p></div><strong class="price">${money(p.price)}</strong></div>
            <button class="add-to-cart" type="button" data-add="${p.id}">${label} <span>+</span></button>
        </article>`;
    }

    function renderFeatured() {
        const grid = $('#featured-grid');
        if (!grid) return;
        const next = EVENTS.find((e) => daysUntil(e.date) >= 0 && e.price > 0) || EVENTS[0];
        const items = [CATALOG[0], CATALOG[3], { ...eventProduct(next), tag: 'Próximo' }];
        grid.innerHTML = items.map((p) => productCard(p)).join('');
    }

    const productState = { filter: 'all', sort: 'featured' };

    function renderProducts() {
        const grid = $('#products-grid');
        if (!grid) return;
        const wished = getWishlist();
        let list = CATALOG.filter((p) => productState.filter === 'all' || (productState.filter === 'favoritos' ? wished.includes(p.id) : p.category === productState.filter));
        const sorters = {
            'price-asc': (a, b) => a.price - b.price,
            'price-desc': (a, b) => b.price - a.price,
            name: (a, b) => a.name.localeCompare(b.name, 'es')
        };
        if (sorters[productState.sort]) list = [...list].sort(sorters[productState.sort]);

        grid.innerHTML = list.map((p) => productCard(p, { withTag: false })).join('');
        grid.hidden = !list.length;
        $('#products-empty').hidden = Boolean(list.length);
        $('#products-empty-text').textContent = productState.filter === 'favoritos'
            ? 'Aún no tienes favoritos. Pulsa el corazón de cualquier pieza para guardarla aquí.'
            : 'No hay piezas con este filtro.';
        $('#product-count').textContent = `${list.length} ${list.length === 1 ? 'pieza' : 'piezas'}`;

        $$('#product-filters .filter-button').forEach((button) => {
            const active = button.dataset.filter === productState.filter;
            button.classList.toggle('is-selected', active);
            button.setAttribute('aria-pressed', String(active));
        });
        syncWishUI();
    }

    const eventState = { city: 'all' };

    function renderEvents() {
        const list = $('#events-list');
        if (!list) return;
        const rsvps = store.get('rsvps', []);

        const cities = [...new Set(EVENTS.map((e) => e.city))];
        $('#event-filters').innerHTML = [['all', 'Todas']].concat(cities.map((c) => [c, c])).map(([value, label]) =>
            `<button class="filter-button${eventState.city === value ? ' is-selected' : ''}" type="button" data-city="${esc(value)}" aria-pressed="${eventState.city === value}">${esc(label)}</button>`).join('');

        list.innerHTML = EVENTS.filter((e) => eventState.city === 'all' || e.city === eventState.city).map((ev) => {
            const days = daysUntil(ev.date);
            const when = days < 0 ? 'Evento finalizado' : days === 0 ? 'Es hoy' : days === 1 ? 'Es mañana' : `Faltan ${days} días`;
            const date = parseDate(ev.date);
            const month = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
            let action;
            if (days < 0) action = '<button class="button button-ink" type="button" disabled>Finalizado</button>';
            else if (ev.price === 0) action = rsvps.includes(ev.id)
                ? '<button class="button button-ink" type="button" disabled>Apuntado ✓</button>'
                : `<button class="button button-ink" type="button" data-rsvp="${ev.id}">Apuntarme <span>↗</span></button>`;
            else action = `<button class="add-to-cart" type="button" data-add="${ev.id}">Comprar entrada <span>+</span></button>`;

            return `<article class="event-card reveal"><div class="ticket">
                <div class="event-date"><strong>${String(date.getDate()).padStart(2, '0')}</strong><span>${capitalize(month)} ${date.getFullYear()}</span></div>
                <div class="event-main"><span class="product-category">${esc(ev.city)} / ${esc(ev.venue)}</span><h2>${esc(ev.title)}</h2><p>${esc(ev.desc)}</p><span class="event-when">${when}</span>
                    <div class="event-actions-secondary"><button class="link-button" type="button" data-ics="${ev.id}">Añadir al calendario</button></div></div>
                <div class="event-action"><strong>${ev.price === 0 ? 'Entrada libre' : money(ev.price)}</strong>${action}</div>
            </div></article>`;
        }).join('');
    }

    // Descarga un archivo .ics para añadir el evento al calendario
    function downloadICS(id) {
        const ev = EVENTS.find((e) => e.id === id);
        if (!ev) return;
        const start = ev.date.replace(/-/g, '');
        const end = new Date(parseDate(ev.date).getTime() + 86400000);
        const endStr = `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, '0')}${String(end.getDate()).padStart(2, '0')}`;
        const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
        const clean = (text) => String(text).replace(/[\\;,]/g, (c) => '\\' + c);
        const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TOMA//ES', 'BEGIN:VEVENT', `UID:${ev.id}@toma`, `DTSTAMP:${stamp}`,
            `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${endStr}`, `SUMMARY:${clean(ev.title)}`, `LOCATION:${clean(ev.venue + ', ' + ev.city)}`, `DESCRIPTION:${clean(ev.desc)}`, 'END:VEVENT', 'END:VCALENDAR'];
        const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${ev.id}.ics`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }

    // Cuenta atrás al próximo evento
    function initLaunch() {
        const box = $('#launch');
        const next = EVENTS.filter((e) => daysUntil(e.date) >= 0).sort((a, b) => parseDate(a.date) - parseDate(b.date))[0];
        if (!box || !next) return;
        box.hidden = false;
        $('#launch-title').textContent = next.title;
        $('#launch-meta').textContent = `${next.city} · ${formatDate(next.date)}`;
        const target = parseDate(next.date).getTime(); // TODO backend: enviar la hora de inicio real del evento
        const units = { d: $('[data-unit="d"]'), h: $('[data-unit="h"]'), m: $('[data-unit="m"]'), s: $('[data-unit="s"]') };
        const tick = () => {
            const diff = Math.max(0, target - Date.now());
            const pad = (n) => String(n).padStart(2, '0');
            units.d.textContent = pad(Math.floor(diff / 86400000));
            units.h.textContent = pad(Math.floor(diff / 3600000) % 24);
            units.m.textContent = pad(Math.floor(diff / 60000) % 60);
            units.s.textContent = pad(Math.floor(diff / 1000) % 60);
        };
        tick();
        setInterval(tick, 1000);
    }

    /* ======================================================================
       7. CARRITO
    ====================================================================== */
    const getCart = () => store.get('cart', []).map((item) => ({ kind: 'product', ...item, key: item.key || item.name }));
    const saveCart = (cart) => store.set('cart', cart);
    const getPromo = () => store.get('promo', null);

    function computeTotals(cart) {
        const subtotal = round2(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
        const code = getPromo();
        const promo = code && CONFIG.promos[code] ? { code, ...CONFIG.promos[code] } : null;
        const discount = promo ? round2(subtotal * promo.percent / 100) : 0;
        const net = round2(subtotal - discount);
        const physical = cart.some((item) => item.kind !== 'event');
        const shipping = physical && net < CONFIG.shipping.freeFrom ? CONFIG.shipping.cost : 0;
        const total = round2(net + shipping);
        return { subtotal, discount, shipping, total, vat: round2(total - total / (1 + CONFIG.vat)), physical, promo, missingForFree: physical ? Math.max(0, round2(CONFIG.shipping.freeFrom - net)) : 0 };
    }

    function updateCart(bump = false) {
        const cart = getCart();
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        $$('.cart-count').forEach((el) => {
            el.textContent = count;
            if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
        });

        const items = $('.cart-items');
        if (!items) return;
        items.innerHTML = cart.length ? cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info"><strong>${esc(item.name)}</strong><small>${money(item.price)} / unidad${item.size ? ' · Talla ' + esc(item.size) : ''}</small></div>
                <strong class="cart-item-total">${money(item.price * item.quantity)}</strong>
                <div class="quantity-control">
                    <button type="button" data-cart-action="decrease" data-index="${index}" aria-label="Quitar una unidad de ${esc(item.name)}">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" data-cart-action="increase" data-index="${index}" aria-label="Añadir una unidad de ${esc(item.name)}">+</button>
                </div>
            </div>`).join('')
            : '<p class="empty-cart"><strong>Tu carrito está vacío.</strong><span>Empieza con una pieza que te represente.</span></p>';

        const t = computeTotals(cart);
        $('.cart-subtotal').textContent = money(t.subtotal);
        $('.line-discount').hidden = !t.promo;
        $('.cart-discount').textContent = '−' + money(t.discount);
        $('.cart-shipping').textContent = !cart.length || !t.physical ? '—' : t.shipping === 0 ? 'Gratis' : money(t.shipping);
        $('.cart-total').textContent = money(t.total);
        $('.ship-hint').textContent = !cart.length || !t.physical ? '' : t.shipping === 0 ? 'Tu pedido tiene envío gratis.' : `Te faltan ${money(t.missingForFree)} para el envío gratis.`;
        $('.checkout-button').disabled = !cart.length;
        if (t.promo) { const s = $('.promo-status'); s.classList.remove('is-error'); s.textContent = `Código aplicado: ${t.promo.label}`; }
    }

    function addItem(product, { size = null, quantity = 1, meta = null } = {}) {
        const cart = getCart();
        const kind = product.kind || 'product';
        const key = [product.id, size].filter(Boolean).join('|');
        const existing = cart.find((item) => item.key === key);
        if (existing) existing.quantity += quantity;
        else cart.push({ key, id: product.id, name: product.name, price: product.price, size, kind, quantity, ...(meta ? { meta } : {}) });
        saveCart(cart);
        updateCart(true);
    }

    function applyPromo(raw) {
        const status = $('.promo-status');
        const code = raw.trim().toUpperCase();
        if (!code) { status.classList.add('is-error'); status.textContent = 'Escribe un código.'; return; }
        if (!CONFIG.promos[code]) { status.classList.add('is-error'); status.textContent = 'Ese código no es válido.'; return; }
        store.set('promo', code);
        updateCart();
    }

    /* ======================================================================
       8. CHECKOUT (3 pasos: datos, pago, confirmación)
    ====================================================================== */
    const checkoutState = { customer: null };

    function renderCheckoutSummary() {
        const cart = getCart();
        const t = computeTotals(cart);
        $('#checkout-lines').innerHTML = cart.map((item) => `<div class="sum-line"><span>${esc(item.name)}<small>${item.quantity} × ${money(item.price)}${item.size ? ' · Talla ' + esc(item.size) : ''}</small></span><b>${money(item.price * item.quantity)}</b></div>`).join('');
        $('#checkout-totals').innerHTML = `
            <div><dt>Subtotal</dt><dd>${money(t.subtotal)}</dd></div>
            ${t.promo ? `<div><dt>Descuento ${esc(t.promo.code)}</dt><dd>−${money(t.discount)}</dd></div>` : ''}
            <div><dt>Envío</dt><dd>${!t.physical ? '—' : t.shipping === 0 ? 'Gratis' : money(t.shipping)}</dd></div>
            <div class="grand"><dt>Total</dt><dd>${money(t.total)}</dd></div>
            <div class="vat"><dt>Incluye IVA (${Math.round(CONFIG.vat * 100)} %)</dt><dd>${money(t.vat)}</dd></div>`;
    }

    function goStep(step) {
        $$('[data-step]').forEach((panel) => { panel.hidden = Number(panel.dataset.step) !== step; });
        $$('[data-step-dot]').forEach((dot) => {
            const n = Number(dot.dataset.stepDot);
            dot.classList.toggle('is-current', n === step);
            dot.classList.toggle('is-done', n < step);
        });
        const summary = $('.checkout-summary');
        if (summary) summary.hidden = step === 3;
        $('.checkout-modal').classList.toggle('is-done', step === 3);
        visibleFocusables($(`[data-step="${step}"]`))[0]?.focus();
    }

    function openCheckout() {
        const cart = getCart();
        if (!cart.length) return;
        const t = computeTotals(cart);
        const user = getSession();
        $('#ship-fields').hidden = !t.physical;
        $('#digital-note').hidden = t.physical;
        if (user) { $('#co-name').value ||= user.name; $('#co-email').value ||= user.email; $('#co-city').value ||= user.city || ''; }
        renderCheckoutSummary();
        openModal('checkout');
        goStep(1);
    }

    /* ======================================================================
       9. VISTA RÁPIDA Y BUSCADOR
    ====================================================================== */
    const quickState = { product: null, size: null, quantity: 1 };

    function openQuick(id) {
        const p = CATALOG.find((item) => item.id === id);
        if (!p) return;
        quickState.product = p;
        quickState.size = p.sizes ? (p.sizes.includes('M') ? 'M' : p.sizes[0]) : null;
        quickState.quantity = 1;

        const plate = $('#qv-plate');
        plate.className = `qv-plate product-image tone-${p.tone}`;
        plate.innerHTML = iconSVG(p.icon);
        $('#qv-cat').textContent = `${capitalize(p.category)} / ${p.code}`;
        $('#qv-title').textContent = p.name;
        $('#qv-detail').textContent = p.detail;
        $('#qv-price').textContent = money(p.price);
        $('#qv-qty-value').textContent = '1';
        $('#qv-sizes-wrap').hidden = !p.sizes;
        $('#qv-sizes').innerHTML = (p.sizes || []).map((size) => `<button type="button" role="radio" data-size="${size}" aria-checked="${size === quickState.size}">${size}</button>`).join('');
        syncWishUI();
        openModal('quick');
    }

    function runSearch(query) {
        const box = $('#search-results');
        const q = normalize(query.trim());
        const products = CATALOG.map((p) => ({ type: 'product', id: p.id, title: p.name, sub: `${capitalize(p.category)} · ${p.detail}`, price: money(p.price), icon: p.icon, tone: p.tone, hay: normalize(`${p.name} ${p.detail} ${p.category}`) }));
        const events = EVENTS.map((e) => ({ type: 'event', id: e.id, title: e.title, sub: `Evento · ${e.city}, ${formatDate(e.date)}`, price: e.price ? money(e.price) : 'Libre', icon: 'ticket', tone: 'noir', hay: normalize(`${e.title} ${e.city} ${e.venue} evento entrada`) }));
        const results = q ? products.concat(events).filter((r) => r.hay.includes(q)).slice(0, 8) : products.slice(0, 4);

        box.innerHTML = results.length
            ? (q ? '' : '<p class="search-hint">Sugerencias</p>') + results.map((r, i) => `<button class="result${i === 0 ? ' is-active' : ''}" type="button" role="option" data-result="${r.type}:${r.id}"><span class="mini-plate tone-${r.tone}">${iconSVG(r.icon, '')}</span><span><strong>${esc(r.title)}</strong><small>${esc(r.sub)}</small></span><span class="result-price">${r.price}</span></button>`).join('')
            : `<p class="search-hint">No encontramos nada para “${esc(query.trim())}”. Prueba con “camiseta”, “tote” o “Madrid”.</p>`;
    }

    function openSearch() {
        $('#search-input').value = '';
        openModal('search');
        runSearch('');
    }

    function activateResult(value) {
        const [type, id] = value.split(':');
        closeModal(true);
        if (type === 'product') openQuick(id);
        else { location.hash = '#/eventos'; }
    }

    /* ======================================================================
       10. CUENTA Y PERFIL
    ====================================================================== */
    const getSession = () => store.get('session', null);

    function updateAccountUI() {
        const user = getSession();
        $('.account-label').textContent = user ? firstName(user.name) : 'Cuenta';
    }

    function setAuthTab(tab) {
        $$('[data-auth-tab]').forEach((button) => button.setAttribute('aria-selected', String(button.dataset.authTab === tab)));
        $$('form[data-form]').forEach((form) => { form.hidden = form.dataset.form !== tab; });
        $('#auth-title').innerHTML = tab === 'login' ? 'Entra en<br>tu cuenta.' : 'Crea tu<br>cuenta.';
        $('#auth-copy').textContent = tab === 'login'
            ? 'Guarda tus productos, consulta tus entradas y gestiona tus creaciones.'
            : 'Un perfil para tus pedidos, entradas, diseños y creaciones.';
    }

    function openAuth(tab = 'login') {
        setAuthTab(tab);
        openModal('auth');
    }

    let profileTab = 'resumen';

    function showProfileTab(name) {
        profileTab = name;
        $$('.profile-tab').forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === name));
        $$('.profile-block').forEach((block) => { block.hidden = block.dataset.panel !== name; });
    }

    const emptyRow = (text, cta = '') => `<div class="empty-row"><p>${text}</p>${cta}</div>`;
    const orderSummary = (order) => order.items.map((i) => `${i.name}${i.size ? ' (' + i.size + ')' : ''} ×${i.quantity}`).join(', ');

    async function renderProfile() {
        const session = getSession();
        const user = session || DEMO_USER;
        const demo = !session;

        $('#profile-avatar').textContent = initials(user.name);
        $('#profile-name').textContent = user.name;
        $('#profile-email').textContent = user.email;
        $('#profile-banner').textContent = demo ? 'Cuenta de demostración. Inicia sesión para ver tus propios datos.' : `Sesión iniciada como ${user.email}`;
        $('#profile-greeting').innerHTML = `<span class="line">Hola, ${esc(firstName(user.name))}.</span><span class="line l2">Este es tu espacio.</span>`;
        $('#logout-button').hidden = demo;

        let orders = await api.getOrders();
        if (demo && !orders.length) orders = DEMO_ORDERS;
        const designs = await api.getDesigns();
        const drafts = await api.getDrafts();
        const wished = getWishlist().map((id) => CATALOG.find((p) => p.id === id)).filter(Boolean);

        const orderRow = (o) => `<article><div><strong>Pedido #${esc(o.id)}</strong><p>${esc(orderSummary(o))} · ${money(o.totals.total)}</p></div><span class="row-end">${esc(o.status)}</span></article>`;
        const shopCta = '<a class="text-link" href="#/productos">Ver productos</a>';

        // Resumen
        const recent = orders.slice(0, 2).map(orderRow).concat(designs.slice(0, 1).map((d) => `<article><div><strong>Diseño guardado</strong><p>${esc(d.product)} personalizada · ${formatDate(d.createdAt)}</p></div><span class="row-end"><button class="link-button" type="button" data-load-design="${d.id}">Editar ↗</button></span></article>`));
        if (demo) recent.push('<article><div><strong>Diseño guardado</strong><p>Camiseta personalizada · hace 2 días</p></div><span class="row-end">Editar ↗</span></article>');
        $('#list-resumen').innerHTML = recent.length ? recent.join('') : emptyRow('Todavía no hay actividad. Tus pedidos y diseños aparecerán aquí.', shopCta);

        // Pedidos
        $('#list-pedidos').innerHTML = orders.length ? orders.map(orderRow).join('') : emptyRow('Aún no has hecho ningún pedido.', shopCta);

        // Diseños
        $('#list-disenos').innerHTML = designs.length ? designs.map((d) => {
            const color = COLORS[d.color] || COLORS.black;
            return `<article><div class="row-lead"><span class="mini-plate ${color.dark ? 'tone-star' : 'tone-noir'}" style="color:${color.hex}">${iconSVG(PRODUCT_ICONS[d.product] || 'tee', '')}</span><div><strong>${esc(d.product)} personalizada</strong><p>“${esc(d.text)}” · Talla ${esc(d.size)} · ${esc(color.name)} · ${formatDate(d.createdAt)}</p></div></div>
                <span class="row-end"><button class="link-button" type="button" data-load-design="${d.id}">Editar</button><button class="link-button" type="button" data-cart-design="${d.id}">Al carrito</button><button class="link-button" type="button" data-del-design="${d.id}">Eliminar</button></span></article>`;
        }).join('') : emptyRow('Todavía no has guardado ningún diseño.', '<a class="text-link" href="#/creacion">Crear un diseño</a>');

        // Entradas
        const tickets = orders.flatMap((o) => o.items.filter((i) => i.kind === 'event').map((i) => ({ order: o.id, item: i })));
        if (demo && !tickets.length) tickets.push({ order: 'TM-1048', item: { id: EVENTS[0].id, name: 'TOMA Night — Madrid', quantity: 1 } });
        $('#list-entradas').innerHTML = tickets.length ? tickets.map(({ order, item }) => {
            const ev = EVENTS.find((e) => e.id === item.id);
            return `<article><div><strong>${esc(item.name)}</strong><p>${ev ? formatDate(ev.date) + ' · ' + esc(ev.venue) : ''} · Pedido #${esc(order)} · ${item.quantity} ${item.quantity === 1 ? 'entrada' : 'entradas'}</p></div><span class="row-end">${ev ? `<button class="link-button" type="button" data-ics="${ev.id}">Añadir al calendario</button>` : ''}</span></article>`;
        }).join('') : emptyRow('No tienes entradas todavía.', '<a class="text-link" href="#/eventos">Ver eventos</a>');

        // Favoritos
        $('#list-favoritos').innerHTML = wished.length ? wished.map((p) => `<article><div class="row-lead"><span class="mini-plate tone-${p.tone}">${iconSVG(p.icon, '')}</span><div><strong>${esc(p.name)}</strong><p>${esc(p.detail)} · ${money(p.price)}</p></div></div><span class="row-end"><button class="link-button" type="button" data-quick="${p.id}">Ver</button><button class="link-button" type="button" data-wish="${p.id}">Quitar</button></span></article>`).join('')
            : emptyRow('Aún no tienes favoritos. Pulsa el corazón de cualquier pieza para guardarla.', shopCta);

        // Ventas y productos del creador
        $('#list-ventas').innerHTML = (demo ? DEMO_SALES : []).map((s) => `<article><div><strong>${esc(s.name)}</strong><p>${esc(s.meta)}</p></div><span class="row-end">${s.amount}</span></article>`).join('')
            || emptyRow('Todavía no tienes ventas. Cuando publiques piezas, verás aquí lo que vendes.');
        const draftRows = drafts.map((d) => `<article><div><strong>${esc(d.name)}</strong><p>Borrador · ${esc(d.category)} · ${money(d.price)}${d.hasImage ? '' : ' · falta añadir imagen'}</p></div><span class="row-end"><button class="link-button" type="button" data-del-draft="${d.id}">Eliminar</button></span></article>`);
        const demoRows = demo ? DEMO_PRODUCTS.map((p) => `<article><div><strong>${esc(p.name)}</strong><p>${esc(p.meta)}</p></div><span class="row-end">${p.state === 'Publicado' ? 'Editar ↗' : 'Continuar ↗'}</span></article>`) : [];
        $('#list-productos').innerHTML = draftRows.concat(demoRows).join('') || emptyRow('Todavía no has preparado ningún producto.');

        // Formulario de edición
        $('#pf-name').value = user.name || '';
        $('#pf-email').value = user.email || '';
        $('#pf-city').value = user.city || '';
        $('#pf-user').value = user.username || '';

        showProfileTab(profileTab);
    }

    /* ======================================================================
       11. PERSONALIZADOR
    ====================================================================== */
    const preview = $('#shirt-preview');
    const printEl = $('#shirt-print');
    const logoEl = $('#print-logo');
    let logoURL = null;

    function readDesign() {
        const select = $('#product-type');
        return {
            product: select.value,
            price: Number(select.selectedOptions[0].dataset.price),
            color: $('.swatch.is-selected')?.dataset.color || 'black',
            text: $('#shirt-text').value.trim() || 'TOMA',
            font: $('#shirt-font').value,
            size: $('#shirt-size').value,
            textScale: Number($('#text-scale').value),
            style: $('input[name="print-style"]:checked').value,
            printColor: $('input[name="print-color"]:checked').value
        };
    }

    function applyDesign() {
        if (!preview) return;
        const d = readDesign();
        preview.dataset.product = d.product;
        preview.dataset.size = d.size;
        preview.dataset.color = d.color;
        preview.dataset.print = d.printColor;
        printEl.dataset.style = d.style;
        printEl.dataset.font = d.font;
        printEl.textContent = d.text;
        const base = Math.min(7.4, 46 / Math.max(d.text.length, 5));
        printEl.style.setProperty('--fs', `${Math.min(base * d.textScale / 100, 52 / Math.max(d.text.length, 3))}cqw`);
        $('#preview-color-name').textContent = COLORS[d.color].name;
        $('#stage-product').textContent = PRODUCT_LABELS[d.product] || d.product;
        $('#stage-price').textContent = money(d.price);
        $('#text-scale-out').textContent = `${d.textScale} %`;
        $('#text-count').textContent = `${$('#shirt-text').value.length}/16`;
    }

    // Carga un diseño (guardado, preset o compartido por enlace) validando cada campo,
    // para que un enlace manipulado o un diseño antiguo nunca deje el formulario roto.
    function loadDesign(raw, navigate = true) {
        const d = { ...DEFAULT_DESIGN, ...raw };
        $('#product-type').value = PRODUCT_LABELS[d.product] ? d.product : DEFAULT_DESIGN.product;
        const color = COLORS[d.color] ? d.color : DEFAULT_DESIGN.color;
        $$('.swatch').forEach((s) => { const on = s.dataset.color === color; s.classList.toggle('is-selected', on); s.setAttribute('aria-pressed', String(on)); });
        $('#shirt-text').value = String(d.text || DEFAULT_DESIGN.text).slice(0, 16);
        $('#shirt-font').value = ['display', 'italic', 'sans'].includes(d.font) ? d.font : DEFAULT_DESIGN.font;
        $('#shirt-size').value = ['XS', 'S', 'M', 'L', 'XL'].includes(d.size) ? d.size : DEFAULT_DESIGN.size;
        $('#text-scale').value = Number(d.textScale) >= 60 && Number(d.textScale) <= 140 ? d.textScale : DEFAULT_DESIGN.textScale;
        const style = $(`input[name="print-style"][value="${['solid', 'outline'].includes(d.style) ? d.style : DEFAULT_DESIGN.style}"]`);
        if (style) style.checked = true;
        const pc = $(`input[name="print-color"][value="${['auto', 'white', 'black', 'gold'].includes(d.printColor) ? d.printColor : DEFAULT_DESIGN.printColor}"]`);
        if (pc) pc.checked = true;
        applyDesign();
        if (navigate) location.hash = '#/creacion';
    }

    function renderPresets() {
        const box = $('#design-presets');
        if (!box) return;
        box.innerHTML = DESIGN_PRESETS.map((p, i) => `<button type="button" class="preset-chip" data-preset="${i}" style="--chip:${COLORS[p.color].hex}">${esc(p.label)}</button>`).join('');
    }

    // Codifica el diseño actual como texto para meterlo en la URL (sin backend: solo va y viene del navegador).
    function encodeDesignState(payload) {
        try { return utf8ToBase64(JSON.stringify(payload)); } catch { return null; }
    }
    function decodeDesignState(encoded) {
        try { return JSON.parse(base64ToUtf8(encoded)); } catch { return null; }
    }

    function shareDesign() {
        const { price, ...d } = readDesign();
        const encoded = encodeDesignState(d);
        if (!encoded) { toast('No se ha podido generar el enlace.'); return; }
        history.replaceState(null, '', `#/creacion?d=${encoded}`);
        const url = location.href;
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(url).then(
                () => toast('Enlace copiado. Compártelo para que vean tu diseño.'),
                () => toast('Enlace listo en la barra de direcciones.')
            );
        } else {
            toast('Enlace listo en la barra de direcciones.');
        }
    }

    function resetDesign() {
        loadDesign(DEFAULT_DESIGN, false);
        $('#logo-input').value = '';
        setLogo(null);
        $('#design-status').textContent = 'Diseño reiniciado.';
    }

    // Si la ruta trae ?d=... (enlace compartido), carga ese diseño; si no, aplica el actual.
    function applyRouteDesign(query) {
        const encoded = new URLSearchParams(query).get('d');
        const payload = encoded ? decodeDesignState(encoded) : null;
        if (payload) loadDesign(payload, false);
        else applyDesign();
    }

    function setLogo(file) {
        if (logoURL) { URL.revokeObjectURL(logoURL); logoURL = null; }
        const has = Boolean(file);
        if (has) { logoURL = URL.createObjectURL(file); logoEl.src = logoURL; } else { logoEl.removeAttribute('src'); }
        logoEl.hidden = !has;
        $('.garment').classList.toggle('has-logo', has);
        $('#logo-clear').hidden = !has;
    }

    function initCustomizer() {
        if (!preview) return;
        $$('.swatch').forEach((swatch) => swatch.addEventListener('click', () => {
            $$('.swatch').forEach((s) => { const on = s === swatch; s.classList.toggle('is-selected', on); s.setAttribute('aria-pressed', String(on)); });
            applyDesign();
        }));

        $('#design-form').addEventListener('input', applyDesign);
        $('#design-form').addEventListener('change', applyDesign);

        $('#logo-input').addEventListener('change', (event) => {
            const file = event.target.files[0];
            const status = $('#design-status');
            if (!file) return setLogo(null);
            if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { event.target.value = ''; status.textContent = 'Formato no válido. Usa PNG, JPG o WebP.'; return; }
            if (file.size > CONFIG.maxLogoBytes) { event.target.value = ''; status.textContent = 'El logo supera 1,5 MB.'; return; }
            status.textContent = '';
            setLogo(file);
        });

        $('#logo-clear').addEventListener('click', () => { $('#logo-input').value = ''; setLogo(null); });

        $('#design-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const { price, ...d } = readDesign();
            await api.saveDesign({ ...d, price });
            $('#design-status').textContent = `Diseño guardado: ${d.product}, talla ${d.size}, color ${COLORS[d.color].name}. Lo tienes en tu perfil.`;
            toast('Diseño guardado.');
            if (location.hash.startsWith('#/perfil')) renderProfile();
        });

        $('#add-design-to-cart').addEventListener('click', () => {
            addDesignToCart(readDesign());
            $('#design-status').textContent = 'Añadido al carrito.';
            toggleDrawer(true);
        });

        $('#share-design').addEventListener('click', shareDesign);
        $('#reset-design').addEventListener('click', resetDesign);

        renderPresets();
        applyDesign();
    }

    function addDesignToCart(d) {
        const signature = [d.product, d.color, d.text, d.font, d.style, d.printColor, d.textScale].join('-');
        addItem({ id: 'custom-' + signature.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: `${d.product} personalizada / ${d.text}`, price: d.price, kind: 'custom' }, { size: d.size, meta: d });
    }

    /* ======================================================================
       12. ROUTER Y ARRANQUE
    ====================================================================== */
    const views = $$('.view');
    const viewNames = views.map((v) => v.dataset.view);
    const menuToggle = $('.menu-toggle');
    const mainMenu = $('#main-menu');

    function closeMenu() {
        mainMenu?.classList.remove('open');
        menuToggle?.setAttribute('aria-expanded', 'false');
    }

    // #/tienda  #/productos  #/productos/ropa  #/productos/favoritos  #/eventos  #/creacion  #/perfil
    // #/creacion?d=... también funciona: un diseño compartido por enlace, codificado sin backend.
    function route() {
        const [path, query] = location.hash.replace(/^#\/?/, '').split('?');
        const [rawName, param] = path.split('/');
        const name = rawName || 'tienda';
        const current = viewNames.includes(name) ? name : '404';

        views.forEach((view) => { view.hidden = view.dataset.view !== current; });
        $$('.main-menu a').forEach((link) => {
            const active = link.dataset.nav === current;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
        });
        document.title = $(`.view[data-view="${current}"]`)?.dataset.title || 'TOMA';
        updateMetaDescription(current);

        if (current === 'productos') {
            productState.filter = ['ropa', 'objetos', 'favoritos'].includes(param) ? param : 'all';
            renderProducts();
        }
        if (current === 'eventos') renderEvents();
        if (current === 'creacion') applyRouteDesign(query || '');
        if (current === 'perfil') renderProfile();

        closeMenu();
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    function initEvents() {
        // Menú móvil y cabecera
        menuToggle?.addEventListener('click', () => {
            const open = mainMenu.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(open));
        });
        const header = $('.site-header');
        const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        window.addEventListener('hashchange', route);

        $('.cart-trigger').addEventListener('click', () => toggleDrawer(true));
        $('.drawer-close').addEventListener('click', () => toggleDrawer(false));
        drawerOverlay.addEventListener('click', () => toggleDrawer(false));
        $('.search-trigger').addEventListener('click', openSearch);
        $('.account-trigger').addEventListener('click', () => { if (getSession()) location.hash = '#/perfil'; else openAuth('login'); });
        $('.checkout-button').addEventListener('click', openCheckout);

        // Delegación de clics para elementos generados dinámicamente
        document.addEventListener('click', async (event) => {
            const t = event.target;
            const pick = (selector) => t.closest(selector);

            if (pick('[data-close]') || (activeModal && t.classList.contains('modal-backdrop'))) {
                if (pick('[data-go-orders]')) { setTimeout(() => showProfileTab('pedidos'), 0); }
                closeModal();
                return;
            }

            let el;
            if ((el = pick('[data-wish]'))) { toggleWish(el.dataset.wish); return; }
            if ((el = pick('[data-quick]'))) { openQuick(el.dataset.quick); return; }
            if ((el = pick('[data-add]'))) {
                const p = findSellable(el.dataset.add);
                if (!p) return;
                if (p.sizes) { openQuick(p.id); return; }
                addItem(p);
                toggleDrawer(true);
                return;
            }
            if ((el = pick('[data-ics]'))) { downloadICS(el.dataset.ics); return; }
            if ((el = pick('[data-rsvp]'))) { await api.rsvp(el.dataset.rsvp); toast('Te has apuntado. ¡Nos vemos allí!'); renderEvents(); return; }
            if ((el = pick('[data-city]'))) { eventState.city = el.dataset.city; renderEvents(); return; }
            if ((el = pick('#product-filters [data-filter]'))) { productState.filter = el.dataset.filter; renderProducts(); return; }
            if (pick('[data-filter-reset]')) { productState.filter = 'all'; renderProducts(); return; }
            if ((el = pick('[data-preset]'))) { loadDesign(DESIGN_PRESETS[Number(el.dataset.preset)], false); $('#design-status').textContent = `Idea aplicada: ${DESIGN_PRESETS[Number(el.dataset.preset)].label}.`; return; }
            if (pick('[data-open-auth]')) { openAuth('login'); return; }
            if ((el = pick('[data-auth-tab]'))) { setAuthTab(el.dataset.authTab); return; }
            if ((el = pick('[data-scroll]'))) { event.preventDefault(); document.getElementById(el.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' }); return; }
            if ((el = pick('[data-cart-action]'))) {
                const cart = getCart();
                const item = cart[Number(el.dataset.index)];
                if (!item) return;
                item.quantity += el.dataset.cartAction === 'increase' ? 1 : -1;
                saveCart(cart.filter((i) => i.quantity > 0));
                updateCart();
                return;
            }
            if ((el = pick('[data-result]'))) { activateResult(el.dataset.result); return; }
            if ((el = pick('[data-load-design]'))) { const d = (await api.getDesigns()).find((x) => x.id === el.dataset.loadDesign); if (d) loadDesign(d); return; }
            if ((el = pick('[data-cart-design]'))) { const d = (await api.getDesigns()).find((x) => x.id === el.dataset.cartDesign); if (d) { addDesignToCart(d); toggleDrawer(true); } return; }
            if ((el = pick('[data-del-design]'))) { await api.deleteDesign(el.dataset.delDesign); toast('Diseño eliminado.'); renderProfile(); return; }
            if ((el = pick('[data-del-draft]'))) { await api.deleteDraft(el.dataset.delDraft); toast('Borrador eliminado.'); renderProfile(); return; }
            if ((el = pick('[data-consent]'))) { store.set('consent', el.dataset.consent); $('.consent').hidden = true; return; }
            if (pick('#logout-button')) { await api.logout(); updateAccountUI(); toast('Has cerrado sesión.'); profileTab = 'resumen'; renderProfile(); return; }
            if ((el = pick('.profile-tab'))) { showProfileTab(el.dataset.tab); return; }
        });

        $('#sort-select').addEventListener('change', (event) => { productState.sort = event.target.value; renderProducts(); });

        // Vista rápida
        $('#qv-sizes').addEventListener('click', (event) => {
            const button = event.target.closest('[data-size]');
            if (!button) return;
            quickState.size = button.dataset.size;
            $$('#qv-sizes button').forEach((b) => b.setAttribute('aria-checked', String(b === button)));
        });
        $('#qv-qty').addEventListener('click', (event) => {
            const button = event.target.closest('[data-qty]');
            if (!button) return;
            quickState.quantity = Math.min(10, Math.max(1, quickState.quantity + Number(button.dataset.qty)));
            $('#qv-qty-value').textContent = quickState.quantity;
        });
        $('#qv-add').addEventListener('click', () => {
            addItem(quickState.product, { size: quickState.size, quantity: quickState.quantity });
            closeModal(true);
            toggleDrawer(true);
        });
        $('#qv-wish').addEventListener('click', () => toggleWish(quickState.product.id));

        // Buscador
        const searchInput = $('#search-input');
        searchInput.addEventListener('input', debounce(() => runSearch(searchInput.value), 120));
        searchInput.addEventListener('keydown', (event) => {
            const items = $$('#search-results .result');
            if (!items.length) return;
            let index = items.findIndex((el) => el.classList.contains('is-active'));
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                items[index]?.classList.remove('is-active');
                index = (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
                items[index].classList.add('is-active');
                items[index].scrollIntoView({ block: 'nearest' });
            } else if (event.key === 'Enter') {
                event.preventDefault();
                (items[index] || items[0]).click();
            }
        });

        // Carrito: código promocional
        $('.promo-form').addEventListener('submit', (event) => { event.preventDefault(); applyPromo($('#promo-input').value); });

        // Checkout
        $('#checkout-form-1').addEventListener('submit', (event) => {
            event.preventDefault();
            if (!validateForm(event.currentTarget)) return;
            checkoutState.customer = {
                name: $('#co-name').value.trim(), email: $('#co-email').value.trim(),
                ...(computeTotals(getCart()).physical ? { address: $('#co-address').value.trim(), city: $('#co-city').value.trim(), zip: $('#co-zip').value.trim(), country: $('#co-country').value } : {})
            };
            goStep(2);
        });
        $('[data-back]').addEventListener('click', () => goStep(1));
        $('#checkout-form-2').addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!validateForm(event.currentTarget)) return;
            const cart = getCart();
            const button = $('button[type="submit"]', event.currentTarget);
            button.disabled = true;
            try {
                const totals = computeTotals(cart);
                const order = await api.createOrder({ items: cart, totals, customer: checkoutState.customer, payment: $('input[name="pay"]:checked').value, promo: totals.promo?.code });
                saveCart([]); store.remove('promo');
                $('#promo-input').value = ''; $('.promo-status').textContent = '';
                updateCart();
                $('#done-order').textContent = order.id;
                resetForm($('#checkout-form-2'));
                goStep(3);
            } finally { button.disabled = false; }
        });

        // Cuenta
        $('form[data-form="login"]').addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const status = $('.form-status', form);
            status.textContent = '';
            if (!validateForm(form)) return;
            try {
                const user = await api.login({ email: $('#login-email').value, password: $('#login-password').value });
                resetForm(form);
                closeModal(); updateAccountUI(); toast(`Hola de nuevo, ${firstName(user.name)}.`);
                if (location.hash.startsWith('#/perfil')) renderProfile();
            } catch (error) { status.textContent = error.message; }
        });
        $('form[data-form="register"]').addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const status = $('.form-status', form);
            status.textContent = '';
            if (!validateForm(form)) return;
            try {
                const user = await api.register({ name: $('#reg-name').value, email: $('#reg-email').value, password: $('#reg-password').value });
                resetForm(form);
                closeModal(); updateAccountUI(); toast(`Cuenta creada. Bienvenida/o, ${firstName(user.name)}.`);
                if (location.hash.startsWith('#/perfil')) renderProfile();
            } catch (error) { status.textContent = error.message; }
        });

        // Perfil
        $('#profile-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!validateForm(event.currentTarget)) return;
            if (!getSession()) { toast('Inicia sesión para guardar cambios en tu perfil.'); return; }
            await api.updateProfile({ name: $('#pf-name').value.trim(), email: $('#pf-email').value.trim(), city: $('#pf-city').value.trim(), username: $('#pf-user').value.trim() });
            updateAccountUI(); renderProfile(); toast('Cambios guardados.');
        });
        $('#draft-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            if (!validateForm(form)) return;
            await api.saveDraft({ name: $('#draft-name').value.trim(), category: $('#draft-category').value, price: parseFloat($('#draft-price').value.replace(',', '.')), hasImage: Boolean($('#draft-image').files.length) });
            resetForm(form); toast('Borrador guardado.'); renderProfile();
        });

        // Eventos y newsletter
        $('.event-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            if (!validateForm(form)) return;
            await api.proposeEvent({ name: $('#event-name').value.trim(), city: $('#event-city').value.trim(), date: $('#event-date-input').value });
            resetForm(form);
            $('.event-status').textContent = 'Propuesta recibida. La revisaremos antes de publicarla.';
        });
        $('.newsletter-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            if (!validateForm(form)) return;
            await api.subscribe($('#news-email').value.trim());
            resetForm(form);
            $('.newsletter-status').textContent = 'Listo. Te avisaremos del próximo drop.';
        });

        // Teclado: Escape, atajos de búsqueda y foco atrapado en modales
        document.addEventListener('keydown', (event) => {
            const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
            if (event.key === 'Escape') {
                if (activeModal) closeModal();
                else if (cartDrawer.classList.contains('is-open')) toggleDrawer(false);
                closeMenu();
                return;
            }
            if (((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing && !activeModal)) {
                event.preventDefault();
                openSearch();
                return;
            }
            if (event.key === 'Tab' && activeModal) {
                const items = visibleFocusables(modalEls[activeModal]);
                if (!items.length) return;
                const first = items[0], last = items[items.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
        });

        // Los enlaces del menú cierran el menú móvil
        mainMenu?.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
    }

    /* ======================================================================
       13. PULIDO: accesibilidad, revelado al scroll y botón de subir
    ====================================================================== */

    // Enlaza cada mensaje de error con su campo para que los lectores de pantalla lo anuncien.
    function wireFieldErrors() {
        $$('.field').forEach((field) => {
            const input = $('input, select', field);
            const error = $('.field-error', field);
            if (!input || !error) return;
            if (!error.id) error.id = `${input.id || 'campo'}-error`;
            error.setAttribute('role', 'alert');
            input.setAttribute('aria-describedby', error.id);
        });
    }

    // Revelado suave: los elementos .reveal aparecen al entrar en pantalla.
    // Un MutationObserver recoge también las tarjetas que se generan después con innerHTML.
    function initReveal() {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce || !('IntersectionObserver' in window)) {
            const showAll = () => $$('.reveal:not(.is-visible)').forEach((el) => el.classList.add('is-visible'));
            showAll();
            new MutationObserver(showAll).observe(document.body, { childList: true, subtree: true });
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

        const watch = () => $$('.reveal:not(.is-visible)').forEach((el) => io.observe(el));
        watch();
        new MutationObserver(debounce(watch, 30)).observe($('main'), { childList: true, subtree: true });
    }

    function initToTop() {
        const button = $('.to-top');
        if (!button) return;
        button.hidden = false;
        const toggle = () => button.classList.toggle('is-visible', window.scrollY > 700);
        window.addEventListener('scroll', toggle, { passive: true });
        button.addEventListener('click', () => {
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        });
        toggle();
    }

    // Descripción por página (útil al compartir y para el historial del navegador)
    const VIEW_DESCRIPTIONS = {
        tienda: 'TOMA: tienda de productos, entradas y creaciones con identidad.',
        productos: 'Catálogo completo de TOMA: ropa y objetos de edición limitada.',
        eventos: 'Agenda de eventos de TOMA: conciertos, sesiones y encuentros.',
        creacion: 'Diseña tu propia camiseta, sudadera o tote bag con TOMA y compártela.',
        perfil: 'Tu espacio en TOMA: pedidos, entradas, diseños y favoritos.',
        404: 'La página que buscas no existe en TOMA.'
    };

    function updateMetaDescription(view) {
        $('meta[name="description"]')?.setAttribute('content', VIEW_DESCRIPTIONS[view] || VIEW_DESCRIPTIONS.tienda);
    }

    function init() {
        initReveal();
        initStarfield();
        renderFeatured();
        renderProducts();
        renderEvents();
        initLaunch();
        initCustomizer();
        initEvents();
        wireFieldErrors();
        initToTop();

        cartDrawer.inert = true;
        Object.values(modalEls).forEach((el) => { el.inert = true; });
        if (!store.get('consent', null)) $('.consent').hidden = false;

        updateAccountUI();
        updateCart();
        syncWishUI();
        route();
    }

    init();
})();
