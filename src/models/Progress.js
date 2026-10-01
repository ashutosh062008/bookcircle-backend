const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    pagesRead: { type: Number, required: true, min: 0 },
    percent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
