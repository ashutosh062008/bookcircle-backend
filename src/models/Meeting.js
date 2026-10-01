const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    title: { type: String, required: true, trim: true },
    agenda: { type: String, default: '' },
    location: { type: String, default: 'Online' },
    scheduledAt: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meeting', meetingSchema);
