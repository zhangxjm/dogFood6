import { createSignal, createEffect, onMount } from 'solid-js';
import Dashboard from './components/Dashboard.jsx';
import ProductLines from './components/ProductLines.jsx';
import Devices from './components/Devices.jsx';
import Tasks from './components/Tasks.jsx';
import Logs from './components/Logs.jsx';
import OfflineCache from './components/OfflineCache.jsx';

const API_BASE = '/api';

export default function App() {
  const [activePage, setActivePage] = createSignal('dashboard');

  const navItems = [
    { id: 'dashboard', name: '实时监控', icon: '📊' },
    { id: 'productLines', name: '产线管理', icon: '🏭' },
    { id: 'devices', name: '设备管理', icon: '⚙️' },
    { id: 'tasks', name: '任务调度', icon: '📋' },
    { id: 'logs', name: '系统日志', icon: '📝' },
    { id: 'offlineCache', name: '离线缓存', icon: '💾' },
  ];

  const renderPage = () => {
    switch (activePage()) {
      case 'dashboard':
        return <Dashboard apiBase={API_BASE} />;
      case 'productLines':
        return <ProductLines apiBase={API_BASE} />;
      case 'devices':
        return <Devices apiBase={API_BASE} />;
      case 'tasks':
        return <Tasks apiBase={API_BASE} />;
      case 'logs':
        return <Logs apiBase={API_BASE} />;
      case 'offlineCache':
        return <OfflineCache apiBase={API_BASE} />;
      default:
        return <Dashboard apiBase={API_BASE} />;
    }
  };

  return (
    <div class="app-container">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h1>边缘计算中台</h1>
          <p>工业实时监控系统</p>
        </div>
        <nav class="nav-menu">
          {navItems.map((item) => (
            <div
              class={`nav-item ${activePage() === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span class="nav-icon">{item.icon}</span>
              <span class="nav-text">{item.name}</span>
            </div>
          ))}
        </nav>
      </aside>
      <main class="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
