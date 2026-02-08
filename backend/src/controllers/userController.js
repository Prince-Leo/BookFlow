const userService = require('../services/userService');
const { logAction } = require('../utils/logger');

class UserController {
  // 获取用户统计
  async getStatistics(req, res) {
    try {
      const statistics = await userService.getUserStatistics(req.user.id);
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 获取所有用户（管理员）
  async getAll(req, res) {
    try {
      const result = await userService.getAllUsers(req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 获取单个用户（管理员）
  async getById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 更新用户状态（管理员）
  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const user = await userService.updateUserStatus(req.params.id, status);
      
      await logAction('UPDATE_USER_STATUS', 'User', user.id, { status }, req.user.id, req.ip);

      res.json({
        message: '用户状态更新成功',
        user
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 更新用户角色（管理员）
  async updateRole(req, res) {
    try {
      const { role } = req.body;
      const user = await userService.updateUserRole(req.params.id, role);
      
      await logAction('UPDATE_USER_ROLE', 'User', user.id, { role }, req.user.id, req.ip);

      res.json({
        message: '用户角色更新成功',
        user
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 删除用户（管理员）
  async delete(req, res) {
    try {
      await userService.deleteUser(req.params.id);
      
      await logAction('DELETE_USER', 'User', req.params.id, {}, req.user.id, req.ip);

      res.json({ message: '用户删除成功' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 获取管理员统计
  async getAdminStatistics(req, res) {
    try {
      const statistics = await userService.getAdminStatistics();
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new UserController();
