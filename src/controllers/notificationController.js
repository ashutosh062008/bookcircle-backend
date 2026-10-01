const Club = require('../models/Club');
const asyncHandler = require('../utils/asyncHandler');
const sendPush = require('../utils/notify');

// POST /api/notifications/send  { title, body, clubId? , userIds? }
exports.send = asyncHandler(async (req, res) => {
  const { title, body, clubId, userIds } = req.body;
  let targets = userIds || [];
  if (clubId) {
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    if (!club.members.some((m) => m.equals(req.user._id))) return res.status(403).json({ message: 'You are not a member of this club' });
    targets = club.members;
  }
  if (!targets.length) return res.status(400).json({ message: 'Provide clubId or userIds' });
  const result = await sendPush(targets, { title, body, data: { type: 'custom' } });
  res.json({ message: 'Notification request processed', ...result });
});
