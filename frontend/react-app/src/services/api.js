import axios from 'axios';

// 根据环境确定 API 基础 URL
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment 
  ? '/api'  // 开发环境使用代理
  : (import.meta.env.VITE_API_URL || 'http://152.32.225.49:3000/api');  // 生产环境使用完整 URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// 认证相关
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// 图书相关
export const bookApi = {
  search: (params) => api.get('/books/search', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
  getPopular: (limit) => api.get('/books/popular', { params: { limit } }),
  getRecommended: () => api.get('/books/recommended/list'),
  addReview: (id, data) => api.post(`/books/${id}/reviews`, data),
  addToFavorites: (id) => api.post(`/books/${id}/favorites`),
  getFavorites: () => api.get('/books/user/favorites'),
  getStatistics: () => api.get('/books/statistics')
};

// 借阅相关
export const borrowApi = {
  borrow: (data) => api.post('/borrows', data),
  returnBook: (id) => api.post(`/borrows/${id}/return`),
  renew: (id, days) => api.post(`/borrows/${id}/renew`, { days }),
  reserve: (data) => api.post('/borrows/reserve', data),
  cancelReservation: (id) => api.delete(`/borrows/reservations/${id}`),
  getHistory: (params) => api.get('/borrows/history', { params }),
  getCurrent: () => api.get('/borrows/current'),
  getAll: (params) => api.get('/borrows/admin/all', { params }),
  getStatistics: () => api.get('/borrows/admin/statistics')
};

// 用户相关
export const userApi = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateStatus: (id, status) => api.put(`/users/${id}/status`, { status }),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`),
  getStatistics: () => api.get('/users/statistics'),
  getAdminStatistics: () => api.get('/users/admin/statistics')
};

// 分类相关
export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

export default api;
