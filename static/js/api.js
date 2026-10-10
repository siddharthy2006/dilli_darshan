/* ----------------------------------------------------
   DELHI DARSHAN - API CLIENT MODULE
   ---------------------------------------------------- */

const API = {
    async fetchZones() {
        try {
            const res = await fetch('/api/zones');
            return await res.json();
        } catch (err) {
            console.error('Failed to fetch zones:', err);
            return [];
        }
    },

    async fetchPlaces(params = {}) {
        try {
            const query = new URLSearchParams(params).toString();
            const res = await fetch(`/api/places?${query}`);
            return await res.json();
        } catch (err) {
            console.error('Failed to fetch places:', err);
            return [];
        }
    },

    async fetchPlaceById(id) {
        try {
            const res = await fetch(`/api/places/${id}`);
            return await res.json();
        } catch (err) {
            console.error('Failed to fetch place details:', err);
            return null;
        }
    },

    async generateItinerary(payload) {
        try {
            const res = await fetch('/api/generate-itinerary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return await res.json();
        } catch (err) {
            console.error('Failed to generate itinerary:', err);
            return null;
        }
    },

    async fetchItineraryById(id) {
        try {
            const res = await fetch(`/api/itineraries/${id}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            console.error('Failed to fetch itinerary:', err);
            return null;
        }
    }
};
