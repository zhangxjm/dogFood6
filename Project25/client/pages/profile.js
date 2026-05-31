import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Award, Clock, CheckCircle, XCircle, Loader2, Edit3, Save, X } from 'lucide-react';
import { authApi, sessionApi } from '../lib/api';
import { useAuthStore } from '../store';

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: '', avatar: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [profileData, sessionsData, statsData] = await Promise.all([
        authApi.getProfile().catch(() => ({ user: null })),
        sessionApi.getSessions({ limit: 10 }).catch(() => ({ sessions: [] })),
        sessionApi.getStats().catch(() => ({ stats: null }))
      ]);
      setProfile(profileData.user);
      setSessions(sessionsData.sessions || []);
      setStats(statsData.stats);
      if (profileData.user) {
        setEditForm({
          display_name: profileData.user.display_name,
          avatar: profileData.user.avatar || ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const data = await authApi.updateProfile(editForm);
      setProfile(data.user);
      updateUser(data.user);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: '待开始', class: 'bg-slate-500/20 text-slate-400' },
      in_progress: { text: '进行中', class: 'bg-blue-500/20 text-blue-400' },
      completed: { text: '已完成', class: 'bg-emerald-500/20 text-emerald-400' }
    };
    return badges[status] || badges.pending;
  };

  const getRoleText = (role) => {
    const roles = {
      admin: '管理员',
      teacher: '教师',
      student: '学生'
    };
    return roles[role] || role;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyber-500 animate-spin mx-auto" />
          <p className="mt-4 text-slate-400">加载个人信息...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <img
              src={profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
              alt="用户头像"
              className="w-24 h-24 rounded-full border-4 border-cyber-500/50"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div className="space-y-4 max-w-md mx-auto md:mx-0">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">显示名称</label>
                  <input
                    type="text"
                    value={editForm.display_name}
                    onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyber-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-cyber-500 hover:bg-cyber-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    保存
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white">{profile?.display_name}</h1>
                <p className="text-slate-400">@{profile?.username}</p>
                <div className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-cyber-500/20 text-cyber-400 rounded-full text-sm">
                    {getRoleText(profile?.role)}
                  </span>
                  <span className="text-slate-400 text-sm flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    加入于 {new Date(profile?.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </>
            )}
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              编辑资料
            </button>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-cyber-400">{stats.total_sessions || 0}</p>
            <p className="text-sm text-slate-400">实训次数</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{stats.completed_sessions || 0}</p>
            <p className="text-sm text-slate-400">完成次数</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-amber-400">{Math.round(stats.avg_score || 0)}</p>
            <p className="text-sm text-slate-400">平均分</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-rose-400">{stats.total_errors || 0}</p>
            <p className="text-sm text-slate-400">错误次数</p>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyber-400" />
          实训记录
        </h2>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">暂无实训记录</p>
          </div>
        ) : (
          <div className="overflow-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm border-b border-slate-700/50">
                  <th className="pb-3 pr-4">实训模块</th>
                  <th className="pb-3 pr-4">状态</th>
                  <th className="pb-3 pr-4">分数</th>
                  <th className="pb-3 pr-4">操作次数</th>
                  <th className="pb-3">时间</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => {
                  const statusBadge = getStatusBadge(session.status);
                  return (
                    <tr key={session.id} className="border-b border-slate-700/30">
                      <td className="py-3 pr-4">
                        <span className="text-white">{session.module_name}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded text-xs ${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {session.status === 'completed' ? (
                          <span className="text-cyber-400 font-medium">{Math.round(session.score)}</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-slate-400">{session.operations_count}</span>
                      </td>
                      <td className="py-3">
                        <span className="text-slate-400 text-sm">
                          {new Date(session.created_at).toLocaleString('zh-CN')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
