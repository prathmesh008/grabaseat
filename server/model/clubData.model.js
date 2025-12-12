// models/event.model.js
const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "VIP", "Gold", "Silver"
  price: { type: Number, required: true },
  rows: { type: Number, required: true },
  cols: { type: Number, required: true },
  bookedSeats: { type: [String], default: [] } // e.g., ["A1", "A2"]
});

const eventSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, default: "General" }, // Concert, Workshop, etc.
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, default: "College Auditorium" },

    // Media
    poster: { // Main display image
      data: Buffer,
      contentType: String,
    },
    banner: { // Wide image for carousel
      data: Buffer,
      contentType: String,
    },

    // Seat Layout & Pricing
    sections: { type: [sectionSchema], default: [] },

    // Dynamic Pricing & Stats
    basePrice: { type: Number, required: true }, // The starting price
    minPrice: { type: Number, default: 0 },      // Lowest it can go
    maxPrice: { type: Number, default: 1000 },   // Highest it can go
    totalCapacity: { type: Number, required: true },
    soldCount: { type: Number, default: 0 },

    // Metadata
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"], default: "UPCOMING" },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate totalSeats
eventSchema.pre('save', function (next) {
  if (this.sections && this.sections.length > 0) {
    this.totalSeats = this.sections.reduce((acc, sec) => acc + (sec.rows * sec.cols), 0);
  } else {
    this.totalSeats = 0;
  }
  next();
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;