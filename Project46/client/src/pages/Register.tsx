import { createSignal } from 'solid-js';
import { useNavigate, A } from '@solidjs/router';
import { authStore } from '../store/authStore';
import { socketService } from '../services/socket';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [nickname, setNickname] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!username() || !password() || !nickname()) {
      setError('请填写完整信息');
      return;
    }
    if (password().length < 6) {
      setError('密码至少6位');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authStore.register(username(), password(), nickname());
      socketService.init();
      navigate('/');
    } catch (e: any) {
      setError(e.message || '注册失败');
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
          }}>创建账号</h1>
          <p style={{ color: '#94a3b8', 'font-size': '14px' }}>加入元宇宙办公系统</p>
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

          <div style={{ 'margin-bottom': '16px' }}>
            <label style={{ display: 'block', 'margin-bottom': '8px', 'font-size': '14px', color: '#cbd5e1' }}>用户名</label>
            <input
              type="text"
              value={username()}
              onInput={(e) => setUsername(e.target.value)}
              placeholder="至少3个字符"
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

          <div style={{ 'margin-bottom': '16px' }}>
            <label style={{ display: 'block', 'margin-bottom': '8px', 'font-size': '14px', color: '#cbd5e1' }}>昵称</label>
            <input
              type="text"
              value={nickname()}
              onInput={(e) => setNickname(e.target.value)}
              placeholder="请输入您的昵称"
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
              placeholder="至少6个字符"
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
            {loading() ? '注册中...' : '注册'}
          </button>
        </form>

        <div style={{ 'text-align': 'center', 'margin-top': '20px' }}>
          <span style={{ color: '#94a3b8', 'font-size': '14px' }}>已有账号？</span>
          <A href="/login" style={{ color: '#60a5fa', 'margin-left': '8px', 'text-decoration': 'none' }}>立即登录</A>
        </div>
      </div>
    </div>
  );
}
