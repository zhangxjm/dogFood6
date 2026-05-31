<script>
  import { onMount, onDestroy } from 'svelte'
  import { deviceStore } from '../stores/deviceStore'
  import { websocketStore } from '../stores/websocketStore'
  import DeviceCard from './DeviceCard.svelte'

  export let onSelectDevice
  export let show3D

  let alarmDevices = []
  let wsUnsubscribe

  const loadDevices = async () => {
    try {
      const res = await fetch('/api/devices')
      const data = await res.json()
      if (data.code === 200) {
        $deviceStore.setDevices(data.data)
      }
      const alarmRes = await fetch('/api/devices/alarms')
      const alarmData = await alarmRes.json()
      if (alarmData.code === 200) {
        alarmDevices = alarmData.data
      }
    } catch (e) {
      console.error('Failed to load devices:', e)
    }
  }

  onMount(() => {
    loadDevices()
    wsUnsubscribe = websocketStore.subscribe(state => {
      Object.values(state.statuses).forEach(status => {
        $deviceStore.updateDevice(status)
      })
    })
    const interval = setInterval(loadDevices, 30000)
    onDestroy(() => {
      clearInterval(interval)
      if (wsUnsubscribe) wsUnsubscribe()
    })
  })
</script>

<div class="dashboard">
  <div class="section">
    <h2 class="section-title">设备实时状态</h2>
    <div class="device-grid">
      {#each $deviceStore.devices as device (device.id)}
        <DeviceCard device={device} onSelect={onSelectDevice} />
      {/each}
    </div>
  </div>

  {#if alarmDevices.length > 0}
    <div class="section">
      <h2 class="section-title alarm">告警设备</h2>
      <div class="alarm-list">
        {#each alarmDevices as device (device.id)}
          <div class="alarm-item" on:click={() => onSelectDevice(device)}>
            <span class="alarm-level {device.alarmLevel === 'CRITICAL' ? 'critical' : 'warning'}">
              {device.alarmLevel === 'CRITICAL' ? '严重' : '警告'}
            </span>
            <span class="alarm-device">{device.deviceName}</span>
            <span class="alarm-message">{device.alarmMessage}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .dashboard {
    max-width: 1400px;
  }

  .section {
    margin-bottom: 32px;
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-left: 12px;
    border-left: 4px solid var(--primary-color);
  }

  .section-title.alarm {
    border-left-color: var(--error-color);
    color: var(--error-color);
  }

  .device-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .alarm-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .alarm-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: var(--panel-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .alarm-item:hover {
    border-color: var(--error-color);
    background: rgba(245, 34, 45, 0.1);
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

  .alarm-message {
    color: var(--text-secondary);
    font-size: 14px;
  }
</style>
