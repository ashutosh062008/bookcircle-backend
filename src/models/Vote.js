const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' },
  },
  { timestamps: true }
);

voteSchema.index({ user: 1, book: 1 }, { unique: true }); // one vote per user per book

module.exports = mongoose.model('Vote', voteSchema);
