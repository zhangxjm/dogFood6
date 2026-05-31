import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import RiskControl from './pages/RiskControl';
import Settlements from './pages/Settlements';
import ExchangeRates from './pages/ExchangeRates';
import Users from './pages/Users';
import SeataMonitor from './pages/SeataMonitor';
import Login from './pages/Login';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Router>
      <Layout className="app-container">
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/risk-control" element={<RiskControl />} />
            <Route path="/settlements" element={<Settlements />} />
            <Route path="/exchange-rates" element={<ExchangeRates />} />
            <Route path="/users" element={<Users />} />
            <Route path="/seata-monitor" element={<SeataMonitor />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </Layout>
    </Router>
  );
};

export default App;
