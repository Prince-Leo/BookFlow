const { User, BorrowRecord, Book, Favorite, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

class UserService {
  // 注册
  async register(userData) {
    const { username, email, password, fullName, phone } = userData;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      throw new Error('用户名或邮箱已被注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      phone,
      role: 'user'
    });

    return this.generateAuthResponse(user);
  }

  // 登录
  async login(email, password) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.status !== 'active') {
      throw new Error('账号已被禁用');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }

    return this.generateAuthResponse(user);
  }

  // 生成认证响应
  generateAuthResponse(user) {
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        maxBooks: user.maxBooks,
        borrowCount: user.borrowCount
      }
    };
  }

  // 获取用户信息
  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    return user;
  }

  // 更新用户信息
  async updateUser(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 如果更新密码，需要加密
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await user.update(updateData);
    return this.getUserById(id);
  }

  // 获取用户统计
  async getUserStatistics(userId) {
    const totalBorrows = await BorrowRecord.count({ where: { userId } });
    const activeBorrows = await BorrowRecord.count({ 
      where: { userId, status: ['borrowed', 'renewed'] } 
    });
    const overdueBorrows = await BorrowRecord.count({ 
      where: { userId, status: 'overdue' } 
    });
    const favoriteCount = await Favorite.count({ where: { userId } });

    // 最近借阅
    const recentBorrows = await BorrowRecord.findAll({
      where: { userId },
      include: [{ model: Book, attributes: ['id', 'title', 'author', 'coverImage'] }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    return {
      totalBorrows,
      activeBorrows,
      overdueBorrows,
      favoriteCount,
      recentBorrows
    };
  }

  // 获取所有用户（管理员）
  async getAllUsers(query) {
    const { role, status, keyword, page = 1, limit = 10 } = query;
    
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (keyword) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${keyword}%` } },
        { email: { [Op.iLike]: `%${keyword}%` } },
        { fullName: { [Op.iLike]: `%${keyword}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    return {
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    };
  }

  // 更新用户状态（管理员）
  async updateUserStatus(userId, status) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    user.status = status;
    await user.save();

    return this.getUserById(userId);
  }

  // 更新用户角色（管理员）
  async updateUserRole(userId, role) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    user.role = role;
    await user.save();

    return this.getUserById(userId);
  }

  // 删除用户（管理员）
  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查是否有未归还的图书
    const activeBorrows = await BorrowRecord.count({
      where: { userId, status: ['borrowed', 'renewed', 'overdue'] }
    });

    if (activeBorrows > 0) {
      throw new Error('用户有未归还的图书，无法删除');
    }

    await user.destroy();
    return true;
  }

  // 获取用户统计（管理员）
  async getAdminStatistics() {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 'active' } });
    const newUsersThisMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setDate(1))
        }
      }
    });

    // 按角色统计
    const roleStats = await User.findAll({
      attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['role'],
      raw: true
    });

    // 最活跃用户
    const mostActiveUsers = await User.findAll({
      attributes: ['id', 'username', 'fullName', 'borrowCount'],
      order: [['borrowCount', 'DESC']],
      limit: 10
    });

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      roleStats,
      mostActiveUsers
    };
  }
}

module.exports = new UserService();
