import { createSignal, onMount, createEffect } from 'solid-js';
import Dashboard from './pages/Dashboard';
import Pets from './pages/Pets';
import Devices from './pages/Devices';
import Stats from './pages/Stats';
import Alerts from './pages/Alerts';

const App = () => {
  const [currentPage, setCurrentPage] = createSignal('dashboard');
  const [alertCount, setAlertCount] = createSignal(0);

  onMount(() => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    setCurrentPage(hash);
    fetchAlertCount();
    setInterval(fetchAlertCount, 30000);
    
    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.replace('#', '') || 'dashboard';
      setCurrentPage(newHash);
    });
  });

  const fetchAlertCount = async () => {
    try {
      const res = await fetch('/api/alerts/unresolved/count');
      const data = await res.json();
      setAlertCount(data.total);
    } catch (e) {
      console.error('Failed to fetch alert count');
    }
  };

  const navigate = (page) => {
    window.location.hash = page;
  };

  const navItems = [
    { page: 'dashboard', label: '仪表盘', icon: '📊' },
    { page: 'pets', label: '宠物管理', icon: '🐾' },
    { page: 'devices', label: '设备管理', icon: '📱' },
    { page: 'stats', label: '数据统计', icon: '📈' },
    { page: 'alerts', label: '告警中心', icon: '🔔' },
  ];

  const renderPage = () => {
    switch (currentPage()) {
      case 'dashboard': return <Dashboard />;
      case 'pets': return <Pets />;
      case 'devices': return <Devices />;
      case 'stats': return <Stats />;
      case 'alerts': return <Alerts />;
      default: return <Dashboard />;
    }
  };

  return (
    <div class="min-h-screen bg-gray-100">
      <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex justify-between h-16 items-center">
            <div class="flex items-center">
              <span class="text-2xl mr-2">🐕</span>
              <span class="text-xl font-bold text-gray-800">宠物智能喂养系统</span>
            </div>
            <div class="flex space-x-1">
              {navItems.map((item) => (
                <button
                  onClick={() => navigate(item.page)}
                  class={`inline-flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                    currentPage() === item.page
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-300'
                  }`}
                >
                  <span class="mr-1">{item.icon}</span>
                  {item.label}
                  {item.page === 'alerts' && alertCount() > 0 && (
                    <span class="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {alertCount()}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main class="max-w-7xl mx-auto py-6 px-4">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
