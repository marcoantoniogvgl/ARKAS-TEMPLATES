"use strict";

const previews = {
    instituto: {
        title: "Plantilla Instituto",
        src: "demos/instituto_arkas_plantilla/index.html"
    },
    restaurante: {
        title: "Plantilla Restaurante",
        src: "demos/restaurante_arkas_plantilla/index.html"
    },
    merchandising: {
        title: "Plantilla Merchandising",
        src: "demos/merchandising_arkas_plantilla/index.html"
    },
    landing: {
        title: "Plantilla Landing Page",
        src: "demos/landing_page_arkas_plantilla/index.html"
    },
    cv: {
        title: "Currículum de Marco Antonio",
        src: "demos/curriculum_oculto/curriculum_oculto.html"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const key = new URLSearchParams(window.location.search).get("demo");
    const preview = key ? previews[key] : undefined;
    const frame = document.getElementById("template-frame");
    const frameWrap = document.getElementById("viewer-frame-wrap");
    const heading = document.getElementById("viewer-title");
    const error = document.getElementById("viewer-error");

    if (!preview || !frame || !heading || !error) {
        if (frame) frame.hidden = true;
        if (frameWrap) frameWrap.hidden = true;
        if (heading) heading.hidden = true;
        if (error) error.hidden = false;
        document.title = "Vista no encontrada | ARKAS TEMPLATES";
        return;
    }

    heading.textContent = preview.title;
    frame.title = preview.title;
    frame.src = preview.src;
    document.title = `${preview.title} | ARKAS TEMPLATES`;
});
