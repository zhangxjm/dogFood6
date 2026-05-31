<script>
  import { onMount, onDestroy } from 'svelte'
  import { websocketStore } from '../stores/websocketStore'

  let stats = { total: 0, online: 0, offline: 0, alarm: 0 }
  let activeAlarms = 0
  let wsConnected = false

  let unsubscribe

  const loadStats = async () => {
    try {
      const res = await fetch('/api/devices/stats')
      const data = await res.json()
      if (data.code === 200) {
        stats = data.data
      }
      const alarmRes = await fetch('/api/alarms/count')
      const alarmData = await alarmRes.json()
      if (alarmData.code === 200) {
        activeAlarms = alarmData.data
      }
    } catch (e) {
      console.error('Failed to load stats:', e)
    }
  }

  onMount(() => {
    unsubscribe = websocketStore.subscribe(state => {
      wsConnected = state.connected
    })
    websocketStore.connect()
    loadStats()
    const interval = setInterval(loadStats, 10000)
    onDestroy(() => {
      clearInterval(interval)
      if (unsubscribe) unsubscribe()
    })
  })
</script>

<header class="header">
  <div class="logo">
    <span class="logo-icon">🏭</span>
    <h1>工业数字孪生设备运维系统</h1>
  </div>
  <div class="stats-bar">
    <div class="stat-item">
      <span class="stat-label">设备总数</span>
      <span class="stat-value">{stats.total}</span>
    </div>
    <div class="stat-item online">
      <span class="stat-label">在线设备</span>
      <span class="stat-value">{stats.online}</span>
    </div>
    <div class="stat-item offline">
      <span class="stat-label">离线设备</span>
      <span class="stat-value">{stats.offline}</span>
    </div>
    <div class="stat-item alarm">
      <span class="stat-label">告警设备</span>
      <span class="stat-value">{activeAlarms || stats.alarm}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">实时连接</span>
      <span class="stat-value {wsConnected ? 'connected' : 'disconnected'}">
        {wsConnected ? '已连接' : '断开'}
      </span>
    </div>
  </div>
  <div class="user-info">
    <span class="user-avatar">👤</span>
    <span>管理员</span>
  </div>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    height: 64px;
    background: linear-gradient(90deg, #161b22 0%, #21262d 100%);
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-icon {
    font-size: 28px;
  }

  .logo h1 {
    font-size: 18px;
    font-weight: 600;
    background: linear-gradient(90deg, #58a6ff, #1890ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stats-bar {
    display: flex;
    gap: 32px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-muted);
  }

  .stat-value {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .stat-item.online .stat-value {
    color: var(--success-color);
  }

  .stat-item.offline .stat-value {
    color: var(--text-muted);
  }

  .stat-item.alarm .stat-value {
    color: var(--error-color);
    animation: pulse 2s infinite;
  }

  .stat-value.connected {
    color: var(--success-color);
  }

  .stat-value.disconnected {
    color: var(--error-color);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .user-avatar {
    font-size: 24px;
  }
</style>
