const { BorrowRecord, Book, User, Reservation, sequelize } = require('../models');
const { Op } = require('sequelize');
const { sendDueDateReminder } = require('../utils/email');

class BorrowService {
  // 借书
  async borrowBook(userId, bookId, days = 30) {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查用户
      const user = await User.findByPk(userId, { transaction });
      if (!user || user.status !== 'active') {
        throw new Error('用户不存在或已被禁用');
      }

      if (user.borrowCount >= user.maxBooks) {
        throw new Error(`已达到最大借阅数量限制 (${user.maxBooks}本)`);
      }

      // 检查图书
      const book = await Book.findByPk(bookId, { transaction });
      if (!book) {
        throw new Error('图书不存在');
      }

      if (book.availableQuantity <= 0) {
        throw new Error('图书暂无库存');
      }

      // 检查是否已借阅
      const existingBorrow = await BorrowRecord.findOne({
        where: { userId, bookId, status: 'borrowed' },
        transaction
      });
      if (existingBorrow) {
        throw new Error('您已借阅该图书');
      }

      // 计算到期日期
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + days);

      // 创建借阅记录
      const borrowRecord = await BorrowRecord.create({
        userId,
        bookId,
        dueDate,
        status: 'borrowed'
      }, { transaction });

      // 更新图书库存
      await book.decrement('availableQuantity', { transaction });
      if (book.availableQuantity - 1 === 0) {
        await book.update({ status: 'borrowed' }, { transaction });
      }

      // 更新用户借阅计数
      await user.increment('borrowCount', { transaction });

