import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge } from 'antd';
import {
  BookOutlined,
  HomeOutlined,
  UserOutlined,
  HistoryOutlined,
  HeartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  ReadOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const { Header, Sider, Content } = Layout;

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  const getMenuItems = () => {
    const baseItems = [
      {
        key: '/',
        icon: <HomeOutlined />,
        label: <Link to="/">首页</Link>
      },
      {
        key: '/books',
        icon: <BookOutlined />,
        label: <Link to="/books">图书浏览</Link>
      },
      {
        key: '/my-borrows',
        icon: <ReadOutlined />,
        label: <Link to="/my-borrows">我的借阅</Link>
      },
      {
        key: '/history',
        icon: <HistoryOutlined />,
        label: <Link to="/history">借阅历史</Link>
      },
      {
        key: '/favorites',
        icon: <HeartOutlined />,
        label: <Link to="/favorites">我的收藏</Link>
      }
    ];

    if (user?.role === 'admin' || user?.role === 'librarian') {
      baseItems.push(
        {
          key: 'admin',
          icon: <SettingOutlined />,
          label: '管理后台',
          children: [
            {
              key: '/admin/dashboard',
              icon: <DashboardOutlined />,
              label: <Link to="/admin/dashboard">数据概览</Link>
            },
            {
              key: '/admin/books',
              icon: <BookOutlined />,
              label: <Link to="/admin/books">图书管理</Link>
            },
            {
              key: '/admin/borrows',
              icon: <HistoryOutlined />,
              label: <Link to="/admin/borrows">借阅管理</Link>
            },
            {
              key: '/admin/users',
              icon: <TeamOutlined />,
              label: <Link to="/admin/users">用户管理</Link>
            }
          ]
        }
      );
    }

    return baseItems;
  };

  const selectedKeys = [location.pathname];
  const openKeys = location.pathname.startsWith('/admin') ? ['admin'] : [];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          zIndex: 10
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: collapsed ? 18 : 20, 
            color: '#1890ff',
            fontWeight: 'bold'
          }}>
            {collapsed ? 'BF' : 'BookFlow'}
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={getMenuItems()}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.fullName || user?.username}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ 
          margin: 24, 
          padding: 24, 
          background: '#fff',
          borderRadius: 8,
          minHeight: 280,
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
