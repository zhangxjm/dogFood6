<script>
  import { onMount } from 'svelte'

  let devices = []
  let commands = []
  let selectedDevice = ''
  let commandType = ''
  let commandData = ''
  let operator = 'admin'

  const commandTypes = [
    { value: 'START', label: '启动设备' },
    { value: 'STOP', label: '停止设备' },
    { value: 'RESET', label: '重置设备' },
    { value: 'MAINTENANCE', label: '维护模式' },
    { value: 'CALIBRATE', label: '校准设备' },
    { value: 'DIAGNOSE', label: '诊断检查' }
  ]

  const loadDevices = async () => {
    try {
      const res = await fetch('/api/devices')
      const data = await res.json()
      if (data.code === 200) {
        devices = data.data
      }
    } catch (e) {
      console.error('Failed to load devices:', e)
    }
  }

  const loadCommands = async () => {
    try {
      const res = await fetch('/api/commands')
      const data = await res.json()
      if (data.code === 200) {
        commands = data.data
      }
    } catch (e) {
      console.error('Failed to load commands:', e)
    }
  }

  const sendCommand = async () => {
    if (!selectedDevice || !commandType) {
      alert('请选择设备和指令类型')
      return
    }

    try {
      const res = await fetch('/api/commands/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceCode: selectedDevice,
          commandType,
          commandData: commandData || '执行' + commandTypes.find(t => t.value === commandType)?.label,
          operator
        })
      })
      const data = await res.json()
      if (data.code === 200) {
        alert('指令发送成功')
        commandData = ''
        loadCommands()
      } else {
        alert('指令发送失败: ' + data.message)
      }
    } catch (e) {
      alert('指令发送失败')
    }
  }

  onMount(() => {
    loadDevices()
    loadCommands()
  })
</script>

<div class="command-panel">
  <h2>运维指令</h2>

  <div class="command-form">
    <div class="form-group">
      <label>选择设备</label>
      <select bind:value={selectedDevice}>
        <option value="">请选择设备</option>
        {#each devices as device}
          <option value={device.deviceCode}>{device.deviceName} ({device.deviceCode})</option>
        {/each}
      </select>
    </div>

    <div class="form-group">
      <label>指令类型</label>
      <select bind:value={commandType}>
        <option value="">请选择指令类型</option>
        {#each commandTypes as type}
          <option value={type.value}>{type.label}</option>
        {/each}
      </select>
    </div>

    <div class="form-group">
      <label>指令参数</label>
      <input type="text" placeholder="输入指令参数（可选）" bind:value={commandData} />
    </div>

    <div class="form-group">
      <label>操作人</label>
      <input type="text" bind:value={operator} />
    </div>

    <button class="btn-send" on:click={sendCommand}>
      发送指令
    </button>
  </div>

  <div class="command-history">
    <h3>指令执行记录</h3>
    <table class="command-table">
      <thead>
        <tr>
          <th>设备</th>
          <th>指令类型</th>
          <th>指令内容</th>
          <th>状态</th>
          <th>操作人</th>
          <th>执行时间</th>
        </tr>
      </thead>
      <tbody>
        {#each commands as cmd}
          <tr>
            <td>{cmd.deviceCode}</td>
            <td>{cmd.commandType}</td>
            <td>{cmd.commandData}</td>
            <td>
              <span class="status {cmd.status}">
                {cmd.status === 'COMPLETED' ? '已完成' : cmd.status === 'EXECUTING' ? '执行中' : cmd.status === 'PENDING' ? '待执行' : '失败'}
              </span>
            </td>
            <td>{cmd.operator || '-'}</td>
            <td>{cmd.createTime?.split('T')[0]} {cmd.createTime?.split('T')[1]?.split('.')[0]}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .command-panel {
    max-width: 1400px;
  }

  .command-panel h2 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 24px;
  }

  .command-form {
    background: var(--panel-bg);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: var(--text-secondary);
  }

  .form-group select,
  .form-group input {
    width: 100%;
    padding: 10px 16px;
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 14px;
  }

  .form-group select:focus,
  .form-group input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .btn-send {
    width: 100%;
    padding: 12px;
    background: var(--primary-color);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-send:hover {
    background: var(--primary-hover);
  }

  .command-history {
    background: var(--panel-bg);
    border-radius: 12px;
    padding: 24px;
  }

  .command-history h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .command-table {
    width: 100%;
    border-collapse: collapse;
  }

  .command-table th {
    padding: 12px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid var(--border-color);
  }

  .command-table td {
    padding: 12px;
    font-size: 14px;
    border-bottom: 1px solid var(--border-color);
  }

  .status {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .status.COMPLETED {
    background: rgba(82, 196, 26, 0.2);
    color: var(--success-color);
  }

  .status.EXECUTING {
    background: rgba(24, 144, 255, 0.2);
    color: var(--primary-color);
  }

  .status.PENDING {
    background: rgba(250, 173, 20, 0.2);
    color: var(--warning-color);
  }

  .status.FAILED {
    background: rgba(245, 34, 45, 0.2);
    color: var(--error-color);
  }
</style>
