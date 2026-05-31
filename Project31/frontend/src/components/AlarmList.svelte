<script>
  import { onMount } from 'svelte'

  let alarms = []
  let resolveNote = ''
  let resolvingId = null

  const loadAlarms = async () => {
    try {
      const res = await fetch('/api/alarms')
      const data = await res.json()
      if (data.code === 200) {
        alarms = data.data
      }
    } catch (e) {
      console.error('Failed to load alarms:', e)
    }
  }

  const resolveAlarm = async (alarmId) => {
    if (!resolveNote) {
      alert('请输入处理备注')
      return
    }

    try {
      const res = await fetch('/api/alarms/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alarmId,
          resolveNote
        })
      })
      const data = await res.json()
      if (data.code === 200) {
        resolveNote = ''
        resolvingId = null
        loadAlarms()
      } else {
        alert('处理失败: ' + data.message)
      }
    } catch (e) {
      alert('处理失败')
    }
  }

  const getAlarmLevelClass = (level) => {
    return level === 'CRITICAL' ? 'critical' : 'warning'
  }

  const getAlarmLevelText = (level) => {
    return level === 'CRITICAL' ? '严重' : '警告'
  }

  onMount(() => {
    loadAlarms()
  })
</script>

<div class="alarm-panel">
  <h2>告警中心</h2>

  <div class="alarm-stats">
    <div class="stat-card active">
      <span class="stat-number">{alarms.filter(a => a.status === 'ACTIVE').length}</span>
      <span class="stat-label">活动告警</span>
    </div>
    <div class="stat-card resolved">
      <span class="stat-number">{alarms.filter(a => a.status === 'RESOLVED').length}</span>
      <span class="stat-label">已处理</span>
    </div>
    <div class="stat-card total">
      <span class="stat-number">{alarms.length}</span>
      <span class="stat-label">总告警数</span>
    </div>
  </div>

  <div class="alarm-list">
    {#if alarms.length === 0}
      <div class="no-alarms">暂无告警信息</div>
    {:else}
      {#each alarms as alarm}
        <div class="alarm-item {alarm.status === 'ACTIVE' ? 'active' : 'resolved'}">
          <div class="alarm-header">
            <span class="alarm-level {getAlarmLevelClass(alarm.alarmLevel)}">
              {getAlarmLevelText(alarm.alarmLevel)}
            </span>
            <span class="alarm-device">{alarm.deviceName} ({alarm.deviceCode})</span>
            <span class="alarm-time">{alarm.alarmTime?.split('T')[0]} {alarm.alarmTime?.split('T')[1]?.split('.')[0]}</span>
          </div>
          <div class="alarm-message">{alarm.alarmMessage}</div>
          <div class="alarm-type">{alarm.alarmType}</div>
          
          {#if alarm.status === 'ACTIVE'}
            <div class="alarm-actions">
              {#if resolvingId === alarm.id}
                <input 
                  type="text" 
                  placeholder="输入处理备注..." 
                  bind:value={resolveNote}
                />
                <button class="btn-confirm" on:click={() => resolveAlarm(alarm.id)}>
                  确认处理
                </button>
                <button class="btn-cancel" on:click={() => { resolvingId = null; resolveNote = '' }}>
                  取消
                </button>
              {:else}
                <button class="btn-resolve" on:click={() => resolvingId = alarm.id}>
                  处理告警
                </button>
              {/if}
            </div>
          {:else}
            <div class="alarm-resolved-info">
              <span>处理时间: {alarm.resolveTime?.split('T')[0]} {alarm.resolveTime?.split('T')[1]?.split('.')[0]}</span>
              <span>处理备注: {alarm.resolveNote}</span>
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .alarm-panel {
    max-width: 1400px;
  }

  .alarm-panel h2 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 24px;
  }

  .alarm-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;
  }

  .stat-card {
    flex: 1;
    background: var(--panel-bg);
    border-radius: 12px;
    padding: 24px;
    text-align: center;
  }

  .stat-card.active {
    border: 1px solid var(--error-color);
  }

  .stat-card.resolved {
    border: 1px solid var(--success-color);
  }

  .stat-card.total {
    border: 1px solid var(--primary-color);
  }

  .stat-number {
    display: block;
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .stat-card.active .stat-number {
    color: var(--error-color);
  }

  .stat-card.resolved .stat-number {
    color: var(--success-color);
  }

  .stat-card.total .stat-number {
    color: var(--primary-color);
  }

  .stat-label {
    font-size: 14px;
    color: var(--text-muted);
  }

  .alarm-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .no-alarms {
    text-align: center;
    padding: 48px;
    color: var(--text-muted);
    background: var(--panel-bg);
    border-radius: 12px;
  }

  .alarm-item {
    background: var(--panel-bg);
    border-radius: 12px;
    padding: 20px;
    border-left: 4px solid;
  }

  .alarm-item.active {
    border-left-color: var(--error-color);
  }

  .alarm-item.resolved {
    border-left-color: var(--success-color);
    opacity: 0.7;
  }

  .alarm-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
  }

  .alarm-level {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }

  .alarm-level.critical {
    background: rgba(245, 34, 45, 0.2);
    color: var(--error-color);
  }

  .alarm-level.warning {
    background: rgba(250, 173, 20, 0.2);
    color: var(--warning-color);
  }

  .alarm-device {
    font-weight: 500;
  }

  .alarm-time {
    margin-left: auto;
    font-size: 13px;
    color: var(--text-muted);
  }

  .alarm-message {
    font-size: 15px;
    margin-bottom: 8px;
  }

  .alarm-type {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }

  .alarm-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .alarm-actions input {
    flex: 1;
    padding: 8px 12px;
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 14px;
  }

  .alarm-actions input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .btn-resolve,
  .btn-confirm {
    padding: 8px 20px;
    background: var(--primary-color);
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-resolve:hover,
  .btn-confirm:hover {
    background: var(--primary-hover);
  }

  .btn-cancel {
    padding: 8px 20px;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-cancel:hover {
    border-color: var(--text-muted);
    color: var(--text-primary);
  }

  .alarm-resolved-info {
    display: flex;
    gap: 24px;
    font-size: 13px;
    color: var(--text-muted);
  }
</style>
