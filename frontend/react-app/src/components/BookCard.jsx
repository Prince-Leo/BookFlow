import React from 'react';
import { Card, Tag, Button, Rate } from 'antd';
import { HeartOutlined, HeartFilled, BookOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Meta } = Card;

const BookCard = ({ book, isFavorite, onFavorite, showActions = true }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'borrowed':
        return 'warning';
      case 'reserved':
        return 'processing';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return '可借阅';
      case 'borrowed':
        return '已借出';
      case 'reserved':
        return '已预约';
      default:
        return status;
    }
  };

  return (
    <Card
      hoverable
      cover={
        <div style={{ 
          height: 200, 
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {book.coverImage ? (
            <img 
              alt={book.title} 
              src={book.coverImage} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <BookOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
          )}
        </div>
      }
      actions={showActions ? [
        <Button 
          type="text" 
          icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
          onClick={(e) => {
            e.preventDefault();
            onFavorite?.(book.id);
          }}
        >
          {isFavorite ? '已收藏' : '收藏'}
        </Button>,
        <Link to={`/books/${book.id}`}>
          <Button type="link">查看详情</Button>
        </Link>
      ] : undefined}
    >
      <Meta
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              maxWidth: '70%'
            }}>
              {book.title}
            </span>
            <Tag color={getStatusColor(book.status)}>
              {getStatusText(book.status)}
            </Tag>
          </div>
        }
        description={
          <div>
            <p style={{ margin: '4px 0', color: '#666' }}>{book.author}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Rate disabled defaultValue={book.rating} style={{ fontSize: 12 }} />
              <span style={{ fontSize: 12, color: '#999' }}>
                库存: {book.availableQuantity}/{book.totalQuantity}
              </span>
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default BookCard;
