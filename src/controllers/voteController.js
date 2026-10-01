const mongoose = require('mongoose');
const Vote = require('../models/Vote');
const Book = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/votes  { book }
exports.castVote = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.body.book);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const vote = await Vote.create({ user: req.user._id, book: book._id, club: book.club });
  res.status(201).json(vote);
});

// GET /api/votes?club=<id>  -> leaderboard: vote count per book
exports.getVotes = asyncHandler(async (req, res) => {
  const match = {};
  if (req.query.club) match.club = new mongoose.Types.ObjectId(req.query.club);
  const tally = await Vote.aggregate([
    { $match: match },
    { $group: { _id: '$book', votes: { $sum: 1 } } },
    { $sort: { votes: -1 } },
    { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
    { $unwind: '$book' },
    { $project: { _id: 0, bookId: '$_id', title: '$book.title', author: '$book.author', votes: 1 } },
  ]);
  res.json(tally);
});

// GET /api/votes/book/:id  -> votes for a single book
exports.getVotesForBook = asyncHandler(async (req, res) => {
  const votes = await Vote.find({ book: req.params.id }).populate('user', 'name');
  res.json({ book: req.params.id, count: votes.length, voters: votes.map((v) => v.user) });
});
