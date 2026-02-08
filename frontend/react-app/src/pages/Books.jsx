import React, { useEffect, useState } from 'react';
import { 
  Row, 
  Col, 
  Input, 
  Select, 
  Button, 
  Pagination, 
  Spin, 
  Empty,
  message,
  Form
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import BookCard from '../components/BookCard';
import { useBookStore } from '../stores/bookStore';
import { useCategoryStore } from '../stores/categoryStore';
import { useBorrowStore } from '../stores/borrowStore';

const { Option } = Select;

const Books = () => {
  const [searchForm, setSearchForm] = useState({
    keyword: '',
    category: undefined,
    status: undefined
  });

  const { 
    books, 
    pagination, 
    searchBooks, 
    addToFavorites, 
    isLoading 
  } = useBookStore();
  const { categories, getAllCategories } = useCategoryStore();
  const { borrowBook, reserveBook } = useBorrowStore();

  useEffect(() => {
    getAllCategories();
    searchBooks();
  }, []);

  const handleSearch = () => {
    searchBooks({ 
      ...searchForm, 
      page: 1, 
      limit: pagination.limit 
    });
  };

  const handleReset = () => {
    setSearchForm({ keyword: '', category: undefined, status: undefined });
    searchBooks({ page: 1, limit: pagination.limit });
  };

  const handlePageChange = (page) => {
    searchBooks({ 
      ...searchForm, 
      page, 
      limit: pagination.limit 
    });
  };

  const handleFavorite = async (bookId) => {
    const result = await addToFavorites(bookId);
    if (result.success) {
      message.success('已添加到收藏夹');
    } else if (result.error) {
      message.error(result.error);
    }
  };

  const handleBorrow = async (bookId) => {
    const result = await borrowBook(bookId);
    if (result.success) {
      message.success('借书成功');
      searchBooks({ ...searchForm, page: pagination.page, limit: pagination.limit });
    } else if (result.error) {
      message.error(result.error);
    }
  };

  const handleReserve = async (bookId) => {
    const result = await reserveBook(bookId);
    if (result.success) {
      message.success('预约成功');
    } else if (result.error) {
      message.error(result.error);
    }
  };

  return (
    <div>
      {/* 搜索栏 */}
      <div style={{ marginBottom: 24, padding: 24, background: '#f5f5f5', borderRadius: 8 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Input
              placeholder="搜索书名、作者、ISBN"
              value={searchForm.keyword}
              onChange={(e) => setSearchForm({ ...searchForm, keyword: e.target.value })}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="选择分类"
              value={searchForm.category}
              onChange={(value) => setSearchForm({ ...searchForm, category: value })}
              style={{ width: '100%' }}
              allowClear
            >
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="图书状态"
              value={searchForm.status}
              onChange={(value) => setSearchForm({ ...searchForm, status: value })}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="available">可借阅</Option>
              <Option value="borrowed">已借出</Option>
              <Option value="reserved">已预约</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Button type="primary" onClick={handleSearch} block>
              搜索
            </Button>
          </Col>
        </Row>
        <Row style={{ marginTop: 16 }}>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Col>
        </Row>
      </div>

      {/* 图书列表 */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : books.length === 0 ? (
        <Empty description="暂无图书" style={{ padding: 60 }} />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {books.map(book => (
              <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                <BookCard 
                  book={book} 
                  onFavorite={handleFavorite}
                />
              </Col>
            ))}
          </Row>
          
          {/* 分页 */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={pagination.page}
              total={pagination.total}
              pageSize={pagination.limit}
              onChange={handlePageChange}
              showSizeChanger={false}
              showTotal={(total) => `共 ${total} 条`}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Books;
