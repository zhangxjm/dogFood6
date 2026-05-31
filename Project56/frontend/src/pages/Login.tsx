import { createSignal } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { login } from '../stores/auth';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');
    try {
      await login(username(), password());
      navigate('/');
    } catch (err: any) {
      setError(err.message || '\u767B\u5F55\u5931\u8D25');
    }
  };

  return (
    <div class="max-w-md mx-auto mt-12">
      <div class="rounded-xl p-8" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <h1 class="text-2xl font-bold text-center mb-6">{'\u767B\u5F55'}</h1>
        {error() && <div class="mb-4 p-3 rounded-lg text-sm" style={{ background: '#FEE2E2', color: 'var(--color-primary)' }}>{error()}</div>}
        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">{'\u624B\u673A\u53F7/\u8D26\u53F7'}</label>
            <input type="text" value={username()} onInput={e => setUsername(e.currentTarget.value)} placeholder={'\u8BF7\u8F93\u5165\u624B\u673A\u53F7\u6216\u8D26\u53F7'} class="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">{'\u5BC6\u7801'}</label>
            <input type="password" value={password()} onInput={e => setPassword(e.currentTarget.value)} placeholder={'\u8BF7\u8F93\u5165\u5BC6\u7801'} class="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} required />
          </div>
          <button type="submit" class="w-full py-3 rounded-lg font-medium text-white transition-all hover:opacity-90" style={{ background: 'var(--color-primary)' }}>{'\u767B\u5F55'}</button>
        </form>
        <p class="text-center text-sm mt-4" style={{ color: 'var(--color-text-light)' }}>
          {'\u8FD8\u6CA1\u6709\u8D26\u53F7\uFF1F'}<A href="/register" class="font-medium transition-colors" style={{ color: 'var(--color-primary)' }}>{'\u7ACB\u5373\u6CE8\u518C'}</A>
        </p>
      </div>
    </div>
  );
}



