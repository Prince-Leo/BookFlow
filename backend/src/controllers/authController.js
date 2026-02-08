const userService = require('../services/userService');
const { logAction } = require('../utils/logger');

class AuthController {
  // 注册
  async register(req, res) {
    try {
      const result = await userService.register(req.body);
      
      await logAction('REGISTER', 'User', result.user.id, {
        username: result.user.username,
        email: result.user.email
      }, null, req.ip);

      res.status(201).json({
        message: '注册成功',
        ...result
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 登录
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      
      await logAction('LOGIN', 'User', result.user.id, {
        email: result.user.email
      }, result.user.id, req.ip);

      res.json({
        message: '登录成功',
        ...result
      });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  // 获取当前用户信息
  async getMe(req, res) {
    try {
      const user = await userService.getUserById(req.user.id);
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 更新个人信息
  async updateProfile(req, res) {
    try {
      const user = await userService.updateUser(req.user.id, req.body);
      
      await logAction('UPDATE_PROFILE', 'User', user.id, {}, req.user.id, req.ip);

      res.json({
        message: '个人信息更新成功',
        user
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();
