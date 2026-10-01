const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const c = require('../controllers/bookController');

const id = param('id').isMongoId().withMessage('Invalid book id');

router.use(protect);

router.route('/')
  .get(c.getBooks)
  .post([body('title').trim().notEmpty().withMessage('Title is required'),
         body('author').trim().notEmpty().withMessage('Author is required'),
         body('totalPages').optional().isInt({ min: 0 }),
         body('club').optional().isMongoId()], validate, c.createBook);

router.route('/:id')
  .get([id], validate, c.getBook)
  .put([id, body('totalPages').optional().isInt({ min: 0 })], validate, c.updateBook)
  .delete([id], validate, c.deleteBook);

module.exports = router;
