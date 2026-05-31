import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, RoundedBox, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { io, Socket } from 'socket.io-client';

interface Booth {
  id: number;
  exhibition_id: number;
  name: string;
  owner_id: number;
  position_x: number;
  position_y: number;
  position_z: number;
  rotation: number;
  theme: string;
  custom_data: string;
  status: string;
}

interface Nft {
  id: number;
  booth_id: number;
  name: string;
  description: string;
  image_url: string;
  metadata: string;
  total_supply: number;
  minted_count: number;
}

function BoothInterior({ booth }: { booth: Booth }) {
  const customData = JSON.parse(booth.custom_data || '{}');
  const color = customData.color || '#00D4FF';

  return (
    <group>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 5, 0]} intensity={1} color={color} />
      <pointLight position={[3, 3, 3]} intensity={0.5} />
      <pointLight position={[-3, 3, -3]} intensity={0.5} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[15, 64]} />
        <meshStandardMaterial color="#0a0a1a" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[14, 15, 64]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>

      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * Math.PI * 2) / 6;
        const x = Math.cos(angle) * 8;
        const z = Math.sin(angle) * 8;
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
            <RoundedBox args={[4, 6, 0.3]} radius={0.1}>
              <meshStandardMaterial color={color} transparent opacity={0.6} metalness={0.3} />
            </RoundedBox>
            <mesh position={[0, 0, 0.2]}>
              <planeGeometry args={[3.5, 5]} />
              <meshStandardMaterial color="#1a1a3a" />
            </mesh>
          </group>
        );
      })}

      <Text
        position={[0, 8, 0]}
        fontSize={1.5}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {booth.name}
      </Text>

      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 20;
        const radius = 12 + Math.random() * 2;
        const y = Math.random() * 10 + 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
        );
      })}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />
    </group>
  );
}

