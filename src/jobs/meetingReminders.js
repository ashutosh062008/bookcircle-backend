const cron = require('node-cron');
const Meeting = require('../models/Meeting');
const Club = require('../models/Club');
const sendPush = require('../utils/notify');

// Every minute: push a reminder for meetings starting within the next 30 minutes.
module.exports = function startReminderJob() {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const soon = new Date(now.getTime() + 30 * 60 * 1000);
      const due = await Meeting.find({ reminderSent: false, scheduledAt: { $gte: now, $lte: soon } });
      for (const m of due) {
        const club = await Club.findById(m.club).select('members name');
        if (club) {
          await sendPush(club.members, {
            title: `Reminder: ${m.title}`,
            body: `${club.name} meets at ${m.scheduledAt.toLocaleTimeString()}`,
            data: { type: 'reminder', meetingId: m._id },
          });
        }
        m.reminderSent = true;
        await m.save();
      }
    } catch (err) {
      console.error('Reminder job error:', err.message);
    }
  });
  console.log('Meeting reminder job scheduled');
};
