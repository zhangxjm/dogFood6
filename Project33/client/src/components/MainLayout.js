import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import { 
  DashboardOutlined, 
  DollarCircleOutlined, 
  SafetyCertificateOutlined, 
  FundOutlined, 
  SwapOutlined, 
  TeamOutlined,
  DatabaseOutlined,
  UserOutlined,
  LogoutOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content, Footer } = Layout;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '系统概览' },
    { key: '/payments', icon: <DollarCircleOutlined />, label: '支付管理' },
    { key: '/risk-control', icon: <SafetyCertificateOutlined />, label: '风控中心' },
    { key: '/settlements', icon: <FundOutlined />, label: '结算管理' },
    { key: '/exchange-rates', icon: <SwapOutlined />, label: '汇率管理' },
    { key: '/users', icon: <TeamOutlined />, label: '用户管理' },
    { key: '/seata-monitor', icon: <DatabaseOutlined />, label: '事务监控' }
  ];

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: '个人信息' },
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' }
    ],
    onClick: ({ key }) => {
      if (key === 'logout') {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  return (
    <>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{ background: '#001529' }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold',
          background: '#002140'
        }}>
          <GlobalOutlined style={{ marginRight: collapsed ? 0 : 8 }} />
          {!collapsed && '跨境支付风控'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>跨境支付结算风控系统</h2>
          <Dropdown menu={userMenu} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
              <span>管理员</span>
            </div>
          </Dropdown>
        </Header>
        <Content className="main-content">
          {children}
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          跨境支付结算风控系统 ©{new Date().getFullYear()} 技术支持：Seata分布式事务
        </Footer>
      </Layout>
    </>
  );
};

export default MainLayout;
