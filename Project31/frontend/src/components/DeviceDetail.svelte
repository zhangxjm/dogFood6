<script>
  import { onMount, onDestroy } from 'svelte'
  import { websocketStore } from '../stores/websocketStore'

  export let device
  export let onBack

  let historyData = []
  let commands = []
  let wsUnsubscribe

  const loadHistory = async () => {
    try {
      const res = await fetch(`/api/devices/${device.deviceCode}/history?limit=50`)
      const data = await res.json()
      if (data.code === 200) {
        historyData = data.data
      }
    } catch (e) {
      console.error('Failed to load history:', e)
    }
  }

  const loadCommands = async () => {
    try {
      const res = await fetch(`/api/commands/device/${device.deviceCode}`)
      const data = await res.json()
      if (data.code === 200) {
        commands = data.data
      }
    } catch (e) {
      console.error('Failed to load commands:', e)
    }
  }

  onMount(() => {
    loadHistory()
    loadCommands()
    wsUnsubscribe = websocketStore.subscribe(state => {
      const status = state.statuses[device.deviceCode]
      if (status) {
        device.temperature = status.temperature
        device.humidity = status.humidity
        device.pressure = status.pressure
        device.vibration = status.vibration
        device.rpm = status.rpm
        device.powerConsumption = status.powerConsumption
        device.efficiency = status.efficiency
        device.alarmLevel = status.alarmLevel
        device.alarmMessage = status.alarmMessage
      }
    })
  })

  onDestroy(() => {
    if (wsUnsubscribe) wsUnsubscribe()
  })
</script>

