import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface Exhibition {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
}

export default function Home() {
  const router = useRouter();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExhibitions = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/exhibitions');
      const data = await response.json();
      setExhibitions(data);
    } catch (error) {
      console.error('Failed to load exhibitions:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const user = localStorage.getItem('metaverse_user');
    if (!user) {
      window.location.href = '/login';
      return;
    }
    loadExhibitions();
  }, [loadExhibitions]);

  const enterExhibition = (id: number) => {
    router.push(`/exhibition?id=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'radial-gradient(ellipse at center, #1a1a3a 0%, #0a0a1a 100%)'
      }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{
      background: 'radial-gradient(ellipse at center, #1a1a3a 0%, #0a0a1a 100%)'
    }}>
      <Head>
        <title>元宇宙虚拟展会 - 展会列表</title>
      </Head>

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{
              background: 'linear-gradient(135deg, #00D4FF, #4ECDC4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              元宇宙虚拟展会
            </h1>
            <p className="text-gray-400">选择一个展会进入沉浸式虚拟世界</p>
          </div>
          <div className="flex gap-4">
            <button className="btn-secondary" onClick={() => router.push('/nft')}>
              我的藏品
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                localStorage.removeItem('metaverse_user');
                window.location.href = '/login';
              }}
            >
              退出登录
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exhibitions.map((exhibition) => (
            <div
              key={exhibition.id}
              onClick={() => enterExhibition(exhibition.id)}
              className="glass-card p-6 cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="w-full h-40 rounded-xl mb-4 flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(78, 205, 196, 0.2))'
              }}>
                <span className="text-6xl">🌐</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{exhibition.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{exhibition.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(exhibition.start_date).toLocaleDateString('zh-CN')} - {new Date(exhibition.end_date).toLocaleDateString('zh-CN')}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  exhibition.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {exhibition.status === 'active' ? '进行中' : '已结束'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {exhibitions.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">暂无展会数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
