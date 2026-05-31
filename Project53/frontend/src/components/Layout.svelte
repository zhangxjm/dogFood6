<script>
    import { Link } from 'svelte-routing';

    let currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

    function updatePath() {
        currentPath = window.location.pathname;
    }

    const menuItems = [
        { path: '/', label: '实时统计', icon: '📊' },
        { path: '/equipment', label: '设备管理', icon: '⚙️' },
        { path: '/energy-data', label: '能耗数据', icon: '📈' },
        { path: '/saving-plans', label: '节能方案', icon: '💡' },
        { path: '/loss-analysis', label: '损耗分析', icon: '🔍' }
    ];
</script>

<div class="app-container">
    <aside class="sidebar">
        <div class="logo">
            <h1>⚡ 能耗管控系统</h1>
        </div>
        <nav class="menu">
            {#each menuItems as item}
                <Link to={item.path} class={currentPath === item.path ? 'menu-item active' : 'menu-item'}>
                    <span class="icon">{item.icon}</span>
                    <span class="label">{item.label}</span>
                </Link>
            {/each}
        </nav>
    </aside>

    <main class="main-content">
        <slot />
    </main>
</div>

<style>
    .app-container {
        display: flex;
        min-height: 100vh;
    }

    .sidebar {
        width: 220px;
        background: linear-gradient(180deg, #1e3a5f 0%, #0d1b2a 100%);
        color: white;
        padding: 20px 0;
        position: fixed;
        height: 100vh;
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    }

    .logo {
        padding: 0 20px 30px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 20px;
    }

    .logo h1 {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
    }

    .menu {
        display: flex;
        flex-direction: column;
    }

    .menu-item {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        transition: all 0.3s;
        border-left: 3px solid transparent;
    }

    .menu-item:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }

    .menu-item.active {
        background: rgba(255, 255, 255, 0.15);
        color: white;
        border-left-color: #4ecdc4;
    }

    .icon {
        font-size: 18px;
        margin-right: 12px;
    }

    .label {
        font-size: 14px;
    }

    .main-content {
        flex: 1;
        margin-left: 220px;
        padding: 30px;
        background: #f5f7fa;
        min-height: 100vh;
    }
</style>
