const borrowService = require('../services/borrowService');
const { logAction } = require('../utils/logger');

class BorrowController {
  // 借书
  async borrow(req, res) {
    try {
      const { bookId, days } = req.body;
      const borrowRecord = await borrowService.borrowBook(
        req.user.id,
        bookId,
        days
      );
      
      await logAction('BORROW_BOOK', 'BorrowRecord', borrowRecord.id, {
        bookId,
        userId: req.user.id
      }, req.user.id, req.ip);

      res.status(201).json({
        message: '借书成功',
        borrowRecord
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 还书
  async returnBook(req, res) {
    try {
      const { borrowRecord, fineAmount } = await borrowService.returnBook(
        req.params.id
      );
      
      await logAction('RETURN_BOOK', 'BorrowRecord', borrowRecord.id, {
        fineAmount
      }, req.user.id, req.ip);

      res.json({
        message: fineAmount > 0 
          ? `还书成功，逾期费用: ¥${fineAmount}` 
          : '还书成功',
        borrowRecord,
        fineAmount
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 续借
  async renew(req, res) {
    try {
      const borrowRecord = await borrowService.renewBook(
        req.params.id,
        req.body.days
      );
      
      await logAction('RENEW_BOOK', 'BorrowRecord', borrowRecord.id, {}, req.user.id, req.ip);

      res.json({
        message: '续借成功',
        borrowRecord
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 预约图书
  async reserve(req, res) {
    try {
      const { bookId } = req.body;
      const reservation = await borrowService.reserveBook(req.user.id, bookId);
      
      await logAction('RESERVE_BOOK', 'Reservation', reservation.id, {
        bookId
      }, req.user.id, req.ip);

      res.status(201).json({
        message: '预约成功',
        reservation
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 取消预约
  async cancelReservation(req, res) {
    try {
      const reservation = await borrowService.cancelReservation(
        req.params.id,
        req.user.id
      );
      
      await logAction('CANCEL_RESERVATION', 'Reservation', reservation.id, {}, req.user.id, req.ip);

      res.json({
        message: '预约已取消',
        reservation
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // 获取用户借阅历史
  async getHistory(req, res) {
    try {
      const result = await borrowService.getUserBorrowHistory(
        req.user.id,
        req.query.page,
        req.query.limit
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 获取当前借阅
  async getCurrent(req, res) {
    try {
      const records = await borrowService.getCurrentBorrows(req.user.id);
      res.json({ records });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 获取所有借阅记录（管理员）
  async getAll(req, res) {
    try {
      const result = await borrowService.getAllBorrows(req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // 获取借阅统计
  async getStatistics(req, res) {
    try {
      const statistics = await borrowService.getBorrowStatistics();
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new BorrowController();
