import { useState, useEffect } from 'react';
import { Trophy, Award, Medal, Crown, Star, Users, Loader2 } from 'lucide-react';
import { achievementApi } from '../lib/api';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [achievementsData, leaderboardData] = await Promise.all([
        achievementApi.getAchievements().catch(() => ({ achievements: [] })),
        achievementApi.getLeaderboard().catch(() => ({ leaderboard: [] }))
      ]);
      setAchievements(achievementsData.achievements || []);
      setLeaderboard(leaderboardData.leaderboard || []);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAchievementIcon = (title) => {
    if (title.includes('完美')) return Crown;
    if (title.includes('优秀')) return Star;
    return Award;
  };

  const getRankMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyber-500 animate-spin mx-auto" />
          <p className="mt-4 text-slate-400">加载成就数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-400" />
          成就中心
        </h1>
        <p className="text-slate-400">查看你获得的成就和排行榜信息</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            我的成就
          </h2>
          {achievements.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">暂无成就</h3>
              <p className="text-slate-400">完成实训以获得成就奖励</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-auto scrollbar-thin">
              {achievements.map((achievement) => {
                const IconComponent = getAchievementIcon(achievement.title);
                return (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl border border-amber-500/20"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white">{achievement.title}</h3>
                      <p className="text-sm text-slate-400 truncate">{achievement.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {achievement.module_name} · {new Date(achievement.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-400">{Math.round(achievement.score)}</p>
                      <p className="text-xs text-slate-400">分</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyber-400" />
            实训排行榜
          </h2>
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">暂无排名</h3>
              <p className="text-slate-400">完成实训参与排名</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    index === 0 ? 'bg-gradient-to-r from-amber-500/20 to-transparent border border-amber-500/30' :
                    index === 1 ? 'bg-gradient-to-r from-slate-400/20 to-transparent border border-slate-400/30' :
                    index === 2 ? 'bg-gradient-to-r from-orange-600/20 to-transparent border border-orange-600/30' :
                    'bg-slate-800/30'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-xl font-bold">
                    {getRankMedal(index) || (index + 1)}
                  </div>
                  <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    alt="用户头像"
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{user.display_name}</h3>
                    <p className="text-sm text-slate-400">
                      完成 {user.completed_count} 次实训 · 最高 {Math.round(user.best_score || 0)} 分
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gradient">{Math.round(user.avg_score || 0)}</p>
                    <p className="text-xs text-slate-400">平均分</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">成就统计</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-800/30 rounded-xl">
            <p className="text-3xl font-bold text-amber-400">{achievements.length}</p>
            <p className="text-sm text-slate-400">获得成就</p>
          </div>
          <div className="text-center p-4 bg-slate-800/30 rounded-xl">
            <p className="text-3xl font-bold text-cyber-400">
              {achievements.filter(a => a.title.includes('完美')).length}
            </p>
            <p className="text-sm text-slate-400">满分成就</p>
          </div>
          <div className="text-center p-4 bg-slate-800/30 rounded-xl">
            <p className="text-3xl font-bold text-emerald-400">
              {achievements.filter(a => a.title.includes('优秀')).length}
            </p>
            <p className="text-sm text-slate-400">优秀成就</p>
          </div>
          <div className="text-center p-4 bg-slate-800/30 rounded-xl">
            <p className="text-3xl font-bold text-rose-400">
              {achievements.length > 0 ? Math.round(Math.max(...achievements.map(a => a.score))) : 0}
            </p>
            <p className="text-sm text-slate-400">最高分数</p>
          </div>
        </div>
      </div>
    </div>
  );
}
