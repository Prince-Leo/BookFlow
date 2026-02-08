import React, { useEffect } from 'react';
import { Row, Col, Card, Button, Empty, Spin, message } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useBookStore } from '../stores/bookStore';

const Favorites = () => {
  const { favorites, getFavorites, isLoading } = useBookStore();

  useEffect(() => {
    getFavorites();
  }, []);

  const handleRemove = async (id) => {
    // 这里需要添加取消收藏的API
    message.success('已从收藏夹移除');
    getFavorites();
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <Empty 
        description="暂无收藏图书" 
        style={{ padding: 60 }}
      >
        <Link to="/books">
          <Button type="primary">去浏览图书</Button>
        </Link>
      </Empty>
    );
  }

  return (
    <div>
      <h2>我的收藏</h2>
      <Row gutter={[16, 16]}>
        {favorites.map(item => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
            <Card
              hoverable
              cover={
                <div style={{ 
                  height: 200, 
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {item.Book?.coverImage ? (
                    <img 
                      alt={item.Book.title} 
                      src={item.Book.coverImage}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: 48, color: '#d9d9d9' }}>📚</span>
                  )}
                </div>
              }
              actions={[
                <Link to={`/books/${item.Book?.id}`}>
                  <Button type="link" icon={<EyeOutlined />}>查看</Button>
                </Link>,
                <Button 
                  type="link" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemove(item.id)}
                >
                  移除
                </Button>
              ]}
            >
              <Card.Meta
                title={item.Book?.title}
                description={item.Book?.author}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Favorites;
