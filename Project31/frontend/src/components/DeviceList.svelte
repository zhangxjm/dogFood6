<script>
  import { onMount, onDestroy } from 'svelte'

  export let onSelectDevice

  let devices = []
  let loading = true
  let searchQuery = ''

  $: filteredDevices = devices.filter(d => 
    d.deviceName.includes(searchQuery) || 
    d.deviceCode.includes(searchQuery) ||
    d.location.includes(searchQuery)
  )

  const loadDevices = async () => {
    try {
      const res = await fetch('/api/devices')
      const data = await res.json()
      if (data.code === 200) {
        devices = data.data
      }
    } catch (e) {
      console.error('Failed to load devices:', e)
    } finally {
      loading = false
    }
  }

  onMount(() => {
    loadDevices()
  })
</script>

<div class="device-list">
  <div class="list-header">
    <h2>设备管理</h2>
    <div class="search-box">
      <input 
        type="text" 
        placeholder="搜索设备名称、编号或位置..." 
        bind:value={searchQuery}
      />
    </div>
  </div>

  {#if loading}
    <div class="loading">加载中...</div>
  {:else}
    <table class="device-table">
      <thead>
        <tr>
          <th>设备编号</th>
          <th>设备名称</th>
          <th>类型</th>
          <th>位置</th>
          <th>状态</th>
          <th>温度</th>
          <th>效率</th>
          <th>告警级别</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredDevices as device (device.id)}
          <tr on:click={() => onSelectDevice(device)}>
            <td>{device.deviceCode}</td>
            <td>{device.deviceName}</td>
            <td>{device.deviceType}</td>
            <td>{device.location}</td>
            <td>
              <span class="status {device.status === 'ONLINE' ? 'online' : 'offline'}">
                {device.status === 'ONLINE' ? '在线' : '离线'}
              </span>
            </td>
            <td class={device.temperature > 60 ? 'warning' : ''}>
              {device.temperature?.toFixed(1)}°C
            </td>
            <td>{device.efficiency?.toFixed(1)}%</td>
            <td>
              {#if device.alarmLevel === 'NORMAL'}
                <span class="alarm normal">正常</span>
              {:else if device.alarmLevel === 'WARNING'}
                <span class="alarm warning">警告</span>
              {:else}
                <span class="alarm critical">严重</span>
              {/if}
            </td>
            <td>
              <button class="btn-detail" on:click|stopPropagation={() => onSelectDevice(device)}>
                详情
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<style>
  .device-list {
    max-width: 1400px;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .list-header h2 {
    font-size: 20px;
    font-weight: 600;
  }

  .search-box input {
    width: 300px;
    padding: 8px 16px;
    background: var(--panel-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 14px;
  }

  .search-box input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .loading {
    text-align: center;
    padding: 48px;
    color: var(--text-muted);
  }

  .device-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--panel-bg);
    border-radius: 12px;
    overflow: hidden;
  }

  .device-table th {
    padding: 14px 16px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid var(--border-color);
  }

  .device-table td {
    padding: 14px 16px;
    font-size: 14px;
    border-bottom: 1px solid var(--border-color);
    cursor: pointer;
  }

  .device-table tbody tr:hover {
    background: rgba(24, 144, 255, 0.05);
  }

  .device-table tbody tr:last-child td {
    border-bottom: none;
  }

  .status {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .status.online {
    background: rgba(82, 196, 26, 0.2);
    color: var(--success-color);
  }

  .status.offline {
    background: rgba(110, 118, 129, 0.2);
    color: var(--text-muted);
  }

  td.warning {
    color: var(--warning-color);
    font-weight: 600;
  }

  .alarm {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .alarm.normal {
    background: rgba(82, 196, 26, 0.2);
    color: var(--success-color);
  }

  .alarm.warning {
    background: rgba(250, 173, 20, 0.2);
    color: var(--warning-color);
  }

  .alarm.critical {
    background: rgba(245, 34, 45, 0.2);
    color: var(--error-color);
  }

  .btn-detail {
    padding: 6px 16px;
    background: var(--primary-color);
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-detail:hover {
    background: var(--primary-hover);
  }
</style>
