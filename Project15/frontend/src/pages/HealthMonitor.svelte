<script>
  import { onMount, onDestroy } from 'svelte';
  import { elderlyList, realtimeHealthData } from '../store.js';

  let loading = true;
  let selectedElderlyId = null;
  let healthHistory = [];
  let stompClient = null;

  async function fetchElderly() {
    loading = true;
    try {
      const res = await fetch('/api/elderly');
      const json = await res.json();
      elderlyList.set(json.data || []);
      if (json.data && json.data.length > 0) {
        selectedElderlyId = json.data[0].id;
        fetchHealthData(selectedElderlyId);
      }
    } catch (error) {
      console.error('Failed to fetch elderly:', error);
    } finally {
      loading = false;
    }
  }

  async function fetchHealthData(elderlyId) {
    try {
      const res = await fetch(`/api/health/elderly/${elderlyId}`);
      const json = await res.json();
      healthHistory = json.data || [];
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    }
  }

  function onElderlyChange() {
    if (selectedElderlyId) {
      fetchHealthData(selectedElderlyId);
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
          if (data.type === 'HEALTH_DATA' && data.data.elderlyId === selectedElderlyId) {
            realtimeHealthData.update(existing => ({
              ...existing,
              [data.data.elderlyId]: data.data
            }));
          }
        });
      });
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }

  function getLatestHealthData() {
    if (selectedElderlyId && $realtimeHealthData[selectedElderlyId]) {
      return $realtimeHealthData[selectedElderlyId];
    }
    return healthHistory.length > 0 ? healthHistory[0] : null;
  }

  function getHealthStatusClass(heartRate, bloodOxygen) {
    if (heartRate < 60 || heartRate > 100) return 'warning';
    if (bloodOxygen < 95) return 'warning';
    if (heartRate < 40 || heartRate > 140) return 'critical';
    if (bloodOxygen < 90) return 'critical';
    return 'normal';
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN');
  }

  onMount(() => {
    fetchElderly();
    connectWebSocket();
  });

  onDestroy(() => {
    if (stompClient && stompClient.connected) {
      stompClient.disconnect();
    }
  });

  $: latestData = getLatestHealthData();
  $: healthStatus = latestData ? getHealthStatusClass(latestData.heartRate, latestData.bloodOxygen) : 'normal';
</script>

