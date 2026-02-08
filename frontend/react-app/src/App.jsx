import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// 布局
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// 页面
import Login from './pages/Login';
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import MyBorrows from './pages/MyBorrows';
import BorrowHistory from './pages/BorrowHistory';
import Favorites from './pages/Favorites';
import Reservations from './pages/Reservations';
import Profile from './pages/Profile';

// 管理员页面
import Dashboard from './pages/admin/Dashboard';
import BookManagement from './pages/admin/BookManagement';
import BorrowManagement from './pages/admin/BorrowManagement';
import UserManagement from './pages/admin/UserManagement';

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* 登录页面 */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
        />

        {/* 受保护的路由 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* 用户路由 */}
          <Route index element={<Home />} />
          <Route path="books" element={<Books />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route path="my-borrows" element={<MyBorrows />} />
          <Route path="history" element={<BorrowHistory />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="profile" element={<Profile />} />

          {/* 管理员路由 */}
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/books"
            element={
              <ProtectedRoute requireAdmin>
                <BookManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/borrows"
            element={
              <ProtectedRoute requireAdmin>
                <BorrowManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <UserManagement />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
