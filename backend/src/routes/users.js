const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// 用户个人路由
router.get('/statistics', userController.getStatistics);

// 管理员路由
router.get('/', authorize('admin', 'librarian'), userController.getAll);
router.get('/admin/statistics', authorize('admin'), userController.getAdminStatistics);
router.get('/:id', authorize('admin', 'librarian'), userController.getById);
router.put('/:id/status', authorize('admin'), userController.updateStatus);
router.put('/:id/role', authorize('admin'), userController.updateRole);
router.delete('/:id', authorize('admin'), userController.delete);

module.exports = router;
