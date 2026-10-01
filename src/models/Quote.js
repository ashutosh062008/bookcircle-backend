const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    page: { type: Number, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quote', quoteSchema);
