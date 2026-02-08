import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Button, 
  Rate, 
  List, 
  Avatar, 
  Spin, 
  message,
  Divider,
  Form,
  Input,
  Modal
} from 'antd';
import { 
  BookOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  EnvironmentOutlined,
  HeartOutlined,
  HeartFilled,
  ArrowLeftOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { useBookStore } from '../stores/bookStore';
import { useBorrowStore } from '../stores/borrowStore';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [reviewForm] = Form.useForm();

  const { 
    currentBook, 
    getBookById, 
    addReview, 
    addToFavorites,
    isLoading 
  } = useBookStore();
  const { borrowBook, reserveBook } = useBorrowStore();

  useEffect(() => {
    getBookById(id);
  }, [id]);

  const handleBorrow = async () => {
    const result = await borrowBook(currentBook.id);
    if (result.success) {
      message.success('借书成功');
      getBookById(id);
    } else if (result.error) {
      message.error(result.error);
    }
  };

  const handleReserve = async () => {
    const result = await reserveBook(currentBook.id);
    if (result.success) {
      message.success('预约成功');
      getBookById(id);
    } else if (result.error) {
      message.error(result.error);
    }
  };

  const handleFavorite = async () => {
    const result = await addToFavorites(currentBook.id);
    if (result.success) {
      message.success('已添加到收藏夹');
    } else if (result.error) {
      message.error(result.error);
    }
  };

  const handleSubmitReview = async (values) => {
    const result = await addReview(currentBook.id, values);
    if (result.success) {
      message.success('评论提交成功');
      setIsReviewModalVisible(false);
      reviewForm.resetFields();
      getBookById(id);
    } else if (result.error) {
      message.error(result.error);
    }
  };

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

  if (isLoading || !currentBook) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/books')}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Card>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <div style={{ 
              height: 400, 
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              overflow: 'hidden'
            }}>
              {currentBook.coverImage ? (
                <img 
                  alt={currentBook.title} 
                  src={currentBook.coverImage}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <BookOutlined style={{ fontSize: 120, color: '#d9d9d9' }} />
              )}
            </div>
          </Col>
          <Col xs={24} md={16}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Title level={2} style={{ margin: 0 }}>{currentBook.title}</Title>
              <Tag color={getStatusColor(currentBook.status)} style={{ fontSize: 14, padding: '4px 12px' }}>
                {getStatusText(currentBook.status)}
              </Tag>
            </div>

            <div style={{ marginTop: 16 }}>
              <Rate disabled value={currentBook.rating} style={{ fontSize: 18 }} />
              <Text style={{ marginLeft: 8 }}>({currentBook.ratingCount} 条评价)</Text>
            </div>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary"><UserOutlined /> 作者:</Text>
                <Text style={{ marginLeft: 8 }}>{currentBook.author}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary"><BookOutlined /> ISBN:</Text>
                <Text style={{ marginLeft: 8 }}>{currentBook.isbn}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary"><CalendarOutlined /> 出版年份:</Text>
                <Text style={{ marginLeft: 8 }}>{currentBook.publishYear || '未知'}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary"><EnvironmentOutlined /> 位置:</Text>
                <Text style={{ marginLeft: 8 }}>{currentBook.location || '未知'}</Text>
              </Col>
            </Row>

            <Divider />

            <Paragraph>{currentBook.description || '暂无简介'}</Paragraph>

            <Divider />

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Text>库存: <strong>{currentBook.availableQuantity}</strong> / {currentBook.totalQuantity}</Text>
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              {currentBook.status === 'available' && currentBook.availableQuantity > 0 ? (
                <Button type="primary" size="large" icon={<ShoppingOutlined />} onClick={handleBorrow}>
                  立即借阅
                </Button>
              ) : (
                <Button type="primary" size="large" icon={<ShoppingOutlined />} onClick={handleReserve}>
                  预约图书
                </Button>
              )}
              <Button 
                size="large" 
                icon={<HeartOutlined />}
                onClick={handleFavorite}
              >
                收藏
              </Button>
              <Button 
                size="large"
                onClick={() => setIsReviewModalVisible(true)}
              >
                写评论
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 评论列表 */}
      <Card title="用户评价" style={{ marginTop: 24 }}>
        {currentBook.Reviews?.length === 0 ? (
          <Text type="secondary">暂无评论</Text>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={currentBook.Reviews || []}
            renderItem={review => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <div>
                      <Text strong>{review.User?.fullName || review.User?.username}</Text>
                      <Rate disabled value={review.rating} style={{ marginLeft: 12, fontSize: 12 }} />
                    </div>
                  }
                  description={
                    <div>
                      <Paragraph>{review.comment}</Paragraph>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 评论弹窗 */}
      <Modal
        title="写评论"
        open={isReviewModalVisible}
        onCancel={() => setIsReviewModalVisible(false)}
        footer={null}
      >
        <Form form={reviewForm} onFinish={handleSubmitReview} layout="vertical">
          <Form.Item
            name="rating"
            label="评分"
            rules={[{ required: true, message: '请选择评分' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="comment"
            label="评论内容"
            rules={[{ required: true, message: '请输入评论内容' }]}
          >
            <TextArea rows={4} placeholder="分享您的阅读体验..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              提交评论
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookDetail;
