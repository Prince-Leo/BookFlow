import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Select, message, Card, Row, Col, DatePicker } from 'antd';
import { ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useBorrowStore } from '../../stores/borrowStore';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const BorrowManagement = () => {
  const [filters, setFilters] = useState({
    status: undefined,
    dateRange: null
  });

  const { 
    allBorrows, 
    pagination, 
    getAllBorrows, 
    returnBook, 
    isLoading 
  } = useBorrowStore();

  useEffect(() => {
    fetchBorrows();
  }, []);

  const fetchBorrows = (page = 1) => {
    const params = { page, limit: 10 };
    if (filters.status) params.status = filters.status;
    getAllBorrows(params);
  };

  const handleReturn = async (id) => {
    const result = await returnBook(id);
    if (result.success) {
      message.success('还书成功');
      fetchBorrows(pagination.page);
    } else if (result.error) {
      message.error(result.error);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'borrowed':
        return <Tag color="blue">借阅中</Tag>;
      case 'renewed':
        return <Tag color="cyan">已续借</Tag>;
      case 'returned':
        return <Tag color="green">已归还</Tag>;
      case 'overdue':
        return <Tag color="red">已逾期</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: '借阅ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户',
      dataIndex: ['User', 'fullName'],
      key: 'user',
      render: (text, record) => text || record.User?.username,
    },
    {
      title: '图书',
      dataIndex: ['Book', 'title'],
      key: 'book',
    },
    {
      title: '借阅日期',
      dataIndex: 'borrowDate',
      key: 'borrowDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '到期日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '归还日期',
      dataIndex: 'returnDate',
      key: 'returnDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: '续借次数',
      dataIndex: 'renewCount',
      key: 'renewCount',
      width: 100,
    },
    {
      title: '逾期费用',
      dataIndex: 'fineAmount',
      key: 'fineAmount',
      render: (amount) => amount > 0 ? <span style={{ color: '#ff4d4f' }}>¥{amount}</span> : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {(record.status === 'borrowed' || record.status === 'renewed' || record.status === 'overdue') && (
            <Button 
              type="primary" 
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleReturn(record.id)}
            >
              确认还书
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Select
              placeholder="筛选状态"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="borrowed">借阅中</Option>
              <Option value="renewed">已续借</Option>
              <Option value="returned">已归还</Option>
              <Option value="overdue">已逾期</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Button type="primary" onClick={() => fetchBorrows(1)}>
              筛选
            </Button>
            <Button 
              style={{ marginLeft: 8 }} 
              onClick={() => {
                setFilters({ status: undefined, dateRange: null });
                fetchBorrows(1);
              }}
            >
              重置
            </Button>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchBorrows(pagination.page)}
              loading={isLoading}
            >
              刷新
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={allBorrows}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: pagination.page,
          total: pagination.total,
          pageSize: pagination.limit,
          onChange: fetchBorrows,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </div>
  );
};

export default BorrowManagement;
