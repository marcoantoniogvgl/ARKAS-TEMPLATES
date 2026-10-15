"use strict";

const menuButton = document.getElementById("menuButton");
const navMenu = document.querySelector(".nav-menu");

function updateMenuLabel(isOpen) {
    const language = window.arkasI18n?.language || "es";
    const labels = {
        es: ["Abrir menú", "Cerrar menú"],
        en: ["Open menu", "Close menu"],
        de: ["Menü öffnen", "Menü schließen"],
        it: ["Apri menu", "Chiudi menu"],
        fr: ["Ouvrir le menu", "Fermer le menu"],
        hi: ["मेन्यू खोलें", "मेन्यू बंद करें"]
    };
    const label = labels[language] || labels.es;
    menuButton?.setAttribute("aria-expanded", String(isOpen));
    menuButton?.setAttribute("aria-label", label[isOpen ? 1 : 0]);
}

if (menuButton && navMenu) {
    updateMenuLabel(false);

    menuButton.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("mobile-active");
        updateMenuLabel(isOpen);
    });

    navMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("mobile-active");
            updateMenuLabel(false);
        });
    });

    window.addEventListener("arkas-language-change", () => {
        updateMenuLabel(navMenu.classList.contains("mobile-active"));
    });
}

const revealItems = document.querySelectorAll(
    ".hero-content, .hero-visual, .section-header, .template-card, " +
    ".category-card, .process-intro, .process-step, .about-symbol, " +
    ".about-content, .cta, .footer-main > *, .footer-bottom"
);

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach((item) => item.classList.add("visible"));
} else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    const siblingIndexes = new Map();
    revealItems.forEach((item) => {
        const parent = item.parentElement;
        const index = siblingIndexes.get(parent) || 0;
        siblingIndexes.set(parent, index + 1);
        item.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 90}ms`);
        item.classList.add("animation-hidden");
        observer.observe(item);
    });
} else {
    revealItems.forEach((item) => item.classList.add("visible"));
}
