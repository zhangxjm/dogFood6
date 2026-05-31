<script>
  import { onMount } from 'svelte';
  import { devicesList, elderlyList } from '../store.js';

  let loading = true;
  let showModal = false;
  let editingDevice = null;
  let formData = {
    deviceCode: '',
    deviceType: '',
    deviceName: '',
    bluetoothMac: '',
    elderlyId: ''
  };

  async function fetchData() {
    loading = true;
    try {
      const [devicesRes, elderlyRes] = await Promise.all([
        fetch('/api/devices').then(r => r.json()),
        fetch('/api/elderly').then(r => r.json())
      ]);
      devicesList.set(devicesRes.data || []);
      elderlyList.set(elderlyRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      loading = false;
    }
  }

  function handleAdd() {
    editingDevice = null;
    formData = {
      deviceCode: '',
      deviceType: '',
      deviceName: '',
      bluetoothMac: '',
      elderlyId: ''
    };
    showModal = true;
  }

  function handleEdit(device) {
    editingDevice = device;
    formData = { ...device };
    showModal = true;
  }

  async function handleDelete(id) {
    if (!confirm('确定要删除该设备吗？')) return;
    try {
      await fetch(`/api/devices/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Failed to delete device:', error);
    }
  }

  async function handleSubmit() {
    try {
      const url = editingDevice ? `/api/devices/${editingDevice.id}` : '/api/devices';
      const method = editingDevice ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      showModal = false;
      fetchData();
    } catch (error) {
      console.error('Failed to save device:', error);
    }
  }

  function getConnectionStatusClass(status) {
    switch (status) {
      case 'CONNECTED': return 'tag-success';
      case 'DISCONNECTED': return 'tag-danger';
      default: return 'tag-warning';
    }
  }

  function getConnectionStatusText(status) {
    switch (status) {
      case 'CONNECTED': return '已连接';
      case 'DISCONNECTED': return '已断开';
      default: return '未知';
    }
  }

  function getElderlyName(elderlyId) {
    const elderly = $elderlyList.find(e => e.id === elderlyId);
    return elderly ? elderly.name : '未绑定';
  }

  onMount(fetchData);
</script>

<div class="devices-page">
  <div class="page-header">
    <h2>设备管理</h2>
    <button class="btn btn-primary" on:click={handleAdd}>
      <span>+ 添加设备</span>
    </button>
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>
  {:else if $devicesList.length > 0}
    <div class="devices-grid">
      {#each $devicesList as device (device.id)}
        <div class="device-card">
          <div class="device-header">
            <div class="device-icon">📱</div>
            <div class="device-info">
              <h3>{device.deviceName || device.deviceCode}</h3>
              <p>{device.deviceType}</p>
            </div>
            <span class="tag {getConnectionStatusClass(device.connectionStatus)}">
              {getConnectionStatusText(device.connectionStatus)}
            </span>
          </div>
          <div class="device-details">
            <div class="detail-row">
              <span class="label">设备编号：</span>
              <span class="value">{device.deviceCode}</span>
            </div>
            <div class="detail-row">
              <span class="label">蓝牙地址：</span>
              <span class="value">{device.bluetoothMac}</span>
            </div>
            <div class="detail-row">
              <span class="label">绑定老人：</span>
              <span class="value">{getElderlyName(device.elderlyId)}</span>
            </div>
            <div class="detail-row">
              <span class="label">电池电量：</span>
              <div class="battery-indicator">
                <div class="battery-bar">
                  <div 
                    class="battery-level" 
                    style="width: {device.batteryLevel || 0}%"
                  ></div>
                </div>
                <span>{device.batteryLevel || 0}%</span>
              </div>
            </div>
            {#if device.lastHeartbeatTime}
              <div class="detail-row">
                <span class="label">最后心跳：</span>
                <span class="value">{device.lastHeartbeatTime}</span>
              </div>
            {/if}
          </div>
          <div class="device-actions">
            <button class="btn btn-sm" on:click={() => handleEdit(device)}>编辑</button>
            <button class="btn btn-sm btn-danger" on:click={() => handleDelete(device.id)}>删除</button>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="empty-state">
      <div class="empty-icon">📱</div>
      <p>暂无设备信息</p>
    </div>
  {/if}
</div>

{#if showModal}
  <div class="modal-overlay" on:click={() => showModal = false}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>{editingDevice ? '编辑设备' : '添加设备'}</h2>
        <button class="modal-close" on:click={() => showModal = false}>×</button>
      </div>
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label>设备编号 *</label>
          <input type="text" bind:value={formData.deviceCode} required placeholder="请输入设备编号">
        </div>
        <div class="form-group">
          <label>设备类型</label>
          <select bind:value={formData.deviceType}>
            <option value="">请选择</option>
            <option value="智能手表">智能手表</option>
            <option value="智能手环">智能手环</option>
            <option value="智能项链">智能项链</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="form-group">
          <label>设备名称</label>
          <input type="text" bind:value={formData.deviceName} placeholder="请输入设备名称">
        </div>
        <div class="form-group">
          <label>蓝牙MAC地址</label>
          <input type="text" bind:value={formData.bluetoothMac} placeholder="例如：00:1A:2B:3C:4D:5E">
        </div>
        <div class="form-group">
          <label>绑定老人</label>
          <select bind:value={formData.elderlyId}>
            <option value="">请选择</option>
            {#each $elderlyList as elderly (elderly.id)}
              <option value={elderly.id}>{elderly.name}</option>
            {/each}
          </select>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn" on:click={() => showModal = false}>取消</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .devices-page {
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

  .devices-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  .device-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .device-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .device-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%);
    border-bottom: 1px solid #f0f0f0;
  }

  .device-icon {
    font-size: 32px;
  }

  .device-info h3 {
    font-size: 16px;
    color: #262626;
    margin: 0 0 4px 0;
  }

  .device-info p {
    font-size: 12px;
    color: #8c8c8c;
    margin: 0;
  }

  .device-details {
    padding: 16px;
  }

  .detail-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;
  }

  .detail-row .label {
    color: #595959;
    min-width: 80px;
  }

  .detail-row .value {
    color: #262626;
    flex: 1;
  }

  .battery-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .battery-bar {
    width: 100px;
    height: 12px;
    background: #f0f0f0;
    border-radius: 6px;
    overflow: hidden;
  }

  .battery-level {
    height: 100%;
    background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%);
    transition: width 0.3s ease;
  }

  .device-actions {
    display: flex;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid #f0f0f0;
    background: #fafafa;
  }

  .btn-sm {
    padding: 4px 12px;
    font-size: 12px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }
</style>
