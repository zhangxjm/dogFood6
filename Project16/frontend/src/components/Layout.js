import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  ScanOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = AntLayout;

const Layout = ({ children, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/pets',
      icon: <TeamOutlined />,
      label: '宠物管理',
      onClick: () => navigate('/pets'),
    },
    {
      key: '/records',
      icon: <FileTextOutlined />,
      label: '医疗记录',
      onClick: () => navigate('/records'),
    },
    {
      key: '/diagnosis',
      icon: <ScanOutlined />,
      label: 'AI诊断',
      onClick: () => navigate('/diagnosis'),
    },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        onLogout();
        navigate('/login');
      },
    },
  ];

  return (
    <AntLayout>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ minHeight: '100vh' }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontSize: collapsed ? 14 : 18,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'AI' : '宠物医疗AI'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <AntLayout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <h2 style={{ margin: 0, color: '#1890ff' }}>宠物医疗影像AI诊断系统</h2>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>医生</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px', background: '#f0f2f5' }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
