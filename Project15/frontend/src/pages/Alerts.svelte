<script>
  import { onMount, onDestroy } from 'svelte';
  import { alertsList, realtimeAlerts } from '../store.js';

  let loading = true;
  let filterStatus = 'ALL';
  let stompClient = null;

  async function fetchAlerts(status = 'ALL') {
    loading = true;
    try {
      let url = '/api/alerts/all';
      if (status === 'PENDING') {
        url = '/api/alerts/pending';
      } else if (status === 'HANDLED') {
        url = '/api/alerts/handled';
      }
      const res = await fetch(url);
      const json = await res.json();
      alertsList.set(json.data || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      loading = false;
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
        stompClient.subscribe('/topic/alerts', (message) => {
          const data = JSON.parse(message.body);
          if (data.type === 'ALERT') {
            realtimeAlerts.update(existing => [data.data, ...existing]);
            if (filterStatus === 'ALL' || filterStatus === 'PENDING') {
              alertsList.update(existing => [data.data, ...existing]);
            }
          }
        });
      });
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }

  async function handleAlert(alertId) {
    const result = prompt('请输入处理结果：');
    if (result === null) return;
    
    try {
      await fetch(`/api/alerts/${alertId}/handle?handleResult=${encodeURIComponent(result)}`, {
        method: 'POST'
      });
      fetchAlerts(filterStatus);
    } catch (error) {
      console.error('Failed to handle alert:', error);
    }
  }

  function changeFilter(status) {
    filterStatus = status;
    fetchAlerts(status);
  }

  function getAlertLevelClass(level) {
    switch (level) {
      case 'CRITICAL': return 'tag-critical';
      case 'WARNING': return 'tag-warning';
      default: return 'tag-success';
    }
  }

  function getAlertTypeName(type) {
    switch (type) {
      case 'HEART_RATE': return '心率异常';
      case 'BLOOD_OXYGEN': return '血氧异常';
      case 'TEMPERATURE': return '体温异常';
      case 'BLOOD_PRESSURE': return '血压异常';
      case 'FALL': return '跌倒检测';
      default: return type;
    }
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN');
  }

  onMount(() => {
    fetchAlerts(filterStatus);
    connectWebSocket();
  });

  onDestroy(() => {
    if (stompClient && stompClient.connected) {
      stompClient.disconnect();
    }
  });
</script>

<div class="alerts-page">
  <div class="page-header">
    <h2>预警中心</h2>
    <div class="filter-buttons">
      <button 
        class="btn {filterStatus === 'ALL' ? 'btn-primary' : ''}" 
        on:click={() => changeFilter('ALL')}
      >
        全部
      </button>
      <button 
        class="btn {filterStatus === 'PENDING' ? 'btn-primary' : ''}" 
        on:click={() => changeFilter('PENDING')}
      >
        待处理
      </button>
      <button 
        class="btn {filterStatus === 'HANDLED' ? 'btn-primary' : ''}" 
        on:click={() => changeFilter('HANDLED')}
      >
        已处理
      </button>
    </div>
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>
  {:else if $alertsList.length > 0}
    <div class="alerts-list">
      {#each $alertsList as alert (alert.id)}
        <div class="alert-card level-{alert.alertLevel.toLowerCase()} status-{alert.alertStatus.toLowerCase()}">
          <div class="alert-header">
            <span class="tag {getAlertLevelClass(alert.alertLevel)}">
              {alert.alertLevel === 'CRITICAL' ? '严重' : alert.alertLevel === 'WARNING' ? '警告' : '提示'}
            </span>
            <span class="alert-type">{getAlertTypeName(alert.alertType)}</span>
            {#if alert.alertStatus === 'PENDING'}
              <span class="tag tag-warning">待处理</span>
            {:else}
              <span class="tag tag-success">已处理</span>
            {/if}
          </div>
          <div class="alert-body">
            <div class="alert-elderly">
              <span class="elderly-icon">👴</span>
              {alert.elderlyName || '未知'}
            </div>
            <div class="alert-content">{alert.alertContent}</div>
            {#if alert.alertValue}
              <div class="alert-value">检测值：{alert.alertValue}</div>
            {/if}
          </div>
          <div class="alert-footer">
            <span class="alert-time">🕐 {formatTime(alert.alertTime)}</span>
            {#if alert.alertStatus === 'PENDING'}
              <button class="btn btn-sm btn-primary" on:click={() => handleAlert(alert.id)}>
                处理
              </button>
            {/if}
            {#if alert.handleResult}
              <span class="handle-result">处理结果：{alert.handleResult}</span>
            {/if}
          </div>
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

<style>
  .alerts-page {
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

  .filter-buttons {
    display: flex;
    gap: 8px;
  }

  .alerts-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .alert-card {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #faad14;
  }

  .alert-card.level-critical {
    border-left-color: #f5222d;
    background: linear-gradient(90deg, #fff1f0 0%, #fff 10%);
  }

  .alert-card.level-warning {
    border-left-color: #faad14;
    background: linear-gradient(90deg, #fffbe6 0%, #fff 10%);
  }

  .alert-card.status-handled {
    opacity: 0.7;
  }

  .alert-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .alert-type {
    font-weight: 600;
    color: #262626;
  }

  .alert-body {
    margin-bottom: 12px;
  }

  .alert-elderly {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #595959;
    margin-bottom: 8px;
  }

  .elderly-icon {
    font-size: 16px;
  }

  .alert-content {
    font-size: 15px;
    color: #262626;
    margin-bottom: 8px;
  }

  .alert-value {
    font-size: 13px;
    color: #595959;
    background: #f5f5f5;
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .alert-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
  }

  .alert-time {
    font-size: 12px;
    color: #8c8c8c;
  }

  .handle-result {
    font-size: 12px;
    color: #52c41a;
  }

  .btn-sm {
    padding: 4px 12px;
    font-size: 12px;
  }
</style>
