import { create } from 'zustand';
import { borrowApi } from '../services/api';

export const useBorrowStore = create((set, get) => ({
  borrowHistory: [],
  currentBorrows: [],
  allBorrows: [],
  statistics: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },

  borrowBook: async (bookId, days = 30) => {
    set({ isLoading: true, error: null });
    try {
      const response = await borrowApi.borrow({ bookId, days });
      set({ isLoading: false });
      return { success: true, borrowRecord: response.borrowRecord };
    } catch (error) {
      set({
        error: error.message || '借书失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  returnBook: async (borrowId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await borrowApi.returnBook(borrowId);
      set({ isLoading: false });
      return { 
        success: true, 
        borrowRecord: response.borrowRecord,
        fineAmount: response.fineAmount 
      };
    } catch (error) {
      set({
        error: error.message || '还书失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  renewBook: async (borrowId, days = 15) => {
    set({ isLoading: true, error: null });
    try {
      const response = await borrowApi.renew(borrowId, days);
      set({ isLoading: false });
      return { success: true, borrowRecord: response.borrowRecord };
    } catch (error) {
      set({
        error: error.message || '续借失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  reserveBook: async (bookId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await borrowApi.reserve({ bookId });
      set({ isLoading: false });
      return { success: true, reservation: response.reservation };
    } catch (error) {
      set({
        error: error.message || '预约失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  cancelReservation: async (reservationId) => {
    set({ isLoading: true, error: null });
    try {
      await borrowApi.cancelReservation(reservationId);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '取消预约失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  getBorrowHistory: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await borrowApi.getHistory(params);
      set({
        borrowHistory: response.records,
        pagination: response.pagination,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '获取借阅历史失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  getCurrentBorrows: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await borrowApi.getCurrent();
      set({
        currentBorrows: response.records,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '获取当前借阅失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  getAllBorrows: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await borrowApi.getAll(params);
      set({
        allBorrows: response.records,
        pagination: response.pagination,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '获取借阅记录失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  getStatistics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await borrowApi.getStatistics();
      set({
        statistics: response,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '获取统计失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null })
}));
