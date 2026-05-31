import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState('robot');
  const [avatarColor, setAvatarColor] = useState('#4A90D9');

  const avatarStyles = [
    { id: 'robot', name: '机器人' },
    { id: 'human', name: '人类' },
    { id: 'alien', name: '外星人' },
  ];

  const avatarColors = [
    '#4A90D9',
    '#D94A4A',
    '#4AD974',
    '#FFD94A',
    '#D94AD9',
    '#4AD9D9',
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const user = localStorage.getItem('metaverse_user');
    if (user) {
      window.location.href = '/';
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });
      const user = await response.json();

      if (user && user.id) {
        await fetch(`http://localhost:3001/users/${user.id}/avatar`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ style: avatarStyle, color: avatarColor }),
        });

        const updatedUser = { ...user, avatar_data: JSON.stringify({ style: avatarStyle, color: avatarColor }) };
        localStorage.setItem('metaverse_user', JSON.stringify(updatedUser));
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('登录失败，请检查服务器是否启动');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'radial-gradient(ellipse at center, #1a1a3a 0%, #0a0a1a 100%)'
    }}>
      <Head>
        <title>登录 - 元宇宙虚拟展会</title>
      </Head>

      <div className="glass-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{
            background: 'linear-gradient(135deg, #00D4FF, #4ECDC4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            元宇宙虚拟展会
          </h1>
          <p className="text-gray-400">登录进入沉浸式虚拟世界</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入您的用户名"
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-3">虚拟形象</label>
            <div className="flex gap-4 justify-center mb-4">
              {avatarStyles.map((style) => (
                <div
                  key={style.id}
                  onClick={() => setAvatarStyle(style.id)}
                  className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${
                    avatarStyle === style.id
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full"
                    style={{ backgroundColor: avatarColor }}
                  />
                  <p className="text-xs text-center mt-2">{style.name}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-center">
              {avatarColors.map((color) => (
                <div
                  key={color}
                  onClick={() => setAvatarColor(color)}
                  className={`w-8 h-8 rounded-full cursor-pointer transition-all ${
                    avatarColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || !username.trim()}
          >
            {loading ? (
              <div className="loading-spinner mx-auto" style={{ width: '24px', height: '24px' }} />
            ) : (
              '进入虚拟世界'
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          提示：请确保服务器已启动在端口 3001
        </p>
      </div>
    </div>
  );
}
