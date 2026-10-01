const Quote = require('../models/Quote');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/quotes  { book, text, page? }
exports.createQuote = asyncHandler(async (req, res) => {
  const { book, text, page } = req.body;
  const quote = await Quote.create({ book, text, page, user: req.user._id });
  res.status(201).json(quote);
});

// GET /api/quotes?book=<id>
exports.getQuotes = asyncHandler(async (req, res) => {
  const filter = req.query.book ? { book: req.query.book } : {};
  res.json(await Quote.find(filter).populate('user', 'name').populate('book', 'title').sort('-createdAt'));
});

// DELETE /api/quotes/:id  (author only)
exports.deleteQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findById(req.params.id);
  if (!quote) return res.status(404).json({ message: 'Quote not found' });
  if (!quote.user.equals(req.user._id)) return res.status(403).json({ message: 'Not your quote' });
  await quote.deleteOne();
  res.json({ message: 'Quote deleted' });
});
