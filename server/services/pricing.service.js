const axios = require('axios');

const FLASK_API_URL = 'http://127.0.0.1:5001/predict';

exports.getDynamicPricing = async (event) => {
    try {
        if (!event || !event.date) {
            console.log("PricingService: Invalid event data, returning default.");
            return { multiplier: 1.0, predictedBookings: 0, source: 'default' };
        }

        const now = new Date();
        const eventDate = new Date(event.date);

        // 1. Calculate 'hour'
        let hour = 18; // Default
        if (event.time && event.time.includes(':')) {
            hour = parseInt(event.time.split(':')[0], 10);
        } else {
            hour = eventDate.getHours() || 18;
        }

        // 2. Calculate 'isWeekend'
        const day = eventDate.getDay();
        const isWeekend = (day === 0 || day === 6) ? 1 : 0;

        // 3. Calculate 'daysUntilEvent'
        const diffTime = eventDate - now;
        const daysUntilEvent = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // If event is in past or today, days = 0.

        // 4. Calculate 'occupancyRate'
        // Total seats in all sections
        let totalSeats = 0;
        let bookedSeats = 0;

        if (event.sections && event.sections.length > 0) {
            event.sections.forEach(section => {
                totalSeats += (section.rows * section.cols);
                bookedSeats += (section.bookedSeats ? section.bookedSeats.length : 0);
            });
        }

        const occupancyRate = totalSeats > 0 ? (bookedSeats / totalSeats) : 0;

        console.log(`Calling Advanced AI Service:
            Event: ${event.title}
            Hour: ${hour}
            Weekend: ${isWeekend}
            DaysLeft: ${daysUntilEvent}
            Occupancy: ${occupancyRate.toFixed(2)} (${bookedSeats}/${totalSeats})
        `);

        // Call Flask API with new features
        const response = await axios.post(FLASK_API_URL, {
            hour,
            isWeekend,
            daysUntilEvent,
            occupancyRate
        });

        if (response.data && response.data.multiplier) {
            return {
                multiplier: response.data.multiplier,
                predictedBookings: -1, // Model now returns multiplier directly
                source: 'ai_v2'
            };
        }

        throw new Error("Invalid response from AI service");

    } catch (error) {
        console.error("AI Service Error (Fallback Mode On):", error.message);

        // --- FALLBACK LOGIC (Updated to mirror AI) ---
        let multiplier = 1.0;

        // ... (Re-calc vars for fallback scope) ...
        const eventDateFallback = new Date(event.date);
        const day = eventDateFallback.getDay();
        const isWeekend = (day === 0 || day === 6);

        // Simple Rules
        if (isWeekend) multiplier += 0.2;

        // Occupancy fallback (approximate if we can't access deep object, but we have event opbject)
        // Assume medium occupancy if unknown

        return {
            multiplier: parseFloat(multiplier.toFixed(2)),
            predictedBookings: -1,
            source: 'fallback'
        };
    }
};
