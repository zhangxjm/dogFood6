import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, RoundedBox } from '@react-three/drei';
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

interface OnlineUser {
  socketId: string;
  userId: string;
  username: string;
  position: { x: number; y: number; z: number };
  avatar: any;
}

interface ChatMessage {
  socketId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

function Booth3D({ booth, onClick }: { booth: Booth; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const customData = JSON.parse(booth.custom_data || '{}');
  const color = customData.color || '#00D4FF';

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime + booth.id) * 0.1;
    }
  });

  return (
    <group
      position={[booth.position_x, booth.position_y, booth.position_z]}
      rotation={[0, booth.rotation, 0]}
      onClick={onClick}
    >
      <RoundedBox
        ref={meshRef}
        args={[4, 3, 4]}
        radius={0.2}
        smoothness={4}
      >
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.8}
          metalness={0.5}
          roughness={0.2}
        />
      </RoundedBox>
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {booth.name}
      </Text>
      <mesh position={[0, -1.6, 0]}>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function UserAvatar({ user, isSelf }: { user: OnlineUser; isSelf: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const avatarData = typeof user.avatar === 'string' ? JSON.parse(user.avatar) : user.avatar;
  const color = avatarData?.color || '#4A90D9';

  useFrame((state) => {
    if (meshRef.current && isSelf) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={[user.position.x, user.position.y, user.position.z]}>
      <mesh ref={meshRef}>
        <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, 1.3, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {user.username}
      </Text>
      {isSelf && (
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#00FF00" />
        </mesh>
      )}
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#1a1a2e" />
    </mesh>
  );
}

function Grid() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.material.opacity = 0.3;
      gridRef.current.material.transparent = true;
    }
  }, []);

  return (
    <gridHelper
      ref={gridRef}
      args={[100, 50, '#00D4FF', '#2a2a4a']}
      position={[0, -1.9, 0]}
    />
  );
}

function ExhibitionHall({
  booths,
  onlineUsers,
  selfUser,
  onBoothClick,
}: {
  booths: Booth[];
  onlineUsers: OnlineUser[];
  selfUser: OnlineUser | null;
  onBoothClick: (booth: Booth) => void;
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#4ECDC4" />
      <directionalLight position={[0, 20, 0]} intensity={0.5} />

      <Ground />
      <Grid />

      {booths.map((booth) => (
        <Booth3D key={booth.id} booth={booth} onClick={() => onBoothClick(booth)} />
      ))}

      {onlineUsers.map((user) => (
        <UserAvatar key={user.socketId} user={user} isSelf={false} />
      ))}

      {selfUser && <UserAvatar user={selfUser} isSelf={true} />}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />
    </>
  );
}

