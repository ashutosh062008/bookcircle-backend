const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const c = require('../controllers/clubController');

const id = param('id').isMongoId().withMessage('Invalid club id');

router.use(protect);

router.route('/')
  .get(c.getClubs)
  .post([body('name').trim().notEmpty().withMessage('Club name is required')], validate, c.createClub);

router.route('/:id')
  .get([id], validate, c.getClub)
  .put([id, body('name').optional().trim().notEmpty()], validate, c.updateClub)
  .delete([id], validate, c.deleteClub);

router.post('/:id/join', [id], validate, c.joinClub);
router.post('/:id/leave', [id], validate, c.leaveClub);
router.get('/:id/messages', [id], validate, c.getMessages);

module.exports = router;
