const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const c = require('../controllers/notificationController');

router.post('/send', protect,
  [body('title').trim().notEmpty().withMessage('Title is required'),
   body('body').trim().notEmpty().withMessage('Body is required'),
   body('clubId').optional().isMongoId(),
   body('userIds').optional().isArray()],
  validate, c.send);

module.exports = router;
