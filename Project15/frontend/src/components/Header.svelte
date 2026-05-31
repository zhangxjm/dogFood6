<script>
  import { page } from '../store.js';

  const menuItems = [
    { id: 'dashboard', name: '数据概览', icon: '📊' },
    { id: 'elderly', name: '老人管理', icon: '👴' },
    { id: 'health', name: '健康监测', icon: '❤️' },
    { id: 'alerts', name: '预警中心', icon: '⚠️' },
    { id: 'emergency', name: '紧急呼叫', icon: '🚨' },
    { id: 'devices', name: '设备管理', icon: '📱' }
  ];

  function navigate(pageId) {
    page.set(pageId);
  }
</script>

<header class="header">
  <div class="header-content">
    <div class="logo">
      <span class="logo-icon">🏥</span>
      <h1>银发智能穿戴健康监护中台</h1>
    </div>
    <nav class="nav">
      {#each menuItems as item (item.id)}
        <button 
          class="nav-item {$page === item.id ? 'active' : ''}"
          on:click={() => navigate(item.id)}
        >
          <span class="nav-icon">{item.icon}</span>
          <span class="nav-text">{item.name}</span>
        </button>
      {/each}
    </nav>
    <div class="header-actions">
      <div class="status-indicator">
        <span class="status-dot"></span>
        <span>系统运行中</span>
      </div>
    </div>
  </div>
</header>

<style>
  .header {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-icon {
    font-size: 28px;
  }

  .logo h1 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
  }

  .nav {
    display: flex;
    gap: 4px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.3s ease;
  }

  .nav-item:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }

  .nav-item.active {
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
  }

  .nav-icon {
    font-size: 16px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #52c41a;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @media (max-width: 768px) {
    .nav-text {
      display: none;
    }
    .nav-item {
      padding: 8px 10px;
    }
    .logo h1 {
      font-size: 14px;
    }
  }
</style>