export default function BoothPage() {
  const router = useRouter();
  const { id } = router.query;
  const [booth, setBooth] = useState<Booth | null>(null);
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedNft, setSelectedNft] = useState<Nft | null>(null);
  const [minting, setMinting] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customizing, setCustomizing] = useState(false);
  const [customColor, setCustomColor] = useState('#00D4FF');

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const user = localStorage.getItem('metaverse_user');
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setCurrentUser(JSON.parse(user));

    if (id) {
      loadBooth(Number(id));
      loadNfts(Number(id));
      initializeSocket(JSON.parse(user), Number(id));
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  const loadBooth = async (boothId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/booths/${boothId}`);
      const data = await response.json();
      setBooth(data);
      if (data.custom_data) {
        const customData = JSON.parse(data.custom_data);
        if (customData.color) {
          setCustomColor(customData.color);
        }
      }
    } catch (error) {
      console.error('Failed to load booth:', error);
    }
    setLoading(false);
  };

  const loadNfts = async (boothId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/nfts?boothId=${boothId}`);
      const data = await response.json();
      setNfts(data);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
    }
  };

  const initializeSocket = (user: any, boothId: number) => {
    const socket = io('http://localhost:3001/exhibition', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('enter_booth', { boothId });
      socket.emit('join_exhibition', {
        exhibitionId: 1,
        userId: user.id,
        username: user.username,
        avatar: user.avatar_data || '{}',
      });
    });

    socket.on('user_entered_booth', (data: any) => {
      console.log('User entered booth:', data);
    });

    socket.on('user_left_booth', (data: any) => {
      console.log('User left booth:', data);
    });

    socket.on('receive_chat', (data: any) => {
      setChatMessages((prev) => [...prev, data]);
    });

    socketRef.current = socket;
  };

  const mintNft = async (nft: Nft) => {
    if (!currentUser) return;
    setMinting(true);

    try {
      const response = await fetch('http://localhost:3001/nfts/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, nftId: nft.id }),
      });
      const result = await response.json();

      if (result.success) {
        alert(`恭喜！成功兑换 NFT: ${nft.name}`);
        loadNfts(booth?.id || 0);
      } else {
        alert(result.message || '兑换失败');
      }
    } catch (error) {
      console.error('Mint error:', error);
      alert('兑换失败，请重试');
    }
    setMinting(false);
  };

  const sendChat = useCallback(() => {
    if (!chatInput.trim() || !socketRef.current) return;
    socketRef.current.emit('send_chat', { message: chatInput });
    setChatInput('');
  }, [chatInput]);

  const saveCustomization = async () => {
    if (!booth) return;
    try {
      await fetch(`http://localhost:3001/booths/${booth.id}/customize`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color: customColor, description: JSON.parse(booth.custom_data || '{}').description }),
      });
      setCustomizing(false);
      loadBooth(booth.id);
    } catch (error) {
      console.error('Customization error:', error);
    }
  };

  if (loading || !booth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'radial-gradient(ellipse at center, #1a1a3a 0%, #0a0a1a 100%)'
      }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  const customData = JSON.parse(booth.custom_data || '{}');

  return (
    <div className="min-h-screen" style={{ background: '#0a0a1a' }}>
      <Head>
        <title>{booth.name} - 元宇宙虚拟展会</title>
      </Head>

      <div className="h-96 relative">
        <Canvas camera={{ position: [0, 5, 12], fov: 60 }} style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 100%)' }}>
          <BoothInterior booth={booth} />
        </Canvas>
      </div>

      <div className="p-8 max-w-6xl mx-auto">
        <div className="glass-card p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: customData.color || '#00D4FF' }}>
                {booth.name}
              </h1>
              <p className="text-gray-400">{customData.description || '探索这个精彩展位'}</p>
            </div>
            <div className="flex gap-4">
              <button className="btn-secondary" onClick={() => router.back()}>
                返回展厅
              </button>
              <button className="btn-primary" onClick={() => setCustomizing(true)}>
                定制展位
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#00D4FF' }}>
              数字藏品
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nfts.map((nft) => {
                const metadata = JSON.parse(nft.metadata || '{}');
                const rarityColor = {
                  legendary: '#FFD700',
                  epic: '#9D4EDD',
                  rare: '#4A90D9',
                }[metadata.rarity] || '#888';

                return (
                  <div
                    key={nft.id}
                    className="nft-card glass-card p-4"
                    onClick={() => setSelectedNft(nft)}
                  >
                    <div
                      className="w-full h-32 rounded-xl mb-3 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${rarityColor}33, ${rarityColor}11)` }}
                    >
                      <span className="text-4xl">🎴</span>
                    </div>
                    <h3 className="font-bold mb-1">{nft.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{nft.description}</p>
                    <div className="flex justify-between items-center">
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${rarityColor}33`, color: rarityColor }}
                      >
                        {metadata.rarity || 'common'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {nft.minted_count}/{nft.total_supply}
                      </span>
                    </div>
                  </div>
                );
              })}
              {nfts.length === 0 && (
                <p className="text-gray-500 col-span-2 text-center py-8">该展位暂无数字藏品</p>
              )}
            </div>
          </div>

          <div>
            <div className="glass-card p-4 mb-6">
              <h3 className="text-sm font-bold mb-3" style={{ color: '#00D4FF' }}>
                实时聊天
              </h3>
              <div className="h-48 overflow-y-auto mb-3">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-bubble ${msg.userId === currentUser?.id ? 'self' : 'other'}`}
                  >
                    <p className="text-xs text-gray-400">{msg.username}</p>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                ))}
                {chatMessages.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">暂无消息</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChat()}
                  placeholder="输入消息..."
                  className="input-field flex-1 text-sm"
                />
                <button onClick={sendChat} className="btn-primary text-sm px-3">
                  发送
                </button>
              </div>
            </div>

            <div className="glass-card p-4">
              <h3 className="text-sm font-bold mb-3" style={{ color: '#00D4FF' }}>
                展位信息
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-400">
                  主题: <span className="text-white">{booth.theme}</span>
                </p>
                <p className="text-gray-400">
                  状态: <span className="text-green-400">{booth.status}</span>
                </p>
                <p className="text-gray-400">
                  藏品数量: <span className="text-white">{nfts.length}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedNft && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelectedNft(null)}
        >
          <div className="glass-card p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
            <div
              className="w-full h-48 rounded-xl mb-4 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${
                  { legendary: '#FFD700', epic: '#9D4EDD', rare: '#4A90D9' }[
                    JSON.parse(selectedNft.metadata || '{}').rarity
                  ] || '#888'
                }33, ${
                  { legendary: '#FFD700', epic: '#9D4EDD', rare: '#4A90D9' }[
                    JSON.parse(selectedNft.metadata || '{}').rarity
                  ] || '#888'
                }11)`,
              }}
            >
              <span className="text-6xl">🎴</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{selectedNft.name}</h2>
            <p className="text-gray-400 mb-4">{selectedNft.description}</p>
            <div className="flex justify-between items-center mb-4">
              <span
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: `${
                    { legendary: '#FFD700', epic: '#9D4EDD', rare: '#4A90D9' }[
                      JSON.parse(selectedNft.metadata || '{}').rarity
                    ] || '#888'
                  }33`,
                  color:
                    { legendary: '#FFD700', epic: '#9D4EDD', rare: '#4A90D9' }[
                      JSON.parse(selectedNft.metadata || '{}').rarity
                    ] || '#888',
                }}
              >
                {JSON.parse(selectedNft.metadata || '{}').rarity || 'common'}
              </span>
              <span className="text-gray-400">
                已兑换 {selectedNft.minted_count}/{selectedNft.total_supply}
              </span>
            </div>
            <div className="flex gap-4">
              <button
                className="btn-primary flex-1"
                onClick={() => mintNft(selectedNft)}
                disabled={minting || selectedNft.minted_count >= selectedNft.total_supply}
              >
                {minting ? '兑换中...' : '立即兑换'}
              </button>
              <button className="btn-secondary" onClick={() => setSelectedNft(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {customizing && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setCustomizing(false)}
        >
          <div className="glass-card p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#00D4FF' }}>
              定制展位
            </h2>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">主题颜色</label>
              <div className="flex gap-2">
                {['#00D4FF', '#4ECDC4', '#FF6B6B', '#FFE66D', '#9D4EDD', '#95E1D3', '#F38181', '#4A90D9'].map(
                  (color) => (
                    <div
                      key={color}
                      onClick={() => setCustomColor(color)}
                      className={`w-10 h-10 rounded-full cursor-pointer transition-all ${
                        customColor === color ? 'ring-2 ring-white' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  )
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <button className="btn-primary flex-1" onClick={saveCustomization}>
                保存
              </button>
              <button className="btn-secondary" onClick={() => setCustomizing(false)}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
