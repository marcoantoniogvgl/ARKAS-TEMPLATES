"use strict";

(() => {
    const storageKey = "arkas-demo-transition";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const demoInfo = {
        instituto: { title: { es: "Plantilla Instituto", en: "Institute Template", de: "Institut-Vorlage", it: "Template Istituto", fr: "Modèle Institut", hi: "संस्थान टेम्पलेट" }, colors: ["#5da5ff", "#d4af37"] },
        restaurante: { title: { es: "Plantilla Restaurante", en: "Restaurant Template", de: "Restaurant-Vorlage", it: "Template Ristorante", fr: "Modèle Restaurant", hi: "रेस्तरां टेम्पलेट" }, colors: ["#e6a85c", "#f06f4f"] },
        merchandising: { title: { es: "Plantilla Merchandising", en: "Merchandising Template", de: "Merchandising-Vorlage", it: "Template Merchandising", fr: "Modèle Produits dérivés", hi: "मर्चेंडाइज़ टेम्पलेट" }, colors: ["#d6ae54", "#f4dc9a"] },
        landing: { title: { es: "Plantilla Landing Page", en: "Landing Page Template", de: "Landingpage-Vorlage", it: "Template Landing Page", fr: "Modèle Page d’atterrissage", hi: "लैंडिंग पेज टेम्पलेट" }, colors: ["#9b7bff", "#22d3ee"] },
        gimnasio: { title: { es: "Plantilla Templo Coba", en: "Templo Coba Template", de: "Vorlage Templo Coba", it: "Template Templo Coba", fr: "Modèle Templo Coba", hi: "Templo Coba टेम्पलेट" }, colors: ["#ff704d", "#ffc857"] },
        "fondos-animados": { title: { es: "Fondos Animados", en: "Animated Backgrounds", de: "Animierte Hintergründe", it: "Sfondi animati", fr: "Arrière-plans animés", hi: "एनिमेटेड बैकग्राउंड" }, colors: ["#21d6c2", "#8b5cf6"] },
        cv: { title: { es: "Currículum de Marco Antonio", en: "Marco Antonio's Resume", de: "Lebenslauf von Marco Antonio", it: "CV di Marco Antonio", fr: "CV de Marco Antonio", hi: "Marco Antonio का रिज़्यूमे" }, colors: ["#36c98b", "#91e7bb"] }
    };
    const demoKeys = Object.keys(demoInfo);

    function getDemoInfo(demo) {
        const index = demoKeys.indexOf(demo);
        return {
            ...(demoInfo[demo] || demoInfo.instituto),
            number: String(index < 0 ? 1 : index + 1).padStart(2, "0")
        };
    }

    function fillTransition(curtain, demo) {
        const info = getDemoInfo(demo);
        const language = window.arkasI18n?.language || "es";
        const [accent, secondary] = info.colors;
        const captions = {
            es: "Nueva vista previa", en: "A new preview", de: "Eine neue Vorschau",
            it: "Una nuova anteprima", fr: "Un nouvel aperçu", hi: "एक नया प्रीव्यू"
        };
        curtain.style.setProperty("--transition-color", accent);
        curtain.style.setProperty("--transition-secondary", secondary);
        curtain.innerHTML = `
            <div class="demo-transition__content">
                <span class="demo-transition__eyebrow">ARKAS <i>/</i> ${info.number}</span>
                <span class="demo-transition__title">${info.title[language] || info.title.es}</span>
                <span class="demo-transition__caption">${captions[language] || captions.es}</span>
                <span class="demo-transition__rule"></span>
            </div>
        `;
    }

    function applySourceBounds(curtain, bounds) {
        const viewportWidth = Math.max(1, window.innerWidth);
        const viewportHeight = Math.max(1, window.innerHeight);
        const left = Math.max(0, Math.min(viewportWidth - 1, bounds.left));
        const top = Math.max(0, Math.min(viewportHeight - 1, bounds.top));
        const right = Math.max(left + 1, Math.min(viewportWidth, bounds.right));
        const bottom = Math.max(top + 1, Math.min(viewportHeight, bounds.bottom));
        curtain.style.setProperty("--transition-top", `${top}px`);
        curtain.style.setProperty("--transition-right", `${viewportWidth - right}px`);
        curtain.style.setProperty("--transition-bottom", `${viewportHeight - bottom}px`);
        curtain.style.setProperty("--transition-left", `${left}px`);
    }

    function cover(demo, bounds) {
        let curtain = document.getElementById("demo-transition");
        if (!curtain) {
            curtain = document.createElement("div");
            curtain.id = "demo-transition";
            curtain.className = "demo-transition";
            curtain.setAttribute("aria-hidden", "true");
            document.body.append(curtain);
        }

        fillTransition(curtain, demo);
        applySourceBounds(curtain, bounds);
        curtain.classList.remove("is-arriving", "is-waiting", "is-leaving");
        void curtain.offsetWidth;

        return new Promise((resolve) => {
            let settled = false;
            let fallbackTimer = 0;
            const finish = () => {
                if (settled) return;
                settled = true;
                window.clearTimeout(fallbackTimer);
                curtain.removeEventListener("animationend", onAnimationEnd);
                curtain.classList.remove("is-leaving");
                curtain.classList.add("is-waiting");
                resolve(curtain);
            };
            const onAnimationEnd = (event) => {
                if (event.target === curtain && event.animationName === "demo-panel-enter") finish();
            };
            curtain.addEventListener("animationend", onAnimationEnd);
            curtain.classList.add("is-leaving");
            fallbackTimer = window.setTimeout(finish, 3200);
        });
    }

    function reveal(curtain, earliestStartAt = 0) {
        const waitForMinimumDuration = new Promise((resolve) => {
            const remaining = Math.max(0, earliestStartAt - Date.now());
            window.setTimeout(resolve, remaining);
        });

        return waitForMinimumDuration.then(() => new Promise((resolve) => {
            let settled = false;
            let fallbackTimer = 0;
            const finish = () => {
                if (settled) return;
                settled = true;
                window.clearTimeout(fallbackTimer);
                curtain.removeEventListener("animationend", onAnimationEnd);
                resolve();
            };
            const onAnimationEnd = (event) => {
                if (event.target === curtain && event.animationName === "demo-panel-exit") finish();
            };
            curtain.addEventListener("animationend", onAnimationEnd);
            curtain.classList.remove("is-waiting", "is-leaving", "is-arriving");
            void curtain.offsetWidth;
            curtain.classList.add("is-arriving");
            fallbackTimer = window.setTimeout(finish, 1200);
        }));
    }

    window.arkasDemoTransition = { cover, reveal };

    function revealViewerFromTransition() {
        const curtain = document.getElementById("demo-transition");
        if (!curtain) return;

        let entry;
        try {
            entry = JSON.parse(sessionStorage.getItem(storageKey) || "null");
            sessionStorage.removeItem(storageKey);
        } catch {
            return;
        }

        const demo = new URLSearchParams(window.location.search).get("demo");
        if (!entry || entry.demo !== demo || Date.now() - entry.startedAt > 60000) return;
        if (reducedMotion) return;

        fillTransition(curtain, demo);
        curtain.classList.add("is-waiting");

        const frame = document.getElementById("template-frame");
        let hasRevealed = false;
        const startReveal = () => {
            if (hasRevealed) return;
            hasRevealed = true;
            window.clearTimeout(fallbackTimer);
            window.arkasDemoTransition.reveal(curtain, entry.startedAt + 3000);
        };
        const fallbackTimer = window.setTimeout(startReveal, 10000);
        if (frame) frame.addEventListener("load", () => {
            startReveal();
        }, { once: true });
    }

    function startDemoTransition(event) {
        if (
            event.defaultPrevented || event.button !== 0 ||
            event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
            !(event.target instanceof Element)
        ) return;

        const link = event.target.closest("a[href]");
        if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;

        let destination;
        try {
            destination = new URL(link.href, window.location.href);
        } catch {
            return;
        }

        if (destination.origin !== window.location.origin || !destination.pathname.endsWith("/plantilla.html")) return;
        const demo = destination.searchParams.get("demo");
        if (!demo || !demoInfo[demo]) return;

        event.preventDefault();
        if (reducedMotion) {
            window.location.assign(destination.href);
            return;
        }

        const source = link.closest(".template-card")?.querySelector(".template-preview") || link;
        const bounds = source.getBoundingClientRect();
        try {
            sessionStorage.setItem(storageKey, JSON.stringify({ demo, startedAt: Date.now() }));
        } catch {
            // The transition still runs when browser storage is unavailable.
        }

        window.arkasDemoTransition.cover(demo, bounds).then(() => {
            window.location.assign(destination.href);
        });
    }

    if (document.body.classList.contains("viewer-page")) {
        document.addEventListener("DOMContentLoaded", revealViewerFromTransition, { once: true });
    } else {
        document.addEventListener("click", startDemoTransition);
        window.addEventListener("pageshow", () => {
            document.getElementById("demo-transition")?.remove();
        });
    }
})();
