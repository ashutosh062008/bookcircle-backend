const Book = require('../models/Book');
const Club = require('../models/Club');
const asyncHandler = require('../utils/asyncHandler');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/books?club=<id>&q=<search>
exports.getBooks = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.club) filter.club = req.query.club;
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(String(req.query.q)), 'i');
    filter.$or = [{ title: rx }, { author: rx }];
  }
  res.json(await Book.find(filter).populate('addedBy', 'name').sort('-createdAt'));
});

// GET /api/books/:id
exports.getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).populate('addedBy', 'name');
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

// POST /api/books
exports.createBook = asyncHandler(async (req, res) => {
  const { title, author, description, totalPages, club } = req.body;
  if (club) {
    const c = await Club.findById(club);
    if (!c) return res.status(404).json({ message: 'Club not found' });
    if (!c.members.some((m) => m.equals(req.user._id))) return res.status(403).json({ message: 'Join the club before adding books' });
  }
  const book = await Book.create({ title, author, description, totalPages, club, addedBy: req.user._id });
  res.status(201).json(book);
});

// only the person who added the book or the club owner may modify it
async function canModify(book, user) {
  if (book.addedBy.equals(user._id)) return true;
  if (book.club) {
    const club = await Club.findById(book.club);
    return !!club && club.owner.equals(user._id);
  }
  return false;
}

// PUT /api/books/:id
exports.updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (!(await canModify(book, req.user))) return res.status(403).json({ message: 'Not allowed to edit this book' });
  ['title', 'author', 'description', 'totalPages'].forEach((f) => { if (req.body[f] !== undefined) book[f] = req.body[f]; });
  await book.save();
  res.json(book);
});

// DELETE /api/books/:id
exports.deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (!(await canModify(book, req.user))) return res.status(403).json({ message: 'Not allowed to delete this book' });
  await book.deleteOne();
  res.json({ message: 'Book deleted' });
});
