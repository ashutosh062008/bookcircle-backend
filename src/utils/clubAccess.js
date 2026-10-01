const Club = require('../models/Club');

// Loads a club and checks the user is a member. Throws 404/403 style errors.
exports.requireMember = async (clubId, userId) => {
  const club = await Club.findById(clubId);
  if (!club) throw Object.assign(new Error('Club not found'), { status: 404 });
  if (!club.members.some((m) => m.equals(userId))) {
    throw Object.assign(new Error('You are not a member of this club'), { status: 403 });
  }
  return club;
};
