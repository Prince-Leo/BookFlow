const { Book, Category, BorrowRecord, Review, Favorite, User, sequelize } = require('../models');
const { Op } = require('sequelize');

class BookService {
  // 搜索图书
  async searchBooks(query) {
    const { keyword, category, author, publisher, status, page = 1, limit = 10 } = query;
    
    const where = {};
    
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${keyword}%` } },
        { author: { [Op.iLike]: `%${keyword}%` } },
        { isbn: { [Op.iLike]: `%${keyword}%` } }
      ];
    }
    
    if (author) where.author = { [Op.iLike]: `%${author}%` };
    if (publisher) where.publisher = { [Op.iLike]: `%${publisher}%` };
    if (status) where.status = status;

    const include = [];
    if (category) {
      include.push({
        model: Category,
        where: { id: category },
        required: true
      });
    } else {
      include.push({
        model: Category,
        required: false
      });
    }

    const { count, rows: books } = await Book.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    return {
      books,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    };
  }

  // 获取图书详情
  async getBookById(id) {
    const book = await Book.findByPk(id, {
      include: [
        { model: Category },
        {
          model: Review,
          include: [{ model: User, attributes: ['id', 'username', 'fullName'] }],
          limit: 10
        }
      ]
    });
    return book;
  }

  // 创建图书
  async createBook(data) {
    // 如果没有设置 availableQuantity，则将其设置为 totalQuantity
    if (data.totalQuantity !== undefined && data.availableQuantity === undefined) {
      data.availableQuantity = data.totalQuantity;
    }
    const book = await Book.create(data);
    return this.getBookById(book.id);
  }

  // 更新图书
  async updateBook(id, data) {
    const book = await Book.findByPk(id);
    if (!book) return null;
    
    await book.update(data);
    return this.getBookById(id);
  }

  // 删除图书
  async deleteBook(id) {
    const book = await Book.findByPk(id);
    if (!book) return false;
    
    await book.destroy();
    return true;
  }

  // 获取推荐图书
  async getRecommendedBooks(userId, limit = 10) {
    // 基于用户借阅历史推荐
    const userBorrows = await BorrowRecord.findAll({
      where: { userId },
      include: [{ model: Book, include: [Category] }],
      limit: 5
    });

    const categoryIds = [...new Set(
      userBorrows.map(b => b.Book?.Category?.id).filter(Boolean)
    )];

    const borrowedBookIds = userBorrows.map(b => b.bookId);

    const where = {
      id: { [Op.notIn]: borrowedBookIds },
      availableQuantity: { [Op.gt]: 0 }
    };

    if (categoryIds.length > 0) {
      where.categoryId = { [Op.in]: categoryIds };
    }

    const books = await Book.findAll({
      where,
      order: [['rating', 'DESC']],
      limit: parseInt(limit)
    });

    return books;
  }

  // 获取热门图书
  async getPopularBooks(limit = 10) {
    const books = await Book.findAll({
      where: { availableQuantity: { [Op.gt]: 0 } },
      order: [
        ['rating', 'DESC'],
        ['ratingCount', 'DESC']
      ],
      limit: parseInt(limit)
    });
    return books;
  }

  // 添加评论和评分
  async addReview(userId, bookId, rating, comment) {
    const review = await Review.create({
      userId,
      bookId,
      rating,
      comment
    });

    // 更新图书评分
    const reviews = await Review.findAll({ where: { bookId } });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await Book.update(
      { rating: avgRating.toFixed(1), ratingCount: reviews.length },
      { where: { id: bookId } }
    );

    return review;
  }

  // 添加到收藏
  async addToFavorites(userId, bookId) {
    const [favorite, created] = await Favorite.findOrCreate({
      where: { userId, bookId },
      defaults: { userId, bookId }
    });
    return { favorite, created };
  }

  // 获取用户收藏
  async getUserFavorites(userId) {
    const favorites = await Favorite.findAll({
      where: { userId },
      include: [{ model: Book, include: [Category] }]
    });
    return favorites;
  }

  // 从收藏中移除
  async removeFromFavorites(userId, bookId) {
    const favorite = await Favorite.findOne({
      where: { userId, bookId }
    });
    if (!favorite) {
      throw new Error('收藏记录不存在');
    }
    await favorite.destroy();
    return true;
  }

  // 获取统计数据
  async getStatistics() {
    const totalBooks = await Book.count();
    const totalAvailable = await Book.sum('availableQuantity');
    const totalBorrowed = await BorrowRecord.count({ where: { status: 'borrowed' } });
    const totalOverdue = await BorrowRecord.count({ where: { status: 'overdue' } });

    // 按类别统计
    const categoryStats = await Book.findAll({
      attributes: [
        'Category.name',
        [sequelize.fn('COUNT', sequelize.col('Book.id')), 'count']
      ],
      include: [{ model: Category, attributes: [] }],
      group: ['Category.id', 'Category.name'],
      raw: true
    });

    // 借阅趋势（最近30天）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const borrowTrend = await BorrowRecord.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('borrowDate')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        borrowDate: { [Op.gte]: thirtyDaysAgo }
      },
      group: [sequelize.fn('DATE', sequelize.col('borrowDate'))],
      order: [[sequelize.fn('DATE', sequelize.col('borrowDate')), 'ASC']],
      raw: true
    });

    return {
      totalBooks,
      totalAvailable,
      totalBorrowed,
      totalOverdue,
      categoryStats,
      borrowTrend
    };
  }
}

module.exports = new BookService();
