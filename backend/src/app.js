const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const { checkOverdueRecords } = require('./services/borrowService');
const { User, Category } = require('./models');
const bcrypt = require('bcryptjs');
const cron = require('node-cron');

// 导入路由
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const borrowRoutes = require('./routes/borrows');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');

const app = express();

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 每个IP限制100个请求
});
app.use(limiter);

// 日志
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({ message: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : err.message
  });
});

// 数据库同步和服务器启动
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();
    
    // 同步数据库模型
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized');

    // 初始化默认数据
    await initializeDefaultData();

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // 设置定时任务：每天检查逾期记录
    cron.schedule('0 0 * * *', async () => {
      console.log('Running daily overdue check...');
      const count = await checkOverdueRecords();
      console.log(`Checked ${count} overdue records`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// 初始化默认数据
const initializeDefaultData = async () => {
  try {
    // 创建默认分类
    const categories = [
      { name: '文学', description: '小说、散文、诗歌等文学作品' },
      { name: '科技', description: '计算机、互联网、人工智能等科技类图书' },
      { name: '历史', description: '历史、传记、考古等历史类图书' },
      { name: '经济', description: '经济、金融、管理等经济类图书' },
      { name: '教育', description: '教育、教材、考试等教育类图书' },
      { name: '艺术', description: '绘画、音乐、设计等艺术类图书' },
      { name: '医学', description: '医学、健康、养生等医学类图书' },
      { name: '法律', description: '法律、法规、案例等法律类图书' }
    ];

    for (const cat of categories) {
      await Category.findOrCreate({
        where: { name: cat.name },
        defaults: cat
      });
    }
    console.log('Default categories created');

    // 创建默认管理员账号
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@bookflow.com',
        password: hashedPassword,
        fullName: '系统管理员',
        role: 'admin',
        status: 'active',
        maxBooks: 10,
        borrowCount: 0
      });
      console.log('Default admin user created (username: admin, password: admin123)');
    }
  } catch (error) {
    console.error('Failed to initialize default data:', error);
  }
};

module.exports = app;
