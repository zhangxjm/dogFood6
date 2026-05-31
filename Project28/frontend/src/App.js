import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  RocketOutlined,
  DashboardOutlined,
  GlobalOutlined,
  WarningOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SatelliteList from './pages/SatelliteList';
import OrbitSimulation from './pages/OrbitSimulation';
import CollisionDetection from './pages/CollisionDetection';

const { Header, Content, Sider } = Layout;

const App = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '数据概览',
    },
    {
      key: '/satellites',
      icon: <RocketOutlined />,
      label: '卫星管理',
    },
    {
      key: '/simulation',
      icon: <GlobalOutlined />,
      label: '轨道仿真',
    },
    {
      key: '/collision',
      icon: <WarningOutlined />,
      label: '碰撞预警',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="ant-layout-header">
        <div className="logo">
          <GlobalOutlined style={{ fontSize: '24px' }} />
          <span>航天卫星轨道计算仿真平台</span>
        </div>
        <div style={{ color: 'white' }}>
          <SettingOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
        </div>
      </Header>
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          width={200}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: 8,
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/satellites" element={<SatelliteList />} />
              <Route path="/simulation" element={<OrbitSimulation />} />
              <Route path="/collision" element={<CollisionDetection />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;
