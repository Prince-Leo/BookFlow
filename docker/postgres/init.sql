-- 初始化数据库脚本
-- 创建一些默认分类
INSERT INTO categories (name, description, "createdAt", "updatedAt") VALUES
('文学', '小说、散文、诗歌等文学作品', NOW(), NOW()),
('科技', '计算机、互联网、人工智能等科技类图书', NOW(), NOW()),
('历史', '历史、传记、考古等历史类图书', NOW(), NOW()),
('经济', '经济、金融、管理等经济类图书', NOW(), NOW()),
('教育', '教育、教材、考试等教育类图书', NOW(), NOW()),
('艺术', '绘画、音乐、设计等艺术类图书', NOW(), NOW()),
('医学', '医学、健康、养生等医学类图书', NOW(), NOW()),
('法律', '法律、法规、案例等法律类图书', NOW(), NOW());

-- 创建默认管理员账号 (密码: admin123)
-- 注意：实际使用时请修改默认密码
INSERT INTO users (username, email, password, "fullName", role, status, "maxBooks", "borrowCount", "createdAt", "updatedAt") VALUES
('admin', 'admin@bookflow.com', '$2a$10$YourHashedPasswordHere', '系统管理员', 'admin', 'active', 10, 0, NOW(), NOW());
