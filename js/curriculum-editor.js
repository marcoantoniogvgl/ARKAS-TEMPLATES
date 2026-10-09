"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("cv-form");
    const preview = document.getElementById("cv-preview");
    const downloadButton = document.getElementById("download-cv");
    const printButton = document.getElementById("print-cv");
    const status = document.getElementById("cv-status");

    if (!form || !preview || !downloadButton || !printButton || !status) return;

    let previewReady = false;

    function getDocument() {
        try {
            return preview.contentDocument;
        } catch (error) {
            console.error("No se pudo acceder a la plantilla de currículum.", error);
            status.textContent = "No se pudo cargar la plantilla. Recarga la página e inténtalo de nuevo.";
            return null;
        }
    }

    function readField(name) {
        return form.elements.namedItem(name).value.trim();
    }

    function parseRows(value, expectedColumns) {
        return value.split(/\r?\n/)
            .map((line) => line.split("|").map((part) => part.trim()))
            .filter((columns) => columns.some(Boolean))
            .map((columns) => Array.from({ length: expectedColumns }, (_, index) => columns[index] || ""));
    }

    function createElement(doc, tagName, className, text) {
        const element = doc.createElement(tagName);
        if (className) element.className = className;
        if (text) element.textContent = text;
        return element;
    }

    function setText(doc, selector, value) {
        const element = doc.querySelector(selector);
        if (!element) return;
        element.textContent = value;
        element.hidden = !value;
        const wrapper = element.closest("[data-cv-optional]");
        if (wrapper) wrapper.hidden = !value;
    }

    function setListSectionVisibility(container, hasItems) {
        const section = container.closest("section");
        if (section) section.hidden = !hasItems;
    }

    function renderProfile(doc, value) {
        const container = doc.querySelector('[data-cv-list="profile"]');
        if (!container) return;
        container.replaceChildren();
        const paragraphs = value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
        if (paragraphs.length === 0 && value.trim()) paragraphs.push(value.trim());
        paragraphs.forEach((paragraph) => container.appendChild(createElement(doc, "p", "", paragraph)));
    }

    function renderCompetencies(doc, value) {
        const container = doc.querySelector('[data-cv-list="competencies"]');
        if (!container) return;
        const rows = parseRows(value, 3);
        container.replaceChildren();
        rows.forEach(([title, description, example], index) => {
            if (!title && !description && !example) return;
            const card = createElement(doc, "article", "competencia");
            card.appendChild(createElement(doc, "div", "icono", String(index + 1).padStart(2, "0")));
            card.appendChild(createElement(doc, "h3", "", title || "Competencia"));
            if (description) card.appendChild(createElement(doc, "p", "", description));
            if (example) {
                const exampleBox = createElement(doc, "div", "ejemplo");
                exampleBox.appendChild(createElement(doc, "strong", "", "Ejemplo: "));
                exampleBox.append(doc.createTextNode(example));
                card.appendChild(exampleBox);
            }
            container.appendChild(card);
        });
        setListSectionVisibility(container, container.childElementCount > 0);
    }

    function renderExperiences(doc, value) {
        const container = doc.querySelector('[data-cv-list="experiences"]');
        if (!container) return;
        const rows = parseRows(value, 4);
        container.replaceChildren();
        rows.forEach(([period, title, description, competencies]) => {
            if (!period && !title && !description && !competencies) return;
            const event = createElement(doc, "article", "evento");
            if (period) event.appendChild(createElement(doc, "div", "fecha", period));
            if (title) event.appendChild(createElement(doc, "h3", "", title));
            if (description) event.appendChild(createElement(doc, "p", "", description));
            if (competencies) {
                const example = createElement(doc, "div", "ejemplo");
                example.appendChild(createElement(doc, "strong", "", "Competencias: "));
                example.append(doc.createTextNode(competencies));
                event.appendChild(example);
            }
            container.appendChild(event);
        });
        setListSectionVisibility(container, container.childElementCount > 0);
    }

    function renderProjects(doc, value) {
        const container = doc.querySelector('[data-cv-list="projects"]');
        if (!container) return;
        const rows = parseRows(value, 3);
        container.replaceChildren();
        rows.forEach(([title, description, technologies]) => {
            if (!title && !description && !technologies) return;
            const project = createElement(doc, "article", "proyecto");
            if (title) project.appendChild(createElement(doc, "h3", "", title));
            if (description) project.appendChild(createElement(doc, "p", "", description));
            if (technologies) {
                const tags = createElement(doc, "div", "tecnologias");
                technologies.split(",").map((technology) => technology.trim()).filter(Boolean)
                    .forEach((technology) => tags.appendChild(createElement(doc, "span", "", technology)));
                if (tags.childElementCount) project.appendChild(tags);
            }
            container.appendChild(project);
        });
        setListSectionVisibility(container, container.childElementCount > 0);
    }

    function renderSkills(doc, value) {
        const container = doc.querySelector('[data-cv-list="skills"]');
        if (!container) return;
        const rows = parseRows(value, 2).filter(([name]) => name);
        container.replaceChildren();
        const columns = [createElement(doc, "div"), createElement(doc, "div")];

        rows.forEach(([name, rawLevel], index) => {
            const skill = createElement(doc, "div", "habilidad");
            const info = createElement(doc, "div", "habilidad-info");
            info.appendChild(createElement(doc, "span", "", name));
            const hasLevel = rawLevel !== "" && Number.isFinite(Number(rawLevel));
            const level = hasLevel ? Math.max(0, Math.min(100, Number(rawLevel))) : null;
            if (level !== null) info.appendChild(createElement(doc, "span", "", `${level}%`));
            skill.appendChild(info);
            if (level !== null) {
                const bar = createElement(doc, "div", "barra");
                const progress = createElement(doc, "div", "progreso");
                progress.style.width = `${level}%`;
                bar.appendChild(progress);
                skill.appendChild(bar);
            }
            columns[index % 2].appendChild(skill);
        });

        columns.forEach((column) => {
            if (column.childElementCount) container.appendChild(column);
        });
        setListSectionVisibility(container, rows.length > 0);
    }

    function renderLearning(doc, value) {
        const container = doc.querySelector('[data-cv-list="learning"]');
        if (!container) return;
        const rows = parseRows(value, 3);
        container.replaceChildren();
        rows.forEach((columns) => {
            if (columns.every((column) => !column)) return;
            const row = doc.createElement("tr");
            columns.forEach((text) => row.appendChild(createElement(doc, "td", "", text)));
            container.appendChild(row);
        });
        const wrapper = container.closest("[data-cv-section]");
        const section = wrapper && wrapper.closest("section");
        if (section) section.hidden = container.childElementCount === 0;
    }

    function renderContributions(doc, value) {
        const container = doc.querySelector('[data-cv-list="contributions"]');
        if (!container) return;
        const rows = parseRows(value, 2);
        container.replaceChildren();
        rows.forEach(([title, description]) => {
            if (!title && !description) return;
            const contribution = createElement(doc, "div", "aporte");
            if (title) contribution.appendChild(createElement(doc, "strong", "", title));
            if (description) contribution.appendChild(createElement(doc, "p", "", description));
            container.appendChild(contribution);
        });
        setListSectionVisibility(container, container.childElementCount > 0);
    }

    function updatePreview() {
        const doc = getDocument();
        if (!doc || !previewReady) return;

        const fullName = readField("name");
        const headline = readField("headline");
        const availability = readField("availability");

        setText(doc, '[data-cv="name"]', fullName);
        setText(doc, '[data-cv="headline"]', headline);
        setText(doc, '[data-cv="contact"]', readField("contact"));
        setText(doc, '[data-cv="availability"]', availability);
        setText(doc, '[data-cv="objective"]', readField("objective"));
        setText(doc, '[data-cv="target"]', readField("target"));
        setText(doc, '[data-cv="footer-name"]', fullName);
        setText(doc, '[data-cv="footer-headline"]', headline);

        const contactLine = doc.querySelector('[data-cv="contact"]');
        const footer = doc.querySelector("[data-cv-footer]");
        if (footer) footer.hidden = !fullName && !headline;
        if (contactLine) contactLine.hidden = !readField("contact");

        const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("es");
        setText(doc, '[data-cv="initials"]', initials);

        renderProfile(doc, readField("profile"));
        const profileSection = doc.querySelector("#objetivo");
        if (profileSection) {
            profileSection.hidden = !readField("profile") && !readField("objective") && !readField("target");
        }
        renderCompetencies(doc, readField("competencies"));
        renderExperiences(doc, readField("experiences"));
        renderProjects(doc, readField("projects"));
        renderSkills(doc, readField("skills"));
        renderLearning(doc, readField("learning"));
        renderContributions(doc, readField("contributions"));

        const sectionNavigation = doc.querySelector("nav");
        if (sectionNavigation) {
            sectionNavigation.querySelectorAll('a[href^="#"]').forEach((link) => {
                const section = doc.getElementById(link.hash.slice(1));
                link.hidden = !section || section.hidden;
            });
            sectionNavigation.hidden = !Array.from(sectionNavigation.querySelectorAll("a")).some((link) => !link.hidden);
        }

        doc.title = fullName ? `Currículum de ${fullName}` : "Plantilla de currículum editable";
        downloadButton.disabled = !fullName || !headline;
        printButton.disabled = !fullName || !headline;
        status.textContent = fullName && headline
            ? "Vista previa actualizada. Tus datos permanecen en este navegador."
            : "Añade tu nombre y tu profesión para habilitar la descarga.";
    }

    preview.addEventListener("load", () => {
        previewReady = true;
        updatePreview();
    });
    form.addEventListener("input", updatePreview);

    downloadButton.addEventListener("click", () => {
        if (!form.reportValidity()) return;
        const doc = getDocument();
        if (!doc || !previewReady) {
            status.textContent = "La vista previa aún se está cargando. Inténtalo de nuevo en unos segundos.";
            return;
        }

        const html = `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
        const documentBlob = new Blob([html], { type: "application/msword;charset=utf-8" });
        const downloadUrl = URL.createObjectURL(documentBlob);
        const link = document.createElement("a");
        const safeName = readField("name")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .toLowerCase() || "curriculum";
        link.href = downloadUrl;
        link.download = `curriculum-${safeName}.doc`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        status.textContent = "Documento descargado. Puedes abrirlo y editarlo en Word o una aplicación compatible.";
    });

    printButton.addEventListener("click", () => {
        if (!form.reportValidity()) return;
        const frameWindow = preview.contentWindow;
        if (!frameWindow || !previewReady) {
            status.textContent = "La vista previa aún se está cargando. Inténtalo de nuevo en unos segundos.";
            return;
        }
        frameWindow.focus();
        frameWindow.print();
    });

    if (preview.contentDocument && preview.contentDocument.readyState === "complete") {
        previewReady = true;
        updatePreview();
    }
});
