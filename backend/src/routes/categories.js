const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { logAction } = require('../utils/logger');

// 获取所有分类（公开）
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取单个分类（公开）
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }
    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建分类（管理员）
router.post('/', authenticate, authorize('admin', 'librarian'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    
    await logAction('CREATE_CATEGORY', 'Category', category.id, { name }, req.user.id, req.ip);

    res.status(201).json({
      message: '分类创建成功',
      category
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新分类（管理员）
router.put('/:id', authenticate, authorize('admin', 'librarian'), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }

    await category.update(req.body);
    
    await logAction('UPDATE_CATEGORY', 'Category', category.id, {}, req.user.id, req.ip);

    res.json({
      message: '分类更新成功',
      category
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除分类（管理员）
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }

    await category.destroy();
    
    await logAction('DELETE_CATEGORY', 'Category', req.params.id, {}, req.user.id, req.ip);

    res.json({ message: '分类删除成功' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
