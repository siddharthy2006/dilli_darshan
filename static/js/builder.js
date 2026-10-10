/* ----------------------------------------------------
   DELHI DARSHAN - ITINERARY BUILDER & TIMELINE RENDERER
   ---------------------------------------------------- */

let currentItinerary = null;

function renderItinerary(data) {
    currentItinerary = data;

    const placeholder = document.getElementById('itinerary-placeholder');
    const results = document.getElementById('itinerary-results');
    
    if (!data || !data.day_plans) {
        showToast('Failed to generate itinerary. Please try again.', 'error');
        return;
    }

    placeholder.classList.add('hidden');
    results.classList.remove('hidden');

    // Header & ID
    document.getElementById('res-trip-id').innerText = `TRIP ID: #${data.id}`;
    document.getElementById('res-title').innerText = data.title;

    // Cost Breakdown
    const b = data.breakdown;
    document.getElementById('res-target-budget').innerText = `₹${data.budget.toLocaleString()}`;
    document.getElementById('res-entry-fees').innerText = `₹${b.entry_fees.toLocaleString()}`;
    document.getElementById('res-transport-fare').innerText = `₹${b.estimated_transport.toLocaleString()}`;
    document.getElementById('res-food-allowance').innerText = `₹${b.estimated_food.toLocaleString()}`;
    document.getElementById('res-grand-total').innerText = `₹${b.total_cost.toLocaleString()}`;

    // Gauge status
    const remaining = b.remaining_budget;
    const gaugeFill = document.getElementById('gauge-fill');
    const statusText = document.getElementById('gauge-status-text');
    const remainingText = document.getElementById('gauge-remaining-text');

    const pct = Math.min(100, Math.max(10, (b.total_cost / data.budget) * 100));
    gaugeFill.style.width = `${pct}%`;

    if (remaining >= 0) {
        statusText.innerHTML = `<i class="fa-solid fa-circle-check text-emerald"></i> ${t('under_budget')}`;
        statusText.className = 'text-emerald';
        remainingText.innerText = `${t('saved_balance')}: ₹${remaining.toLocaleString()}`;
        gaugeFill.style.background = 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)';
    } else {
        statusText.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-accent"></i> ${t('over_budget')}`;
        statusText.className = 'text-accent';
        remainingText.innerText = `${t('shortfall')}: ₹${Math.abs(remaining).toLocaleString()}`;
        gaugeFill.style.background = 'linear-gradient(90deg, #f59e0b 0%, #f43f5e 100%)';
    }

    // Timeline Rendering
    const timelineContainer = document.getElementById('day-plans-timeline');
    timelineContainer.innerHTML = '';

    const visitorType = data.visitor_type;

    data.day_plans.forEach(dp => {
        const dayBlock = document.createElement('div');
        dayBlock.className = 'day-block';

        let itemsHTML = '';
        dp.items.forEach((item, index) => {
            const p = item.place;
            const fee = visitorType === 'foreigner' ? p.fee_foreigner_adult : p.fee_indian_adult;
            const feeText = fee === 0 ? t('fee_free') : `₹${fee} ${t('cost_entry')}`;
            const closedTxt = p.closed_on !== 'None' ? `${t('closed_on')} ${p.closed_on}` : '';
            
            itemsHTML += `
                <div class="timeline-node">
                    <div class="node-point">${item.sequence}</div>
                    <div class="timeline-card">
                        <img src="${p.image_url}" alt="${p.name}" class="place-img-thumb" onclick="openPlaceModal(${p.id})">
                        <div class="timeline-card-content">
                            <div>
                                <div class="place-meta-top">
                                    <span class="time-slot-tag"><i class="fa-regular fa-clock"></i> ${item.start_time} (${p.recommended_duration_mins} mins)</span>
                                    <span class="rating-tag"><i class="fa-solid fa-star"></i> ${p.rating}</span>
                                </div>
                                <h3 class="place-title" onclick="openPlaceModal(${p.id})" style="cursor:pointer;">${p.name}</h3>
                                <p class="place-desc">${p.description}</p>
                            </div>

                            <div class="place-details-pills">
                                <span class="badge badge-success"><i class="fa-solid fa-ticket"></i> ${feeText}</span>
                                <span class="badge badge-info"><i class="fa-solid fa-building-columns"></i> ${p.zone_code.toUpperCase()} DELHI</span>
                                ${p.closed_on !== 'None' ? `<span class="badge badge-warning"><i class="fa-solid fa-triangle-exclamation"></i> ${closedTxt}</span>` : ''}
                            </div>

                            <div class="metro-tip-bar">
                                <i class="fa-solid fa-subway text-accent"></i> <strong>${t('metro_gate')}:</strong> ${p.nearest_metro}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        dayBlock.innerHTML = `
            <div class="day-block-header">
                <span class="day-badge">${t('day')} ${dp.day}</span>
                <h3 class="day-title">${t('sequence_title')}</h3>
            </div>
            <div class="timeline-items">
                ${itemsHTML}
            </div>
        `;

        timelineContainer.appendChild(dayBlock);
    });

    // Scroll to results smoothly
    results.scrollIntoView({ behavior: 'smooth' });
}

function saveCurrentItinerary() {
    if (!currentItinerary) return;
    showToast(`Trip ID #${currentItinerary.id} is saved in database!`, 'success');
}
