const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// 用户路由
router.post('/', borrowController.borrow);
router.get('/history', borrowController.getHistory);
router.get('/current', borrowController.getCurrent);
router.post('/:id/return', borrowController.returnBook);
router.post('/:id/renew', borrowController.renew);
router.post('/reserve', borrowController.reserve);
router.delete('/reservations/:id', borrowController.cancelReservation);

// 管理员路由
router.get('/admin/all', authorize('admin', 'librarian'), borrowController.getAll);
router.get('/admin/statistics', authorize('admin', 'librarian'), borrowController.getStatistics);

module.exports = router;
