/* ----------------------------------------------------
   DELHI DARSHAN - MAIN APP INTERACTIONS & CONTROLLER
   ---------------------------------------------------- */

let allPlaces = [];
let allZones = [];
let currentZoneFilter = 'south';

document.addEventListener('DOMContentLoaded', async () => {
    // Start typewriter effect with Delhi Darshan phrases
    initTypewriterEffect();

    // Initial data fetch
    allZones = await API.fetchZones();
    allPlaces = await API.fetchPlaces();

    renderZoneCards();
    renderCatalogPlaces(allPlaces);
    selectZone('south');
});

// Typewriter Text Effect featuring "Delhi Darshan"
function initTypewriterEffect() {
    const typedTextSpan = document.getElementById('typed-text');
    if (!typedTextSpan) return;

    const phrases = [
        "Welcome to Delhi Darshan",
        "Delhi Darshan - Craft Your Perfect Journey",
        "Delhi Darshan - Explore South, Central & Old Delhi",
        "Delhi Darshan - Plan Your Dream Trip on Any Budget"
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 80;
    const deletingSpeed = 35;
    const delayBetweenPhrases = 2200;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typedTextSpan.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedTextSpan.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        let delta = isDeleting ? deletingSpeed : typingSpeed;

        if (!isDeleting && charIndex === currentPhrase.length) {
            delta = delayBetweenPhrases;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            delta = 500;
        }

        setTimeout(type, delta);
    }

    type();
}

// Interactive Radial Zone Selection (Large Circular Nodes)
function selectRadialZone(zoneCode) {
    const hiddenSelect = document.getElementById('input-zone');
    if (hiddenSelect) hiddenSelect.value = zoneCode;

    // Update center hub active state
    const hub = document.querySelector('.radial-hub-large');
    if (hub) {
        if (zoneCode === 'all') {
            hub.classList.add('active');
        } else {
            hub.classList.remove('active');
        }
    }

    // Update radial node active states
    document.querySelectorAll('.radial-node-large').forEach(node => {
        if (node.getAttribute('data-radial-zone') === zoneCode) {
            node.classList.add('active');
        } else {
            node.classList.remove('active');
        }
    });
}

// Tab Navigation
function switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabId}`);
    const targetBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);

    if (targetTab) targetTab.classList.remove('hidden');
    if (targetBtn) targetBtn.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Quick Budget Helper
function setBudget(val) {
    document.getElementById('input-budget').value = val;
}

// Form Submission Handler
async function handleGenerateItinerary(e) {
    e.preventDefault();

    const generateBtn = document.getElementById('generate-btn');
    generateBtn.disabled = true;
    generateBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> ${t('btn_generate')}...`;

    const budget = parseFloat(document.getElementById('input-budget').value);
    const zone = document.getElementById('input-zone').value;
    const visitor_type = document.querySelector('input[name="visitor_type"]:checked').value;
    const days = parseInt(document.getElementById('input-days').value);
    const companion = document.getElementById('input-companion').value;

    const res = await API.generateItinerary({
        budget, zone, visitor_type, days, companion
    });

    generateBtn.disabled = false;
    generateBtn.innerHTML = `<i class="fa-solid fa-route"></i> <span data-i18n="btn_generate">${t('btn_generate')}</span>`;

    if (res && !res.error) {
        renderItinerary(res);
        showToast(currentLang === 'hi' ? 'आपकी यात्रा तैयार है!' : 'YOUR TRIP is ready!', 'success');
    } else {
        showToast('Error generating itinerary. Please try again.', 'error');
    }
}

// Render Zone Cards in Zone Explorer Tab
function renderZoneCards() {
    const grid = document.getElementById('zones-selector-grid');
    if (!grid) return;

    grid.innerHTML = allZones.map(z => {
        const zoneName = t(`zone_${z.code}`) || z.name;
        return `
            <div class="zone-card ${z.code === currentZoneFilter ? 'active' : ''}" onclick="selectZone('${z.code}')">
                <div class="zone-card-top">
                    <span class="zone-name">${zoneName}</span>
                    <span class="badge badge-info">${z.place_count} Places</span>
                </div>
                <p class="zone-tagline">${z.tagline}</p>
            </div>
        `;
    }).join('');
}

// Select Zone in Zone Explorer
function selectZone(zoneCode) {
    currentZoneFilter = zoneCode;
    renderZoneCards();

    const zoneObj = allZones.find(z => z.code === zoneCode);
    const titleEl = document.getElementById('current-zone-title');
    const countEl = document.getElementById('current-zone-count');

    if (titleEl) {
        const zName = t(`zone_${zoneCode}`) || (zoneObj ? zoneObj.name : zoneCode);
        titleEl.innerText = `${zName}`;
    }

    const filtered = allPlaces.filter(p => p.zone_code === zoneCode);
    if (countEl) countEl.innerText = `${filtered.length} Places`;

    const grid = document.getElementById('zone-places-grid');
    if (grid) {
        grid.innerHTML = filtered.map(p => renderPlaceStandaloneCard(p)).join('');
    }
}

