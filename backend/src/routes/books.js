const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticate, authorize } = require('../middleware/auth');
const { bookValidation } = require('../middleware/validation');

// 公开路由
router.get('/search', bookController.search);
router.get('/popular', bookController.getPopular);
router.get('/statistics', bookController.getStatistics);
router.get('/:id', bookController.getById);

// 需要认证的路由
router.use(authenticate);

router.get('/recommended/list', bookController.getRecommended);
router.get('/user/favorites', bookController.getFavorites);
router.delete('/:id/favorites', bookController.removeFromFavorites);
router.post('/:id/reviews', bookController.addReview);
router.post('/:id/favorites', bookController.addToFavorites);

// 需要管理员权限的路由
router.post('/', authorize('admin', 'librarian'), bookValidation, bookController.create);
router.put('/:id', authorize('admin', 'librarian'), bookController.update);
router.delete('/:id', authorize('admin'), bookController.delete);

module.exports = router;
