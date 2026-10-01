const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const c = require('../controllers/progressController');

router.use(protect);
router.post('/',
  [body('book').isMongoId().withMessage('Valid book id required'),
   body('pagesRead').isInt({ min: 0 }).withMessage('pagesRead must be a non-negative integer')],
  validate, c.updateProgress);
router.get('/', c.getProgress);
router.get('/user/:id', [param('id').isMongoId()], validate, c.getUserProgress);

module.exports = router;
