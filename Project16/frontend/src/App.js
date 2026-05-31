import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PetList from './pages/PetList';
import RecordList from './pages/RecordList';
import DiagnosisPage from './pages/DiagnosisPage';
import DiagnosisDetail from './pages/DiagnosisDetail';
import Layout from './components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" />
          ) : (
            <Login onLogin={() => setIsAuthenticated(true)} />
          )
        }
      />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <Layout onLogout={() => setIsAuthenticated(false)}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pets" element={<PetList />} />
                <Route path="/records" element={<RecordList />} />
                <Route path="/diagnosis" element={<DiagnosisPage />} />
                <Route path="/diagnosis/:id" element={<DiagnosisDetail />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;
