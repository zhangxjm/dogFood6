import { createSignal, onMount } from 'solid-js';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'solid-chartjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const Stats = () => {
  const [dailyData, setDailyData] = createSignal([]);
  const [hourlyData, setHourlyData] = createSignal([]);
  const [alertStats, setAlertStats] = createSignal(null);
  const [pets, setPets] = createSignal([]);
  const [selectedPet, setSelectedPet] = createSignal('');
  const [days, setDays] = createSignal(7);

  onMount(() => {
    fetchPets();
    fetchStats();
  });

  const fetchPets = async () => {
    try {
      const res = await fetch('/api/pets');
      const data = await res.json();
      setPets(data);
    } catch (e) {
      console.error('Failed to fetch pets');
    }
  };

  const fetchStats = async () => {
    try {
      const petParam = selectedPet() ? `&pet_id=${selectedPet()}` : '';
      const [dailyRes, hourlyRes, alertRes] = await Promise.all([
        fetch(`/api/stats/feeding/daily?days=${days()}${petParam}`),
        fetch(`/api/stats/feeding/hourly?days=1${petParam}`),
        fetch(`/api/stats/alerts?days=${days()}`)
      ]);
      
      setDailyData(await dailyRes.json());
      setHourlyData(await hourlyRes.json());
      setAlertStats(await alertRes.json());
    } catch (e) {
      console.error('Failed to fetch stats');
    }
  };

  const handlePetChange = (e) => {
    setSelectedPet(e.target.value);
    fetchStats();
  };

  const handleDaysChange = (newDays) => {
    setDays(newDays);
    fetchStats();
  };

  const dailyChartData = {
    labels: dailyData().map(d => d.date.slice(5)),
    datasets: [
      {
        label: '投喂量 (g)',
        data: dailyData().map(d => d.total_portion),
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: '投喂次数',
        data: dailyData().map(d => d.feeding_count * 50),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'transparent',
        yAxisID: 'y1',
        tension: 0.4
      }
    ]
  };

  const dailyOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: { display: true, text: '每日投喂趋势' }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: '投喂量 (g)' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: '投喂次数' },
        grid: { drawOnChartArea: false }
      }
    }
  };

  const hourlyChartData = {
    labels: hourlyData().map(d => d.hour.slice(11, 16)),
    datasets: [{
      label: '投喂量 (g)',
      data: hourlyData().map(d => d.total_portion),
      backgroundColor: 'rgba(168, 85, 247, 0.6)',
      borderColor: 'rgb(168, 85, 247)',
      borderWidth: 1
    }]
  };

  const hourlyOptions = {
    responsive: true,
    plugins: {
      title: { display: true, text: '今日24小时投喂分布' }
    }
  };

  return (
    <div>
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 class="text-2xl font-bold text-gray-800">数据统计</h1>
        <div class="flex flex-wrap gap-3">
          <select
            value={selectedPet()}
            onChange={handlePetChange}
            class="px-3 py-2 border rounded-md"
          >
            <option value="">全部宠物</option>
            {pets().map(pet => (
              <option value={pet.id}>{pet.name}</option>
            ))}
          </select>
          <div class="flex rounded-md overflow-hidden border">
            {[7, 14, 30].map(d => (
              <button
                onClick={() => handleDaysChange(d)}
                class={`px-4 py-2 ${days() === d ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
              >
                {d}天
              </button>
            ))}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="card">
          <Line data={dailyChartData} options={dailyOptions} />
        </div>
        <div class="card">
          <Bar data={hourlyChartData} options={hourlyOptions} />
        </div>
      </div>

      {alertStats() && (
        <div class="card mb-6">
          <h2 class="text-lg font-semibold mb-4">告警统计（近{days()}天）</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg text-center">
              <p class="text-3xl font-bold text-gray-800">{alertStats().total}</p>
              <p class="text-sm text-gray-500">总告警数</p>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg text-center">
              <p class="text-3xl font-bold text-yellow-600">{alertStats().by_severity.warning || 0}</p>
              <p class="text-sm text-yellow-600">警告</p>
            </div>
            <div class="bg-red-50 p-4 rounded-lg text-center">
              <p class="text-3xl font-bold text-red-600">{alertStats().by_severity.error || 0}</p>
              <p class="text-sm text-red-600">错误</p>
            </div>
            <div class="bg-red-100 p-4 rounded-lg text-center">
              <p class="text-3xl font-bold text-red-800">{alertStats().by_severity.critical || 0}</p>
              <p class="text-sm text-red-800">严重</p>
            </div>
          </div>

          {Object.keys(alertStats().by_type).length > 0 && (
            <div class="mt-6">
              <h3 class="font-medium mb-3">告警类型分布</h3>
              <div class="flex flex-wrap gap-2">
                {Object.entries(alertStats().by_type).map(([type, count]) => (
                  <span key={type} class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100">
                    {type === 'low_battery' ? '🔋 低电量' :
                     type === 'device_offline' ? '📴 设备离线' :
                     type === 'feeding_failed' ? '❌ 投喂失败' : type}
                    <span class="ml-2 font-semibold">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div class="card">
        <h2 class="text-lg font-semibold mb-4">统计明细</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-2 text-sm font-medium text-gray-500">日期</th>
                <th class="text-left py-2 text-sm font-medium text-gray-500">投喂总量 (g)</th>
                <th class="text-left py-2 text-sm font-medium text-gray-500">投喂次数</th>
                <th class="text-left py-2 text-sm font-medium text-gray-500">平均每次 (g)</th>
              </tr>
            </thead>
            <tbody>
              {dailyData().reverse().map(day => (
                <tr class="border-b border-gray-100">
                  <td class="py-2 text-sm">{day.date}</td>
                  <td class="py-2 text-sm font-medium">{day.total_portion.toFixed(1)}</td>
                  <td class="py-2 text-sm">{day.feeding_count}</td>
                  <td class="py-2 text-sm">
                    {day.feeding_count > 0 ? (day.total_portion / day.feeding_count).toFixed(1) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Stats;
