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

// ----------------------------------------------------
// RATINGS CONTROLLER & HELPERS
// ----------------------------------------------------

function getUserRatings() {
    try {
        return JSON.parse(localStorage.getItem('delhi_user_ratings')) || {};
    } catch {
        return {};
    }
}

function saveUserRating(placeId, rating) {
    const ratings = getUserRatings();
    ratings[placeId] = Number(rating);
    localStorage.setItem('delhi_user_ratings', JSON.stringify(ratings));
}

function getRatingDescription(rating) {
    const r = Math.round(rating);
    switch (r) {
        case 5: return t('rate_excellent');
        case 4: return t('rate_very_good');
        case 3: return t('rate_good');
        case 2: return t('rate_fair');
        case 1: return t('rate_poor');
        default: return '';
    }
}

async function submitPlaceRating(placeId, rating, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    const res = await API.ratePlace(placeId, rating);
    if (res && res.success) {
        saveUserRating(placeId, rating);

        // Update in-memory places cache
        const place = allPlaces.find(p => p.id === placeId);
        if (place) {
            place.rating = res.rating;
            place.rating_count = res.rating_count;
        }

        // Update UI dynamically across open cards and modals
        updatePlaceRatingUI(placeId, res.rating, res.rating_count, rating);

        showToast(
            currentLang === 'hi' 
                ? `रेटिंग दर्ज की गई: ${rating}★! धन्यवाद!` 
                : `Rated ${rating}★! Thank you for rating!`, 
            'success'
        );
    } else {
        showToast('Failed to submit rating. Please try again.', 'error');
    }
}

function updatePlaceRatingUI(placeId, newRating, newCount, userRating) {
    // 1. Update card average rating & count
    document.querySelectorAll(`.card-rating-num-${placeId}`).forEach(el => {
        el.innerText = Number(newRating).toFixed(1);
    });
    document.querySelectorAll(`.card-rating-count-${placeId}`).forEach(el => {
        el.innerText = `(${newCount})`;
    });

    // 2. Update interactive stars on cards
    document.querySelectorAll(`.card-stars-${placeId}`).forEach(el => {
        el.innerHTML = renderCardStarsHtml(placeId, userRating);
    });

    // 3. Update modal if opened for this place
    const modalStars = document.getElementById(`modal-stars-${placeId}`);
    if (modalStars) {
        modalStars.innerHTML = renderModalStarsHtml(placeId, userRating);
    }
    const modalFeedback = document.getElementById(`modal-feedback-${placeId}`);
    if (modalFeedback) {
        modalFeedback.innerHTML = `<span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> ${t('your_rating')}: <strong>${userRating}/5 ★</strong> (${getRatingDescription(userRating)})</span>`;
    }
    const modalRatingNum = document.getElementById(`modal-score-num-${placeId}`);
    if (modalRatingNum) {
        modalRatingNum.innerText = Number(newRating).toFixed(1);
    }
    const modalRatingCount = document.getElementById(`modal-score-count-${placeId}`);
    if (modalRatingCount) {
        modalRatingCount.innerText = `(${newCount})`;
    }
}

function renderCardStarsHtml(placeId, userRating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        const isFilled = userRating >= i;
        starsHtml += `
            <i class="fa-star star-btn ${isFilled ? 'fa-solid active' : 'fa-regular'}" 
               data-star="${i}" 
               data-place="${placeId}"
               onmouseenter="handleStarHover(${placeId}, ${i}, true)"
               onmouseleave="handleStarHover(${placeId}, 0, true)"
               onclick="submitPlaceRating(${placeId}, ${i}, event)"
               title="${i} ★ - ${getRatingDescription(i)}"></i>
        `;
    }
    return `
        <span class="rate-status-label">${userRating ? t('your_rating') : t('rate_label')}:</span>
        <div class="stars-group">${starsHtml}</div>
    `;
}

function renderModalStarsHtml(placeId, userRating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        const isFilled = userRating >= i;
        starsHtml += `
            <i class="fa-star modal-star-btn ${isFilled ? 'fa-solid active' : 'fa-regular'}" 
               data-star="${i}" 
               data-place="${placeId}"
               onmouseenter="handleModalStarHover(${placeId}, ${i})"
               onmouseleave="handleModalStarHover(${placeId}, 0)"
               onclick="submitPlaceRating(${placeId}, ${i}, event)"
               title="${i} ★ - ${getRatingDescription(i)}"></i>
        `;
    }
    return starsHtml;
}

function handleStarHover(placeId, hoverVal, isCard = true) {
    const selector = isCard ? `.card-stars-${placeId} .star-btn` : `#modal-stars-${placeId} .modal-star-btn`;
    const stars = document.querySelectorAll(selector);
    const userRating = getUserRatings()[placeId] || 0;
    const activeLevel = hoverVal > 0 ? hoverVal : userRating;

    stars.forEach(star => {
        const starVal = parseInt(star.getAttribute('data-star'));
        if (starVal <= activeLevel) {
            star.classList.remove('fa-regular');
            star.classList.add('fa-solid', 'hover-active');
        } else {
            star.classList.remove('fa-solid', 'hover-active');
            star.classList.add('fa-regular');
        }
    });
}

function handleModalStarHover(placeId, hoverVal) {
    handleStarHover(placeId, hoverVal, false);
    const feedback = document.getElementById(`modal-feedback-${placeId}`);
    if (!feedback) return;
    const userRating = getUserRatings()[placeId] || 0;

    if (hoverVal > 0) {
        feedback.innerHTML = `<span><i class="fa-solid fa-star text-gold"></i> <strong>${hoverVal}/5</strong> - ${getRatingDescription(hoverVal)}</span>`;
    } else if (userRating > 0) {
        feedback.innerHTML = `<span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> ${t('your_rating')}: <strong>${userRating}/5 ★</strong> (${getRatingDescription(userRating)})</span>`;
    } else {
        feedback.innerHTML = `<span>${t('tap_to_rate')}</span>`;
    }
}

