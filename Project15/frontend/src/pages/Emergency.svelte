<script>
  import { onMount, onDestroy } from 'svelte';
  import { emergencyCallsList, realtimeEmergencyCalls, elderlyList } from '../store.js';

  let loading = true;
  let selectedElderlyId = null;
  let stompClient = null;

  async function fetchData() {
    loading = true;
    try {
      const [elderlyRes, emergencyRes] = await Promise.all([
        fetch('/api/elderly').then(r => r.json()),
        fetch('/api/emergency/pending').then(r => r.json())
      ]);
      elderlyList.set(elderlyRes.data || []);
      emergencyCallsList.set(emergencyRes.data || []);
      if (elderlyRes.data && elderlyRes.data.length > 0) {
        selectedElderlyId = elderlyRes.data[0].id;
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
        stompClient.subscribe('/topic/emergency', (message) => {
          const data = JSON.parse(message.body);
          if (data.type === 'EMERGENCY_CALL') {
            realtimeEmergencyCalls.update(existing => [data.data, ...existing]);
          }
        });
      });
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }

  async function createEmergencyCall() {
    if (!selectedElderlyId) {
      alert('请选择老人');
      return;
    }
    
    const content = prompt('请输入紧急呼叫内容：');
    if (content === null) return;
    
    try {
      await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elderlyId: selectedElderlyId,
          callType: 'MANUAL',
          callContent: content
        })
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create emergency call:', error);
    }
  }

  async function handleEmergency(callId) {
    const result = prompt('请输入处理结果：');
    if (result === null) return;
    
    try {
      await fetch(`/api/emergency/${callId}/handle?handleResult=${encodeURIComponent(result)}`, {
        method: 'POST'
      });
      fetchData();
    } catch (error) {
      console.error('Failed to handle emergency:', error);
    }
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN');
  }

  $: allCalls = [...$emergencyCallsList, ...$realtimeEmergencyCalls].slice(0, 50);

  onMount(() => {
    fetchData();
    connectWebSocket();
  });

  onDestroy(() => {
    if (stompClient && stompClient.connected) {
      stompClient.disconnect();
    }
  });
</script>

<div class="emergency-page">
  <div class="page-header">
    <h2>紧急呼叫</h2>
    <div class="header-actions">
      <select bind:value={selectedElderlyId}>
        {#each $elderlyList as elderly (elderly.id)}
          <option value={elderly.id}>{elderly.name}</option>
        {/each}
      </select>
      <button class="btn btn-danger" on:click={createEmergencyCall}>
        🚨 发起紧急呼叫
      </button>
    </div>
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>
  {:else if allCalls.length > 0}
    <div class="calls-list">
      {#each allCalls as call (call.id)}
        <div class="call-card status-{call.callStatus.toLowerCase()}">
          <div class="call-header">
            <span class="call-type-icon">🚨</span>
            <span class="call-type">{call.callType === 'MANUAL' ? '手动呼叫' : '自动呼叫'}</span>
            {#if call.callStatus === 'PENDING'}
              <span class="tag tag-critical">待处理</span>
            {:else}
              <span class="tag tag-success">已处理</span>
            {/if}
          </div>
          <div class="call-body">
            <div class="call-content">{call.callContent || '紧急求助'}</div>
            {#if call.contactName}
              <div class="call-contact">
                <span>联系人：{call.contactName}</span>
                <span>联系电话：{call.contactPhone}</span>
              </div>
            {/if}
          </div>
          <div class="call-footer">
            <span class="call-time">🕐 {formatTime(call.callTime)}</span>
            {#if call.callStatus === 'PENDING'}
              <button class="btn btn-sm btn-primary" on:click={() => handleEmergency(call.id)}>
                处理
              </button>
            {/if}
            {#if call.handleResult}
              <span class="handle-result">处理结果：{call.handleResult}</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="empty-state">
      <div class="empty-icon">📞</div>
      <p>暂无紧急呼叫记录</p>
    </div>
  {/if}
</div>

<style>
  .emergency-page {
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

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-actions select {
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    font-size: 14px;
  }

  .calls-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .call-card {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #ff4d4f;
  }

  .call-card.status-handled {
    opacity: 0.7;
    border-left-color: #52c41a;
  }

  .call-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .call-type-icon {
    font-size: 20px;
  }

  .call-type {
    font-weight: 600;
    color: #262626;
  }

  .call-body {
    margin-bottom: 12px;
  }

  .call-content {
    font-size: 15px;
    color: #262626;
    margin-bottom: 8px;
  }

  .call-contact {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: #595959;
  }

  .call-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
  }

  .call-time {
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
