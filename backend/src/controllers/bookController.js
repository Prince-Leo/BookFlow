const bookService = require('../services/bookService');
const { logAction } = require('../utils/logger');

class BookController {
  // 搜索图书
  async search(req, res) {
    try {
      const result = await bookService.searchBooks(req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 获取图书详情
  async getById(req, res) {
    try {
      const book = await bookService.getBookById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: '图书不存在' });
      }
      res.json({ book });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 创建图书
  async create(req, res) {
    try {
      const book = await bookService.createBook(req.body);
      
      await logAction('CREATE_BOOK', 'Book', book.id, {
        title: book.title,
        isbn: book.isbn
      }, req.user.id, req.ip);

      res.status(201).json({
        message: '图书创建成功',
        book
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 更新图书
  async update(req, res) {
    try {
      const book = await bookService.updateBook(req.params.id, req.body);
      if (!book) {
        return res.status(404).json({ message: '图书不存在' });
      }
      
      await logAction('UPDATE_BOOK', 'Book', book.id, {
        title: book.title
      }, req.user.id, req.ip);

      res.json({
        message: '图书更新成功',
        book
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 删除图书
  async delete(req, res) {
    try {
      const success = await bookService.deleteBook(req.params.id);
      if (!success) {
        return res.status(404).json({ message: '图书不存在' });
      }
      
      await logAction('DELETE_BOOK', 'Book', req.params.id, {}, req.user.id, req.ip);

      res.json({ message: '图书删除成功' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 获取推荐图书
  async getRecommended(req, res) {
    try {
      const books = await bookService.getRecommendedBooks(
        req.user.id,
        req.query.limit
      );
      res.json({ books });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 获取热门图书
  async getPopular(req, res) {
    try {
      const books = await bookService.getPopularBooks(req.query.limit);
      res.json({ books });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 添加评论
  async addReview(req, res) {
    try {
      const { rating, comment } = req.body;
      const review = await bookService.addReview(
        req.user.id,
        req.params.id,
        rating,
        comment
      );
      
      await logAction('ADD_REVIEW', 'Review', review.id, {
        bookId: req.params.id,
        rating
      }, req.user.id, req.ip);

      res.status(201).json({
        message: '评论添加成功',
        review
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 添加到收藏
  async addToFavorites(req, res) {
    try {
      const { favorite, created } = await bookService.addToFavorites(
        req.user.id,
        req.params.id
      );
      
      if (!created) {
        return res.status(400).json({ message: '图书已在收藏夹中' });
      }

      res.status(201).json({
        message: '已添加到收藏夹',
        favorite
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 获取用户收藏
  async getFavorites(req, res) {
    try {
      const favorites = await bookService.getUserFavorites(req.user.id);
      res.json({ favorites });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 从收藏中移除
  async removeFromFavorites(req, res) {
    try {
      await bookService.removeFromFavorites(req.user.id, req.params.id);
      
      await logAction('REMOVE_FAVORITE', 'Favorite', null, {
        bookId: req.params.id
      }, req.user.id, req.ip);

      res.json({ message: '已从收藏夹移除' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 获取统计数据
  async getStatistics(req, res) {
    try {
      const statistics = await bookService.getStatistics();
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new BookController();
