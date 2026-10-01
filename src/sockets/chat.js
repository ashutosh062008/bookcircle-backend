const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Club = require('../models/Club');
const Message = require('../models/Message');

/**
 * Socket.io club chat.
 * Connect with:  io(URL, { auth: { token: '<JWT>' } })
 * Client -> server:  'club:join' (clubId), 'club:leave' (clubId), 'chat:message' ({ clubId, text }), 'chat:typing' (clubId)
 * Server -> client:  'chat:message', 'chat:typing', 'chat:system', 'chat:error', 'meeting:new'
 */
module.exports = function initChat(io) {
  io.use(async (socket, next) => {
    try {
      const decoded = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const isMember = async (clubId) => {
      const club = await Club.findById(clubId).select('members');
      return !!club && club.members.some((m) => m.equals(socket.user._id));
    };

    socket.on('club:join', async (clubId) => {
      try {
        if (!(await isMember(clubId))) return socket.emit('chat:error', 'Not a member of this club');
        socket.join(`club:${clubId}`);
        socket.to(`club:${clubId}`).emit('chat:system', `${socket.user.name} joined the chat`);
      } catch (err) {
        socket.emit('chat:error', err.message);
      }
    });

    socket.on('club:leave', (clubId) => socket.leave(`club:${clubId}`));

    socket.on('chat:message', async ({ clubId, text } = {}) => {
      try {
        if (!text || !text.trim()) return;
        if (!(await isMember(clubId))) return socket.emit('chat:error', 'Not a member of this club');
        const msg = await Message.create({ club: clubId, sender: socket.user._id, text });
        io.to(`club:${clubId}`).emit('chat:message', {
          _id: msg._id, club: clubId, text: msg.text, createdAt: msg.createdAt,
          sender: { _id: socket.user._id, name: socket.user.name },
        });
      } catch (err) {
        socket.emit('chat:error', err.message);
      }
    });

    socket.on('chat:typing', (clubId) => {
      socket.to(`club:${clubId}`).emit('chat:typing', { userId: socket.user._id, name: socket.user.name });
    });
  });
};
