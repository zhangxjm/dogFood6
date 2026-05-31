import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';
import { apiService } from '../services/api';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      if (values.username === 'admin' && values.password === 'admin123') {
        message.success('登录成功');
        localStorage.setItem('token', 'mock-token');
        onLogin();
      } else {
        message.error('用户名或密码错误');
      }
    } catch (error) {
      message.error('登录失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <GlobalOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <h2 className="login-title">跨境支付结算风控系统</h2>
          <p style={{ color: '#999' }}>Cross-border Payment Risk Control System</p>
        </div>
        <Form
          name="login"
          onFinish={handleLogin}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
          <p>默认账号: admin / admin123</p>
          <p>技术支持: Seata分布式事务</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
