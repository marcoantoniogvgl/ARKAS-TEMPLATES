"use strict";

const previews = {
    instituto: {
        title: { es: "Plantilla Instituto", en: "Institute Template", de: "Institut-Vorlage", it: "Template Istituto", fr: "Modèle Institut", hi: "संस्थान टेम्पलेट" },
        accent: "#5da5ff",
        src: "demos/instituto_arkas_plantilla/index.html"
    },
    restaurante: {
        title: { es: "Plantilla Restaurante", en: "Restaurant Template", de: "Restaurant-Vorlage", it: "Template Ristorante", fr: "Modèle Restaurant", hi: "रेस्तरां टेम्पलेट" },
        accent: "#e6a85c",
        src: "demos/restaurante_arkas_plantilla/index.html"
    },
    merchandising: {
        title: { es: "Plantilla Merchandising", en: "Merchandising Template", de: "Merchandising-Vorlage", it: "Template Merchandising", fr: "Modèle Produits dérivés", hi: "मर्चेंडाइज़ टेम्पलेट" },
        accent: "#d6ae54",
        src: "demos/merchandising_arkas_plantilla/index.html"
    },
    landing: {
        title: { es: "Plantilla Landing Page", en: "Landing Page Template", de: "Landingpage-Vorlage", it: "Template Landing Page", fr: "Modèle Page d’atterrissage", hi: "लैंडिंग पेज टेम्पलेट" },
        accent: "#9b7bff",
        src: "demos/landing_page_arkas_plantilla/index.html"
    },
    gimnasio: {
        title: { es: "Plantilla Gimnasio Templo Coba", en: "Templo Coba Gym Template", de: "Fitnessstudio-Vorlage Templo Coba", it: "Template Palestra Templo Coba", fr: "Modèle Salle de sport Templo Coba", hi: "Templo Coba जिम टेम्पलेट" },
        accent: "#ff704d",
        src: "demos/TemploCoba/index.html"
    },
    "fondos-animados": {
        title: { es: "Fondos Animados Interactivos", en: "Interactive Animated Backgrounds", de: "Interaktive animierte Hintergründe", it: "Sfondi animati interattivi", fr: "Arrière-plans animés interactifs", hi: "इंटरैक्टिव एनिमेटेड बैकग्राउंड" },
        accent: "#21d6c2",
        src: "demos/animated_backgrounds/index.html"
    },
    cv: {
        title: { es: "Currículum de Marco Antonio", en: "Marco Antonio's Resume", de: "Lebenslauf von Marco Antonio", it: "CV di Marco Antonio", fr: "CV de Marco Antonio", hi: "Marco Antonio का रिज़्यूमे" },
        accent: "#36c98b",
        src: "demos/curriculum_oculto/curriculum_oculto.html"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const keys = Object.keys(previews);
    let currentKey = params.get("demo");
    const viewerMain = document.getElementById("viewer-main");
    const frame = document.getElementById("template-frame");
    const frameWrap = document.getElementById("viewer-frame-wrap");
    const heading = document.getElementById("viewer-title");
    const error = document.getElementById("viewer-error");
    const position = document.getElementById("demo-position");
    const previousButton = document.getElementById("previous-demo");
    const nextButton = document.getElementById("next-demo");
    const fullscreenButton = document.getElementById("fullscreen-button");
    const fullscreenLabel = fullscreenButton?.querySelector("[data-i18n]");
    const status = document.getElementById("viewer-status");

    if (!currentKey || !previews[currentKey] || !viewerMain || !frame || !frameWrap || !heading || !error) {
        if (frame) frame.hidden = true;
        if (frameWrap) frameWrap.hidden = true;
        if (heading) heading.hidden = true;
        if (previousButton) previousButton.hidden = true;
        if (nextButton) nextButton.hidden = true;
        if (fullscreenButton) fullscreenButton.hidden = true;
        if (position) position.hidden = true;
        error.hidden = false;
        const missingLabel = window.arkasI18n?.translate(
            "previewNotFound",
            document.documentElement.lang === "en" ? "Preview not found" : "Vista no encontrada"
        );
        document.title = `${missingLabel} | ARKAS TEMPLATES`;
        return;
    }

    function currentLanguage() {
        return window.arkasI18n?.language || "es";
    }

    const fullscreenErrors = {
        es: { close: "No se pudo cerrar la pantalla completa.", open: "No se pudo abrir la pantalla completa. Comprueba los permisos del navegador." },
        en: { close: "Fullscreen mode could not be closed.", open: "Fullscreen mode could not be opened. Check your browser permissions." },
        de: { close: "Der Vollbildmodus konnte nicht geschlossen werden.", open: "Der Vollbildmodus konnte nicht geöffnet werden. Prüfe die Browserberechtigungen." },
        it: { close: "Non è stato possibile chiudere la modalità a schermo intero.", open: "Non è stato possibile attivare lo schermo intero. Controlla le autorizzazioni del browser." },
        fr: { close: "Impossible de quitter le mode plein écran.", open: "Impossible d’activer le plein écran. Vérifiez les autorisations du navigateur." },
        hi: { close: "पूर्ण स्क्रीन मोड बंद नहीं हो सका।", open: "पूर्ण स्क्रीन मोड शुरू नहीं हो सका। ब्राउज़र की अनुमतियां जांचें।" }
    };

    function updatePreviewDetails(key, updateUrl = true) {
        currentKey = key;
        const preview = previews[key];
        const language = currentLanguage();
        const index = keys.indexOf(key);
        heading.textContent = preview.title[language] || preview.title.es;
        frame.title = preview.title[language] || preview.title.es;
        position.textContent = `${index + 1} / ${keys.length}`;
        document.title = `${preview.title[language] || preview.title.es} | ARKAS TEMPLATES`;
        if (updateUrl) {
            params.set("demo", key);
            try {
                history.replaceState(null, "", `${window.location.pathname}?${params.toString()}${window.location.hash}`);
            } catch {
                window.location.search = `?demo=${encodeURIComponent(key)}`;
            }
        }
    }

    function showPreview(key, updateUrl = true) {
        updatePreviewDetails(key, updateUrl);
        frame.src = previews[key].src;
    }

    function updateFullscreenButton() {
        const isFullscreen = document.fullscreenElement === viewerMain;
        const labelKey = isFullscreen ? "exitFullscreen" : "fullscreen";
        const fallback = isFullscreen ? "Salir de pantalla completa" : "Ver demo en pantalla completa";
        const label = window.arkasI18n?.translate(labelKey, fallback) || fallback;
        fullscreenButton?.setAttribute("aria-label", label);
        if (fullscreenLabel) {
            const buttonText = window.arkasI18n?.translate(
                isFullscreen ? "exitFullscreen" : "fullscreenButton",
                isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
            );
            fullscreenLabel.textContent = buttonText;
        }
    }

    let isSwitching = false;
    let switchToken = 0;

    function movePreview(direction) {
        if (isSwitching) return;
        const index = keys.indexOf(currentKey);
        const nextIndex = (index + direction + keys.length) % keys.length;
        const nextKey = keys[nextIndex];
        const nextPreview = previews[nextKey];

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            showPreview(nextKey);
            return;
        }

        const transition = window.arkasDemoTransition;
        if (!transition?.cover || !transition?.reveal) {
            showPreview(nextKey);
            return;
        }

        isSwitching = true;
        const token = ++switchToken;
        const controls = [previousButton, nextButton].filter(Boolean);
        controls.forEach((button) => { button.disabled = true; });
        frameWrap.setAttribute("aria-busy", "true");
        const transitionStartedAt = Date.now();

        const finishSwitch = () => {
            if (token !== switchToken) return;
            frameWrap.removeAttribute("aria-busy");
            controls.forEach((button) => { button.disabled = false; });
            isSwitching = false;
        };

        const sourceBounds = frameWrap.getBoundingClientRect();
        transition.cover(nextKey, sourceBounds).then((curtain) => {
            if (token !== switchToken) return;

            updatePreviewDetails(nextKey);
            let hasRevealed = false;
            let fallbackTimer = 0;
            const revealNewPreview = () => {
                if (token !== switchToken || hasRevealed) return;
                hasRevealed = true;
                window.clearTimeout(fallbackTimer);
                transition.reveal(curtain, transitionStartedAt + 3000).then(finishSwitch);
            };

            frame.addEventListener("load", revealNewPreview, { once: true });
            fallbackTimer = window.setTimeout(revealNewPreview, 10000);
            frame.src = nextPreview.src;
        }).catch(() => {
            if (token !== switchToken) return;
            showPreview(nextKey);
            finishSwitch();
        });
    }

    previousButton?.addEventListener("click", () => movePreview(-1));
    nextButton?.addEventListener("click", () => movePreview(1));

    document.addEventListener("keydown", (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
            return;
        }

        if (event.key === "ArrowLeft") movePreview(-1);
        if (event.key === "ArrowRight") movePreview(1);
    });

    fullscreenButton?.addEventListener("click", async () => {
        if (document.fullscreenElement) {
            try {
                await document.exitFullscreen();
                status.textContent = "";
                updateFullscreenButton();
            } catch {
                status.textContent = (fullscreenErrors[currentLanguage()] || fullscreenErrors.es).close;
            }
            return;
        }

        try {
            await viewerMain.requestFullscreen();
            status.textContent = "";
            updateFullscreenButton();
        } catch {
            status.textContent = (fullscreenErrors[currentLanguage()] || fullscreenErrors.es).open;
        }
    });

    document.addEventListener("fullscreenchange", () => {
        status.textContent = "";
        updateFullscreenButton();
    });

    window.addEventListener("arkas-language-change", () => {
        const title = previews[currentKey].title[currentLanguage()] || previews[currentKey].title.es;
        heading.textContent = title;
        frame.title = title;
        document.title = `${title} | ARKAS TEMPLATES`;
        updateFullscreenButton();
    });

    showPreview(currentKey, false);
    updateFullscreenButton();
});
