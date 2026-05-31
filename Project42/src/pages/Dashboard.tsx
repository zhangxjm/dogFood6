import { useEffect } from 'react';
import { FileText, BookMarked, Flame, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import StatsCard from '@/components/StatsCard';

export default function Dashboard() {
  const { dashboard, fetchDashboard, checkin, loading } = useStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleCheckin = async () => {
    await checkin();
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-green-500';
    if (progress >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryName = (categoryId: number) => {
    const cat = useStore.getState().categories.find(c => c.id === categoryId);
    return cat?.name || '';
  };

  if (!dashboard) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-lg">
            {loading.dashboard ? '加载中...' : '暂无数据'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">欢迎回来</h2>
        <p className="text-gray-500 mt-1">继续你的自考之旅，坚持就是胜利！</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard
          icon={<FileText className="w-6 h-6" />}
          value={dashboard.total_materials}
          label="总资料数"
          gradient="bg-gradient-to-br from-primary-500 to-primary-700"
        />
        <StatsCard
          icon={<BookMarked className="w-6 h-6" />}
          value={dashboard.total_subjects}
          label="已学科目"
          gradient="bg-gradient-to-br from-accent-400 to-accent-600"
        />
        <StatsCard
          icon={<Flame className="w-6 h-6" />}
          value={dashboard.streak_days}
          label="连续打卡"
          gradient="bg-gradient-to-br from-orange-400 to-red-500"
        />
        <StatsCard
          icon={<Clock className="w-6 h-6" />}
          value={`${dashboard.total_hours}h`}
          label="学习总时长"
          gradient="bg-gradient-to-br from-blue-400 to-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">今日打卡</h3>
          <div className="flex flex-col items-center py-4">
            {dashboard.today_checked_in ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <span className="text-green-600 font-medium">今日已打卡</span>
              </div>
            ) : (
              <button
                onClick={handleCheckin}
                disabled={loading.checkin}
                className="w-20 h-20 rounded-full bg-primary-700 text-white flex items-center justify-center hover:bg-primary-800 transition-all duration-200 hover:scale-105 disabled:opacity-50 shadow-lg shadow-primary-700/30"
              >
                <CheckCircle2 className="w-10 h-10" />
              </button>
            )}
            <p className="text-sm text-gray-500 mt-3">
              {dashboard.today_checked_in ? '继续加油！' : '点击按钮完成今日打卡'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">最近资料</h3>
            <Link to="/materials" className="text-primary-600 text-sm flex items-center gap-1 hover:text-primary-700">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {dashboard.recent_materials.length === 0 ? (
            <p className="text-gray-400 text-center py-8">暂无资料</p>
          ) : (
            <div className="space-y-3">
              {dashboard.recent_materials.slice(0, 5).map((material) => (
                <div
                  key={material.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700 truncate">{material.title}</div>
                    <div className="text-xs text-gray-400">{getCategoryName(material.category_id)} · {material.created_at ? new Date(material.created_at).toLocaleDateString('zh-CN') : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">科目进度</h3>
          <Link to="/progress" className="text-primary-600 text-sm flex items-center gap-1 hover:text-primary-700">
            详细追踪 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {dashboard.subjects_progress.length === 0 ? (
          <p className="text-gray-400 text-center py-8">暂无科目数据</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboard.subjects_progress.map((subject) => (
              <div key={subject.id} className="p-4 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                  <span className="text-sm text-gray-500">{subject.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(subject.progress)}`}
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
