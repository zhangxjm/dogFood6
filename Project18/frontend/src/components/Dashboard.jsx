import { createSignal, createEffect, onMount } from 'solid-js';

export default function Dashboard(props) {
  const [stats, setStats] = createSignal(null);
  const [devices, setDevices] = createSignal([]);
  const [sensorData, setSensorData] = createSignal([]);
  const [loading, setLoading] = createSignal(true);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${props.apiBase}/system-stats`);
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await fetch(`${props.apiBase}/devices`);
      const data = await res.json();
      if (data.success && data.data) {
        setDevices(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    }
  };

  const fetchSensorData = async () => {
    try {
      const res = await fetch(`${props.apiBase}/sensor-data?limit=20`);
      const data = await res.json();
      if (data.success && data.data) {
        setSensorData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch sensor data:', err);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchDevices(), fetchSensorData()]);
    setLoading(false);
  };

  onMount(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  });

  const formatTime = (time) => {
    if (!time) return '-';
    const date = new Date(time);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div>
      <div class="page-header">
        <h2>实时监控仪表盘</h2>
        <p>
          <span class="realtime-indicator">
            <span class="realtime-dot"></span>
            数据实时更新中
          </span>
        </p>
      </div>

      {!loading() && stats() && (
        <div class="stats-grid">
          <div class="stat-card">
            <div class="label">设备总数</div>
            <div class="value">{stats().total_devices}</div>
            <div class="change positive">在线 {stats().online_devices} 台</div>
          </div>
          <div class="stat-card">
            <div class="label">离线设备</div>
            <div class="value">{stats().offline_devices}</div>
            <div class="change negative">需关注</div>
          </div>
          <div class="stat-card">
            <div class="label">运行中任务</div>
            <div class="value">{stats().active_tasks}</div>
            <div class="change positive">效率正常</div>
          </div>
          <div class="stat-card">
            <div class="label">待处理缓存</div>
            <div class="value">{stats().cache_count}</div>
            <div class="change">离线数据</div>
          </div>
          <div class="stat-card">
            <div class="label">平均CPU使用率</div>
            <div class="value">{(stats().cpu_usage_avg || 0).toFixed(1)}%</div>
            <div class={stats().cpu_usage_avg > 80 ? 'change negative' : 'change positive'}>
              {stats().cpu_usage_avg > 80 ? '偏高' : '正常'}
            </div>
          </div>
          <div class="stat-card">
            <div class="label">平均内存使用率</div>
            <div class="value">{(stats().memory_usage_avg || 0).toFixed(1)}%</div>
            <div class={stats().memory_usage_avg > 80 ? 'change negative' : 'change positive'}>
              {stats().memory_usage_avg > 80 ? '偏高' : '正常'}
            </div>
          </div>
        </div>
      )}

      <div class="card">
        <div class="card-header">
          <h3>设备状态监控</h3>
          <button class="btn btn-outline btn-sm" onClick={refreshData}>
            刷新
          </button>
        </div>
        <div class="device-grid">
          {devices().map((device) => (
            <div class="device-card">
              <div class="device-card-header">
                <div>
                  <h4>{device.name}</h4>
                  <p>{device.ip_address}</p>
                </div>
                <span class={`status-badge status-${device.status}`}>
                  {device.status === 'online' ? '在线' : '离线'}
                </span>
              </div>
              <div class="device-stats">
                <div class="device-stat">
                  <div class="device-stat-label">CPU</div>
                  <div class="device-stat-value">{device.cpu_usage.toFixed(1)}%</div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill cpu" 
                      style={{ width: `${device.cpu_usage}%` }}
                    ></div>
                  </div>
                </div>
                <div class="device-stat">
                  <div class="device-stat-label">内存</div>
                  <div class="device-stat-value">{device.memory_usage.toFixed(1)}%</div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill memory" 
                      style={{ width: `${device.memory_usage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <p style={{ 'font-size': '11px', color: 'var(--text-secondary)', 'margin-top': '8px' }}>
                最后在线: {formatTime(device.last_seen)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>最新传感器数据</h3>
        </div>
        {sensorData().length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>设备ID</th>
                <th>指标</th>
                <th>数值</th>
                <th>单位</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              {sensorData().slice(0, 10).map((item) => (
                <tr>
                  <td>{item.device_id.substring(0, 8)}...</td>
                  <td>{item.metric}</td>
                  <td>{item.value.toFixed(2)}</td>
                  <td>{item.unit}</td>
                  <td>{formatTime(item.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div class="empty-state">
            <div class="empty-state-icon">📊</div>
            <p>暂无传感器数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
