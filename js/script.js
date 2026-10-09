"use strict";

const menuButton = document.getElementById("menuButton");
const navMenu = document.querySelector(".nav-menu");

if (menuButton && navMenu) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");

    menuButton.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("mobile-active");
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });

    navMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("mobile-active");
            menuButton.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-label", "Abrir menú");
        });
    });
}

const cards = document.querySelectorAll(
    ".template-card, .category-card, .process-step"
);

if ("IntersectionObserver" in window) {
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

    cards.forEach((card) => {
        card.classList.add("animation-hidden");
        observer.observe(card);
    });
} else {
    cards.forEach((card) => card.classList.add("visible"));
}