<div class="health-monitor">
  <div class="page-header">
    <h2>健康监测</h2>
    <div class="elderly-selector">
      <label>选择老人：</label>
      <select bind:value={selectedElderlyId} on:change={onElderlyChange}>
        {#each $elderlyList as elderly (elderly.id)}
          <option value={elderly.id}>{elderly.name}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>
  {:else if latestData}
    <div class="health-display">
      <div class="health-status-bar status-{healthStatus}">
        <span class="status-indicator"></span>
        <span>健康状态：{healthStatus === 'normal' ? '正常' : healthStatus === 'warning' ? '异常' : '危险'}</span>
      </div>

      <div class="metrics-grid">
        <div class="metric-card heart-rate">
          <div class="metric-icon">❤️</div>
          <div class="metric-content">
            <div class="metric-label">心率</div>
            <div class="metric-value">{latestData.heartRate}</div>
            <div class="metric-unit">次/分</div>
          </div>
          <div class="metric-indicator {latestData.heartRate < 60 || latestData.heartRate > 100 ? 'abnormal' : ''}">
            {latestData.heartRate < 60 ? '偏低' : latestData.heartRate > 100 ? '偏高' : '正常'}
          </div>
        </div>

        <div class="metric-card blood-oxygen">
          <div class="metric-icon">🫁</div>
          <div class="metric-content">
            <div class="metric-label">血氧</div>
            <div class="metric-value">{latestData.bloodOxygen}</div>
            <div class="metric-unit">%</div>
          </div>
          <div class="metric-indicator {latestData.bloodOxygen < 95 ? 'abnormal' : ''}">
            {latestData.bloodOxygen < 90 ? '危险' : latestData.bloodOxygen < 95 ? '偏低' : '正常'}
          </div>
        </div>

        <div class="metric-card temperature">
          <div class="metric-icon">🌡️</div>
          <div class="metric-content">
            <div class="metric-label">体温</div>
            <div class="metric-value">{latestData.temperature}</div>
            <div class="metric-unit">℃</div>
          </div>
          <div class="metric-indicator {latestData.temperature < 36 || latestData.temperature > 37.5 ? 'abnormal' : ''}">
            {latestData.temperature < 35 ? '过低' : latestData.temperature < 36 ? '偏低' : latestData.temperature > 39 ? '过高' : latestData.temperature > 37.5 ? '偏高' : '正常'}
          </div>
        </div>

        <div class="metric-card blood-pressure">
          <div class="metric-icon">💓</div>
          <div class="metric-content">
            <div class="metric-label">血压</div>
            <div class="metric-value">{latestData.systolicPressure}/{latestData.diastolicPressure}</div>
            <div class="metric-unit">mmHg</div>
          </div>
        </div>

        <div class="metric-card steps">
          <div class="metric-icon">🚶</div>
          <div class="metric-content">
            <div class="metric-label">今日步数</div>
            <div class="metric-value">{latestData.steps || 0}</div>
            <div class="metric-unit">步</div>
          </div>
        </div>

        <div class="metric-card sleep">
          <div class="metric-icon">😴</div>
          <div class="metric-content">
            <div class="metric-label">睡眠质量</div>
            <div class="metric-value">{latestData.sleepQuality === 'GOOD' ? '良好' : latestData.sleepQuality === 'NORMAL' ? '一般' : '较差'}</div>
          </div>
        </div>
      </div>

      <div class="card history-card">
        <h3>历史数据</h3>
        {#if healthHistory.length > 0}
          <div class="history-list">
            {#each healthHistory.slice(0, 10) as record (record.id)}
              <div class="history-item">
                <div class="history-time">{formatTime(record.dataTime)}</div>
                <div class="history-metrics">
                  <span>❤️ {record.heartRate}次/分</span>
                  <span>🫁 {record.bloodOxygen}%</span>
                  <span>🌡️ {record.temperature}℃</span>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="empty-state">
            <div class="empty-icon">📊</div>
            <p>暂无历史数据</p>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <div class="empty-state">
      <div class="empty-icon">📱</div>
      <p>暂无健康数据</p>
    </div>
  {/if}
</div>

<style>
  .health-monitor {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .page-header h2 {
    font-size: 20px;
    color: #262626;
    margin: 0;
  }

  .elderly-selector {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .elderly-selector select {
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    font-size: 14px;
  }

  .health-display {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .health-status-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    border-radius: 8px;
    font-weight: 600;
  }

  .status-normal {
    background: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
  }

  .status-warning {
    background: #fffbe6;
    color: #faad14;
    border: 1px solid #ffe58f;
  }

  .status-critical {
    background: #fff1f0;
    color: #f5222d;
    border: 1px solid #ffa39e;
  }

  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: currentColor;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .metric-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: relative;
  }

  .metric-icon {
    font-size: 32px;
  }

  .metric-content {
    flex: 1;
  }

  .metric-label {
    font-size: 14px;
    color: #595959;
    margin-bottom: 4px;
  }

  .metric-value {
    font-size: 28px;
    font-weight: 600;
    color: #262626;
  }

  .metric-unit {
    font-size: 12px;
    color: #8c8c8c;
  }

  .metric-indicator {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    background: #f6ffed;
    color: #52c41a;
  }

  .metric-indicator.abnormal {
    background: #fff1f0;
    color: #ff4d4f;
  }

  .heart-rate {
    border-left: 4px solid #ff4d4f;
  }

  .blood-oxygen {
    border-left: 4px solid #1890ff;
  }

  .temperature {
    border-left: 4px solid #faad14;
  }

  .blood-pressure {
    border-left: 4px solid #722ed1;
  }

  .steps {
    border-left: 4px solid #13c2c2;
  }

  .sleep {
    border-left: 4px solid #52c41a;
  }

  .history-card h3 {
    font-size: 16px;
    color: #262626;
    margin: 0 0 16px 0;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #fafafa;
    border-radius: 6px;
  }

  .history-time {
    font-size: 13px;
    color: #8c8c8c;
  }

  .history-metrics {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: #595959;
  }

  @media (max-width: 1200px) {
    .metrics-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .metrics-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
