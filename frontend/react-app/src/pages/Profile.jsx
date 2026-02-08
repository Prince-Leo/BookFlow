import React, { useEffect } from 'react';
import { Card, Form, Input, Button, message, Row, Col, Statistic } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, BookOutlined, HeartOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import { useBookStore } from '../stores/bookStore';

const Profile = () => {
  const [form] = Form.useForm();
  const { user, updateProfile, isLoading } = useAuthStore();
  const { getStatistics, statistics } = useBookStore();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone
      });
    }
    getStatistics();
  }, [user, form]);

  const handleSubmit = async (values) => {
    const result = await updateProfile(values);
    if (result.success) {
      message.success('个人信息更新成功');
    } else if (result.error) {
      message.error(result.error);
    }
  };

  return (
    <div>
      <Row gutter={24}>
        <Col xs={24} md={16}>
          <Card title="个人信息">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input prefix={<UserOutlined />} disabled />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>

              <Form.Item
                name="fullName"
                label="真实姓名"
                rules={[{ required: true, message: '请输入真实姓名' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="phone"
                label="手机号"
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="我的数据">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Statistic
                  title="当前借阅"
                  value={user?.borrowCount || 0}
                  suffix={`/ ${user?.maxBooks || 5}`}
                  prefix={<BookOutlined />}
                />
              </Col>
              <Col span={24}>
                <Statistic
                  title="用户角色"
                  value={user?.role === 'admin' ? '管理员' : user?.role === 'librarian' ? '图书管理员' : '普通用户'}
                  prefix={<UserOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
