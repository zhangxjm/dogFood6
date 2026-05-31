import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Users, Plus, LogIn, Copy, Check, X, Play, Clock, UserPlus,
  MessageCircle, Send, Loader2, AlertCircle, Zap
} from 'lucide-react';
import { collaborativeApi, trainingApi } from '../lib/api';
import { useAuthStore, useCollaborativeStore } from '../store';
import wsService from '../lib/websocket';

export default function Collaborative() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  
  const [rooms, setRooms] = useState([]);
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [createForm, setCreateForm] = useState({ module_id: '', max_users: 4 });
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
    initWebSocket();

    return () => {
      if (currentRoom) {
        wsService.leaveRoom(currentRoom.room_code);
      }
    };
  }, []);

  useEffect(() => {
    if (currentRoom) {
      wsService.joinRoom(currentRoom.room_code);
    }
  }, [currentRoom]);

  const initWebSocket = () => {
    if (!user) return;

    wsService.connect(user).then(() => {
      setWsConnected(true);

      wsService.on('user_joined', (data) => {
        setRoomUsers(data.users);
        addSystemMessage(`${data.user.display_name} 加入了房间`);
      });

      wsService.on('user_left', (data) => {
        setRoomUsers(data.users);
        addSystemMessage(`${data.user.display_name} 离开了房间`);
      });

      wsService.on('chat', (data) => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          user: data.user,
          message: data.message,
          timestamp: data.timestamp
        }]);
      });

      wsService.on('room_joined', (data) => {
        setRoomUsers(data.room.users);
      });
    }).catch((error) => {
      console.error('WebSocket connection failed:', error);
    });
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [roomsData, modulesData] = await Promise.all([
        collaborativeApi.getRooms().catch(() => ({ rooms: [] })),
        trainingApi.getModules().catch(() => ({ modules: [] }))
      ]);
      setRooms(roomsData.rooms || []);
      setModules(modulesData.modules || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSystemMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      system: true,
      message: text,
      timestamp: Date.now()
    }]);
  };

  const handleCreateRoom = async () => {
    try {
      const data = await collaborativeApi.createRoom(createForm);
      setCurrentRoom(data.room);
      setRoomUsers(data.room.participants || []);
      setShowCreateModal(false);
      setCreateForm({ module_id: '', max_users: 4 });
      setMessages([]);
      addSystemMessage('房间创建成功');
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleJoinRoom = async () => {
    try {
      await collaborativeApi.joinRoom(joinCode.toUpperCase());
      const data = await collaborativeApi.getRoom(joinCode.toUpperCase());
      setCurrentRoom(data.room);
      setRoomUsers(data.room.participants || []);
      setShowJoinModal(false);
      setJoinCode('');
      setMessages([]);
      addSystemMessage('成功加入房间');
    } catch (error) {
      alert(error.error || '加入房间失败');
    }
  };

  const handleLeaveRoom = async () => {
    if (!currentRoom) return;

    try {
      await collaborativeApi.leaveRoom(currentRoom.room_code);
      wsService.leaveRoom(currentRoom.room_code);
      setCurrentRoom(null);
      setRoomUsers([]);
      setMessages([]);
      loadData();
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  };

  const handleStartTraining = async () => {
    if (!currentRoom) return;

    try {
      const data = await collaborativeApi.startRoom(currentRoom.room_code);
      alert('协同实训已开始！');
    } catch (error) {
      alert(error.error || '开始实训失败');
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentRoom) return;

    wsService.sendChat(newMessage);
    setMessages(prev => [...prev, {
      id: Date.now(),
      user: user,
      message: newMessage,
      timestamp: Date.now(),
      isOwn: true
    }]);
    setNewMessage('');
  };

  const handleCopyCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.room_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyber-500 animate-spin mx-auto" />
          <p className="mt-4 text-slate-400">加载房间列表...</p>
        </div>
      </div>
    );
  }

  if (currentRoom) {
    return (
      <div className="space-y-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-cyber flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">协同实训房间</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-400">房间号:</span>
                  <span className="px-2 py-1 bg-slate-800 rounded text-cyber-400 font-mono font-bold">
                    {currentRoom.room_code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 hover:bg-slate-700 rounded transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentRoom.host_id === user?.id && currentRoom.status === 'waiting' && (
                <button
                  onClick={handleStartTraining}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  开始实训
                </button>
              )}
              <button
                onClick={handleLeaveRoom}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                离开房间
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="glass rounded-2xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyber-400" />
                协同实训场景
              </h2>
              <div className="h-96 bg-slate-800/50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">3D 协同场景将在此处显示</p>
                  <p className="text-sm text-slate-500 mt-2">
                    房间状态: {currentRoom.status === 'waiting' ? '等待开始' : currentRoom.status === 'active' ? '进行中' : '已关闭'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyber-400" />
                房间成员 ({roomUsers.length}/{currentRoom.max_users})
              </h3>
              <div className="space-y-2">
                {roomUsers.map((roomUser) => (
                  <div
                    key={roomUser.user_id}
                    className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl"
                  >
                    <img
                      src={roomUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                      alt="用户头像"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{roomUser.display_name}</p>
                      <p className="text-xs text-slate-400">
                        {roomUser.role === 'host' ? '房主' : '参与者'}
                      </p>
                    </div>
                    {roomUser.user_id === user?.id && (
                      <span className="text-xs text-cyber-400">你</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4 flex flex-col h-80">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-cyber-400" />
                聊天室
              </h3>
              <div className="flex-1 overflow-auto space-y-2 scrollbar-thin mb-4">
                {messages.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm">暂无消息</p>
                ) : (
                  messages.map((msg) => (
                    msg.system ? (
                      <div key={msg.id} className="text-center">
                        <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                          {msg.message}
                        </span>
                      </div>
                    ) : (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${msg.isOwn ? 'bg-cyber-500/20' : 'bg-slate-800/50'} rounded-xl p-3`}>
                          {!msg.isOwn && (
                            <p className="text-xs text-cyber-400 mb-1">{msg.user?.display_name}</p>
                          )}
                          <p className="text-sm text-white">{msg.message}</p>
                        </div>
                      </div>
                    )
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="输入消息..."
                  className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyber-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-3 py-2 bg-cyber-500 hover:bg-cyber-600 text-white rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">协同实训中心</h1>
            <p className="text-slate-400">与同学一起进行虚拟实训，实时协作交流</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              加入房间
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-cyber text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              创建房间
            </button>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-cyber-400" />
          可用房间
        </h2>
        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">暂无可用房间</h3>
            <p className="text-slate-400">创建一个新房间或等待其他同学创建</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const module = modules.find(m => m.id === room.module_id);
              return (
                <div
                  key={room.id}
                  className="p-4 bg-slate-800/30 rounded-xl hover:bg-slate-700/40 transition-all cursor-pointer"
                  onClick={() => {
                    setJoinCode(room.room_code);
                    setShowJoinModal(true);
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 bg-cyber-500/20 text-cyber-400 rounded font-mono text-sm">
                      {room.room_code}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      room.status === 'waiting' ? 'bg-amber-500/20 text-amber-400' :
                      room.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {room.status === 'waiting' ? '等待中' : room.status === 'active' ? '进行中' : '已关闭'}
                    </span>
                  </div>
                  <h3 className="font-medium text-white mb-2">{module?.name || '未知模块'}</h3>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {room.participants?.length || 0}/{room.max_users}
                    </span>
                    <span>房主: {room.host_name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyber-400" />
              创建协同房间
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">选择实训模块</label>
                <select
                  value={createForm.module_id}
                  onChange={(e) => setCreateForm({ ...createForm, module_id: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyber-500"
                >
                  <option value="">请选择实训模块</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>{module.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">最大人数</label>
                <select
                  value={createForm.max_users}
                  onChange={(e) => setCreateForm({ ...createForm, max_users: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyber-500"
                >
                  <option value={2}>2人</option>
                  <option value={3}>3人</option>
                  <option value={4}>4人</option>
                  <option value={6}>6人</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={!createForm.module_id}
                className="flex-1 px-4 py-3 bg-gradient-cyber text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建房间
              </button>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-cyber-400" />
              加入协同房间
            </h2>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">输入房间号</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="例如: AB12CD"
                maxLength={6}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white text-center text-2xl font-mono tracking-widest placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyber-500"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleJoinRoom}
                disabled={joinCode.length !== 6}
                className="flex-1 px-4 py-3 bg-gradient-cyber text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                加入房间
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
