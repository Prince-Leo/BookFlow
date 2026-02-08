import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Empty, Spin, message, Popconfirm } from 'antd';
import { DeleteOutlined, BookOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { borrowApi } from '../services/api';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await borrowApi.getReservations();
      setReservations(response.reservations || []);
    } catch (error) {
      message.error('获取预约列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await borrowApi.cancelReservation(id);
      message.success('预约已取消');
      fetchReservations();
    } catch (error) {
      message.error(error.message || '取消预约失败');
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <Tag color="blue">等待中</Tag>;
      case 'fulfilled':
        return <Tag color="green">已满足</Tag>;
      case 'cancelled':
        return <Tag color="gray">已取消</Tag>;
      case 'expired':
        return <Tag color="red">已过期</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: '图书',
      key: 'book',
      render: (_, record) => (
        <Space>
          <BookOutlined />
          <Link to={`/books/${record.Book?.id}`}>
            {record.Book?.title || '未知图书'}
          </Link>
        </Space>
      ),
    },
    {
      title: '作者',
      key: 'author',
      render: (_, record) => record.Book?.author || '-',
    },
    {
      title: '预约日期',
      dataIndex: 'reservationDate',
      key: 'reservationDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: '到期日期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Popconfirm
              title="确认取消预约"
              description="确定要取消这个预约吗？"
              onConfirm={() => handleCancel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button danger icon={<DeleteOutlined />} size="small">
                取消预约
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <Empty
        description="暂无预约记录"
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
      <h2>我的预约</h2>
      <Table
        columns={columns}
        dataSource={reservations}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </div>
  );
};

export default Reservations;
