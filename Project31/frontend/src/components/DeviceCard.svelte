<script>
  export let device
  export let onSelect

  const getStatusColor = (status) => {
    switch (status) {
      case 'ONLINE': return 'var(--success-color)'
      case 'OFFLINE': return 'var(--text-muted)'
      default: return 'var(--warning-color)'
    }
  }

  const getAlarmColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'var(--error-color)'
      case 'WARNING': return 'var(--warning-color)'
      default: return 'var(--success-color)'
    }
  }
</script>

<div class="device-card" on:click={() => onSelect(device)}>
  <div class="card-header">
    <div class="device-info">
      <h3 class="device-name">{device.deviceName}</h3>
      <span class="device-code">{device.deviceCode}</span>
    </div>
    <span 
      class="status-badge"
      style:background-color={getStatusColor(device.status) + '33'}
      style:color={getStatusColor(device.status)}
    >
      {device.status === 'ONLINE' ? '在线' : '离线'}
    </span>
  </div>

  <div class="card-body">
    <div class="metric-grid">
      <div class="metric">
        <span class="metric-label">温度</span>
        <span class="metric-value" style:color={device.temperature > 60 ? 'var(--error-color)' : 'var(--text-primary)'}>
          {device.temperature?.toFixed(1)}°C
        </span>
      </div>
      <div class="metric">
        <span class="metric-label">湿度</span>
        <span class="metric-value">{device.humidity?.toFixed(1)}%</span>
      </div>
      <div class="metric">
        <span class="metric-label">压力</span>
        <span class="metric-value">{device.pressure?.toFixed(2)}MPa</span>
      </div>
      <div class="metric">
        <span class="metric-label">振动</span>
        <span class="metric-value" style:color={device.vibration > 4 ? 'var(--warning-color)' : 'var(--text-primary)'}>
          {device.vibration?.toFixed(2)}mm/s
        </span>
      </div>
      <div class="metric">
        <span class="metric-label">转速</span>
        <span class="metric-value">{device.rpm?.toFixed(0)}RPM</span>
      </div>
      <div class="metric">
        <span class="metric-label">功率</span>
        <span class="metric-value">{device.powerConsumption?.toFixed(1)}kW</span>
      </div>
    </div>
  </div>

  <div class="card-footer">
    <div class="efficiency-bar">
      <div class="efficiency-label">效率</div>
      <div class="efficiency-progress">
        <div 
          class="efficiency-fill" 
          style:width={device.efficiency + '%'}
          style:background-color={device.efficiency > 80 ? 'var(--success-color)' : 'var(--warning-color)'}
        ></div>
      </div>
      <span class="efficiency-value">{device.efficiency?.toFixed(1)}%</span>
    </div>
    {#if device.alarmLevel !== 'NORMAL'}
      <span class="alarm-indicator" style:background-color={getAlarmColor(device.alarmLevel)}>
        {device.alarmLevel === 'CRITICAL' ? '严重告警' : '警告'}
      </span>
    {/if}
  </div>
</div>

<style>
  .device-card {
    background: var(--panel-bg);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .device-card:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .device-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .device-name {
    font-size: 16px;
    font-weight: 600;
  }

  .device-code {
    font-size: 12px;
    color: var(--text-muted);
  }

  .status-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .card-body {
    margin-bottom: 16px;
  }

  .metric-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .metric {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .metric-label {
    font-size: 11px;
    color: var(--text-muted);
  }

  .metric-value {
    font-size: 14px;
    font-weight: 600;
  }

  .card-footer {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .efficiency-bar {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .efficiency-label {
    font-size: 11px;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .efficiency-progress {
    flex: 1;
    height: 8px;
    background: var(--border-color);
    border-radius: 4px;
    overflow: hidden;
  }

  .efficiency-fill {
    height: 100%;
    transition: width 0.3s;
  }

  .efficiency-value {
    font-size: 12px;
    font-weight: 600;
  }

  .alarm-indicator {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    color: white;
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
