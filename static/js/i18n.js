/* ----------------------------------------------------
   DELHI DARSHAN - INTERNATIONALIZATION & TRANSLATION (EN/HI)
   ---------------------------------------------------- */

let currentLang = localStorage.getItem('delhi_lang') || 'en';

const translations = {
    en: {
        brand_sub: "Delhi Journey & Budget Planner",
        nav_planner: "Planner",
        nav_zones: "Zones",
        nav_catalog: "Destinations",
        nav_saved: "Saved",
        hero_tag: "Capital Explorer 2026",
        stat_places: "Total Places: 27",
        stat_regions: "Regions: 6",
        form_title: "Trip Planner",
        form_subtitle: "Select your preferences to generate a sequential itinerary.",
        label_zone: "Select Zone",
        label_budget: "Target Budget",
        label_visitor: "Visitor Category",
        visitor_indian: "Indian",
        visitor_foreigner: "Foreigner",
        label_duration: "Duration",
        duration_1: "1 Day",
        duration_2: "2 Days",
        duration_3: "3 Days",
        label_companion: "Traveling As",
        comp_solo: "Solo",
        comp_couple: "Couple",
        comp_family: "Family",
        comp_friends: "Friends",
        btn_generate: "YOUR TRIP",
        placeholder_title: "Your Itinerary Will Appear Here",
        placeholder_desc: "Select your budget, region, and details on the left, then click YOUR TRIP.",
        btn_save_trip: "Save",
        btn_print: "Print",
        cost_budget: "Budget",
        cost_entry: "Entry Fees",
        cost_metro: "Metro Fare",
        cost_food: "Food",
        cost_total: "Grand Total",
        zone_title: "Delhi Zones",
        zone_desc: "Browse places grouped by Delhi's geographic zones.",
        catalog_title: "Destinations Directory",
        catalog_desc: "Complete dataset with live entry fees, opening hours, closed days, and metro lines.",
        search_placeholder: "Search places, metro, attractions...",
        saved_title: "Saved Trip",
        saved_desc: "Enter your 8-character Trip ID to load a saved trip.",
        saved_placeholder: "Enter Trip ID (e.g. a1b2c3d4)",
        btn_load_trip: "Load Trip",

        // Single name categories & zones
        zone_all: "All Delhi",
        zone_south: "South Delhi",
        zone_central: "Central Delhi",
        zone_old_delhi: "Old Delhi",
        zone_north: "North Delhi",
        zone_east: "East Delhi",
        zone_west: "West Delhi",

        cat_all: "All Categories",
        cat_monument: "Monuments",
        cat_spiritual: "Spiritual",
        cat_park: "Parks",
        cat_market: "Bazaars",
        cat_museum: "Museums",
        cat_food_hub: "Food Hubs",

        fee_free: "FREE",
        closed_on: "Closed",
        metro_gate: "Metro",
        details: "Details",
        day: "Day",
        sequence_title: "Sequential Route",
        under_budget: "Under Budget",
        over_budget: "Over Budget",
        saved_balance: "Remaining",
        shortfall: "Shortfall"
    },
    hi: {
        brand_sub: "दिल्ली यात्रा एवं बजट योजनाकार",
        nav_planner: "योजनाकार",
        nav_zones: "क्षेत्र",
        nav_catalog: "गंतव्य",
        nav_saved: "सहेजी गई",
        hero_tag: "राजधानी अन्वेषक 2026",
        stat_places: "कुल स्थान: 27",
        stat_regions: "क्षेत्र: 6",
        form_title: "यात्रा योजनाकार",
        form_subtitle: "अपनी प्राथमिकताओं के आधार पर यात्रा योजना बनाएं।",
        label_zone: "क्षेत्र चुनें",
        label_budget: "लक्ष्य बजट",
        label_visitor: "आगंतुक श्रेणी",
        visitor_indian: "भारतीय",
        visitor_foreigner: "विदेशी",
        label_duration: "अवधि",
        duration_1: "1 दिन",
        duration_2: "2 दिन",
        duration_3: "3 दिन",
        label_companion: "यात्रा साथी",
        comp_solo: "सोलो",
        comp_couple: "दंपति",
        comp_family: "परिवार",
        comp_friends: "मित्र",
        btn_generate: "आपकी यात्रा",
        placeholder_title: "आपकी यात्रा योजना यहां दिखाई देगी",
        placeholder_desc: "बाईं ओर अपना बजट और क्षेत्र चुनें, फिर 'आपकी यात्रा' पर क्लिक करें।",
        btn_save_trip: "सहेजें",
        btn_print: "प्रिंट",
        cost_budget: "बजट",
        cost_entry: "प्रवेश शुल्क",
        cost_metro: "मेट्रो किराया",
        cost_food: "भोजन",
        cost_total: "कुल खर्च",
        zone_title: "दिल्ली क्षेत्र",
        zone_desc: "दिल्ली के भौगोलिक क्षेत्रों के आधार पर स्थानों को देखें।",
        catalog_title: "गंतव्य सूची",
        catalog_desc: "प्रवेश शुल्क, खुलने का समय, बंद दिन और मेट्रो मार्ग।",
        search_placeholder: "स्थान, मेट्रो खोजें...",
        saved_title: "सहेजी गई यात्रा",
        saved_desc: "अपनी यात्रा लोड करने के लिए 8-अक्षरों की ID दर्ज करें।",
        saved_placeholder: "यात्रा ID दर्ज करें (उदा. a1b2c3d4)",
        btn_load_trip: "यात्रा लोड करें",

        zone_all: "सभी दिल्ली",
        zone_south: "दक्षिण दिल्ली",
        zone_central: "मध्य दिल्ली",
        zone_old_delhi: "पुरानी दिल्ली",
        zone_north: "उत्तर दिल्ली",
        zone_east: "पूर्व दिल्ली",
        zone_west: "पश्चिम दिल्ली",

        cat_all: "सभी श्रेणियां",
        cat_monument: "स्मारक",
        cat_spiritual: "धार्मिक",
        cat_park: "पार्क",
        cat_market: "बाज़ार",
        cat_museum: "संग्रहालय",
        cat_food_hub: "फ़ूड हब",

        fee_free: "मुफ़्त",
        closed_on: "बंद",
        metro_gate: "मेट्रो",
        details: "विवरण",
        day: "दिन",
        sequence_title: "क्रमिक मार्ग",
        under_budget: "बजट में",
        over_budget: "बजट से अधिक",
        saved_balance: "शेष",
        shortfall: "कमतर"
    }
};

