import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  message,
  Popconfirm,
  Row,
  Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useBookStore } from '../../stores/bookStore';
import { useCategoryStore } from '../../stores/categoryStore';

const { Option } = Select;
const { TextArea } = Input;

const BookManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form] = Form.useForm();

  const { 
    books, 
    pagination, 
    searchBooks, 
    createBook, 
    updateBook, 
    deleteBook, 
    isLoading 
  } = useBookStore();
  const { categories, getAllCategories } = useCategoryStore();

  useEffect(() => {
    getAllCategories();
    fetchBooks();
  }, []);

  const fetchBooks = (page = 1) => {
    searchBooks({ page, limit: 10, keyword: searchKeyword });
  };

  const handleAdd = () => {
    setEditingBook(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingBook(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    const result = await deleteBook(id);
    if (result.success) {
      message.success('删除成功');
      fetchBooks(pagination.page);
    } else if (result.error) {
      message.error(result.error);
    }
  };

  const handleSubmit = async (values) => {
    if (editingBook) {
      const result = await updateBook(editingBook.id, values);
      if (result.success) {
        message.success('更新成功');
        setIsModalVisible(false);
        fetchBooks(pagination.page);
      } else if (result.error) {
        message.error(result.error);
      }
    } else {
      const result = await createBook(values);
      if (result.success) {
        message.success('创建成功');
        setIsModalVisible(false);
        fetchBooks(1);
      } else if (result.error) {
        message.error(result.error);
      }
    }
  };

  const handleSearch = () => {
    fetchBooks(1);
  };

  const columns = [
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '分类',
      dataIndex: ['Category', 'name'],
      key: 'category',
    },
    {
      title: '库存',
      key: 'stock',
      render: (_, record) => `${record.availableQuantity}/${record.totalQuantity}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这本图书吗？此操作不可恢复。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col flex="auto">
          <Input
            placeholder="搜索图书"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            allowClear
          />
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加图书
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={books}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: pagination.page,
          total: pagination.total,
          pageSize: pagination.limit,
          onChange: fetchBooks,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <Modal
        title={editingBook ? '编辑图书' : '添加图书'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="isbn"
                label="ISBN"
                rules={[{ required: true, message: '请输入ISBN' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="title"
                label="书名"
                rules={[{ required: true, message: '请输入书名' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="author"
                label="作者"
                rules={[{ required: true, message: '请输入作者' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="publisher"
                label="出版社"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="分类"
              >
                <Select placeholder="选择分类">
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="publishYear"
                label="出版年份"
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="totalQuantity"
                label="总库存"
                rules={[{ required: true, message: '请输入库存数量' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="存放位置"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="简介"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingBook ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookManagement;
