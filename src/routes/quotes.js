const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const c = require('../controllers/quoteController');

router.use(protect);
router.route('/')
  .get(c.getQuotes)
  .post([body('book').isMongoId(), body('text').trim().notEmpty().withMessage('Quote text required')], validate, c.createQuote);
router.delete('/:id', [param('id').isMongoId()], validate, c.deleteQuote);

module.exports = router;
