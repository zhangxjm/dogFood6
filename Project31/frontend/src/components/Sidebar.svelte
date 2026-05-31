<script>
  export let currentView
  export let onViewChange

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: '数据概览' },
    { id: 'devices', icon: '🔧', label: '设备管理' },
    { id: 'commands', icon: '📡', label: '运维指令' },
    { id: 'alarms', icon: '⚠️', label: '告警中心' }
  ]

  const handleClick = (itemId) => {
    console.log('点击菜单:', itemId)
    if (onViewChange && typeof onViewChange === 'function') {
      onViewChange(itemId)
    } else {
      console.error('onViewChange is not a function:', onViewChange)
    }
  }
</script>

<aside class="sidebar">
  <nav class="menu">
    {#each menuItems as item}
      <button 
        type="button"
        class="menu-item {currentView === item.id ? 'active' : ''}"
        on:click|preventDefault={() => handleClick(item.id)}
      >
        <span class="menu-icon">{item.icon}</span>
        <span class="menu-label">{item.label}</span>
      </button>
    {/each}
  </nav>
  <div class="sidebar-footer">
    <div class="system-info">
      <span class="info-label">系统状态</span>
      <span class="info-value running">运行中</span>
    </div>
    <div class="system-info">
      <span class="info-label">消息队列</span>
      <span class="info-value connected">已连接</span>
    </div>
  </div>
</aside>

<style>
  .sidebar {
    width: 200px;
    background: var(--panel-bg);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
  }

  .menu {
    flex: 1;
    padding: 16px 0;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 24px;
    cursor: pointer;
    transition: all 0.2s;
    border-left: 3px solid transparent;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
    color: inherit;
    font-size: inherit;
    font-family: inherit;
  }

  .menu-item:hover {
    background: rgba(24, 144, 255, 0.1);
  }

  .menu-item.active {
    background: rgba(24, 144, 255, 0.15);
    border-left-color: var(--primary-color);
    color: var(--primary-color);
  }

  .menu-icon {
    font-size: 18px;
  }

  .menu-label {
    font-size: 14px;
  }

  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid var(--border-color);
  }

  .system-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    font-size: 12px;
  }

  .info-label {
    color: var(--text-muted);
  }

  .info-value {
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
  }

  .info-value.running {
    background: rgba(82, 196, 26, 0.2);
    color: var(--success-color);
  }

  .info-value.connected {
    background: rgba(24, 144, 255, 0.2);
    color: var(--primary-color);
  }
</style>
