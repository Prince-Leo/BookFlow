import React, { useEffect, useState } from 'react';
import { Table, Card, Pagination, Tag, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useBorrowStore } from '../stores/borrowStore';
import dayjs from 'dayjs';

const BorrowHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { borrowHistory, pagination, getBorrowHistory, isLoading } = useBorrowStore();

  useEffect(() => {
    fetchHistory();
  }, [currentPage]);

  const fetchHistory = () => {
    getBorrowHistory({ page: currentPage, limit: 10 });
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
      title: '图书名称',
      dataIndex: ['Book', 'title'],
      key: 'title',
    },
    {
      title: '作者',
      dataIndex: ['Book', 'author'],
      key: 'author',
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
      title: '逾期费用',
      dataIndex: 'fineAmount',
      key: 'fineAmount',
      render: (amount) => amount > 0 ? <span style={{ color: '#ff4d4f' }}>¥{amount}</span> : '-',
    },
  ];

  return (
    <div>
      <Card 
        title="借阅历史" 
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchHistory}
            loading={isLoading}
          >
            刷新
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={borrowHistory}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          locale={{ emptyText: '暂无借阅历史' }}
        />
        
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={pagination.page}
            total={pagination.total}
            pageSize={pagination.limit}
            onChange={setCurrentPage}
            showSizeChanger={false}
            showTotal={(total) => `共 ${total} 条`}
          />
        </div>
      </Card>
    </div>
  );
};

export default BorrowHistory;
