const Club = require('../models/Club');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const { requireMember } = require('../utils/clubAccess');

// GET /api/clubs
exports.getClubs = asyncHandler(async (req, res) => {
  const filter = req.query.mine === 'true' ? { members: req.user._id } : {};
  const clubs = await Club.find(filter).populate('owner', 'name email').sort('-createdAt');
  res.json(clubs);
});

// GET /api/clubs/:id
exports.getClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id).populate('owner members', 'name email');
  if (!club) return res.status(404).json({ message: 'Club not found' });
  res.json(club);
});

// POST /api/clubs
exports.createClub = asyncHandler(async (req, res) => {
  const club = await Club.create({
    name: req.body.name,
    description: req.body.description,
    owner: req.user._id,
    members: [req.user._id],
  });
  res.status(201).json(club);
});

// PUT /api/clubs/:id  (owner only)
exports.updateClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) return res.status(404).json({ message: 'Club not found' });
  if (!club.owner.equals(req.user._id)) return res.status(403).json({ message: 'Only the club owner can edit it' });
  if (req.body.name !== undefined) club.name = req.body.name;
  if (req.body.description !== undefined) club.description = req.body.description;
  await club.save();
  res.json(club);
});

// DELETE /api/clubs/:id  (owner only)
exports.deleteClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) return res.status(404).json({ message: 'Club not found' });
  if (!club.owner.equals(req.user._id)) return res.status(403).json({ message: 'Only the club owner can delete it' });
  await club.deleteOne();
  res.json({ message: 'Club deleted' });
});

// POST /api/clubs/:id/join
exports.joinClub = asyncHandler(async (req, res) => {
  const club = await Club.findByIdAndUpdate(req.params.id, { $addToSet: { members: req.user._id } }, { new: true });
  if (!club) return res.status(404).json({ message: 'Club not found' });
  res.json({ message: 'Joined club', members: club.members.length });
});

// POST /api/clubs/:id/leave
exports.leaveClub = asyncHandler(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) return res.status(404).json({ message: 'Club not found' });
  if (club.owner.equals(req.user._id)) return res.status(400).json({ message: 'Owner cannot leave; delete the club instead' });
  club.members.pull(req.user._id);
  await club.save();
  res.json({ message: 'Left club' });
});

// GET /api/clubs/:id/messages  -> chat history (members only)
exports.getMessages = asyncHandler(async (req, res) => {
  await requireMember(req.params.id, req.user._id);
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const messages = await Message.find({ club: req.params.id }).sort('-createdAt').limit(limit).populate('sender', 'name');
  res.json(messages.reverse());
});
