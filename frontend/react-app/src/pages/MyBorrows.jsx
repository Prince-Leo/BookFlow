import React, { useEffect } from 'react';
import { Table, Button, Tag, Space, Card, message, Popconfirm } from 'antd';
import { ReloadOutlined, ReturnIcon } from '@ant-design/icons';
import { useBorrowStore } from '../stores/borrowStore';
import dayjs from 'dayjs';

const MyBorrows = () => {
  const { currentBorrows, getCurrentBorrows, returnBook, renewBook, isLoading } = useBorrowStore();

  useEffect(() => {
    getCurrentBorrows();
  }, []);

  const handleReturn = async (id) => {
    const result = await returnBook(id);
    if (result.success) {
      message.success(result.fineAmount > 0 
        ? `还书成功，逾期费用: ¥${result.fineAmount}` 
        : '还书成功'
      );
      getCurrentBorrows();
    } else if (result.error) {
      message.error(result.error);
    }
  };

  const handleRenew = async (id) => {
    const result = await renewBook(id);
    if (result.success) {
      message.success('续借成功');
      getCurrentBorrows();
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
      render: (date, record) => {
        const isOverdue = dayjs().isAfter(dayjs(date));
        return (
          <span style={{ color: isOverdue || record.status === 'overdue' ? '#ff4d4f' : 'inherit' }}>
            {dayjs(date).format('YYYY-MM-DD')}
          </span>
        );
      },
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
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="确认还书"
            description="确定要归还这本图书吗？"
            onConfirm={() => handleReturn(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="primary" size="small">
              还书
            </Button>
          </Popconfirm>
          {record.renewCount < 2 && record.status !== 'overdue' && (
            <Button 
              size="small" 
              onClick={() => handleRenew(record.id)}
            >
              续借
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title="当前借阅" 
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={getCurrentBorrows}
            loading={isLoading}
          >
            刷新
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={currentBorrows}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          locale={{ emptyText: '暂无借阅记录' }}
        />
      </Card>
    </div>
  );
};

export default MyBorrows;
