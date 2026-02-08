import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import { 
  UserOutlined, 
  BookOutlined, 
  ReadOutlined, 
  ClockCircleOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useBookStore } from '../../stores/bookStore';
import { useBorrowStore } from '../../stores/borrowStore';
import { userApi } from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { statistics: bookStats, getStatistics: getBookStats } = useBookStore();
  const { statistics: borrowStats, getStatistics: getBorrowStats } = useBorrowStore();

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    setLoading(true);
    await Promise.all([
      getBookStats(),
      getBorrowStats(),
      fetchUserStats()
    ]);
    setLoading(false);
  };

  const fetchUserStats = async () => {
    try {
      const response = await userApi.getAdminStatistics();
      setUserStats(response);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  const statsCards = [
    {
      title: '总用户数',
      value: userStats?.totalUsers || 0,
      icon: <UserOutlined />,
      color: '#1890ff'
    },
    {
      title: '图书总数',
      value: bookStats?.totalBooks || 0,
      icon: <BookOutlined />,
      color: '#52c41a'
    },
    {
      title: '当前借阅',
      value: borrowStats?.activeBorrows || 0,
      icon: <ReadOutlined />,
      color: '#722ed1'
    },
    {
      title: '逾期图书',
      value: borrowStats?.overdueBorrows || 0,
      icon: <ClockCircleOutlined />,
      color: '#ff4d4f'
    }
  ];

  // 借阅趋势数据
  const borrowTrendData = bookStats?.borrowTrend?.map(item => ({
    date: item.date,
    count: parseInt(item.count)
  })) || [];

  // 分类统计数据
  const categoryData = bookStats?.categoryStats?.map(item => ({
    name: item.name,
    value: parseInt(item.count)
  })) || [];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                valueStyle={{ color: stat.color }}
                prefix={stat.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 图表区域 */}
      <Row gutter={16}>
        <Col xs={24} lg={12} style={{ marginBottom: 16 }}>
          <Card title="借阅趋势（最近30天）">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={borrowTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12} style={{ marginBottom: 16 }}>
          <Card title="图书分类分布">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 详细统计 */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="本月新增用户"
              value={userStats?.newUsersThisMonth || 0}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="本月借阅"
              value={borrowStats?.monthlyBorrows || 0}
              suffix="次"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="已归还"
              value={borrowStats?.returnedBorrows || 0}
              suffix="本"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="可借阅图书"
              value={bookStats?.totalAvailable || 0}
              suffix="本"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