      await transaction.commit();
      return borrowRecord;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // 还书
  async returnBook(borrowId) {
    const transaction = await sequelize.transaction();
    
    try {
      const borrowRecord = await BorrowRecord.findByPk(borrowId, {
        include: [Book, User],
        transaction
      });

      if (!borrowRecord) {
        throw new Error('借阅记录不存在');
      }

      if (borrowRecord.status === 'returned') {
        throw new Error('该图书已归还');
      }

      const now = new Date();
      let fineAmount = 0;

      // 计算逾期费用
      if (now > borrowRecord.dueDate) {
        const daysOverdue = Math.ceil((now - borrowRecord.dueDate) / (1000 * 60 * 60 * 24));
        fineAmount = daysOverdue * 1; // 每天1元
        borrowRecord.status = 'overdue';
      } else {
        borrowRecord.status = 'returned';
      }

      borrowRecord.returnDate = now;
      borrowRecord.fineAmount = fineAmount;
      await borrowRecord.save({ transaction });

      // 更新图书库存
      const book = borrowRecord.Book;
      await book.increment('availableQuantity', { transaction });
      await book.update({ status: 'available' }, { transaction });

      // 更新用户借阅计数
      const user = borrowRecord.User;
      await user.decrement('borrowCount', { transaction });

      // 检查是否有预约
      const reservation = await Reservation.findOne({
        where: { bookId: book.id, status: 'pending' },
        order: [['reservationDate', 'ASC']],
        transaction
      });

      if (reservation) {
        // 通知预约用户（异步）
        // await notifyReservationUser(reservation.userId, book.id);
      }

      await transaction.commit();
      return { borrowRecord, fineAmount };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // 续借
  async renewBook(borrowId, additionalDays = 15) {
    const borrowRecord = await BorrowRecord.findByPk(borrowId, {
      include: [Book]
    });

    if (!borrowRecord) {
      throw new Error('借阅记录不存在');
    }

    if (borrowRecord.status !== 'borrowed') {
      throw new Error('只能续借已借阅的图书');
    }

    if (borrowRecord.renewCount >= 2) {
      throw new Error('已达到最大续借次数');
    }

    // 检查是否有预约
    const reservation = await Reservation.findOne({
      where: { 
        bookId: borrowRecord.bookId, 
        status: 'pending'
      }
    });

    if (reservation) {
      throw new Error('该图书已被预约，无法续借');
    }

    const newDueDate = new Date(borrowRecord.dueDate);
    newDueDate.setDate(newDueDate.getDate() + additionalDays);

    borrowRecord.dueDate = newDueDate;
    borrowRecord.renewCount += 1;
    borrowRecord.status = 'renewed';
    await borrowRecord.save();

    return borrowRecord;
  }

  // 预约图书
  async reserveBook(userId, bookId) {
    const book = await Book.findByPk(bookId);
    if (!book) {
      throw new Error('图书不存在');
    }

    if (book.availableQuantity > 0) {
      throw new Error('图书有库存，可直接借阅');
    }

    // 检查是否已预约
    const existingReservation = await Reservation.findOne({
      where: { userId, bookId, status: 'pending' }
    });
    if (existingReservation) {
      throw new Error('您已预约该图书');
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 预约有效期7天

    const reservation = await Reservation.create({
      userId,
      bookId,
      expiryDate
    });

    return reservation;
  }

  // 取消预约
  async cancelReservation(reservationId, userId) {
    const reservation = await Reservation.findOne({
      where: { id: reservationId, userId }
    });

    if (!reservation) {
      throw new Error('预约记录不存在');
    }

    if (reservation.status !== 'pending') {
      throw new Error('只能取消待处理的预约');
    }

    reservation.status = 'cancelled';
    await reservation.save();

    return reservation;
  }

  // 获取用户预约列表
  async getUserReservations(userId) {
    const reservations = await Reservation.findAll({
      where: { userId },
      include: [{ model: Book, attributes: ['id', 'title', 'author', 'coverImage'] }],
      order: [['createdAt', 'DESC']]
    });
    return reservations;
  }

  // 获取用户借阅历史
  async getUserBorrowHistory(userId, page = 1, limit = 10) {
    const { count, rows: records } = await BorrowRecord.findAndCountAll({
      where: { userId },
      include: [{ model: Book, attributes: ['id', 'title', 'author', 'coverImage'] }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    return {
      records,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    };
  }

  // 获取当前借阅
  async getCurrentBorrows(userId) {
    const records = await BorrowRecord.findAll({
      where: { 
        userId, 
        status: ['borrowed', 'renewed', 'overdue']
      },
      include: [{ model: Book, attributes: ['id', 'title', 'author', 'coverImage'] }],
      order: [['dueDate', 'ASC']]
    });
    return records;
  }

  // 获取所有借阅记录（管理员）
  async getAllBorrows(query) {
    const { status, userId, bookId, page = 1, limit = 10 } = query;
    
    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (bookId) where.bookId = bookId;

    const { count, rows: records } = await BorrowRecord.findAndCountAll({
      where,
      include: [
        { model: Book, attributes: ['id', 'title', 'author'] },
        { model: User, attributes: ['id', 'username', 'fullName'] }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    return {
      records,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    };
  }

  // 检查并更新逾期记录
  async checkOverdueRecords() {
    const now = new Date();
    
    const overdueRecords = await BorrowRecord.findAll({
      where: {
        status: ['borrowed', 'renewed'],
        dueDate: { [Op.lt]: now }
      },
      include: [User, Book]
    });

    for (const record of overdueRecords) {
      record.status = 'overdue';
      await record.save();

      // 发送提醒邮件
      if (record.User && record.User.email) {
        await sendDueDateReminder(
          record.User.email,
          record.User.fullName,
          record.Book.title,
          record.dueDate
        );
      }
    }

    return overdueRecords.length;
  }

  // 获取借阅统计
  async getBorrowStatistics() {
    const totalBorrows = await BorrowRecord.count();
    const activeBorrows = await BorrowRecord.count({ where: { status: 'borrowed' } });
    const overdueBorrows = await BorrowRecord.count({ where: { status: 'overdue' } });
    const returnedBorrows = await BorrowRecord.count({ where: { status: 'returned' } });

    // 本月借阅
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyBorrows = await BorrowRecord.count({
      where: { borrowDate: { [Op.gte]: startOfMonth } }
    });

    return {
      totalBorrows,
      activeBorrows,
      overdueBorrows,
      returnedBorrows,
      monthlyBorrows
    };
  }
}

module.exports = new BorrowService();
