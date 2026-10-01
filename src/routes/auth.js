const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const c = require('../controllers/authController');

router.post('/register',
  [body('name').trim().notEmpty().withMessage('Name is required'),
   body('email').isEmail().withMessage('Valid email required'),
   body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  validate, c.register);

router.post('/login',
  [body('email').isEmail().withMessage('Valid email required'),
   body('password').notEmpty().withMessage('Password is required')],
  validate, c.login);

router.post('/firebase', [body('idToken').notEmpty().withMessage('idToken required')], validate, c.firebaseLogin);
router.get('/me', protect, c.me);
router.put('/fcm-token', protect, [body('fcmToken').notEmpty().withMessage('fcmToken required')], validate, c.saveFcmToken);

module.exports = router;
