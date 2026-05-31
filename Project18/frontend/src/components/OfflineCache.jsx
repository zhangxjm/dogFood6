import { createSignal, onMount, For } from 'solid-js';

export default function OfflineCache(props) {
  const [cache, setCache] = createSignal([]);
  const [devices, setDevices] = createSignal([]);
  const [syncing, setSyncing] = createSignal(false);

  const fetchData = async () => {
    try {
      const [cacheRes, devicesRes] = await Promise.all([
        fetch(`${props.apiBase}/offline-cache`),
        fetch(`${props.apiBase}/devices`),
      ]);
      const cacheData = await cacheRes.json();
      const devicesData = await devicesRes.json();

      if (cacheData.success) {
        setCache(cacheData.data);
      }
      if (devicesData.success) {
        setDevices(devicesData.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  onMount(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  });

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${props.apiBase}/offline-cache/sync`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        alert('缓存同步成功！');
        fetchData();
      } else {
        alert('同步失败: ' + (data.error || '未知错误'));
      }
    } catch (err) {
      alert('同步请求失败: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return '-';
    const date = new Date(time);
    return date.toLocaleString('zh-CN');
  };

  const getDeviceName = (deviceId) => {
    if (!deviceId) return '-';
    const device = devices().find((d) => d.id === deviceId);
    return device ? device.name : deviceId.substring(0, 8);
  };

  const getDataTypeLabel = (type) => {
    const labels = {
      sensor_data: '传感器数据',
      heartbeat: '心跳数据',
      diagnostic: '诊断数据',
      log: '日志数据',
    };
    return labels[type] || type;
  };

  return (
    <div>
      <div class="page-header">
        <h2>离线缓存</h2>
        <p>管理断网期间缓存的待同步数据</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>待同步缓存</h3>
          <button
            class="btn btn-primary"
            onClick={handleSync}
            disabled={syncing()}
          >
            {syncing() ? '同步中...' : '立即同步'}
          </button>
        </div>

        {cache().length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>缓存ID</th>
                <th>设备</th>
                <th>数据类型</th>
                <th>状态</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              <For each={cache()}>
                {(item) => (
                  <tr>
                    <td style={{ 'font-family': 'monospace', 'font-size': '12px' }}>
                      {item.id.substring(0, 8)}...
                    </td>
                    <td>{getDeviceName(item.device_id)}</td>
                    <td>{getDataTypeLabel(item.data_type)}</td>
                    <td>
                      <span class={`status-badge status-${item.status === 'pending' ? 'pending' : 'completed'}`}>
                        {item.status === 'pending' ? '待同步' : '已同步'}
                      </span>
                    </td>
                    <td>{formatTime(item.created_at)}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        ) : (
          <div class="empty-state">
            <div class="empty-state-icon">💾</div>
            <p>暂无待同步缓存</p>
          </div>
        )}
      </div>

      <div class="card">
        <h3 style={{ 'margin-bottom': '16px' }}>功能说明</h3>
        <div style={{ 'line-height': '1.8', color: 'var(--text-secondary)' }}>
          <p><strong>边缘缓存机制：</strong></p>
          <ul style={{ 'margin-left': '20px', 'margin-top': '8px' }}>
            <li>当网络中断时，传感器数据自动缓存到本地SQLite数据库</li>
            <li>系统每30秒自动检测网络状态，一旦恢复立即同步缓存数据</li>
            <li>缓存数据按时间顺序同步，确保数据完整性</li>
            <li>同步成功后数据状态更新为"已同步"</li>
          </ul>
          <p style={{ 'margin-top': '16px' }}><strong>数据类型：</strong></p>
          <ul style={{ 'margin-left': '20px', 'margin-top': '8px' }}>
            <li>传感器数据 - 温度、压力、振动等实时监测数据</li>
            <li>心跳数据 - 设备在线状态和资源使用情况</li>
            <li>诊断数据 - 设备健康检查结果</li>
            <li>日志数据 - 系统运行日志</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
