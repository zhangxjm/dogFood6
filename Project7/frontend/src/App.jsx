import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Layout, Menu, theme } from 'antd';
import {
  DashboardOutlined,
  ShopOutlined,
  ReadOutlined,
  CalculatorOutlined,
  CreditCardOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard.jsx';
import Shops from './pages/Shops.jsx';
import MeterReadings from './pages/MeterReadings.jsx';
import Bills from './pages/Bills.jsx';
import Payments from './pages/Payments.jsx';
import Overdue from './pages/Overdue.jsx';

const { Header, Content, Sider } = Layout;

function App() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/shops',
      icon: <ShopOutlined />,
      label: '商铺管理',
    },
    {
      key: '/meter-readings',
      icon: <ReadOutlined />,
      label: '水电读数',
    },
    {
      key: '/bills',
      icon: <CalculatorOutlined />,
      label: '费用核算',
    },
    {
      key: '/payments',
      icon: <CreditCardOutlined />,
      label: '缴费记录',
    },
    {
      key: '/overdue',
      icon: <WarningOutlined />,
      label: '欠费提醒',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
      >
        <div
          style={{
            height: 64,
            margin: 16,
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: borderRadiusLG,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? 12 : 16,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? '水电' : '水电费用系统'}
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={[window.location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0 }}>商业商铺水电费用统计系统</h2>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/shops" element={<Shops />} />
            <Route path="/meter-readings" element={<MeterReadings />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/overdue" element={<Overdue />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
