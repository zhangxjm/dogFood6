import { useEffect } from 'react';
import { GitBranch, CheckCircle, ArrowRight, Trash2, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/store';
import { fetchSortingRules, fetchSortingStatistics, fetchLineStatuses } from '@/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

export default function Sorting() {
  const { sortingRules, sortingStats, setSortingRules, setSortingStats, lineStatuses, setLineStatuses } = useAppStore();

  useEffect(() => {
    const loadData = async () => {
      const rules = await fetchSortingRules();
      setSortingRules(rules);
      const stats = await fetchSortingStatistics();
      setSortingStats(stats);
      const lines = await fetchLineStatuses();
      setLineStatuses(lines);
    };
    loadData();
  }, [setSortingRules, setSortingStats, setLineStatuses]);

  const pieData = [
    { name: '合格', value: sortingStats.passCount, color: '#22C55E' },
    { name: '返工', value: sortingStats.reworkCount, color: '#FBBF24' },
    { name: '报废', value: sortingStats.rejectCount, color: '#EF4444' },
  ];

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'PASS': return '放行';
      case 'REWORK': return '返工';
      case 'REJECT': return '报废';
      default: return action;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'MINOR': return '轻微缺陷';
      case 'MAJOR': return '主要缺陷';
      case 'CRITICAL': return '严重缺陷';
      default: return severity;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'PASS': return 'text-green-600 bg-green-50';
      case 'REWORK': return 'text-yellow-600 bg-yellow-50';
      case 'REJECT': return 'text-red-600 bg-red-50';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">自动分流控制</h2>
        <p className="text-gray-500 text-sm mt-1">配置分流规则与监控分流执行状态</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={GitBranch}
          label="今日分流总数"
          value={sortingStats.totalProcessed.toLocaleString()}
          color="text-brand-500"
          bgColor="bg-brand-50"
        />
        <StatCard
          icon={CheckCircle}
          label="合格放行"
          value={sortingStats.passCount.toLocaleString()}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          icon={RefreshCw}
          label="返工处理"
          value={sortingStats.reworkCount.toLocaleString()}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatCard
          icon={Trash2}
          label="报废处理"
          value={sortingStats.rejectCount.toLocaleString()}
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-800">分流分布</h3>
          </div>
          <div className="card-body h-64">
            {sortingStats.totalProcessed > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                暂无数据
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-800">分流规则配置</h3>
          </div>
          <div className="card-body space-y-3">
            {sortingRules
              .sort((a, b) => a.priority - b.priority)
              .map((rule) => (
                <div
                  key={rule.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border',
                    rule.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                      <span className="text-brand-600 font-bold text-sm">{rule.priority}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{rule.name}</p>
                      <p className="text-sm text-gray-500">{getSeverityLabel(rule.defectSeverity)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                    <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getActionColor(rule.action))}>
                      {getActionLabel(rule.action)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-gray-800">产线分流设备状态</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-4">
            {lineStatuses.map((line) => (
              <div key={line.lineId} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      line.status === 'RUNNING' ? 'bg-green-500' : 'bg-gray-400'
                    )}></span>
                    <span className="font-medium text-gray-900">{line.lineName}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {line.status === 'RUNNING' ? '运行中' : '已停止'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded">
                    <p className="text-lg font-bold text-green-600">{Math.round(line.passRate || 0)}%</p>
                    <p className="text-xs text-gray-500">合格率</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="text-lg font-bold text-gray-700">{line.totalInspectedToday}</p>
                    <p className="text-xs text-gray-500">已处理</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="text-lg font-bold text-brand-500">正常</p>
                    <p className="text-xs text-gray-500">设备状态</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bgColor }: any) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={cn('text-2xl font-bold mt-1', color)}>{value}</p>
        </div>
        <div className={cn('p-3 rounded-lg', bgColor)}>
          <Icon className={cn('w-6 h-6', color)} />
        </div>
      </div>
    </div>
  );
}