// Render Standalone Place Card
function renderPlaceStandaloneCard(p) {
    const closedTxt = p.closed_on !== 'None' ? `${t('closed_on')} ${p.closed_on}` : '';
    return `
        <div class="place-card-standalone">
            <div class="standalone-img-box">
                <img src="${p.image_url}" alt="${p.name}">
                <span class="zone-badge-overlay">${p.zone_code.toUpperCase()} DELHI</span>
            </div>
            <div class="standalone-body">
                <div>
                    <h3 class="standalone-title">${p.name}</h3>
                    <p class="standalone-desc">${p.description}</p>
                </div>
                <div>
                    <div class="place-details-pills" style="margin-bottom:0.75rem;">
                        <span class="badge badge-info"><i class="fa-solid fa-clock"></i> ${p.timing_open} - ${p.timing_close}</span>
                        ${p.closed_on !== 'None' ? `<span class="badge badge-warning">${closedTxt}</span>` : ''}
                    </div>
                    <div class="standalone-footer">
                        <span class="fee-tag">🇮🇳 ₹${p.fee_indian_adult} | ✈️ ₹${p.fee_foreigner_adult}</span>
                        <button class="btn btn-sm btn-outline" onclick="openPlaceModal(${p.id})">${t('details')}</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Catalog Search & Filters
function filterCatalog() {
    const searchVal = document.getElementById('catalog-search').value.toLowerCase().trim();
    const zoneVal = document.getElementById('catalog-zone-filter').value;
    const catVal = document.getElementById('catalog-category-filter').value;

    const filtered = allPlaces.filter(p => {
        const matchesSearch = !searchVal || 
            p.name.toLowerCase().includes(searchVal) || 
            p.description.toLowerCase().includes(searchVal) || 
            p.nearest_metro.toLowerCase().includes(searchVal);
        const matchesZone = zoneVal === 'all' || p.zone_code === zoneVal;
        const matchesCat = catVal === 'all' || p.category === catVal;

        return matchesSearch && matchesZone && matchesCat;
    });

    renderCatalogPlaces(filtered);
}

function renderCatalogPlaces(places) {
    const grid = document.getElementById('catalog-places-grid');
    if (!grid) return;

    if (places.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><h3>No destinations match your search</h3></div>`;
        return;
    }

    grid.innerHTML = places.map(p => renderPlaceStandaloneCard(p)).join('');
}

// Open Place Modal
async function openPlaceModal(placeId) {
    const place = await API.fetchPlaceById(placeId);
    if (!place) return;

    const modal = document.getElementById('place-modal');
    const content = document.getElementById('modal-content');

    content.innerHTML = `
        <div style="position:relative; margin:-1.5rem -1.5rem 1.25rem -1.5rem;">
            <img src="${place.image_url}" style="width:100%; height:240px; object-fit:cover; border-radius: 20px 20px 0 0;">
            <span class="zone-badge-overlay" style="top:15px; left:15px;">${place.zone_code.toUpperCase()} DELHI</span>
        </div>

        <h2 style="font-size:1.6rem; margin-bottom:0.4rem;">${place.name}</h2>
        <div style="display:flex; gap:0.75rem; align-items:center; margin-bottom:1rem; font-size:0.85rem; color:var(--text-muted);">
            <span><i class="fa-solid fa-star text-accent"></i> ${place.rating} Rating</span> |
            <span><i class="fa-solid fa-clock text-accent"></i> Rec. ${place.recommended_duration_mins} mins</span> |
            <span><i class="fa-solid fa-sun text-accent"></i> Best in ${place.best_time_to_visit}</span>
        </div>

        <p style="color:var(--text-main); font-size:0.95rem; margin-bottom:1.5rem; line-height:1.6;">${place.description}</p>

        <div class="card" style="margin-bottom:1.25rem; padding:1.25rem;">
            <h4 style="margin-bottom:0.75rem; color:var(--primary); font-size:1.05rem;"><i class="fa-solid fa-ticket"></i> Entry Fees & Guidelines</h4>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; font-size:0.9rem;">
                <div><strong>Indian Adults:</strong> ₹${place.fee_indian_adult}</div>
                <div><strong>Foreign Tourists:</strong> ₹${place.fee_foreigner_adult}</div>
                <div><strong>Indian Children:</strong> ₹${place.fee_indian_child}</div>
                <div><strong>Foreigner Children:</strong> ₹${place.fee_foreigner_child}</div>
                <div><strong>Camera Ticket:</strong> ${place.camera_fee > 0 ? '₹' + place.camera_fee : t('fee_free')}</div>
                <div><strong>Closed Day:</strong> ${place.closed_on}</div>
            </div>
        </div>

        <div class="card" style="padding:1.25rem;">
            <h4 style="margin-bottom:0.75rem; color:var(--accent-indigo); font-size:1.05rem;"><i class="fa-solid fa-subway"></i> Visiting Hours & Metro Station</h4>
            <p style="font-size:0.9rem; margin-bottom:0.4rem;"><strong>Timings:</strong> ${place.timing_open} to ${place.timing_close}</p>
            <p style="font-size:0.9rem;"><strong>Nearest Metro Line:</strong> ${place.nearest_metro}</p>
        </div>
    `;

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('place-modal').classList.add('hidden');
}

// Load Saved Trip by ID
async function loadSavedTripById() {
    const tripId = document.getElementById('lookup-trip-id').value.trim();
    if (!tripId) {
        showToast('Please enter a valid 8-character Trip ID', 'warning');
        return;
    }

    const data = await API.fetchItineraryById(tripId);
    if (data && !data.error) {
        switchTab('planner');
        renderItinerary(data);
        showToast(`Loaded trip #${tripId} successfully!`, 'success');
    } else {
        showToast(`No itinerary found with ID #${tripId}`, 'error');
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fa-solid fa-info-circle"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}
