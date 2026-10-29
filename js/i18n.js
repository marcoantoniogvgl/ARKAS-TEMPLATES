"use strict";

(() => {
    const translations = {
        es: { selectLanguage: "Seleccionar idioma" },
        en: {
            selectLanguage: "Choose language",
            navTemplates: "Templates",
            navCategories: "Categories",
            navProcess: "How it works",
            navAbout: "About ARKAS",
            navAboutMe: "About me",
            navExplore: "Explore",
            heroTitleFirst: "Build a website",
            heroTitleSecond: "that stands out",
            heroDescription: "Professional website templates, designed and built to give your project a strong foundation.",
            heroExplore: "Explore templates",
            heroHow: "How it works",
            statTemplates: "Templates",
            statCustomizable: "Customizable",
            statPossibilities: "Possibilities",
            collectionLabel: "THE ARKAS COLLECTION",
            featuredTemplates: "Featured templates",
            collectionDescription: "Ready-made designs for your next website.",
            categoryEducation: "Education",
            templateInstitute: "Institute",
            descriptionInstitute: "Professional education website.",
            categoryRestaurant: "Restaurant",
            templateRestaurant: "Restaurant",
            descriptionRestaurant: "A modern website for food businesses.",
            categoryMerchandising: "Merchandising",
            templateMerchandising: "Merchandising",
            descriptionMerchandising: "An online store for brands and artists.",
            categoryLanding: "Landing page",
            templateLanding: "Landing Page",
            descriptionLanding: "A landing page focused on conversions.",
            categoryGym: "Gym",
            templateGym: "Templo Coba",
            descriptionGym: "A complete website for a sports center.",
            categoryBackgrounds: "Animated backgrounds",
            templateBackgrounds: "Animated backgrounds",
            descriptionBackgrounds: "Interactive visual effects to bring websites to life.",
            includes: "Includes",
            includesGym: "6 classes",
            includesBackgrounds: "12 effects",
            viewDemo: "View demo",
            requestTemplate: "Request this template",
            categoriesLabel: "EXPLORE",
            categoriesTitle: "Find your style.",
            categoryEducationTitle: "Education",
            categoryEducationDescription: "Websites for schools, academies, and educational projects.",
            categoryRestaurantTitle: "Restaurants",
            categoryRestaurantDescription: "Designs for restaurants, cafés, and food businesses.",
            categoryMerchandisingTitle: "Merchandising",
            categoryMerchandisingDescription: "Online stores for artists, brands, and products.",
            categoryLandingTitle: "Landing pages",
            categoryLandingDescription: "Pages designed to introduce and convert.",
            categoryGymTitle: "Gyms",
            categoryGymDescription: "Websites for gyms, sports centers, and trainers.",
            categoryBackgroundsTitle: "Animated backgrounds",
            categoryBackgroundsDescription: "Interactive visual effects to bring your website to life.",
            processLabel: "HOW IT WORKS",
            processTitleFirst: "Choose.",
            processTitleSecond: "Customize.",
            processTitleThird: "Publish.",
            processDescription: "You don't have to start from scratch. Choose a professional foundation and make it your own.",
            processChoose: "Choose",
            processChooseDescription: "Find the right template for your project.",
            processBuy: "Purchase",
            processBuyDescription: "Get all the files included with the template.",
            processCustomize: "Customize",
            processCustomizeDescription: "Change text, images, colors, and content.",
            processPublish: "Publish",
            processPublishDescription: "Launch your website and take your project to the next level.",
            aboutLabel: "ABOUT ARKAS",
            aboutTitleFirst: "Designed to",
            aboutTitleSecond: "create.",
            aboutDescription: "ARKAS TEMPLATES began with a simple idea: create professional website templates that give every project a solid foundation.",
            aboutDescriptionSecondary: "Each design combines aesthetics, functionality, responsive design, and easy customization.",
            aboutExplore: "Explore the templates",
            aboutMeLabel: "ABOUT ME",
            aboutMeTitleFirst: "Hi, I'm",
            aboutMeTitleSecond: "Marco.",
            aboutMeDescription: "I'm studying Web Application Development and looking for an internship where I can contribute and keep learning through real-world projects.",
            aboutMeDescriptionSecondary: "I'm especially interested in frontend development, while continuing to grow my backend skills. I enjoy self-learning, solving problems, and creating clear, easy-to-use interfaces.",
            aboutResume: "See my hidden resume",
            aboutGift: "Get my template for free",
            ctaLabel: "ARKAS TEMPLATES",
            ctaTitleFirst: "Your project.",
            ctaTitleSecond: "Your identity.",
            ctaDescription: "Start with a professional template.",
            footerDescription: "Professional website templates designed for digital projects.",
            footerProduct: "PRODUCT",
            footerArkas: "ARKAS",
            footerAbout: "About us",
            footerResume: "View resume",
            footerContact: "Contact",
            footerLicenses: "Ask about licenses",
            copyright: "© 2026 ARKAS TEMPLATES",
            credits: "Designed & Developed by ARKAS",
            previewInstitute: "View the Institute template demo",
            previewRestaurant: "View the Restaurant template demo",
            previewMerchandising: "View the Merchandising template demo",
            previewLanding: "View the Landing Page template demo",
            previewGym: "View the Templo Coba template demo",
            previewBackgrounds: "View the Animated Backgrounds demo",
            openMenu: "Open menu",
            closeMenu: "Close menu",
            homeLabel: "ARKAS TEMPLATES, home page",
            viewerLabel: "Preview inside ARKAS TEMPLATES",
            backToTemplates: "← Back to templates",
            previousDemo: "Previous demo",
            nextDemo: "Next demo",
            fullscreen: "View demo fullscreen",
            fullscreenButton: "Fullscreen",
            exitFullscreen: "Exit fullscreen",
            previewNotFound: "We couldn't find this preview",
            previewNotFoundDescription: "Return to the collection to choose another template.",
            viewTemplates: "View templates"
        },
        de: {
            selectLanguage: "Sprache auswählen",
            navTemplates: "Vorlagen", navProcess: "So funktioniert es", navAbout: "Über ARKAS", navAboutMe: "Über mich", navExplore: "Entdecken",
            heroTitleFirst: "Erstelle eine Website", heroTitleSecond: "die heraussticht", heroDescription: "Professionelle Website-Vorlagen, gestaltet und entwickelt, damit dein Projekt ein solides Fundament erhält.", heroExplore: "Vorlagen entdecken", heroHow: "So funktioniert es",
            statTemplates: "Vorlagen", statCustomizable: "Anpassbar", statPossibilities: "Möglichkeiten",
            collectionLabel: "DIE ARKAS KOLLEKTION", featuredTemplates: "Ausgewählte Vorlagen", collectionDescription: "Fertige Designs für deine nächste Website.",
            categoryEducation: "Bildung", templateInstitute: "Institut", descriptionInstitute: "Professionelle Website für Bildungseinrichtungen.", categoryRestaurant: "Restaurant", templateRestaurant: "Restaurant", descriptionRestaurant: "Moderne Website für Gastronomiebetriebe.", categoryMerchandising: "Merchandising", templateMerchandising: "Merchandising", descriptionMerchandising: "Ein Onlineshop für Marken und Künstler.", categoryLanding: "Landingpage", templateLanding: "Landingpage", descriptionLanding: "Eine Landingpage mit Fokus auf Conversions.", categoryGym: "Fitnessstudio", templateGym: "Templo Coba", descriptionGym: "Eine vollständige Website für ein Sportzentrum.", categoryBackgrounds: "Animierte Hintergründe", templateBackgrounds: "Animierte Hintergründe", descriptionBackgrounds: "Interaktive visuelle Effekte, die Websites lebendig machen.", includes: "Enthält", includesGym: "6 Kurse", includesBackgrounds: "12 Effekte", viewDemo: "Demo ansehen", requestTemplate: "Diese Vorlage anfragen",
            processLabel: "SO FUNKTIONIERT ES", processTitleFirst: "Auswählen.", processTitleSecond: "Anpassen.", processTitleThird: "Veröffentlichen.", processDescription: "Du musst nicht bei null anfangen. Wähle eine professionelle Grundlage und gestalte sie nach deinen Vorstellungen.", processChoose: "Auswählen", processChooseDescription: "Finde die passende Vorlage für dein Projekt.", processBuy: "Kaufen", processBuyDescription: "Erhalte alle Dateien, die in der Vorlage enthalten sind.", processCustomize: "Anpassen", processCustomizeDescription: "Ändere Texte, Bilder, Farben und Inhalte.", processPublish: "Veröffentlichen", processPublishDescription: "Starte deine Website und bring dein Projekt auf die nächste Stufe.",
            aboutLabel: "ÜBER ARKAS", aboutTitleFirst: "Entwickelt zum", aboutTitleSecond: "Gestalten.", aboutDescription: "ARKAS TEMPLATES begann mit einer einfachen Idee: professionelle Website-Vorlagen zu erstellen, die jedem Projekt ein solides Fundament geben.", aboutDescriptionSecondary: "Jedes Design vereint Ästhetik, Funktionalität, responsives Design und einfache Anpassung.", aboutExplore: "Vorlagen entdecken",
            aboutMeLabel: "ÜBER MICH", aboutMeTitleFirst: "Hallo, ich bin", aboutMeTitleSecond: "Marco.", aboutMeDescription: "Ich studiere Webanwendungsentwicklung und suche ein Praktikum, in dem ich mitarbeiten und durch echte Projekte weiterlernen kann.", aboutMeDescriptionSecondary: "Besonders interessiere ich mich für Frontend-Entwicklung und baue gleichzeitig meine Backend-Kenntnisse aus. Ich lerne gern selbstständig, löse Probleme und entwickle klare, benutzerfreundliche Oberflächen.", aboutResume: "Meinen versteckten Lebenslauf ansehen", aboutGift: "Hol dir meine Vorlage kostenlos",
            ctaLabel: "ARKAS TEMPLATES", ctaTitleFirst: "Dein Projekt.", ctaTitleSecond: "Deine Identität.", ctaDescription: "Beginne mit einer professionellen Vorlage.", footerDescription: "Professionelle Website-Vorlagen für digitale Projekte.", footerProduct: "PRODUKT", footerArkas: "ARKAS", footerAbout: "Über uns", footerResume: "Lebenslauf ansehen", footerContact: "Kontakt", footerLicenses: "Nach Lizenzen fragen", copyright: "© 2026 ARKAS TEMPLATES", credits: "Entworfen & entwickelt von ARKAS",
            backToTemplates: "← Zurück zu den Vorlagen", fullscreenButton: "Vollbild", fullscreen: "Demo im Vollbild ansehen", exitFullscreen: "Vollbild verlassen", previewNotFound: "Diese Vorschau wurde nicht gefunden", previewNotFoundDescription: "Kehre zur Sammlung zurück und wähle eine andere Vorlage.", viewTemplates: "Vorlagen ansehen", previousDemo: "Vorherige Demo", nextDemo: "Nächste Demo"
        },
        it: {
            selectLanguage: "Seleziona lingua",
            navTemplates: "Template", navProcess: "Come funziona", navAbout: "Su ARKAS", navAboutMe: "Su di me", navExplore: "Esplora",
            heroTitleFirst: "Crea un sito web", heroTitleSecond: "che si distingue", heroDescription: "Template web professionali, progettati e sviluppati per dare al tuo progetto basi solide.", heroExplore: "Esplora i template", heroHow: "Come funziona",
            statTemplates: "Template", statCustomizable: "Personalizzabili", statPossibilities: "Possibilità",
            collectionLabel: "LA COLLEZIONE ARKAS", featuredTemplates: "Template in evidenza", collectionDescription: "Design pronti per il tuo prossimo sito web.",
            categoryEducation: "Istruzione", templateInstitute: "Istituto", descriptionInstitute: "Sito web professionale per la formazione.", categoryRestaurant: "Ristorante", templateRestaurant: "Ristorante", descriptionRestaurant: "Un sito web moderno per attività di ristorazione.", categoryMerchandising: "Merchandising", templateMerchandising: "Merchandising", descriptionMerchandising: "Un negozio online per brand e artisti.", categoryLanding: "Landing page", templateLanding: "Landing page", descriptionLanding: "Una landing page pensata per convertire.", categoryGym: "Palestra", templateGym: "Templo Coba", descriptionGym: "Un sito web completo per un centro sportivo.", categoryBackgrounds: "Sfondi animati", templateBackgrounds: "Sfondi animati", descriptionBackgrounds: "Effetti visivi interattivi per dare vita ai siti web.", includes: "Include", includesGym: "6 lezioni", includesBackgrounds: "12 effetti", viewDemo: "Guarda la demo", requestTemplate: "Richiedi questo template",
            processLabel: "COME FUNZIONA", processTitleFirst: "Scegli.", processTitleSecond: "Personalizza.", processTitleThird: "Pubblica.", processDescription: "Non devi partire da zero. Scegli una base professionale e rendila tua.", processChoose: "Scegli", processChooseDescription: "Trova il template giusto per il tuo progetto.", processBuy: "Acquista", processBuyDescription: "Ricevi tutti i file inclusi nel template.", processCustomize: "Personalizza", processCustomizeDescription: "Modifica testi, immagini, colori e contenuti.", processPublish: "Pubblica", processPublishDescription: "Lancia il tuo sito e porta il progetto al livello successivo.",
            aboutLabel: "SU ARKAS", aboutTitleFirst: "Progettato per", aboutTitleSecond: "creare.", aboutDescription: "ARKAS TEMPLATES è nato da un'idea semplice: creare template web professionali che offrano a ogni progetto basi solide.", aboutDescriptionSecondary: "Ogni design unisce estetica, funzionalità, responsive design e facilità di personalizzazione.", aboutExplore: "Esplora i template",
            aboutMeLabel: "SU DI ME", aboutMeTitleFirst: "Ciao, sono", aboutMeTitleSecond: "Marco.", aboutMeDescription: "Studio Sviluppo di Applicazioni Web e cerco un tirocinio in cui contribuire e continuare a imparare con progetti reali.", aboutMeDescriptionSecondary: "Mi interessa soprattutto lo sviluppo frontend, mentre continuo a migliorare le mie competenze backend. Mi piace imparare da solo, risolvere problemi e creare interfacce chiare e facili da usare.", aboutResume: "Scopri il mio CV nascosto", aboutGift: "Ricevi gratis il mio template",
            ctaLabel: "ARKAS TEMPLATES", ctaTitleFirst: "Il tuo progetto.", ctaTitleSecond: "La tua identità.", ctaDescription: "Inizia con un template professionale.", footerDescription: "Template web professionali per progetti digitali.", footerProduct: "PRODOTTO", footerArkas: "ARKAS", footerAbout: "Chi siamo", footerResume: "Visualizza il CV", footerContact: "Contatti", footerLicenses: "Chiedi informazioni sulle licenze", copyright: "© 2026 ARKAS TEMPLATES", credits: "Ideato e sviluppato da ARKAS",
            backToTemplates: "← Torna ai template", fullscreenButton: "Schermo intero", fullscreen: "Guarda la demo a schermo intero", exitFullscreen: "Esci dallo schermo intero", previewNotFound: "Anteprima non trovata", previewNotFoundDescription: "Torna alla raccolta per scegliere un altro template.", viewTemplates: "Visualizza i template", previousDemo: "Demo precedente", nextDemo: "Demo successiva"
        },
        fr: {
            selectLanguage: "Choisir la langue",
            navTemplates: "Modèles", navProcess: "Comment ça marche", navAbout: "À propos d’ARKAS", navAboutMe: "À propos de moi", navExplore: "Explorer",
            heroTitleFirst: "Créez un site web", heroTitleSecond: "qui se démarque", heroDescription: "Des modèles de sites web professionnels, conçus pour donner à votre projet des bases solides.", heroExplore: "Explorer les modèles", heroHow: "Comment ça marche",
            statTemplates: "Modèles", statCustomizable: "Personnalisables", statPossibilities: "Possibilités",
            collectionLabel: "LA COLLECTION ARKAS", featuredTemplates: "Modèles à la une", collectionDescription: "Des designs prêts pour votre prochain site web.",
            categoryEducation: "Éducation", templateInstitute: "Institut", descriptionInstitute: "Un site web professionnel pour la formation.", categoryRestaurant: "Restaurant", templateRestaurant: "Restaurant", descriptionRestaurant: "Un site web moderne pour les professionnels de la restauration.", categoryMerchandising: "Produits dérivés", templateMerchandising: "Produits dérivés", descriptionMerchandising: "Une boutique en ligne pour les marques et les artistes.", categoryLanding: "Page d’atterrissage", templateLanding: "Page d’atterrissage", descriptionLanding: "Une page conçue pour générer des conversions.", categoryGym: "Salle de sport", templateGym: "Templo Coba", descriptionGym: "Un site web complet pour un centre sportif.", categoryBackgrounds: "Arrière-plans animés", templateBackgrounds: "Arrière-plans animés", descriptionBackgrounds: "Des effets visuels interactifs pour donner vie aux sites web.", includes: "Comprend", includesGym: "6 cours", includesBackgrounds: "12 effets", viewDemo: "Voir la démo", requestTemplate: "Demander ce modèle",
            processLabel: "COMMENT ÇA MARCHE", processTitleFirst: "Choisissez.", processTitleSecond: "Personnalisez.", processTitleThird: "Publiez.", processDescription: "Pas besoin de partir de zéro. Choisissez une base professionnelle et adaptez-la à vos envies.", processChoose: "Choisir", processChooseDescription: "Trouvez le modèle adapté à votre projet.", processBuy: "Acheter", processBuyDescription: "Recevez tous les fichiers inclus avec le modèle.", processCustomize: "Personnaliser", processCustomizeDescription: "Modifiez les textes, les images, les couleurs et le contenu.", processPublish: "Publier", processPublishDescription: "Lancez votre site web et faites passer votre projet au niveau supérieur.",
            aboutLabel: "À PROPOS D’ARKAS", aboutTitleFirst: "Conçu pour", aboutTitleSecond: "créer.", aboutDescription: "ARKAS TEMPLATES est né d’une idée simple : créer des modèles de sites web professionnels qui donnent à chaque projet des bases solides.", aboutDescriptionSecondary: "Chaque design allie esthétique, fonctionnalité, conception responsive et personnalisation facile.", aboutExplore: "Explorer les modèles",
            aboutMeLabel: "À PROPOS DE MOI", aboutMeTitleFirst: "Bonjour, je suis", aboutMeTitleSecond: "Marco.", aboutMeDescription: "J’étudie le développement d’applications web et je cherche un stage pour contribuer à des projets réels et continuer à apprendre.", aboutMeDescriptionSecondary: "Je m’intéresse particulièrement au développement frontend tout en continuant à progresser en backend. J’aime apprendre par moi-même, résoudre des problèmes et créer des interfaces claires et faciles à utiliser.", aboutResume: "Voir mon CV caché", aboutGift: "Recevez mon modèle gratuitement",
            ctaLabel: "ARKAS TEMPLATES", ctaTitleFirst: "Votre projet.", ctaTitleSecond: "Votre identité.", ctaDescription: "Commencez avec un modèle professionnel.", footerDescription: "Des modèles de sites web professionnels pour les projets numériques.", footerProduct: "PRODUIT", footerArkas: "ARKAS", footerAbout: "À propos", footerResume: "Voir le CV", footerContact: "Contact", footerLicenses: "Demander des informations sur les licences", copyright: "© 2026 ARKAS TEMPLATES", credits: "Conçu et développé par ARKAS",
            backToTemplates: "← Retour aux modèles", fullscreenButton: "Plein écran", fullscreen: "Voir la démo en plein écran", exitFullscreen: "Quitter le plein écran", previewNotFound: "Aperçu introuvable", previewNotFoundDescription: "Revenez à la collection pour choisir un autre modèle.", viewTemplates: "Voir les modèles", previousDemo: "Démo précédente", nextDemo: "Démo suivante"
        },
        hi: {
            selectLanguage: "भाषा चुनें",
            navTemplates: "वेबसाइट टेम्पलेट", navProcess: "कैसे काम करता है", navAbout: "ARKAS के बारे में", navAboutMe: "मेरे बारे में", navExplore: "देखें",
            heroTitleFirst: "एक वेबसाइट बनाएं", heroTitleSecond: "जो सबसे अलग दिखे", heroDescription: "पेशेवर वेबसाइट टेम्पलेट, जिन्हें आपके प्रोजेक्ट को मजबूत आधार देने के लिए डिज़ाइन और विकसित किया गया है।", heroExplore: "टेम्पलेट देखें", heroHow: "कैसे काम करता है",
            statTemplates: "टेम्पलेट", statCustomizable: "अनुकूलित किए जा सकते हैं", statPossibilities: "संभावनाएं",
            collectionLabel: "ARKAS संग्रह", featuredTemplates: "चुनिंदा टेम्पलेट", collectionDescription: "आपकी अगली वेबसाइट के लिए तैयार डिज़ाइन।",
            categoryEducation: "शिक्षा", templateInstitute: "संस्थान", descriptionInstitute: "शिक्षा के लिए पेशेवर वेबसाइट।", categoryRestaurant: "रेस्तरां", templateRestaurant: "रेस्तरां", descriptionRestaurant: "खाने-पीने के व्यवसायों के लिए आधुनिक वेबसाइट।", categoryMerchandising: "मर्चेंडाइज़", templateMerchandising: "मर्चेंडाइज़", descriptionMerchandising: "ब्रांड और कलाकारों के लिए ऑनलाइन स्टोर।", categoryLanding: "लैंडिंग पेज", templateLanding: "लैंडिंग पेज", descriptionLanding: "कन्वर्ज़न पर केंद्रित लैंडिंग पेज।", categoryGym: "जिम", templateGym: "Templo Coba", descriptionGym: "खेल केंद्र के लिए पूरी वेबसाइट।", categoryBackgrounds: "एनिमेटेड बैकग्राउंड", templateBackgrounds: "एनिमेटेड बैकग्राउंड", descriptionBackgrounds: "वेबसाइट को जीवंत बनाने वाले इंटरैक्टिव विज़ुअल इफेक्ट।", includes: "शामिल है", includesGym: "6 कक्षाएं", includesBackgrounds: "12 इफेक्ट", viewDemo: "डेमो देखें", requestTemplate: "यह टेम्पलेट मांगें",
            processLabel: "कैसे काम करता है", processTitleFirst: "चुनें।", processTitleSecond: "अनुकूलित करें।", processTitleThird: "प्रकाशित करें।", processDescription: "आपको शुरुआत शून्य से करने की ज़रूरत नहीं है। एक पेशेवर आधार चुनें और उसे अपने अनुसार बनाएं।", processChoose: "चुनें", processChooseDescription: "अपने प्रोजेक्ट के लिए सही टेम्पलेट खोजें।", processBuy: "खरीदें", processBuyDescription: "टेम्पलेट के साथ शामिल सभी फ़ाइलें पाएं।", processCustomize: "अनुकूलित करें", processCustomizeDescription: "टेक्स्ट, चित्र, रंग और सामग्री बदलें।", processPublish: "प्रकाशित करें", processPublishDescription: "अपनी वेबसाइट शुरू करें और प्रोजेक्ट को अगले स्तर तक ले जाएं।",
            aboutLabel: "ARKAS के बारे में", aboutTitleFirst: "बनाया गया", aboutTitleSecond: "रचने के लिए।", aboutDescription: "ARKAS TEMPLATES की शुरुआत एक सरल विचार से हुई: पेशेवर वेबसाइट टेम्पलेट बनाना, जो हर प्रोजेक्ट को मजबूत आधार दें।", aboutDescriptionSecondary: "हर डिज़ाइन में सुंदरता, उपयोगिता, रिस्पॉन्सिव डिज़ाइन और आसान अनुकूलन का मेल है।", aboutExplore: "टेम्पलेट देखें",
            aboutMeLabel: "मेरे बारे में", aboutMeTitleFirst: "नमस्ते, मैं", aboutMeTitleSecond: "Marco हूं।", aboutMeDescription: "मैं वेब एप्लिकेशन डेवलपमेंट की पढ़ाई कर रहा हूं और ऐसी इंटर्नशिप खोज रहा हूं जहां वास्तविक प्रोजेक्ट पर योगदान देकर सीखता रहूं।", aboutMeDescriptionSecondary: "मुझे खास तौर पर फ्रंटएंड डेवलपमेंट में रुचि है और मैं बैकएंड कौशल भी बढ़ा रहा हूं। मुझे खुद सीखना, समस्याएं सुलझाना और साफ़ व आसान इंटरफेस बनाना पसंद है।", aboutResume: "मेरा छिपा हुआ रिज़्यूमे देखें", aboutGift: "मेरा टेम्पलेट मुफ्त पाएं",
            ctaLabel: "ARKAS TEMPLATES", ctaTitleFirst: "आपका प्रोजेक्ट।", ctaTitleSecond: "आपकी पहचान।", ctaDescription: "एक पेशेवर टेम्पलेट से शुरुआत करें।", footerDescription: "डिजिटल प्रोजेक्ट के लिए पेशेवर वेबसाइट टेम्पलेट।", footerProduct: "उत्पाद", footerArkas: "ARKAS", footerAbout: "हमारे बारे में", footerResume: "रिज़्यूमे देखें", footerContact: "संपर्क", footerLicenses: "लाइसेंस के बारे में पूछें", copyright: "© 2026 ARKAS TEMPLATES", credits: "ARKAS द्वारा डिज़ाइन और विकसित",
            backToTemplates: "← टेम्पलेट पर वापस जाएं", fullscreenButton: "पूर्ण स्क्रीन", fullscreen: "डेमो पूर्ण स्क्रीन में देखें", exitFullscreen: "पूर्ण स्क्रीन से बाहर निकलें", previewNotFound: "यह प्रीव्यू नहीं मिला", previewNotFoundDescription: "दूसरा टेम्पलेट चुनने के लिए संग्रह पर लौटें।", viewTemplates: "टेम्पलेट देखें", previousDemo: "पिछला डेमो", nextDemo: "अगला डेमो"
        }
    };

    translations.en.templateGym = "Gym";
    translations.en.previewGym = "View the Gym template demo";
    translations.de.templateGym = "Fitnessstudio";
    translations.it.templateGym = "Palestra";
    translations.fr.templateGym = "Salle de sport";
    translations.hi.templateGym = "जिम";

    const textElements = [...document.querySelectorAll("[data-i18n]")];
    const ariaElements = [...document.querySelectorAll("[data-i18n-aria]")];
    const originalTexts = new WeakMap();
    const originalAria = new WeakMap();
    const languageChoices = {
        es: { flag: "🇪🇸", code: "ES" },
        en: { flag: "🇬🇧", code: "EN" },
        de: { flag: "🇩🇪", code: "DE" },
        it: { flag: "🇮🇹", code: "IT" },
        fr: { flag: "🇫🇷", code: "FR" },
        hi: { flag: "🇮🇳", code: "HI" }
    };
    const pageMetadata = {
        es: { title: "ARKAS TEMPLATES | Plantillas Web", description: "ARKAS TEMPLATES - Plantillas web profesionales listas para utilizar.", viewerDescription: "Explora una plantilla dentro de ARKAS TEMPLATES." },
        en: { title: "ARKAS TEMPLATES | Website Templates", description: "ARKAS TEMPLATES - Professional website templates ready to use.", viewerDescription: "Explore a template in the ARKAS TEMPLATES viewer." },
        de: { title: "ARKAS TEMPLATES | Website-Vorlagen", description: "ARKAS TEMPLATES – Professionelle Website-Vorlagen, sofort einsatzbereit.", viewerDescription: "Entdecke eine Vorlage in der ARKAS TEMPLATES Vorschau." },
        it: { title: "ARKAS TEMPLATES | Template Web", description: "ARKAS TEMPLATES – Template web professionali pronti all'uso.", viewerDescription: "Esplora un template nella raccolta ARKAS TEMPLATES." },
        fr: { title: "ARKAS TEMPLATES | Modèles Web", description: "ARKAS TEMPLATES – Des modèles de sites web professionnels prêts à l'emploi.", viewerDescription: "Explorez un modèle dans l'aperçu ARKAS TEMPLATES." },
        hi: { title: "ARKAS TEMPLATES | वेबसाइट टेम्पलेट", description: "ARKAS TEMPLATES - उपयोग के लिए तैयार पेशेवर वेबसाइट टेम्पलेट।", viewerDescription: "ARKAS TEMPLATES प्रीव्यू में एक टेम्पलेट देखें।" }
    };

    function updateLanguageSwitcher(language) {
        document.querySelectorAll("[data-language-switcher]").forEach((switcher) => {
            const choice = languageChoices[language];
            const flag = switcher.querySelector("[data-language-flag]");
            const code = switcher.querySelector("[data-language-code]");
            const toggle = switcher.querySelector("[data-language-menu-toggle]");
            const menu = switcher.querySelector("[data-language-menu]");

            if (flag) flag.textContent = choice.flag;
            if (code) code.textContent = choice.code;
            if (toggle) toggle.setAttribute("aria-label", translations[language]?.selectLanguage || "Choose language");
            if (menu) menu.setAttribute("aria-label", translations[language]?.selectLanguage || "Choose language");

            switcher.querySelectorAll("[data-language-option]").forEach((option) => {
                option.setAttribute("aria-pressed", String(option.dataset.languageOption === language));
            });
        });
    }

    function setDirectText(element, value) {
        const textNodes = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE);
        const firstTextNode = textNodes.find((node) => node.textContent.trim());
        if (!firstTextNode) {
            element.insertBefore(document.createTextNode(value), element.firstChild);
            return;
        }

        firstTextNode.textContent = ` ${value} `;
        textNodes.filter((node) => node !== firstTextNode).forEach((node) => {
            node.textContent = "";
        });
    }

    function applyLanguage(language) {
        const selectedLanguage = Object.prototype.hasOwnProperty.call(languageChoices, language) ? language : "es";
        document.documentElement.lang = selectedLanguage;

        textElements.forEach((element) => {
            if (!originalTexts.has(element)) {
                const textNode = [...element.childNodes].find(
                    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
                );
                originalTexts.set(element, textNode ? textNode.textContent.trim() : element.textContent.trim());
            }
            const key = element.dataset.i18n;
            const translation = translations[selectedLanguage]?.[key];
            setDirectText(element, selectedLanguage === "es" ? originalTexts.get(element) : (translation || originalTexts.get(element)));
        });

        ariaElements.forEach((element) => {
            if (!originalAria.has(element)) {
                originalAria.set(element, element.getAttribute("aria-label") || "");
            }
            const key = element.dataset.i18nAria;
            const translatedLabel = translations[selectedLanguage]?.[key];
            element.setAttribute(
                "aria-label",
                selectedLanguage === "es" ? originalAria.get(element) : (translatedLabel || originalAria.get(element))
            );
        });

        updateLanguageSwitcher(selectedLanguage);

        if (document.body.classList.contains("viewer-page")) {
            document.querySelector('meta[name="description"]')?.setAttribute("content", pageMetadata[selectedLanguage].viewerDescription);
        } else {
            document.title = pageMetadata[selectedLanguage].title;
            document.querySelector('meta[name="description"]')?.setAttribute("content", pageMetadata[selectedLanguage].description);
        }

        window.dispatchEvent(new CustomEvent("arkas-language-change", { detail: { language: selectedLanguage } }));
    }

    let preferredLanguage = "es";
    try {
        const storedLanguage = localStorage.getItem("arkas-language");
        if (Object.prototype.hasOwnProperty.call(languageChoices, storedLanguage)) {
            preferredLanguage = storedLanguage;
        }
    } catch (error) {
        console.warn("ARKAS language preference could not be read from storage.", error);
        preferredLanguage = "es";
    }

    function closeLanguageMenu(toggle, menu) {
        menu.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
    }

    document.querySelectorAll("[data-language-menu-toggle]").forEach((toggle) => {
        const menu = document.getElementById(toggle.getAttribute("aria-controls"));
        const switcher = toggle.closest("[data-language-switcher]");
        if (!menu || !switcher) return;

        toggle.addEventListener("click", () => {
            const isOpen = toggle.getAttribute("aria-expanded") === "true";
            menu.hidden = isOpen;
            toggle.setAttribute("aria-expanded", String(!isOpen));
        });

        switcher.querySelectorAll("[data-language-option]").forEach((option) => {
            option.addEventListener("click", () => {
                const nextLanguage = option.dataset.languageOption;
                try {
                    localStorage.setItem("arkas-language", nextLanguage);
                } catch (error) {
                    console.warn("ARKAS language preference could not be saved.", error);
                }
                applyLanguage(nextLanguage);
                closeLanguageMenu(toggle, menu);
                toggle.focus();
            });
        });

        document.addEventListener("click", (event) => {
            if (!switcher.contains(event.target)) closeLanguageMenu(toggle, menu);
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
                closeLanguageMenu(toggle, menu);
                toggle.focus();
            }
        });
    });

    window.arkasI18n = {
        get language() {
            return Object.prototype.hasOwnProperty.call(languageChoices, document.documentElement.lang) ? document.documentElement.lang : "es";
        },
        translate(key, fallback) {
            return translations[this.language]?.[key] || fallback;
        }
    };

    applyLanguage(preferredLanguage);
})();
