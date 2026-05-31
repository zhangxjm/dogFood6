import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import { HomeOutlined, BookOutlined, VideoCameraOutlined, TrophyOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import Login from './pages/Login';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LiveRoom from './pages/LiveRoom';
import Certificates from './pages/Certificates';
import MyCourses from './pages/MyCourses';
import { User } from './types';

const { Header, Content, Sider } = Layout;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/courses', icon: <BookOutlined />, label: '课程中心' },
    { key: '/my-courses', icon: <BookOutlined />, label: '我的课程' },
    { key: '/live', icon: <VideoCameraOutlined />, label: '直播课堂' },
    { key: '/certificates', icon: <TrophyOutlined />, label: '证书中心' },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 'bold' }}>
          非遗研学平台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[window.location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Dropdown menu={{ items: userMenuItems }}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user.name}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/live" element={<LiveRoom />} />
            <Route path="/live/:courseId" element={<LiveRoom />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
