import { create } from 'zustand';
import { bookApi } from '../services/api';

export const useBookStore = create((set, get) => ({
  books: [],
  currentBook: null,
  favorites: [],
  popularBooks: [],
  recommendedBooks: [],
  statistics: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },

  searchBooks: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookApi.search(params);
      set({
        books: response.books,
        pagination: response.pagination,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '搜索失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  getBookById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookApi.getById(id);
      set({
        currentBook: response.book,
        isLoading: false
      });
      return { success: true, book: response.book };
    } catch (error) {
      set({
        error: error.message || '获取图书失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  createBook: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookApi.create(data);
      set({ isLoading: false });
      return { success: true, book: response.book };
    } catch (error) {
      set({
        error: error.message || '创建图书失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  updateBook: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookApi.update(id, data);
      set({ isLoading: false });
      return { success: true, book: response.book };
    } catch (error) {
      set({
        error: error.message || '更新图书失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  deleteBook: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await bookApi.delete(id);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '删除图书失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  getPopularBooks: async (limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookApi.getPopular(limit);
      set({
        popularBooks: response.books,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '获取热门图书失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  getRecommendedBooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookApi.getRecommended();
      set({
        recommendedBooks: response.books,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '获取推荐图书失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  addReview: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await bookApi.addReview(id, data);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '添加评论失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  addToFavorites: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await bookApi.addToFavorites(id);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '添加收藏失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  getFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookApi.getFavorites();
      set({
        favorites: response.favorites,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '获取收藏失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  getStatistics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookApi.getStatistics();
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

  clearError: () => set({ error: null }),
  clearCurrentBook: () => set({ currentBook: null })
}));