function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || translations['en'][key] || key;
}

function updatePageLanguage() {
    localStorage.setItem('delhi_lang', currentLang);

    const langLabel = document.getElementById('lang-label');
    if (langLabel) {
        langLabel.innerText = currentLang === 'en' ? 'हिन्दी' : 'English';
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            const icon = el.querySelector('i');
            if (icon) {
                const textNode = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
                if (textNode) {
                    textNode.textContent = ' ' + translations[currentLang][key];
                } else {
                    el.innerHTML = icon.outerHTML + ' ' + translations[currentLang][key];
                }
            } else {
                el.innerText = translations[currentLang][key];
            }
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang] && translations[currentLang][key]) {
            el.placeholder = translations[currentLang][key];
        }
    });

    updateSelectOptions();

    if (typeof filterCatalog === 'function') filterCatalog();
    if (typeof selectZone === 'function' && typeof currentZoneFilter !== 'undefined') selectZone(currentZoneFilter);
    if (typeof currentItinerary !== 'undefined' && currentItinerary) {
        renderItinerary(currentItinerary);
    }
}

function updateSelectOptions() {
    const zoneSelect = document.getElementById('input-zone');
    if (zoneSelect) {
        const opts = ['all', 'south', 'central', 'old_delhi', 'north', 'east', 'west'];
        opts.forEach(opt => {
            const el = zoneSelect.querySelector(`option[value="${opt}"]`);
            if (el && translations[currentLang][`zone_${opt}`]) {
                el.innerText = translations[currentLang][`zone_${opt}`];
            }
        });
    }

    const catSelect = document.getElementById('catalog-category-filter');
    if (catSelect) {
        const cats = ['all', 'monument', 'spiritual', 'park', 'market', 'museum', 'food_hub'];
        cats.forEach(c => {
            const el = catSelect.querySelector(`option[value="${c}"]`);
            if (el && translations[currentLang][`cat_${c}`]) {
                el.innerText = translations[currentLang][`cat_${c}`];
            }
        });
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    updatePageLanguage();
}

document.addEventListener('DOMContentLoaded', () => {
    updatePageLanguage();
});
