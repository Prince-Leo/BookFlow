import { create } from 'zustand';
import { categoryApi } from '../services/api';

export const useCategoryStore = create((set, get) => ({
  categories: [],
  currentCategory: null,
  isLoading: false,
  error: null,

  getAllCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryApi.getAll();
      set({
        categories: response.categories,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '获取分类失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  getCategoryById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryApi.getById(id);
      set({
        currentCategory: response.category,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '获取分类失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  createCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryApi.create(data);
      set(state => ({
        categories: [...state.categories, response.category],
        isLoading: false
      }));
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '创建分类失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  updateCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryApi.update(id, data);
      set(state => ({
        categories: state.categories.map(c => 
          c.id === id ? response.category : c
        ),
        isLoading: false
      }));
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '更新分类失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await categoryApi.delete(id);
      set(state => ({
        categories: state.categories.filter(c => c.id !== id),
        isLoading: false
      }));
      return { success: true };
    } catch (error) {
      set({
        error: error.message || '删除分类失败',
        isLoading: false
      });
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null })
}));
