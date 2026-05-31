import { createSignal, onMount } from 'solid-js';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'solid-chartjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [overview, setOverview] = createSignal(null);
  const [dailyData, setDailyData] = createSignal([]);
  const [recentAlerts, setRecentAlerts] = createSignal([]);
  const [feedingNow, setFeedingNow] = createSignal(false);

  onMount(() => {
    fetchOverview();
    fetchDailyStats();
    fetchRecentAlerts();
    
    setInterval(fetchOverview, 30000);
    setInterval(fetchRecentAlerts, 30000);
  });

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/stats/overview');
      const data = await res.json();
      setOverview(data);
    } catch (e) {
      console.error('Failed to fetch overview');
    }
  };

  const fetchDailyStats = async () => {
    try {
      const res = await fetch('/api/stats/feeding/daily?days=7');
      const data = await res.json();
      setDailyData(data);
    } catch (e) {
      console.error('Failed to fetch daily stats');
    }
  };

  const fetchRecentAlerts = async () => {
    try {
      const res = await fetch('/api/alerts?resolved=false');
      const data = await res.json();
      setRecentAlerts(data.slice(0, 5));
    } catch (e) {
      console.error('Failed to fetch alerts');
    }
  };

  const handleManualFeed = async () => {
    setFeedingNow(true);
    try {
      const res = await fetch('/api/devices/1/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portion: 50, pet_id: 1 })
      });
      const data = await res.json();
      alert(data.message);
    } catch (e) {
      alert('投喂失败，请稍后重试');
    }
    setFeedingNow(false);
  };

  const barChartData = {
    labels: dailyData().map(d => d.date.slice(5)),
    datasets: [{
      label: '投喂量 (g)',
      data: dailyData().map(d => d.total_portion),
      backgroundColor: 'rgba(14, 165, 233, 0.6)',
      borderColor: 'rgb(14, 165, 233)',
      borderWidth: 1
    }]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: '近7天投喂趋势' }
    }
  };

  const pieData = overview() ? {
    labels: ['在线设备', '离线设备'],
    datasets: [{
      data: [overview().online_devices, overview().offline_devices],
      backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)']
    }]
  } : { labels: [], datasets: [] };

  const pieOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: '设备状态' }
    }
  };

  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">仪表盘</h1>
        <button 
          onClick={handleManualFeed}
          disabled={feedingNow()}
          class="btn btn-success"
        >
          {feedingNow() ? '投喂中...' : '立即投喂 🐾'}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">宠物总数</p>
              <p class="text-3xl font-bold text-gray-800">{overview()?.total_pets || 0}</p>
            </div>
            <span class="text-4xl">🐾</span>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">在线设备</p>
              <p class="text-3xl font-bold text-green-600">{overview()?.online_devices || 0}</p>
            </div>
            <span class="text-4xl">📱</span>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">今日投喂次数</p>
              <p class="text-3xl font-bold text-blue-600">{overview()?.today_feedings || 0}</p>
            </div>
            <span class="text-4xl">🍽️</span>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm">未处理告警</p>
              <p class="text-3xl font-bold text-red-600">{overview()?.unresolved_alerts || 0}</p>
            </div>
            <span class="text-4xl">🔔</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="card">
          <Bar data={barChartData} options={barOptions} />
        </div>
        <div class="card">
          <Doughnut data={pieData} options={pieOptions} />
        </div>
      </div>

      <div class="card">
        <h2 class="text-lg font-semibold mb-4">最近告警</h2>
        {recentAlerts().length === 0 ? (
          <p class="text-gray-500 text-center py-4">暂无告警</p>
        ) : (
          <div class="space-y-3">
            {recentAlerts().map(alert => (
              <div class={`p-3 rounded-md ${
                alert.severity === 'error' ? 'bg-red-50' : 
                alert.severity === 'critical' ? 'bg-red-100' : 'bg-yellow-50'
              }`}>
                <div class="flex justify-between items-start">
                  <div>
                    <span class={`status-badge ${
                      alert.severity === 'error' ? 'bg-red-200 text-red-800' : 
                      alert.severity === 'critical' ? 'bg-red-300 text-red-900' : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {alert.severity === 'error' ? '错误' : alert.severity === 'critical' ? '严重' : '警告'}
                    </span>
                    <p class="mt-1 text-gray-700">{alert.message}</p>
                  </div>
                  <span class="text-xs text-gray-500">{new Date(alert.created_at).toLocaleString('zh-CN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
