<script>
  import { onMount, onDestroy } from 'svelte';
  import { realtimeHealthData, realtimeAlerts, realtimeEmergencyCalls } from '../store.js';

  let stats = {
    elderlyCount: 0,
    deviceCount: 0,
    alertCount: 0,
    emergencyCount: 0
  };

  let recentAlerts = [];
  let recentHealthData = [];
  let stompClient = null;

  async function fetchData() {
    try {
      const [elderlyRes, devicesRes, alertsRes, emergencyRes] = await Promise.all([
        fetch('/api/elderly').then(r => r.json()),
        fetch('/api/devices').then(r => r.json()),
        fetch('/api/alerts/pending').then(r => r.json()),
        fetch('/api/emergency/pending').then(r => r.json())
      ]);

      stats.elderlyCount = elderlyRes.data?.length || 0;
      stats.deviceCount = devicesRes.data?.length || 0;
      stats.alertCount = alertsRes.data?.length || 0;
      stats.emergencyCount = emergencyRes.data?.length || 0;

      recentAlerts = alertsRes.data?.slice(0, 5) || [];
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  }

  function connectWebSocket() {
    const SockJS = window.SockJS;
    const Stomp = window.Stomp;
    
    if (!SockJS || !Stomp) return;

    try {
      const socket = new SockJS('/ws');
      stompClient = Stomp.over(socket);
      stompClient.debug = () => {};

      stompClient.connect({}, () => {
        stompClient.subscribe('/topic/health', (message) => {
          const data = JSON.parse(message.body);
          if (data.type === 'HEALTH_DATA') {
            realtimeHealthData.update(existing => {
              const updated = { ...existing };
              if (data.data.elderlyId) {
                updated[data.data.elderlyId] = data.data;
              }
              return updated;
            });
            recentHealthData = [data.data, ...recentHealthData].slice(0, 10);
          }
        });

        stompClient.subscribe('/topic/alerts', (message) => {
          const data = JSON.parse(message.body);
          if (data.type === 'ALERT') {
            realtimeAlerts.update(existing => [data.data, ...existing].slice(0, 50));
            recentAlerts = [data.data, ...recentAlerts].slice(0, 5);
            stats.alertCount++;
          }
        });

        stompClient.subscribe('/topic/emergency', (message) => {
          const data = JSON.parse(message.body);
          if (data.type === 'EMERGENCY_CALL') {
            realtimeEmergencyCalls.update(existing => [data.data, ...existing].slice(0, 50));
            stats.emergencyCount++;
          }
        });
      });
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }

  onMount(() => {
    fetchData();
    connectWebSocket();
  });

  onDestroy(() => {
    if (stompClient && stompClient.connected) {
      stompClient.disconnect();
    }
  });

  function getAlertLevelClass(level) {
    switch (level) {
      case 'CRITICAL': return 'tag-critical';
      case 'WARNING': return 'tag-warning';
      default: return 'tag-success';
    }
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN');
  }
</script>

<div class="dashboard">
  <div class="stats-grid">
    <div class="stat-card elderly">
      <div class="stat-info">
        <h3>监护老人</h3>
        <div class="stat-value">{stats.elderlyCount}</div>
      </div>
      <div class="stat-icon elderly-icon">👴</div>
    </div>
    <div class="stat-card device">
      <div class="stat-info">
        <h3>在线设备</h3>
        <div class="stat-value">{stats.deviceCount}</div>
      </div>
      <div class="stat-icon device-icon">📱</div>
    </div>
    <div class="stat-card alert">
      <div class="stat-info">
        <h3>待处理预警</h3>
        <div class="stat-value">{stats.alertCount}</div>
      </div>
      <div class="stat-icon alert-icon">⚠️</div>
    </div>
    <div class="stat-card emergency">
      <div class="stat-info">
        <h3>紧急呼叫</h3>
        <div class="stat-value">{stats.emergencyCount}</div>
      </div>
      <div class="stat-icon emergency-icon">🚨</div>
    </div>
  </div>

  <div class="content-grid">
    <div class="card">
      <h2 class="card-title">实时健康数据</h2>
      {#if recentHealthData.length > 0}
        <div class="health-list">
          {#each recentHealthData.slice(0, 5) as data (data.id)}
            <div class="health-item">
              <div class="health-elderly">{data.elderlyName || '未知'}</div>
              <div class="health-metrics">
                <span class="metric heart">
                  <span class="metric-icon">❤️</span>
                  {data.heartRate} 次/分
                </span>
                <span class="metric oxygen">
                  <span class="metric-icon">🫁</span>
                  {data.bloodOxygen}%
                </span>
                <span class="metric temp">
                  <span class="metric-icon">🌡️</span>
                  {data.temperature}℃
                </span>
              </div>
              <div class="health-time">{formatTime(data.dataTime)}</div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <p>暂无实时数据</p>
        </div>
      {/if}
    </div>

    <div class="card">
      <h2 class="card-title">最新预警信息</h2>
      {#if recentAlerts.length > 0}
        <div class="alert-list">
          {#each recentAlerts as alert (alert.id)}
            <div class="alert-item">
              <div class="alert-header">
                <span class="tag {getAlertLevelClass(alert.alertLevel)}">
                  {alert.alertLevel === 'CRITICAL' ? '严重' : alert.alertLevel === 'WARNING' ? '警告' : '提示'}
                </span>
                <span class="alert-elderly">{alert.elderlyName || '未知'}</span>
              </div>
              <div class="alert-content">{alert.alertContent}</div>
              <div class="alert-time">{formatTime(alert.alertTime)}</div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <p>暂无预警信息</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .stat-info h3 {
    font-size: 14px;
    color: #595959;
    margin: 0 0 8px 0;
  }

  .stat-value {
    font-size: 32px;
    font-weight: 600;
    color: #262626;
  }

  .stat-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }

  .elderly-icon {
    background: #e6f7ff;
  }

  .device-icon {
    background: #f6ffed;
  }

  .alert-icon {
    background: #fff7e6;
  }

  .emergency-icon {
    background: #fff1f0;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #262626;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }

  .health-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .health-item {
    padding: 12px;
    background: #fafafa;
    border-radius: 6px;
    border-left: 3px solid #1890ff;
  }

  .health-elderly {
    font-weight: 600;
    color: #262626;
    margin-bottom: 8px;
  }

  .health-metrics {
    display: flex;
    gap: 16px;
    margin-bottom: 4px;
  }

  .metric {
    font-size: 13px;
    color: #595959;
  }

  .metric-icon {
    margin-right: 4px;
  }

  .health-time {
    font-size: 12px;
    color: #8c8c8c;
  }

  .alert-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .alert-item {
    padding: 12px;
    background: #fafafa;
    border-radius: 6px;
    border-left: 3px solid #faad14;
  }

  .alert-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .alert-elderly {
    font-weight: 600;
    color: #262626;
  }

  .alert-content {
    font-size: 13px;
    color: #595959;
    margin-bottom: 4px;
  }

  .alert-time {
    font-size: 12px;
    color: #8c8c8c;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #8c8c8c;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  @media (max-width: 1200px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
