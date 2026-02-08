import React, { useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Carousel, Spin, Button } from 'antd';
import { 
  BookOutlined, 
  ReadOutlined, 
  ClockCircleOutlined, 
  HeartOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useBookStore } from '../stores/bookStore';
import { useBorrowStore } from '../stores/borrowStore';
import BookCard from '../components/BookCard';

const { Title, Paragraph } = Typography;

const Home = () => {
  const { user } = useAuthStore();
  const { 
    popularBooks, 
    recommendedBooks, 
    getPopularBooks, 
    getRecommendedBooks,
    isLoading 
  } = useBookStore();
  const { currentBorrows, getCurrentBorrows } = useBorrowStore();

  useEffect(() => {
    getPopularBooks(6);
    getCurrentBorrows();
    if (user) {
      getRecommendedBooks();
    }
  }, [user]);

  const stats = [
    {
      title: '当前借阅',
      value: currentBorrows.filter(b => ['borrowed', 'renewed'].includes(b.status)).length,
      icon: <ReadOutlined />,
      color: '#1890ff'
    },
    {
      title: '逾期图书',
      value: currentBorrows.filter(b => b.status === 'overdue').length,
      icon: <ClockCircleOutlined />,
      color: '#ff4d4f'
    },
    {
      title: '可借额度',
      value: `${(user?.maxBooks || 5) - (user?.borrowCount || 0)} / ${user?.maxBooks || 5}`,
      icon: <BookOutlined />,
      color: '#52c41a'
    }
  ];

  return (
    <div>
      {/* 欢迎区域 */}
      <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)' }}>
        <div style={{ color: '#fff' }}>
          <Title level={2} style={{ color: '#fff', margin: 0 }}>
            欢迎回来，{user?.fullName || user?.username}！
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8, fontSize: 16 }}>
            探索知识的海洋，发现你的下一本好书
          </Paragraph>
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={8} key={index}>
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

      {/* 推荐图书 */}
      {user && recommendedBooks.length > 0 && (
        <Card 
          title="为你推荐" 
          style={{ marginBottom: 24 }}
          extra={<Link to="/books"><Button type="link">查看更多 <ArrowRightOutlined /></Button></Link>}
        >
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {recommendedBooks.slice(0, 4).map(book => (
                <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                  <BookCard book={book} />
                </Col>
              ))}
            </Row>
          )}
        </Card>
      )}

      {/* 热门图书 */}
      <Card 
        title="热门图书" 
        style={{ marginBottom: 24 }}
        extra={<Link to="/books"><Button type="link">查看更多 <ArrowRightOutlined /></Button></Link>}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {popularBooks.slice(0, 4).map(book => (
              <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                <BookCard book={book} />
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* 当前借阅 */}
      {currentBorrows.length > 0 && (
        <Card title="当前借阅" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            {currentBorrows.slice(0, 4).map(record => (
              <Col xs={24} sm={12} md={8} lg={6} key={record.id}>
                <Card size="small" title={record.Book?.title}>
                  <p>作者: {record.Book?.author}</p>
                  <p>到期日期: {new Date(record.dueDate).toLocaleDateString()}</p>
                  <p>状态: {record.status === 'overdue' ? <span style={{ color: '#ff4d4f' }}>已逾期</span> : '借阅中'}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
};

export default Home;
