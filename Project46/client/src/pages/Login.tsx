import { createSignal } from 'solid-js';
import { useNavigate, A } from '@solidjs/router';
import { authStore } from '../store/authStore';
import { socketService } from '../services/socket';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!username() || !password()) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authStore.login(username(), password());
      socketService.init();
      navigate('/');
    } catch (e: any) {
      setError(e.message || '登录失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
    }}>
      <div class="fade-in" style={{
        width: '400px',
        padding: '40px',
        background: 'rgba(30, 41, 59, 0.9)',
        'border-radius': '16px',
        'backdrop-filter': 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        'box-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{ 'text-align': 'center', 'margin-bottom': '32px' }}>
          <h1 style={{
            'font-size': '32px',
            'margin-bottom': '8px',
            background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
            '-webkit-background-clip': 'text',
            '-webkit-text-fill-color': 'transparent',
          }}>元宇宙办公系统</h1>
          <p style={{ color: '#94a3b8', 'font-size': '14px' }}>虚拟协作 · 高效办公</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error() && (
            <div style={{
              padding: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              'border-radius': '8px',
              'margin-bottom': '16px',
              'font-size': '14px',
            }}>{error()}</div>
          )}

          <div style={{ 'margin-bottom': '20px' }}>
            <label style={{ display: 'block', 'margin-bottom': '8px', 'font-size': '14px', color: '#cbd5e1' }}>用户名</label>
            <input
              type="text"
              value={username()}
              onInput={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                'border-radius': '8px',
                color: '#e2e8f0',
                'font-size': '14px',
              }}
            />
          </div>

          <div style={{ 'margin-bottom': '24px' }}>
            <label style={{ display: 'block', 'margin-bottom': '8px', 'font-size': '14px', color: '#cbd5e1' }}>密码</label>
            <input
              type="password"
              value={password()}
              onInput={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                'border-radius': '8px',
                color: '#e2e8f0',
                'font-size': '14px',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading()}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              color: 'white',
              border: 'none',
              'border-radius': '8px',
              'font-size': '16px',
              'font-weight': '600',
              cursor: loading() ? 'not-allowed' : 'pointer',
              opacity: loading() ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {loading() ? '登录中...' : '登录'}
          </button>
        </form>

        <div style={{ 'text-align': 'center', 'margin-top': '20px' }}>
          <span style={{ color: '#94a3b8', 'font-size': '14px' }}>还没有账号？</span>
          <A href="/register" style={{ color: '#60a5fa', 'margin-left': '8px', 'text-decoration': 'none' }}>立即注册</A>
        </div>

        <div style={{ 'margin-top': '24px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', 'border-radius': '8px' }}>
          <p style={{ 'font-size': '12px', color: '#94a3b8', 'margin-bottom': '8px' }}>测试账号：</p>
          <p style={{ 'font-size': '12px', color: '#60a5fa' }}>admin / 123456</p>
          <p style={{ 'font-size': '12px', color: '#60a5fa' }}>zhangsan / 123456</p>
        </div>
      </div>
    </div>
  );
}