export default function Exhibition() {
  const router = useRouter();
  const { id } = router.query;
  const [booths, setBooths] = useState<Booth[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [selfUser, setSelfUser] = useState<OnlineUser | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [loading, setLoading] = useState(true);

  const exhibitionSocketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const user = localStorage.getItem('metaverse_user');
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setCurrentUser(JSON.parse(user));

    if (id) {
      loadBooths(Number(id));
      initializeSocket(JSON.parse(user));
    }

    return () => {
      if (exhibitionSocketRef.current) {
        exhibitionSocketRef.current.disconnect();
      }
    };
  }, [id]);

  const loadBooths = async (exhibitionId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/booths?exhibitionId=${exhibitionId}`);
      const data = await response.json();
      setBooths(data);
    } catch (error) {
      console.error('Failed to load booths:', error);
    }
    setLoading(false);
  };

  const initializeSocket = (user: any) => {
    const socket = io('http://localhost:3001/exhibition', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to exhibition socket');
      socket.emit('join_exhibition', {
        exhibitionId: id,
        userId: user.id,
        username: user.username,
        avatar: user.avatar_data || '{}',
      });
    });

    socket.on('joined_exhibition', (data: any) => {
      setOnlineUsers(data.users);
      setSelfUser({
        socketId: socket.id,
        userId: user.id,
        username: user.username,
        position: { x: 0, y: 0, z: 0 },
        avatar: user.avatar_data || '{}',
      });
    });

    socket.on('user_joined', (user: OnlineUser) => {
      setOnlineUsers((prev) => [...prev.filter((u) => u.socketId !== user.socketId), user]);
    });

    socket.on('user_left', (data: any) => {
      setOnlineUsers((prev) => prev.filter((u) => u.socketId !== data.socketId));
    });

    socket.on('user_position_update', (data: any) => {
      setOnlineUsers((prev) =>
        prev.map((u) =>
          u.socketId === data.socketId
            ? { ...u, position: data.position }
            : u
        )
      );
    });

    socket.on('receive_chat', (data: ChatMessage) => {
      setChatMessages((prev) => [...prev, data]);
    });

    exhibitionSocketRef.current = socket;
  };

  const sendChat = useCallback(() => {
    if (!chatInput.trim() || !exhibitionSocketRef.current) return;

    exhibitionSocketRef.current.emit('send_chat', {
      message: chatInput,
    });
    setChatInput('');
  }, [chatInput]);

  const handleBoothClick = (booth: Booth) => {
    setSelectedBooth(booth);
  };

  const enterBooth = (boothId: number) => {
    router.push(`/booth/${boothId}`);
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
    <div className="h-screen relative">
      <Head>
        <title>虚拟展厅 - 元宇宙虚拟展会</title>
      </Head>

      <Canvas
        camera={{ position: [0, 10, 15], fov: 60 }}
        style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 100%)' }}
      >
        <ExhibitionHall
          booths={booths}
          onlineUsers={onlineUsers}
          selfUser={selfUser}
          onBoothClick={handleBoothClick}
        />
      </Canvas>

      <div className="absolute top-4 left-4 glass-card p-4 max-w-xs">
        <h2 className="text-lg font-bold mb-2" style={{ color: '#00D4FF' }}>
          虚拟展厅
        </h2>
        <p className="text-sm text-gray-400 mb-2">
          在线人数: {onlineUsers.length + 1}
        </p>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm" onClick={() => router.push('/')}>
            返回列表
          </button>
          <button className="btn-secondary text-sm" onClick={() => setShowChat(!showChat)}>
            {showChat ? '隐藏聊天' : '显示聊天'}
          </button>
        </div>
      </div>

      {showChat && (
        <div className="absolute bottom-4 left-4 glass-card p-4 w-80 max-h-96 flex flex-col">
          <h3 className="text-sm font-bold mb-2" style={{ color: '#00D4FF' }}>
            实时聊天
          </h3>
          <div className="flex-1 overflow-y-auto mb-4 max-h-48">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`chat-bubble ${
                  msg.userId === currentUser?.id ? 'self' : 'other'
                }`}
              >
                <p className="text-xs text-gray-400">{msg.username}</p>
                <p className="text-sm">{msg.message}</p>
              </div>
            ))}
            {chatMessages.length === 0 && (
              <p className="text-gray-500 text-sm text-center">暂无消息</p>
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
            <button onClick={sendChat} className="btn-primary text-sm px-4">
              发送
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 glass-card p-4">
        <h3 className="text-sm font-bold mb-2" style={{ color: '#00D4FF' }}>
          在线用户
        </h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {currentUser && (
            <div className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: JSON.parse(currentUser.avatar_data || '{}').color || '#4A90D9' }}
              />
              <span>{currentUser.username} (我)</span>
            </div>
          )}
          {onlineUsers.map((user) => (
            <div key={user.socketId} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: typeof user.avatar === 'string' ? JSON.parse(user.avatar).color : user.avatar?.color || '#4A90D9' }}
              />
              <span className="text-gray-300">{user.username}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedBooth && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center" onClick={() => setSelectedBooth(null)}>
          <div className="glass-card p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#00D4FF' }}>
              {selectedBooth.name}
            </h2>
            <p className="text-gray-400 mb-4">
              {JSON.parse(selectedBooth.custom_data || '{}').description || '探索这个展位的精彩内容'}
            </p>
            <div className="flex gap-4">
              <button className="btn-primary" onClick={() => enterBooth(selectedBooth.id)}>
                进入展位
              </button>
              <button className="btn-secondary" onClick={() => setSelectedBooth(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 glass-card p-3 text-xs text-gray-400">
        <p>🖱️ 鼠标拖拽旋转视角</p>
        <p>🖱️ 滚轮缩放</p>
        <p>👆 点击展位查看详情</p>
      </div>
    </div>
  );
}
