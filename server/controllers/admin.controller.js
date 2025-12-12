// controllers/admin.controller.js
const db = require("../model");
const Event = db.event;
const Booking = db.booking;
const User = db.user;

/** Utility */
const safe = (v) => (typeof v === "number" && !isNaN(v) ? v : 0);

/* ============================================================================
   1. DASHBOARD ANALYTICS
============================================================================ */
exports.getAnalytics = async (req, res) => {
    try {
        const totalEvents = await Event.countDocuments();
        const totalBookings = await Booking.countDocuments();

        const revenueAgg = await Booking.aggregate([
            { $match: { status: "CONFIRMED" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        const totalRevenue = revenueAgg.length > 0 ? safe(revenueAgg[0].total) : 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeEventsToday = await Event.countDocuments({
            date: { $gte: today },
            status: "UPCOMING"
        });

        res.status(200).send({
            totalEvents,
            totalBookings,
            totalRevenue,
            activeEventsToday,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err.message });
    }
};

/* ============================================================================
   2. ADMIN EVENTS
============================================================================ */
exports.getAdminEvents = async (req, res) => {
    try {
        // Fetch ALL events (Legacy behavior)
        const events = await Event.find({})
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).send(events);
    } catch (err) {
        console.error("Get Events Error:", err);
        res.status(500).send({ message: "Failed to fetch events" });
    }
};

/* ============================================================================
   3. UPCOMING EVENTS
============================================================================ */
exports.getUpcomingEvents = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const next14 = new Date(today);
        next14.setDate(today.getDate() + 14);

        const events = await Event.find({
            date: { $gte: today, $lte: next14 },
            status: "UPCOMING",
        })
            .sort({ date: 1 })
            .limit(5);

        res.status(200).send(events);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

/* ============================================================================
   4. RECENT REGISTRATIONS
============================================================================ */
/* ============================================================================
   4. RECENT REGISTRATIONS
============================================================================ */
exports.getRecentRegistrations = async (req, res) => {
    try {
        // Fetch ALL recent bookings (Legacy behavior)
        const bookings = await Booking.find({ status: { $in: ["CONFIRMED", "PENDING"] } })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("user", "name email")
            .populate("event", "title category");

        const formatted = bookings.map((b) => ({
            id: b._id,
            userName: b.user ? b.user.name : "Deleted User",
            userEmail: b.user ? b.user.email : "N/A",
            eventName: b.event ? b.event.title : "Event Removed",
            seats: b.tickets.length,
            amount: safe(b.totalAmount),
            timestamp: b.createdAt,
        }));

        res.status(200).send(formatted);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

/* ============================================================================
   5. CHART DATA — FINAL VERSION (FIXED: Timezone Aware & Category Lookup)
============================================================================ */
exports.getChartData = async (req, res) => {
    try {
        /* --------------------------------------------
           A. Revenue Trend (Last 7 Days - IST Aware)
        -------------------------------------------- */
        const queryStartDate = new Date();
        queryStartDate.setDate(queryStartDate.getDate() - 10);

        const rawTrend = await Booking.aggregate([
            { $match: { status: { $in: ["CONFIRMED", "PENDING"] }, createdAt: { $gte: queryStartDate } } }, // Include PENDING
            {
                $group: {
                    // Group by IST Date String (+5:30)
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: "+05:30"
                        }
                    },
                    revenue: { $sum: "$totalAmount" },
                    count: { $sum: 1 },
                },
            },
        ]);

        const revenueTrend = [];
        const IST_OFFSET = 5.5 * 60 * 60 * 1000;
        const now = new Date();
        const nowIST = new Date(now.getTime() + IST_OFFSET);

        for (let i = 0; i < 7; i++) {
            const d = new Date(nowIST.getTime());
            d.setDate(d.getDate() - (6 - i));
            const key = d.toISOString().split("T")[0];

            const found = rawTrend.find((r) => r._id === key);
            revenueTrend.push({
                date: key,
                revenue: found ? safe(found.revenue) : 0,
                bookings: found ? safe(found.count) : 0,
            });
        }

        /* --------------------------------------------
           B. Category Distribution (Improved Lookup)
        -------------------------------------------- */
        console.log("Looking up events from collection:", Event.collection.name);

        const rawCategory = await Booking.aggregate([
            { $match: { status: { $in: ["CONFIRMED", "PENDING"] } } }, // Include PENDING
            {
                $lookup: {
                    from: "events", // Hardcoded 'events'
                    localField: "event",
                    foreignField: "_id",
                    as: "eventDetails",
                },
            },
            { $unwind: { path: "$eventDetails", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ["$eventDetails.category", "General"] },
                    revenue: { $sum: "$totalAmount" },
                    bookings: { $sum: 1 },
                },
            },
            { $sort: { revenue: -1 } },
        ]);

        const categoryDistribution = rawCategory.map((c) => ({
            category: c._id || "General",
            revenue: safe(c.revenue),
            bookings: safe(c.bookings),
        }));

        res.status(200).send({
            revenueTrend,
            categoryDistribution
        });

        console.log("✅ Revenue Trend From Backend:", revenueTrend);
        console.log("✅ Category Distribution From Backend:", categoryDistribution);
    } catch (err) {
        console.error("Chart Data Error:", err);
        res.status(500).send({ message: err.message });
    }
};