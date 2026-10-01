const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const c = require('../controllers/voteController');

router.use(protect);
router.post('/', [body('book').isMongoId().withMessage('Valid book id required')], validate, c.castVote);
router.get('/', c.getVotes);
router.get('/book/:id', [param('id').isMongoId()], validate, c.getVotesForBook);

module.exports = router;
