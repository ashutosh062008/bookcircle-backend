const Meeting = require('../models/Meeting');
const asyncHandler = require('../utils/asyncHandler');
const sendPush = require('../utils/notify');
const { requireMember } = require('../utils/clubAccess');

// POST /api/meetings
exports.createMeeting = asyncHandler(async (req, res) => {
  const { club, book, title, agenda, location, scheduledAt } = req.body;
  const c = await requireMember(club, req.user._id);
  const meeting = await Meeting.create({ club, book, title, agenda, location, scheduledAt, createdBy: req.user._id });

  // fire-and-forget push + realtime event to the club
  sendPush(c.members.filter((m) => !m.equals(req.user._id)), {
    title: `New meeting: ${title}`,
    body: `Scheduled for ${new Date(scheduledAt).toLocaleString()}`,
    data: { type: 'meeting', meetingId: meeting._id, clubId: club },
  });
  const io = req.app.get('io');
  if (io) io.to(`club:${club}`).emit('meeting:new', meeting);

  res.status(201).json(meeting);
});

// GET /api/meetings?upcoming=true
exports.getMeetings = asyncHandler(async (req, res) => {
  const filter = req.query.upcoming === 'true' ? { scheduledAt: { $gte: new Date() } } : {};
  res.json(await Meeting.find(filter).populate('club', 'name').populate('book', 'title').sort('scheduledAt'));
});

// GET /api/meetings/club/:id
exports.getClubMeetings = asyncHandler(async (req, res) => {
  res.json(await Meeting.find({ club: req.params.id }).populate('book', 'title').sort('scheduledAt'));
});
