const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let enabled = false;

function initFirebase() {
  try {
    let credentials = null;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const p = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      if (fs.existsSync(p)) credentials = JSON.parse(fs.readFileSync(p, 'utf8'));
    }
    if (!credentials) {
      console.warn('Firebase not configured - push notifications & Firebase login disabled');
      return;
    }
    admin.initializeApp({ credential: admin.credential.cert(credentials) });
    enabled = true;
    console.log('Firebase Admin initialised');
  } catch (err) {
    console.warn('Firebase init failed:', err.message);
  }
}

const isFirebaseEnabled = () => enabled;

module.exports = { admin, initFirebase, isFirebaseEnabled };
