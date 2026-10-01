const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const { admin, isFirebaseEnabled } = require('../config/firebase');

const userPayload = (u) => ({ _id: u._id, name: u.name, email: u.email });

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) return res.status(409).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, password });
  res.status(201).json({ user: userPayload(user), token: generateToken(user._id) });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ user: userPayload(user), token: generateToken(user._id) });
});

// POST /api/auth/firebase  { idToken }  -> exchanges a Firebase ID token for our JWT
exports.firebaseLogin = asyncHandler(async (req, res) => {
  if (!isFirebaseEnabled()) return res.status(503).json({ message: 'Firebase is not configured on the server' });
  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(req.body.idToken);
  } catch {
    return res.status(401).json({ message: 'Invalid Firebase ID token' });
  }
  let user = await User.findOne({ $or: [{ firebaseUid: decoded.uid }, { email: decoded.email }] });
  if (!user) {
    user = await User.create({ name: decoded.name || decoded.email.split('@')[0], email: decoded.email, firebaseUid: decoded.uid });
  } else if (!user.firebaseUid) {
    user.firebaseUid = decoded.uid;
    await user.save();
  }
  res.json({ user: userPayload(user), token: generateToken(user._id) });
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => res.json({ user: userPayload(req.user) }));

// PUT /api/auth/fcm-token  { fcmToken }  -> store device token for push notifications
exports.saveFcmToken = asyncHandler(async (req, res) => {
  req.user.fcmToken = req.body.fcmToken;
  await req.user.save();
  res.json({ message: 'FCM token saved' });
});
