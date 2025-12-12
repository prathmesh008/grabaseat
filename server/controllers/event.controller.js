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
        // Fetch ALL events (including COMPLETED/expired) so the user can see everything in the DB
        let events = await Event.find({}).sort({ date: 1 });

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

        // Debug: Check if banner exists
        if (eventResponse.banner && eventResponse.banner.data) {
            // Buffer data might come as a Buffer object or { type: 'Buffer', data: [...] } from toObject()
            // Depending on Mongoose version, accessing .length directly on the object might work if it's a raw Buffer, 
            // otherwise check .data.length or similar if it's the JSON representation.
            const size = eventResponse.banner.data.length || (eventResponse.banner.data.buffer ? eventResponse.banner.data.buffer.byteLength : 'Unknown');
            console.log(`Event ${eventResponse._id} has Banner data. Size: ${size}`);
        } else {
            console.log(`Event ${eventResponse._id} missing Banner data.`);
        }

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
