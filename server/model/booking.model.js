// models/booking.model.js
const mongoose = require("mongoose");

const ticketSubSchema = new mongoose.Schema({
  sectionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  sectionName: String,
  seatNumber: String, // "A1"
  price: Number,
}, { _id: false });

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
            index: true,
        },
        tickets: { type: [ticketSubSchema], default: [] },
        totalAmount: { type: Number, required: true },
        dynamicMultiplier: { type: Number, default: 1.0 },
        status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED"], default: "CONFIRMED" },
        paymentId: { type: String },
        qrCode: { type: String }, // Base64 or URL
    },
    {
        timestamps: true,
    }
);

// Index on createdAt for fast queries for recent activity
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;