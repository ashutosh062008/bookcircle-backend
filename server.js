require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initFirebase } = require('./src/config/firebase');
const initChat = require('./src/sockets/chat');
const startReminderJob = require('./src/jobs/meetingReminders');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  initFirebase();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_ORIGIN || '*' },
  });
  app.set('io', io);
  initChat(io);
  startReminderJob();

  server.listen(PORT, () => {
    console.log(`BookCircle API running on http://localhost:${PORT}`);
    console.log(`Swagger docs:        http://localhost:${PORT}/api-docs`);
  });
})();