<div class="device-detail">
  <div class="detail-header">
    <button class="btn-back" on:click={onBack}>← 返回</button>
    <div class="device-title">
      <h2>{device.deviceName}</h2>
      <span class="device-code">{device.deviceCode}</span>
    </div>
    <span 
      class="status-badge {device.status === 'ONLINE' ? 'online' : 'offline'}"
    >
      {device.status === 'ONLINE' ? '在线' : '离线'}
    </span>
  </div>

  <div class="detail-content">
    <div class="info-panel">
      <h3>基本信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">设备类型</span>
          <span class="value">{device.deviceType}</span>
        </div>
        <div class="info-item">
          <span class="label">安装位置</span>
          <span class="value">{device.location}</span>
        </div>
        <div class="info-item">
          <span class="label">制造商</span>
          <span class="value">{device.manufacturer}</span>
        </div>
        <div class="info-item">
          <span class="label">安装日期</span>
          <span class="value">{device.installDate?.split('T')[0]}</span>
        </div>
      </div>
    </div>

    <div class="metrics-panel">
      <h3>实时运行参数</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">🌡️</div>
          <div class="metric-info">
            <span class="metric-label">温度</span>
            <span class="metric-value {device.temperature > 60 ? 'warning' : ''}">
              {device.temperature?.toFixed(1)}°C
            </span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">💧</div>
          <div class="metric-info">
            <span class="metric-label">湿度</span>
            <span class="metric-value">{device.humidity?.toFixed(1)}%</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">⚡</div>
          <div class="metric-info">
            <span class="metric-label">压力</span>
            <span class="metric-value">{device.pressure?.toFixed(2)}MPa</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">📊</div>
          <div class="metric-info">
            <span class="metric-label">振动</span>
            <span class="metric-value {device.vibration > 4 ? 'warning' : ''}">
              {device.vibration?.toFixed(2)}mm/s
            </span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">⚙️</div>
          <div class="metric-info">
            <span class="metric-label">转速</span>
            <span class="metric-value">{device.rpm?.toFixed(0)}RPM</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">🔋</div>
          <div class="metric-info">
            <span class="metric-label">功率</span>
            <span class="metric-value">{device.powerConsumption?.toFixed(1)}kW</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">📈</div>
          <div class="metric-info">
            <span class="metric-label">效率</span>
            <span class="metric-value">{device.efficiency?.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>

    {#if device.alarmLevel !== 'NORMAL' && device.alarmMessage}
      <div class="alarm-panel">
        <h3>告警信息</h3>
        <div class="alarm-banner {device.alarmLevel === 'CRITICAL' ? 'critical' : 'warning'}">
          <span class="alarm-icon">⚠️</span>
          <span class="alarm-text">{device.alarmMessage}</span>
        </div>
      </div>
    {/if}

    <div class="history-panel">
      <h3>历史数据</h3>
      <div class="history-chart">
        <div class="chart-container">
          {#each historyData.slice(-20) as record, i}
            <div 
              class="bar" 
              style:height={(record.temperature / 100 * 100) + '%'}
              style:background-color={record.temperature > 60 ? 'var(--error-color)' : 'var(--primary-color)'}
              title={`${record.recordTime?.split('T')[1]?.split('.')[0]}: ${record.temperature?.toFixed(1)}°C`}
            ></div>
          {/each}
        </div>
        <div class="chart-labels">
          <span>温度历史趋势 (最近20条记录)</span>
        </div>
      </div>
    </div>

    <div class="commands-panel">
      <h3>指令执行记录</h3>
      <div class="commands-list">
        {#if commands.length > 0}
          {#each commands.slice(0, 5) as cmd}
            <div class="command-item">
              <span class="command-type">{cmd.commandType}</span>
              <span class="command-data">{cmd.commandData}</span>
              <span class="command-status {cmd.status === 'COMPLETED' ? 'success' : 'pending'}">
                {cmd.status === 'COMPLETED' ? '已完成' : cmd.status === 'EXECUTING' ? '执行中' : '待执行'}
              </span>
              <span class="command-time">{cmd.createTime?.split('T')[1]?.split('.')[0]}</span>
            </div>
          {/each}
        {:else}
          <div class="no-commands">暂无指令记录</div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .device-detail {
    max-width: 1400px;
  }

  .detail-header {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 24px;
    padding: 20px;
    background: var(--panel-bg);
    border-radius: 12px;
  }

  .btn-back {
    padding: 8px 16px;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-back:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  .device-title {
    flex: 1;
  }

  .device-title h2 {
    font-size: 20px;
    font-weight: 600;
  }

  .device-code {
    font-size: 14px;
    color: var(--text-muted);
  }

  .status-badge {
    padding: 6px 16px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
  }

  .status-badge.online {
    background: rgba(82, 196, 26, 0.2);
    color: var(--success-color);
  }

  .status-badge.offline {
    background: rgba(110, 118, 129, 0.2);
    color: var(--text-muted);
  }

  .detail-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .info-panel,
  .metrics-panel,
  .history-panel,
  .commands-panel,
  .alarm-panel {
    background: var(--panel-bg);
    border-radius: 12px;
    padding: 20px;
  }

  .info-panel h3,
  .metrics-panel h3,
  .history-panel h3,
  .commands-panel h3,
  .alarm-panel h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color);
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .info-item .label {
    font-size: 12px;
    color: var(--text-muted);
  }

  .info-item .value {
    font-size: 14px;
    font-weight: 500;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .metric-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
  }

  .metric-icon {
    font-size: 24px;
  }

  .metric-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .metric-label {
    font-size: 12px;
    color: var(--text-muted);
  }

  .metric-value {
    font-size: 18px;
    font-weight: 600;
  }

  .metric-value.warning {
    color: var(--warning-color);
  }

  .alarm-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: 8px;
  }

  .alarm-banner.critical {
    background: rgba(245, 34, 45, 0.15);
    border: 1px solid var(--error-color);
  }

  .alarm-banner.warning {
    background: rgba(250, 173, 20, 0.15);
    border: 1px solid var(--warning-color);
  }

  .alarm-icon {
    font-size: 24px;
  }

  .alarm-text {
    font-size: 14px;
    font-weight: 500;
  }

  .history-chart {
    height: 150px;
  }

  .chart-container {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 120px;
    padding: 10px 0;
  }

  .bar {
    flex: 1;
    min-width: 8px;
    border-radius: 4px 4px 0 0;
    transition: height 0.3s;
  }

  .chart-labels {
    text-align: center;
    font-size: 12px;
    color: var(--text-muted);
  }

  .commands-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .command-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
  }

  .command-type {
    font-weight: 500;
    min-width: 80px;
  }

  .command-data {
    flex: 1;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .command-status {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
  }

  .command-status.success {
    background: rgba(82, 196, 26, 0.2);
    color: var(--success-color);
  }

  .command-status.pending {
    background: rgba(250, 173, 20, 0.2);
    color: var(--warning-color);
  }

  .command-time {
    font-size: 12px;
    color: var(--text-muted);
  }

  .no-commands {
    text-align: center;
    padding: 24px;
    color: var(--text-muted);
  }
</style>
