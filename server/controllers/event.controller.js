const db = require("../model");
const Event = db.event;
const Booking = db.booking;

exports.createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            date,
            time,
            location,
            sections,
        } = req.body;

        const event = new Event({
            title,
            description,
            category: category || "General",
            date: new Date(date),
            time,
            location,
            sections: JSON.parse(sections),
            createdBy: req.userId,
        });

        if (req.files.poster) {
            event.poster = {
                data: req.files.poster[0].buffer,
                contentType: req.files.poster[0].mimetype,
            };
        }

        if (req.files.banner) {
            event.banner = {
                data: req.files.banner[0].buffer,
                contentType: req.files.banner[0].mimetype,
            };
        }

        await event.save();
        res.status(201).send(event);
    } catch (err) {
        console.error("Create Event Error:", err);
        res.status(500).send({ message: err.message });
    }
};

exports.getAllEvents = async (req, res) => {
    try {
        // Fetch ALL events but EXCLUDE both banner AND poster data to make the response tiny and fast
        let events = await Event.find({}).sort({ date: 1 }).select('-banner -poster');

        const now = new Date();
        const updates = [];

        for (const event of events) {
            const eventDateTime = new Date(event.date);
            if (event.time && event.time.includes(':')) {
                const [hours, minutes] = event.time.split(':').map(Number);
                eventDateTime.setHours(hours, minutes, 0, 0);
            }

            // If past date, mark COMPLETED in background, but still return it to frontend
            if (now > eventDateTime && event.status !== "COMPLETED") {
                event.status = "COMPLETED";
                updates.push(event.save());
            }
        }

        // Execute status updates in parallel
        if (updates.length > 0) {
            Promise.all(updates).catch(err => console.error("Error auto-completing events:", err));
        }

        res.status(200).send(events);
    } catch (error) {
        res.status(500).send({ message: "Error fetching events" });
    }
};

exports.getEventPoster = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).select('poster');
        if (!event || !event.poster || !event.poster.data) {
            // Return a 404 or a default placeholder if needed
            return res.status(404).send('Poster not found');
        }

        res.set('Content-Type', event.poster.contentType || 'image/jpeg');
        res.send(event.poster.data);
    } catch (error) {
        res.status(500).send({ message: "Error fetching poster" });
    }
};

exports.getEventBanner = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).select('banner');
        if (!event || !event.banner || !event.banner.data) {
            return res.status(404).send('Banner not found');
        }

        res.set('Content-Type', event.banner.contentType || 'image/jpeg');
        res.send(event.banner.data);
    } catch (error) {
        res.status(500).send({ message: "Error fetching banner" });
    }
};

exports.getEventById = async (req, res) => {
    try {
        // const { getDynamicPricing } = require("../services/pricing.service");
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).send({ message: "Event not found" });

        // Calculate dynamic pricing (DISABLED)
        // const pricingData = await getDynamicPricing(event);
        console.log("Dynamic Pricing Disabled for getEventById. Defaulting to 1x.");

        // Convert to object and append dynamic (runtime) fields
        const eventResponse = event.toObject();
        eventResponse.currentMultiplier = 1; // Default
        eventResponse.predictedDemand = 0; // Default

        // Optimizing payload: Remove heavy buffers, add flags
        eventResponse.hasBanner = !!(eventResponse.banner && eventResponse.banner.data);
        eventResponse.hasPoster = !!(eventResponse.poster && eventResponse.poster.data);

        // Remove the heavy data from the JSON response
        if (eventResponse.banner) delete eventResponse.banner.data;
        if (eventResponse.poster) delete eventResponse.poster.data;

        res.status(200).send(eventResponse);
    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).send({ message: "Error fetching event" });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.status(200).send({ message: "Event deleted" });
    } catch (error) {
        res.status(500).send({ message: "Error deleting event" });
    }
};

exports.getEventBanners = async (req, res) => {
    try {
        const events = await Event.find({ status: "UPCOMING" })
            .sort({ createdAt: -1 })
            .limit(4)
            .select("banner title category date time");

        if (events.length < 1) {
            return res.status(200).send([]);
        }
        res.status(200).send(events);
    } catch (error) {
        res.status(500).send({ message: "Error fetching banners" });
    }
};
