import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface UserNft {
  id: number;
  booth_id: number;
  name: string;
  description: string;
  image_url: string;
  metadata: string;
  total_supply: number;
  minted_count: number;
  minted_at: string;
}

export default function NftCollection() {
  const router = useRouter();
  const [nfts, setNfts] = useState<UserNft[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const user = localStorage.getItem('metaverse_user');
    if (!user) {
      window.location.href = '/login';
      return;
    }
    const parsedUser = JSON.parse(user);
    setCurrentUser(parsedUser);
    loadUserNfts(parsedUser.id);
  }, []);

  const loadUserNfts = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/users/${userId}/nfts`);
      const data = await response.json();
      setNfts(data);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
    }
    setLoading(false);
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
        <title>我的藏品 - 元宇宙虚拟展会</title>
      </Head>

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              我的数字藏品
            </h1>
            <p className="text-gray-400">
              {currentUser?.username} 的收藏 ({nfts.length} 件)
            </p>
          </div>
          <button className="btn-secondary" onClick={() => router.push('/')}>
            返回首页
          </button>
        </div>

        {nfts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft) => {
              const metadata = JSON.parse(nft.metadata || '{}');
              const rarityColor = {
                legendary: '#FFD700',
                epic: '#9D4EDD',
                rare: '#4A90D9',
              }[metadata.rarity] || '#888';

              return (
                <div key={nft.id} className="glass-card p-6">
                  <div
                    className="w-full h-48 rounded-xl mb-4 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${rarityColor}33, ${rarityColor}11)`
                    }}
                  >
                    <span className="text-6xl">🎴</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{nft.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{nft.description}</p>
                  <div className="flex justify-between items-center">
                    <span
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ backgroundColor: `${rarityColor}33`, color: rarityColor }}
                    >
                      {metadata.rarity || 'common'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(nft.minted_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                      编号: #{nft.id.toString().padStart(6, '0')}
                    </p>
                    <p className="text-xs text-gray-500">
                      分类: {metadata.category || '未分类'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎴</div>
            <h2 className="text-2xl font-bold mb-2">暂无藏品</h2>
            <p className="text-gray-400 mb-8">前往虚拟展厅探索并兑换数字藏品</p>
            <button className="btn-primary" onClick={() => router.push('/')}>
              开始探索
            </button>
          </div>
        )}

        {nfts.length > 0 && (
          <div className="mt-12 glass-card p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#00D4FF' }}>
              收藏统计
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }}>
                <p className="text-2xl font-bold" style={{ color: '#FFD700' }}>
                  {nfts.filter((n) => JSON.parse(n.metadata || '{}').rarity === 'legendary').length}
                </p>
                <p className="text-sm text-gray-400">传说</p>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(157, 78, 221, 0.1)' }}>
                <p className="text-2xl font-bold" style={{ color: '#9D4EDD' }}>
                  {nfts.filter((n) => JSON.parse(n.metadata || '{}').rarity === 'epic').length}
                </p>
                <p className="text-sm text-gray-400">史诗</p>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(74, 144, 217, 0.1)' }}>
                <p className="text-2xl font-bold" style={{ color: '#4A90D9' }}>
                  {nfts.filter((n) => JSON.parse(n.metadata || '{}').rarity === 'rare').length}
                </p>
                <p className="text-sm text-gray-400">稀有</p>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(136, 136, 136, 0.1)' }}>
                <p className="text-2xl font-bold" style={{ color: '#888' }}>
                  {nfts.filter((n) => !['legendary', 'epic', 'rare'].includes(JSON.parse(n.metadata || '{}').rarity)).length}
                </p>
                <p className="text-sm text-gray-400">普通</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
