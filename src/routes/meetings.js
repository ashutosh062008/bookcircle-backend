const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const c = require('../controllers/meetingController');

router.use(protect);
router.post('/',
  [body('club').isMongoId().withMessage('Valid club id required'),
   body('title').trim().notEmpty().withMessage('Title is required'),
   body('scheduledAt').isISO8601().withMessage('scheduledAt must be an ISO date'),
   body('book').optional().isMongoId()],
  validate, c.createMeeting);
router.get('/', c.getMeetings);
router.get('/club/:id', [param('id').isMongoId()], validate, c.getClubMeetings);

module.exports = router;
