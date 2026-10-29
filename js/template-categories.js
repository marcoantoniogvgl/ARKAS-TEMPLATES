"use strict";

(() => {
    const tabs = [...document.querySelectorAll("[data-template-filter]")];
    const grid = document.getElementById("templateGrid");
    const description = document.getElementById("templateCategoryDescription");
    if (!tabs.length || !grid || !description) return;

    const categoryOrder = {
        business: ["preview-merchandising", "preview-restaurante", "preview-gimnasio", "preview-concesionario"],
        education: ["preview-instituto", "preview-cursos-online"],
        portfolios: ["preview-landing", "preview-portfolio"],
        animations: ["preview-fondos-animados"],
        games: ["preview-mini-juegos"]
    };

    const copy = {
        es: {
            labels: ["Negocios físicos y online", "Enseñanza", "Landing pages y portfolios", "Animaciones", "Mini juegos"],
            previews: [
                ["Merchandising", "Restaurante", "Gimnasio", "Concesionario"],
                ["Instituto", "Cursos online"],
                ["Landing page", "Crear mi portfolio"],
                ["Fondos animados"],
                ["Arkas Arcade"]
            ],
            tablistLabel: "Categorías de plantillas",
            descriptions: [
                "Plantillas para comercios, restaurantes, gimnasios y concesionarios.",
                "Diseños para institutos y formación online.",
                "Crea landing pages y presenta tu portfolio profesional.",
                "Fondos animados e interactivos para tus proyectos.",
                "Cuatro minijuegos interactivos para jugar desde el navegador."
            ],
            dealership: ["Automoción", "Concesionario", "Una base en rojo y negro para mostrar vehículos y servicios."],
            courses: ["Enseñanza", "Cursos online", "Una plantilla en blanco para presentar cursos y formación online."],
            comingSoon: "En preparación",
            games: ["Arcade", "Arkas Arcade", "Cuatro minijuegos interactivos para jugar desde el navegador.", "COLECCIÓN", "4 juegos", "Explorar juegos"]
        },
        en: {
            labels: ["Physical & online businesses", "Education", "Landing pages & portfolios", "Animations", "Mini games"],
            previews: [
                ["Merchandising", "Restaurant", "Gym", "Dealership"],
                ["Institute", "Online courses"],
                ["Landing page", "Create my portfolio"],
                ["Animated backgrounds"],
                ["Arkas Arcade"]
            ],
            tablistLabel: "Template categories",
            descriptions: [
                "Website templates for shops, restaurants, gyms, and dealerships.",
                "Designs for institutes and online learning.",
                "Create landing pages and present your professional portfolio.",
                "Animated, interactive backgrounds for your projects.",
                "Four interactive mini games to play in your browser."
            ],
            dealership: ["Automotive", "Dealership", "A blank red and black layout for vehicles and services."],
            courses: ["Education", "Online courses", "A blank template for online courses and training."],
            comingSoon: "Coming soon",
            games: ["Arcade", "Arkas Arcade", "Four interactive mini games to play in your browser.", "COLLECTION", "4 games", "Explore games"]
        },
        de: {
            labels: ["Geschäfte und Online-Shops", "Bildung", "Landingpages und Portfolios", "Animationen", "Minispiele"],
            previews: [
                ["Merchandising", "Restaurant", "Fitnessstudio", "Autohaus"],
                ["Institut", "Online-Kurse"],
                ["Landingpage", "Portfolio erstellen"],
                ["Animierte Hintergründe"],
                ["Arkas Arcade"]
            ],
            tablistLabel: "Vorlagenkategorien",
            descriptions: [
                "Website-Vorlagen für Geschäfte, Restaurants, Fitnessstudios und Autohäuser.",
                "Designs für Institute und Online-Kurse.",
                "Erstelle Landingpages und präsentiere dein professionelles Portfolio.",
                "Animierte, interaktive Hintergründe für deine Projekte.",
                "Vier interaktive Minispiele für deinen Browser."
            ],
            dealership: ["Automobil", "Autohaus", "Eine leere Vorlage in Rot und Schwarz für Fahrzeuge und Services."],
            courses: ["Bildung", "Online-Kurse", "Eine leere Vorlage für Online-Kurse und Weiterbildung."],
            comingSoon: "In Vorbereitung",
            games: ["Arcade", "Arkas Arcade", "Vier interaktive Minispiele für deinen Browser.", "SAMMLUNG", "4 Spiele", "Spiele entdecken"]
        },
        it: {
            labels: ["Attività fisiche e online", "Formazione", "Landing page e portfolio", "Animazioni", "Mini giochi"],
            previews: [
                ["Merchandising", "Ristorante", "Palestra", "Concessionaria"],
                ["Istituto", "Corsi online"],
                ["Landing page", "Crea il mio portfolio"],
                ["Sfondi animati"],
                ["Arkas Arcade"]
            ],
            tablistLabel: "Categorie di template",
            descriptions: [
                "Template per negozi, ristoranti, palestre e concessionarie.",
                "Design per istituti e corsi online.",
                "Crea landing page e presenta il tuo portfolio professionale.",
                "Sfondi animati e interattivi per i tuoi progetti.",
                "Quattro mini giochi interattivi da provare nel browser."
            ],
            dealership: ["Automotive", "Concessionaria", "Una base vuota in rosso e nero per presentare veicoli e servizi."],
            courses: ["Formazione", "Corsi online", "Un template vuoto per presentare corsi e formazione online."],
            comingSoon: "In preparazione",
            games: ["Arcade", "Arkas Arcade", "Quattro mini giochi interattivi da provare nel browser.", "RACCOLTA", "4 giochi", "Esplora i giochi"]
        },
        fr: {
            labels: ["Commerces physiques et en ligne", "Enseignement", "Pages d’accueil et portfolios", "Animations", "Mini-jeux"],
            previews: [
                ["Produits dérivés", "Restaurant", "Salle de sport", "Concessionnaire"],
                ["Institut", "Cours en ligne"],
                ["Page d’accueil", "Créer mon portfolio"],
                ["Arrière-plans animés"],
                ["Arkas Arcade"]
            ],
            tablistLabel: "Catégories de modèles",
            descriptions: [
                "Modèles pour commerces, restaurants, salles de sport et concessionnaires.",
                "Des designs pour les établissements et les cours en ligne.",
                "Créez des pages d’accueil et présentez votre portfolio professionnel.",
                "Des arrière-plans animés et interactifs pour vos projets.",
                "Quatre mini-jeux interactifs à découvrir dans votre navigateur."
            ],
            dealership: ["Automobile", "Concessionnaire", "Une base vierge rouge et noire pour présenter véhicules et services."],
            courses: ["Enseignement", "Cours en ligne", "Un modèle vierge pour présenter des cours et formations en ligne."],
            comingSoon: "En préparation",
            games: ["Arcade", "Arkas Arcade", "Quatre mini-jeux interactifs à découvrir dans votre navigateur.", "COLLECTION", "4 jeux", "Explorer les jeux"]
        },
        hi: {
            labels: ["ऑफ़लाइन और ऑनलाइन व्यवसाय", "शिक्षा", "लैंडिंग पेज और पोर्टफोलियो", "एनिमेशन", "मिनी गेम"],
            previews: [
                ["मर्चेंडाइज़", "रेस्तरां", "जिम", "कार डीलरशिप"],
                ["संस्थान", "ऑनलाइन पाठ्यक्रम"],
                ["लैंडिंग पेज", "मेरा पोर्टफोलियो बनाएं"],
                ["एनिमेटेड बैकग्राउंड"],
                ["Arkas Arcade"]
            ],
            tablistLabel: "टेम्पलेट श्रेणियां",
            descriptions: [
                "दुकानों, रेस्तरां, जिम और कार डीलरशिप के लिए वेबसाइट टेम्पलेट।",
                "संस्थानों और ऑनलाइन पाठ्यक्रमों के लिए डिज़ाइन।",
                "लैंडिंग पेज बनाएं और अपना पेशेवर पोर्टफोलियो दिखाएं।",
                "आपकी परियोजनाओं के लिए एनिमेटेड और इंटरैक्टिव बैकग्राउंड।",
                "ब्राउज़र में खेलने के लिए चार इंटरैक्टिव मिनी गेम।"
            ],
            dealership: ["ऑटोमोबाइल", "कार डीलरशिप", "वाहनों और सेवाओं के लिए लाल और काले रंग का खाली डिज़ाइन।"],
            courses: ["शिक्षा", "ऑनलाइन पाठ्यक्रम", "ऑनलाइन पाठ्यक्रम और प्रशिक्षण के लिए खाली टेम्पलेट।"],
            comingSoon: "जल्द आ रहा है",
            games: ["आर्केड", "Arkas Arcade", "ब्राउज़र में खेलने के लिए चार इंटरैक्टिव मिनी गेम।", "संग्रह", "4 गेम", "गेम देखें"]
        }
    };

    const templates = new Map(
        [...grid.querySelectorAll(":scope > [data-template-category]")].map((element) => [element.id, element])
    );
    const orderedIds = Object.values(categoryOrder).flat();

    orderedIds.forEach((id) => {
        const number = templates.get(id)?.querySelector(".template-number");
        if (number) {
            const group = Object.values(categoryOrder).find((ids) => ids.includes(id));
            number.textContent = String(group.indexOf(id) + 1).padStart(2, "0");
        }
    });

    function currentCopy() {
        const language = window.arkasI18n?.language || document.documentElement.lang || "es";
        return copy[language] || copy.es;
    }

    function updateLanguage() {
        const languageCopy = currentCopy();
        document.querySelector(".template-category-selector")?.setAttribute("aria-label", languageCopy.tablistLabel);
        tabs.forEach((tab, index) => {
            tab.querySelector(".template-category-name").textContent = languageCopy.labels[index] || copy.es.labels[index];
            const options = tab.parentElement.querySelectorAll(".template-category-option");
            options.forEach((option) => {
                const optionIndex = Number(option.dataset.categoryOptionIndex);
                option.textContent = languageCopy.previews[index]?.[optionIndex] || copy.es.previews[index][optionIndex];
            });
        });

        const localizedCardText = [
            ["#preview-concesionario [data-i18n='categoryDealership']", languageCopy.dealership[0]],
            ["#preview-concesionario [data-i18n='templateDealership']", languageCopy.dealership[1]],
            ["#preview-concesionario [data-i18n='descriptionDealership']", languageCopy.dealership[2]],
            ["#preview-cursos-online [data-i18n='categoryTeaching']", languageCopy.courses[0]],
            ["#preview-cursos-online [data-i18n='templateOnlineCourses']", languageCopy.courses[1]],
            ["#preview-cursos-online [data-i18n='descriptionOnlineCourses']", languageCopy.courses[2]]
        ];
        localizedCardText.forEach(([selector, text]) => {
            const element = document.querySelector(selector);
            if (element) element.textContent = text;
        });
        document.querySelectorAll("#preview-concesionario .template-includes strong, #preview-cursos-online .template-includes strong")
            .forEach((element) => { element.textContent = languageCopy.comingSoon; });

        const gameCard = document.getElementById("preview-mini-juegos");
        if (gameCard) {
            const gameFields = [
                [".preview-category", languageCopy.games[0]],
                [".template-details h3", languageCopy.games[1]],
                [".template-details p", languageCopy.games[2]],
                [".template-includes span", languageCopy.games[3]],
                [".template-includes strong", languageCopy.games[4]],
                [".template-actions .demo-link span", languageCopy.games[5]]
            ];
            gameFields.forEach(([selector, text]) => {
                const element = gameCard.querySelector(selector);
                if (element) element.textContent = text;
            });
        }

        const selectedIndex = tabs.findIndex((tab) => tab.getAttribute("aria-expanded") === "true");
        const activeIndex = Math.max(selectedIndex, 0);
        description.textContent = languageCopy.descriptions[activeIndex] || copy.es.descriptions[activeIndex];

    }

    function selectCategory(category, force = false) {
        const selectedTab = tabs.find((tab) => tab.dataset.templateFilter === category);
        if (!selectedTab) return;
        if (!force && selectedTab.getAttribute("aria-expanded") === "true") return;

        tabs.forEach((tab) => {
            const isSelected = tab === selectedTab;
            tab.classList.toggle("active", isSelected);
            tab.setAttribute("aria-expanded", String(isSelected));
            tab.parentElement.classList.toggle("active", isSelected);
        });

        const visibleIds = categoryOrder[category] || [];
        orderedIds.forEach((id) => {
            const template = templates.get(id);
            if (template) template.hidden = !visibleIds.includes(id);
        });

        visibleIds.forEach((id) => {
            const template = templates.get(id);
            if (!template) return;
            grid.append(template);
            template.classList.remove("category-card-entering");
            void template.offsetWidth;
            template.classList.add("category-card-entering");
            template.addEventListener("animationend", () => template.classList.remove("category-card-entering"), { once: true });
        });

        updateLanguage();
    }

    tabs.forEach((tab) => {
        tab.addEventListener("click", (event) => {
            selectCategory(tab.dataset.templateFilter);
            const bounds = tab.getBoundingClientRect();
            const ripple = document.createElement("span");
            ripple.className = "template-category-ripple";
            ripple.setAttribute("aria-hidden", "true");
            ripple.style.left = `${(event.detail ? event.clientX : bounds.left + bounds.width / 2) - bounds.left}px`;
            ripple.style.top = `${(event.detail ? event.clientY : bounds.top + bounds.height / 2) - bounds.top}px`;
            tab.append(ripple);
            ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
        });
        tab.addEventListener("pointerenter", (event) => {
            if (event.pointerType === "mouse") selectCategory(tab.dataset.templateFilter);
        });
        tab.addEventListener("focus", () => selectCategory(tab.dataset.templateFilter));
    });

    document.querySelectorAll(".template-category-option").forEach((option) => {
        option.addEventListener("click", () => {
            const group = option.closest(".template-category-group");
            const categoryTab = group?.querySelector("[data-template-filter]");
            const target = document.getElementById(option.dataset.templateTarget);
            if (!categoryTab || !target) return;

            selectCategory(categoryTab.dataset.templateFilter);
            const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" });
        });
    });

    window.addEventListener("arkas-language-change", updateLanguage);
    selectCategory(tabs.find((tab) => tab.classList.contains("active"))?.dataset.templateFilter || "business", true);
})();
