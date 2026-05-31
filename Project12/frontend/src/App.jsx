import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Layout, Menu, theme } from 'antd'
import {
  DashboardOutlined,
  AppstoreOutlined,
  CloudServerOutlined,
  SafetyCertificateOutlined,
  SettingOutlined
} from '@ant-design/icons'
import Dashboard from './pages/Dashboard.jsx'
import HeritageList from './pages/HeritageList.jsx'
import HeritageDetail from './pages/HeritageDetail.jsx'
import PointCloud from './pages/PointCloud.jsx'
import TextureRestoration from './pages/TextureRestoration.jsx'
import Copyright from './pages/Copyright.jsx'

const { Header, Content, Sider } = Layout

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '首页概览'
  },
  {
    key: '/heritage',
    icon: <AppstoreOutlined />,
    label: '文物管理'
  },
  {
    key: '/pointcloud',
    icon: <CloudServerOutlined />,
    label: '点云处理'
  },
  {
    key: '/texture',
    icon: <CloudServerOutlined />,
    label: '纹理修复'
  },
  {
    key: '/copyright',
    icon: <SafetyCertificateOutlined />,
    label: '版权存证'
  }
]

function AppContent() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer }
  } = theme.useToken()

  const selectedKey = location.pathname.startsWith('/heritage') 
    ? '/heritage' 
    : location.pathname

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0
        }}
      >
        <div className="header-logo" style={{ padding: '16px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          {!collapsed && <span>非遗三维复原</span>}
          {collapsed && <span>非遗</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems.map(item => ({
            ...item,
            label: <Link to={item.key}>{item.label}</Link>
          }))}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18 }}>非遗数字化三维复原平台</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#6b7280' }}>管理员</span>
          </div>
        </Header>
        <Content style={{ margin: 0 }}>
          <div className="page-container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/heritage" element={<HeritageList />} />
              <Route path="/heritage/:id" element={<HeritageDetail />} />
              <Route path="/pointcloud" element={<PointCloud />} />
              <Route path="/texture" element={<TextureRestoration />} />
              <Route path="/copyright" element={<Copyright />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}
