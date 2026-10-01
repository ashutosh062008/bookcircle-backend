const User = require('../models/User');
const { admin, isFirebaseEnabled } = require('../config/firebase');

/**
 * Send a push notification to a list of user ids via Firebase Cloud Messaging.
 * Returns { sent, failed, skipped } - never throws (notifications must not break the API).
 */
module.exports = async function sendPush(userIds, { title, body, data = {} }) {
  if (!isFirebaseEnabled()) return { sent: 0, failed: 0, skipped: userIds.length, reason: 'Firebase not configured' };

  const users = await User.find({ _id: { $in: userIds }, fcmToken: { $ne: null } }).select('fcmToken');
  const tokens = users.map((u) => u.fcmToken);
  if (!tokens.length) return { sent: 0, failed: 0, skipped: userIds.length, reason: 'No device tokens' };

  try {
    const res = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    });
    return { sent: res.successCount, failed: res.failureCount, skipped: userIds.length - tokens.length };
  } catch (err) {
    console.error('FCM error:', err.message);
    return { sent: 0, failed: tokens.length, skipped: 0, reason: err.message };
  }
};