// Render Standalone Place Card
function renderPlaceStandaloneCard(p) {
    const userRating = getUserRatings()[p.id] || 0;
    const closedTxt = p.closed_on !== 'None' ? `${t('closed_on')} ${p.closed_on}` : '';
    const ratingVal = (p.rating !== undefined && p.rating !== null) ? Number(p.rating).toFixed(1) : '4.5';
    const ratingCount = p.rating_count || 120;

    return `
        <div class="place-card-standalone" id="place-card-${p.id}">
            <div class="standalone-img-box">
                <img src="${p.image_url}" alt="${p.name}">
                <span class="zone-badge-overlay">${p.zone_code.toUpperCase()} DELHI</span>
            </div>
            <div class="standalone-body">
                <div>
                    <div class="place-header-row">
                        <h3 class="standalone-title">${p.name}</h3>
                        <div class="community-rating-pill" title="Community Rating: ${ratingVal} / 5 based on ${ratingCount} reviews">
                            <i class="fa-solid fa-star text-gold"></i>
                            <span class="card-rating-num-${p.id}">${ratingVal}</span>
                            <span class="card-rating-count-${p.id}">(${ratingCount})</span>
                        </div>
                    </div>
                    <p class="standalone-desc">${p.description}</p>
                </div>
                <div>
                    <!-- Interactive Rating Bar for this Destination -->
                    <div class="card-rate-bar card-stars-${p.id}" onclick="event.stopPropagation();">
                        ${renderCardStarsHtml(p.id, userRating)}
                    </div>

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
    const sortVal = document.getElementById('catalog-sort-filter') ? document.getElementById('catalog-sort-filter').value : 'rating_desc';

    const filtered = allPlaces.filter(p => {
        const matchesSearch = !searchVal || 
            p.name.toLowerCase().includes(searchVal) || 
            p.description.toLowerCase().includes(searchVal) || 
            p.nearest_metro.toLowerCase().includes(searchVal);
        const matchesZone = zoneVal === 'all' || p.zone_code === zoneVal;
        const matchesCat = catVal === 'all' || p.category === catVal;

        return matchesSearch && matchesZone && matchesCat;
    });

    // Apply sorting
    filtered.sort((a, b) => {
        if (sortVal === 'rating_desc') return b.rating - a.rating;
        if (sortVal === 'rating_asc') return a.rating - b.rating;
        if (sortVal === 'name_asc') return a.name.localeCompare(b.name);
        if (sortVal === 'fee_asc') return a.fee_indian_adult - b.fee_indian_adult;
        return b.rating - a.rating;
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

    const userRating = getUserRatings()[place.id] || 0;
    const ratingVal = Number(place.rating || 4.5).toFixed(1);
    const ratingCount = place.rating_count || 120;

    const modal = document.getElementById('place-modal');
    const content = document.getElementById('modal-content');

    content.innerHTML = `
        <div style="position:relative; margin:-1.5rem -1.5rem 1.25rem -1.5rem;">
            <img src="${place.image_url}" style="width:100%; height:240px; object-fit:cover; border-radius: 20px 20px 0 0;">
            <span class="zone-badge-overlay" style="top:15px; left:15px;">${place.zone_code.toUpperCase()} DELHI</span>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.4rem; gap:1rem;">
            <h2 style="font-size:1.6rem; margin:0;">${place.name}</h2>
            <div class="community-rating-pill" style="font-size:0.95rem; padding:0.3rem 0.8rem;">
                <i class="fa-solid fa-star text-gold"></i>
                <span id="modal-score-num-${place.id}">${ratingVal}</span>
                <span id="modal-score-count-${place.id}" style="opacity:0.8; font-weight:normal;">(${ratingCount})</span>
            </div>
        </div>

        <div style="display:flex; gap:0.75rem; align-items:center; margin-bottom:1rem; font-size:0.85rem; color:var(--text-muted); flex-wrap:wrap;">
            <span><i class="fa-solid fa-clock text-accent"></i> Rec. ${place.recommended_duration_mins} mins</span> |
            <span><i class="fa-solid fa-sun text-accent"></i> Best in ${place.best_time_to_visit}</span> |
            <span><i class="fa-solid fa-subway text-accent"></i> ${place.nearest_metro}</span>
        </div>

        <p style="color:var(--text-main); font-size:0.95rem; margin-bottom:1.25rem; line-height:1.6;">${place.description}</p>

        <!-- Rate this Destination Interactive Section -->
        <div class="card modal-rating-card" id="modal-rating-section-${place.id}">
            <div class="modal-rating-header">
                <div>
                    <h4 style="margin:0 0 0.25rem 0; font-size:1.05rem; color:var(--text-main);">
                        <i class="fa-solid fa-star text-gold"></i> ${t('rate_destination')}
                    </h4>
                    <p style="margin:0; font-size:0.82rem; color:var(--text-muted);">${t('rate_subtitle')}</p>
                </div>
            </div>

            <div class="modal-rating-body">
                <div class="modal-stars-row" id="modal-stars-${place.id}">
                    ${renderModalStarsHtml(place.id, userRating)}
                </div>
                <div class="modal-rating-feedback" id="modal-feedback-${place.id}">
                    ${userRating > 0 
                        ? `<span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> ${t('your_rating')}: <strong>${userRating}/5 ★</strong> (${getRatingDescription(userRating)})</span>`
                        : `<span>${t('tap_to_rate')}</span>`}
                </div>
            </div>
        </div>

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
