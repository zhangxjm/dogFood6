import { createSignal, onMount, For } from 'solid-js';

export default function Logs(props) {
  const [logs, setLogs] = createSignal([]);
  const [devices, setDevices] = createSignal([]);
  const [filterDevice, setFilterDevice] = createSignal('');
  const [filterLevel, setFilterLevel] = createSignal('');

  const fetchData = async () => {
    try {
      const [logsRes, devicesRes] = await Promise.all([
        fetch(`${props.apiBase}/logs?limit=100`),
        fetch(`${props.apiBase}/devices`),
      ]);
      const logsData = await logsRes.json();
      const devicesData = await devicesRes.json();

      if (logsData.success) {
        setLogs(logsData.data);
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
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  });

  const formatTime = (time) => {
    if (!time) return '-';
    const date = new Date(time);
    return date.toLocaleString('zh-CN');
  };

  const getDeviceName = (deviceId) => {
    if (!deviceId) return '系统';
    const device = devices().find((d) => d.id === deviceId);
    return device ? device.name : deviceId.substring(0, 8);
  };

  const filteredLogs = () => {
    return logs().filter((log) => {
      if (filterDevice() && log.device_id !== filterDevice()) return false;
      if (filterLevel() && log.level !== filterLevel()) return false;
      return true;
    });
  };

  return (
    <div>
      <div class="page-header">
        <h2>系统日志</h2>
        <p>查看系统运行日志和事件记录</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>日志列表</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              value={filterLevel()}
              onChange={(e) => setFilterLevel(e.target.value)}
              style={{ padding: '6px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', 'border-radius': '6px', color: 'var(--text-primary)' }}
            >
              <option value="">全部级别</option>
              <option value="info">信息</option>
              <option value="warning">警告</option>
              <option value="error">错误</option>
              <option value="success">成功</option>
            </select>
            <select
              value={filterDevice()}
              onChange={(e) => setFilterDevice(e.target.value)}
              style={{ padding: '6px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', 'border-radius': '6px', color: 'var(--text-primary)' }}
            >
              <option value="">全部设备</option>
              <For each={devices()}>
                {(device) => (
                  <option value={device.id}>{device.name}</option>
                )}
              </For>
            </select>
            <button class="btn btn-outline btn-sm" onClick={fetchData}>刷新</button>
          </div>
        </div>

        {filteredLogs().length > 0 ? (
          <div>
            <For each={filteredLogs()}>
              {(log) => (
                <div class={`log-entry ${log.level}`}>
                  <div>
                    <span class="log-time">{formatTime(log.timestamp)}</span>
                    <span style={{ 'font-weight': '600', 'margin-right': '8px' }}>
                      [{log.level.toUpperCase()}]
                    </span>
                    <span style={{ color: 'var(--text-secondary)', 'margin-right': '8px' }}>
                      [{getDeviceName(log.device_id)}]
                    </span>
                  </div>
                  <div style={{ 'margin-top': '4px', 'padding-left': '8px' }}>
                    {log.message}
                  </div>
                </div>
              )}
            </For>
          </div>
        ) : (
          <div class="empty-state">
            <div class="empty-state-icon">📝</div>
            <p>暂无日志数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
