const Progress = require('../models/Progress');
const Book = require('../models/Book');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/progress  { book, pagesRead }  (upsert - one record per user per book)
exports.updateProgress = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.body.book);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const pagesRead = Number(req.body.pagesRead);
  if (book.totalPages && pagesRead > book.totalPages) {
    return res.status(400).json({ message: `pagesRead cannot exceed totalPages (${book.totalPages})` });
  }
  const percent = book.totalPages ? Math.round((pagesRead / book.totalPages) * 100) : 0;
  const progress = await Progress.findOneAndUpdate(
    { user: req.user._id, book: book._id },
    { pagesRead, percent },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(progress);
});

// GET /api/progress?book=<id>
exports.getProgress = asyncHandler(async (req, res) => {
  const filter = req.query.book ? { book: req.query.book } : {};
  res.json(await Progress.find(filter).populate('user', 'name').populate('book', 'title totalPages'));
});

// GET /api/progress/user/:id
exports.getUserProgress = asyncHandler(async (req, res) => {
  res.json(await Progress.find({ user: req.params.id }).populate('book', 'title author totalPages'));
});
