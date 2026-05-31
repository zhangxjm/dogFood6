import { Outlet, useNavigate, A } from '@solidjs/router';
import { authStore } from '../store/authStore';
import { socketService } from '../services/socket';
import { onCleanup, onMount } from 'solid-js';

export default function Layout() {
  const navigate = useNavigate();
  let onlineUsersInterval: number;

  onMount(() => {
    onlineUsersInterval = window.setInterval(() => {
      fetch('/api/users/online', { credentials: 'include' });
    }, 30000);
  });

  onCleanup(() => {
    clearInterval(onlineUsersInterval);
  });

  async function handleLogout() {
    socketService.disconnect();
    await authStore.logout();
    navigate('/login');
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', 'flex-direction': 'column' }}>
      <header style={{
        height: '60px',
        background: 'rgba(30, 41, 59, 0.95)',
        'border-bottom': '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'space-between',
        padding: '0 24px',
        'backdrop-filter': 'blur(10px)',
      }}>
        <div style={{ display: 'flex', 'align-items': 'center', gap: '32px' }}>
          <A href="/" style={{
            display: 'flex',
            'align-items': 'center',
            gap: '8px',
            color: 'white',
            'text-decoration': 'none',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              'border-radius': '8px',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              'font-weight': 'bold',
            }}>宇</div>
            <span style={{ 'font-size': '18px', 'font-weight': '600' }}>元宇宙办公</span>
          </A>
          <nav style={{ display: 'flex', gap: '8px' }}>
            <A href="/" style={{
              padding: '8px 16px',
              color: '#cbd5e1',
              'text-decoration': 'none',
              'border-radius': '6px',
              transition: 'all 0.2s',
            }}
            activeStyle={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}
            >
              工作台
            </A>
          </nav>
        </div>

        <div style={{ display: 'flex', 'align-items': 'center', gap: '16px' }}>
          <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              'border-radius': '50%',
              background: socketService.isConnected() ? '#22c55e' : '#ef4444',
            }} />
            <span style={{ 'font-size': '12px', color: '#94a3b8' }}>
              {socketService.isConnected() ? '已连接' : '连接断开'}
            </span>
          </div>
          <div style={{ display: 'flex', 'align-items': 'center', gap: '12px' }}>
            <img src={authStore.user()?.avatar} alt="avatar" style={{ width: '32px', height: '32px', 'border-radius': '50%' }} />
            <span style={{ 'font-size': '14px', color: '#e2e8f0' }}>{authStore.user()?.nickname}</span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              'border-radius': '6px',
              'font-size': '13px',
              transition: 'all 0.2s',
            }}
          >
            退出登录
          </button>
        </div>
      </header>

      <main style={{ flex: 1, overflow: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  );
}
