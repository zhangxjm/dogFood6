import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Users, Trophy, TrendingUp, Clock, CheckCircle, 
  AlertCircle, Play, BarChart3, Activity, Award, Zap
} from 'lucide-react';
import { sessionApi, trainingApi, achievementApi } from '../lib/api';
import { useAuthStore } from '../store';
import VirtualScene from '../components/VirtualScene';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState(null);
  const [modules, setModules] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, modulesData, sessionsData, achievementsData, leaderboardData] = await Promise.all([
        sessionApi.getStats().catch(() => ({ stats: null })),
        trainingApi.getModules().catch(() => ({ modules: [] })),
        sessionApi.getSessions({ limit: 5 }).catch(() => ({ sessions: [] })),
        achievementApi.getAchievements().catch(() => ({ achievements: [] })),
        achievementApi.getLeaderboard({ limit: 5 }).catch(() => ({ leaderboard: [] }))
      ]);

      setStats(statsData.stats);
      setModules(modulesData.modules?.slice(0, 6) || []);
      setRecentSessions(sessionsData.sessions || []);
      setAchievements(achievementsData.achievements?.slice(0, 5) || []);
      setLeaderboard(leaderboardData.leaderboard || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { 
      label: '实训次数', 
      value: stats?.total_sessions || 0, 
      icon: Activity, 
      color: 'from-cyan-500 to-blue-500',
      bg: 'bg-cyan-500/20'
    },
    { 
      label: '完成实训', 
      value: stats?.completed_sessions || 0, 
      icon: CheckCircle, 
      color: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-500/20'
    },
    { 
      label: '平均分数', 
      value: stats?.avg_score ? Math.round(stats.avg_score) : 0, 
      icon: BarChart3, 
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-500/20'
    },
    { 
      label: '获得成就', 
      value: achievements?.length || 0, 
      icon: Trophy, 
      color: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-500/20'
    }
  ];

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      easy: { text: '初级', class: 'bg-emerald-500/20 text-emerald-400' },
      medium: { text: '中级', class: 'bg-amber-500/20 text-amber-400' },
      hard: { text: '高级', class: 'bg-red-500/20 text-red-400' }
    };
    return badges[difficulty] || badges.easy;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: '待开始', class: 'bg-slate-500/20 text-slate-400' },
      in_progress: { text: '进行中', class: 'bg-blue-500/20 text-blue-400' },
      completed: { text: '已完成', class: 'bg-emerald-500/20 text-emerald-400' }
    };
    return badges[status] || badges.pending;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-400">加载数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt="用户头像"
            className="w-16 h-16 rounded-full border-2 border-cyber-500/50"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">欢迎回来，{user?.display_name}！</h1>
            <p className="text-slate-400">
              {user?.role === 'admin' ? '系统管理员' : user?.role === 'teacher' ? '教师' : '学生'}
              {' · '}
              今天是 {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link
            href="/training"
            className="px-6 py-3 bg-gradient-cyber text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center gap-2 cyber-button"
          >
            <Play className="w-5 h-5" />
            开始实训
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div key={index} className="glass rounded-2xl p-5 hover:border-cyber-500/50 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-6 h-6 bg-gradient-to-br ${card.color} bg-clip-text text-transparent`} />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-sm text-slate-400">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyber-400" />
              推荐实训模块
            </h2>
            <Link href="/training" className="text-sm text-cyber-400 hover:text-cyber-300">
              查看全部
            </Link>
          </div>
          <div className="space-y-3">
            {modules.length === 0 ? (
              <p className="text-slate-400 text-center py-8">暂无实训模块</p>
            ) : (
              modules.map((module) => {
                const badge = getDifficultyBadge(module.difficulty);
                return (
                  <Link
                    key={module.id}
                    href={`/training/${module.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 hover:bg-slate-700/40 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-cyber flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{module.name}</h3>
                      <p className="text-sm text-slate-400 truncate">{module.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${badge.class}`}>
                      {badge.text}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyber-400" />
              最近实训记录
            </h2>
            <Link href="/profile" className="text-sm text-cyber-400 hover:text-cyber-300">
              查看全部
            </Link>
          </div>
          <div className="space-y-3">
            {recentSessions.length === 0 ? (
              <p className="text-slate-400 text-center py-8">暂无实训记录</p>
            ) : (
              recentSessions.map((session) => {
                const statusBadge = getStatusBadge(session.status);
                return (
                  <div key={session.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30">
                    <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{session.module_name}</h3>
                      <p className="text-sm text-slate-400">
                        {new Date(session.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <div className="text-right">
                      {session.status === 'completed' && (
                        <p className="text-lg font-bold text-cyber-400">{Math.round(session.score)}分</p>
                      )}
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusBadge.class}`}>
                        {statusBadge.text}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-400" />
            最近成就
          </h2>
          <div className="space-y-3">
            {achievements.length === 0 ? (
              <p className="text-slate-400 text-center py-8">暂无成就，继续努力！</p>
            ) : (
              achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white">{achievement.title}</h3>
                    <p className="text-sm text-slate-400 truncate">{achievement.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-400">{Math.round(achievement.score)}分</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-cyber-400" />
            实训排行榜
          </h2>
          <div className="space-y-3">
            {leaderboard.length === 0 ? (
              <p className="text-slate-400 text-center py-8">暂无排名数据</p>
            ) : (
              leaderboard.map((user, index) => (
                <div key={user.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-amber-500 text-white' :
                    index === 1 ? 'bg-slate-400 text-white' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    alt="用户头像"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{user.display_name}</h3>
                    <p className="text-sm text-slate-400">完成 {user.completed_count} 次实训</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-cyber-400">{Math.round(user.avg_score || 0)}分</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-cyber-400" />
          3D 虚拟实训场景预览
        </h2>
        <div className="h-80">
          <VirtualScene
            sceneConfig={{ sceneType: 'lab' }}
            interactive={true}
          />
        </div>
        <p className="mt-4 text-sm text-slate-400 text-center">
          提示：使用鼠标拖动旋转视角，滚轮缩放，点击组件进行交互
        </p>
      </div>
    </div>
  );
}
