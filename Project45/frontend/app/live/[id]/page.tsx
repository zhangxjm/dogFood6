'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Radio,
  Eye,
  Heart,
  Send,
  Settings,
  Users,
  ArrowLeft,
  Play,
  Wifi,
  Clock,
} from 'lucide-react';
import { liveApi, craftApi } from '@/lib/api';
import LivePlayer from '@/components/LivePlayer';
import { formatDate, formatDuration } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export default function LiveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [live, setLive] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [joinInfo, setJoinInfo] = useState<any>(null);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useAuthStore();

  const liveId = Number(params.id);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [liveId]);

  useEffect(() => {
    if (joined && live) {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `ws://localhost:8000/api/live/ws/${liveId}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
          setMessages((prev) => [...prev, data]);
        } else if (data.type === 'like') {
          setLive((prev: any) => prev ? { ...prev, like_count: data.like_count } : null);
        }
      };

      return () => {
        wsRef.current?.close();
      };
    }
  }, [joined, liveId, live]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    try {
      const [liveRes, chatRes] = await Promise.all([
        liveApi.getLiveRoom(liveId),
        liveApi.getChatMessages(liveId),
      ]);
      setLive(liveRes.data);
      setMessages(chatRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (live?.is_live) {
      try {
        const res = await liveApi.getLiveStats(liveId);
        setStats(res.data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    }
  };

  const handleJoin = async () => {
    try {
      const res = await liveApi.joinLiveRoom(liveId);
      setJoinInfo(res.data);
      setJoined(true);
      setLive((prev: any) => prev ? { ...prev, viewer_count: res.data.viewer_count } : null);
    } catch (error) {
      console.error('Failed to join:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await liveApi.sendChatMessage(liveId, {
        message: newMessage,
        username: user?.username || '匿名用户',
      });

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'chat',
            message: newMessage,
            username: user?.username || '匿名用户',
          })
        );
      }

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleLike = () => {
    if (!live) return;

    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 300);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'like' }));
    }
  };

  const optimizeLatency = async () => {
    try {
      await liveApi.optimizeLatency(liveId);
      alert('低延迟模式已启用！');
    } catch (error) {
      console.error('Failed to optimize:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-heritage-red border-t-transparent"></div>
      </div>
    );
  }

  if (!live) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-500 mb-4">直播间不存在</h3>
          <Link href="/live" className="btn-primary">
            返回直播列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-heritage-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <Link
            href="/live"
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回列表</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {joined ? (
              <LivePlayer
                hlsUrl={live.hls_url || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'}
                webrtcUrl={live.webrtc_url}
                isLive={live.is_live}
                lowLatency={live.is_low_latency}
                title={live.title}
              />
            ) : (
              <div className="relative w-full aspect-video bg-black/80 rounded-xl overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Play size={48} className="text-white ml-2" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{live.title}</h3>
                  <p className="text-white/60 mb-6">点击下方按钮加入直播，开始学习</p>
                  <button onClick={handleJoin} className="btn-primary px-8 py-3 text-lg">
                    进入直播间
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    {live.is_live && (
                      <span className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                        <span className="w-2 h-2 bg-white rounded-full live-indicator"></span>
                        <span>直播中</span>
                      </span>
                    )}
                    {live.is_low_latency && (
                      <span className="flex items-center space-x-1 bg-heritage-gold text-white px-3 py-1 rounded text-sm">
                        <Wifi size={14} />
                        <span>低延迟</span>
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-heritage-ink mb-2">{live.title}</h1>
                  <p className="text-gray-600">{live.description}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Eye size={16} />
                      <span>{live.viewer_count}</span>
                    </div>
                    <button
                      onClick={handleLike}
                      className={`flex items-center space-x-1 text-heritage-red transition-transform ${
                        likeAnimating ? 'scale-125' : ''
                      }`}
                    >
                      <Heart size={16} fill="currentColor" />
                      <span>{live.like_count}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-heritage-gold to-heritage-red rounded-full flex items-center justify-center text-white font-bold">
                    {live.host?.full_name?.[0] || live.host?.username?.[0] || '主'}
                  </div>
                  <div>
                    <div className="font-semibold text-heritage-ink">
                      {live.host?.full_name || live.host?.username}
                    </div>
                    <div className="text-sm text-gray-500">
                      {live.craft ? `正在教授：${live.craft.title}` : '非遗传承人'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {live.is_live && (
                    <button
                      onClick={optimizeLatency}
                      className="flex items-center space-x-1 text-sm bg-heritage-gold/10 text-heritage-gold px-3 py-1.5 rounded-lg hover:bg-heritage-gold/20 transition-colors"
                    >
                      <Settings size={14} />
                      <span>优化延迟</span>
                    </button>
                  )}
                  {stats && (
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{formatDuration(stats.duration_seconds)}</span>
                      </div>
                      <div className="text-xs">{stats.resolution} · {Math.round(stats.bitrate)}kbps</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {live.craft && (
              <div className="bg-white rounded-xl p-6">
                <h3 className="font-bold text-lg text-heritage-ink mb-4">📚 关联技艺教程</h3>
                <Link
                  href={`/crafts/${live.craft.id}`}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-heritage-gold/20 to-heritage-red/20 rounded-lg flex items-center justify-center text-3xl">
                    🎨
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-heritage-ink">{live.craft.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1">{live.craft.description}</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl h-[600px] flex flex-col">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-heritage-ink flex items-center space-x-2">
                  <Users size={18} />
                  <span>实时聊天</span>
                  <span className="text-xs font-normal text-gray-500">({messages.length})</span>
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>暂无消息</p>
                    <p className="text-sm">发送第一条消息吧！</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-heritage-red text-sm">
                          {msg.username || '匿名用户'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{msg.message}</p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef}></div>
              </div>

              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="发送消息..."
                    className="flex-1 input-field text-sm"
                    disabled={!joined}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!joined || !newMessage.trim()}
                    className="p-2 bg-heritage-red text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
