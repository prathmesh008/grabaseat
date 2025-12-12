const mongoose = require('mongoose');

const PriceLockSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: String, required: true }, // Or User ObjectId if you have auth
  lockedPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// THIS IS CRITICAL: Auto-delete this document after 15 minutes (900 seconds)
PriceLockSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

module.exports = mongoose.model('PriceLock', PriceLockSchema);