# BookCircle - Book Club Organizer (Backend)

Case Study 44: Backend Development - **Node.js, Express.js & MongoDB**.
Users create/join book clubs, vote on books, track reading progress, schedule meetings, chat in real time (Socket.io) and get push reminders (Firebase Cloud Messaging).

## Tech stack
- **Node.js + Express** - REST API, modular routes & controllers
- **MongoDB + Mongoose** - clubs, books, users, votes, progress, meetings, messages, quotes
- **Auth** - JWT (email/password) + Firebase Auth (ID-token exchange)
- **Socket.io** - real-time club chat (messages saved to DB)
- **Firebase Admin (FCM)** - push notifications + automatic meeting reminders (node-cron)
- **express-validator** - request validation middleware
- **Swagger UI** + **Postman collection** - API documentation

## Setup
```bash
git clone <your-repo-url>
cd bookcircle-backend
npm install
cp .env.example .env      # then edit values
npm run dev               # or: npm start
```
Requires Node 18+ and a running MongoDB (local or MongoDB Atlas - put the URI in `MONGO_URI`).

- API: http://localhost:5000
- Swagger docs: http://localhost:5000/api-docs
- Postman: import `docs/BookCircle.postman_collection.json` (register/login auto-saves the JWT into `{{token}}`)

### Firebase (optional)
The API runs without Firebase; push notifications and `/api/auth/firebase` are simply disabled.
To enable: Firebase Console -> Project settings -> Service accounts -> *Generate new private key*, save as `serviceAccountKey.json` in the project root (git-ignored) and set `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env` (or paste the JSON into `FIREBASE_SERVICE_ACCOUNT_JSON` on Render/Heroku).
The mobile/web client sends its device token to `PUT /api/auth/fcm-token`.

## Project structure
```
server.js                  entry: DB, Firebase, HTTP + Socket.io, cron
src/
  app.js                   Express app, middleware, route mounting, Swagger
  config/                  db.js, firebase.js
  models/                  User, Club, Book, Vote, Progress, Meeting, Message, Quote
  controllers/             business logic per resource
  routes/                  route definitions + validation rules
  middleware/              auth (JWT), validate, error handling
  sockets/chat.js          Socket.io chat
  jobs/meetingReminders.js cron: reminder push 30 min before a meeting
  utils/                   notify (FCM), token, helpers
docs/                      swagger.yaml, Postman collection
```

## API endpoints
All routes except register/login/firebase need `Authorization: Bearer <token>`.

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/firebase`, `GET /api/auth/me`, `PUT /api/auth/fcm-token` |
| Clubs | `GET /api/clubs`, `GET /api/clubs/:id`, `POST /api/clubs`, `PUT /api/clubs/:id`, `DELETE /api/clubs/:id`, `POST /api/clubs/:id/join`, `POST /api/clubs/:id/leave`, `GET /api/clubs/:id/messages` |
| Books | `GET /api/books`, `GET /api/books/:id`, `POST /api/books`, `PUT /api/books/:id`, `DELETE /api/books/:id` |
| Votes | `POST /api/votes`, `GET /api/votes`, `GET /api/votes/book/:id` |
| Progress | `POST /api/progress`, `GET /api/progress`, `GET /api/progress/user/:id` |
| Meetings | `POST /api/meetings`, `GET /api/meetings`, `GET /api/meetings/club/:id` |
| Notifications | `POST /api/notifications/send` |
| Quotes (bonus) | `POST /api/quotes`, `GET /api/quotes`, `DELETE /api/quotes/:id` |

### Example user flow
1. `POST /api/votes` -> vote for a book
2. `POST /api/progress` -> mark pages read
3. `POST /api/meetings` -> schedule discussion (members get a push + realtime `meeting:new`)

## Real-time chat (Socket.io)
```js
const socket = io('http://localhost:5000', { auth: { token: JWT } });
socket.emit('club:join', clubId);
socket.emit('chat:message', { clubId, text: 'Finished chapter 3!' });
socket.on('chat:message', (m) => console.log(m.sender.name, m.text));
```
Events: `club:join`, `club:leave`, `chat:message`, `chat:typing` (client -> server); `chat:message`, `chat:typing`, `chat:system`, `chat:error`, `meeting:new` (server -> client).

## Design notes
- Passwords hashed with bcrypt; JWT verified in `protect` middleware.
- Unique indexes: one vote per user per book, one progress record per user per book (upsert).
- Only the club owner can edit/delete a club; only the book's adder or club owner can edit/delete a book.
- Validation errors return `400` with per-field messages; duplicates `409`; unified error handler.

## Deployment (Render)
1. Push to GitHub. 2. New **Web Service** on Render -> connect repo.
3. Build: `npm install`, Start: `npm start`.
4. Add env vars: `MONGO_URI` (Atlas), `JWT_SECRET`, `CLIENT_ORIGIN`, optionally `FIREBASE_SERVICE_ACCOUNT_JSON`.
