import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Select, 
  Input, 
  message,
  Popconfirm,
  Row,
  Col,
  Card
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { userApi } from '../../services/api';

const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState(undefined);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (searchKeyword) params.keyword = searchKeyword;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      
      const response = await userApi.getAll(params);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleUpdateRole = async (id, role) => {
    try {
      await userApi.updateRole(id, role);
      message.success('角色更新成功');
      fetchUsers(pagination.page);
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await userApi.updateStatus(id, status);
      message.success('状态更新成功');
      fetchUsers(pagination.page);
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await userApi.delete(id);
      message.success('删除成功');
      fetchUsers(pagination.page);
    } catch (error) {
      message.error(error.message || '删除失败');
    }
  };

  const getRoleTag = (role) => {
    switch (role) {
      case 'admin':
        return <Tag color="red">管理员</Tag>;
      case 'librarian':
        return <Tag color="blue">图书管理员</Tag>;
      default:
        return <Tag color="default">普通用户</Tag>;
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'active':
        return <Tag color="green">正常</Tag>;
      case 'inactive':
        return <Tag color="orange">未激活</Tag>;
      case 'suspended':
        return <Tag color="red">已禁用</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '真实姓名',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        <Select
          value={role}
          onChange={(value) => handleUpdateRole(record.id, value)}
          style={{ width: 100 }}
        >
          <Option value="user">普通用户</Option>
          <Option value="librarian">图书管理员</Option>
          <Option value="admin">管理员</Option>
        </Select>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleUpdateStatus(record.id, value)}
          style={{ width: 100 }}
        >
          <Option value="active">正常</Option>
          <Option value="inactive">未激活</Option>
          <Option value="suspended">已禁用</Option>
        </Select>
      ),
    },
    {
      title: '借阅数',
      dataIndex: 'borrowCount',
      key: 'borrowCount',
      width: 80,
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="确认删除"
            description="确定要删除该用户吗？此操作不可恢复。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />} size="small">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={6}>
            <Input
              placeholder="搜索用户"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={() => fetchUsers(1)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={5}>
            <Select
              placeholder="角色筛选"
              value={roleFilter}
              onChange={(value) => setRoleFilter(value)}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="user">普通用户</Option>
              <Option value="librarian">图书管理员</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Col>
          <Col xs={24} sm={5}>
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="active">正常</Option>
              <Option value="inactive">未激活</Option>
              <Option value="suspended">已禁用</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Button type="primary" onClick={() => fetchUsers(1)}>
              筛选
            </Button>
            <Button 
              style={{ marginLeft: 8 }} 
              onClick={() => {
                setSearchKeyword('');
                setRoleFilter(undefined);
                setStatusFilter(undefined);
                fetchUsers(1);
              }}
            >
              重置
            </Button>
            <Button 
              style={{ marginLeft: 8 }} 
              icon={<ReloadOutlined />} 
              onClick={() => fetchUsers(pagination.page)}
              loading={loading}
            >
              刷新
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          total: pagination.total,
          pageSize: pagination.limit,
          onChange: fetchUsers,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </div>
  );
};

export default UserManagement;
