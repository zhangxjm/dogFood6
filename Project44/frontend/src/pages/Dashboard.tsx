import { useEffect, useState } from 'react';
import {
  Database,
  HardDrive,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useSystemStore } from '../store/useSystemStore';
import { dataApi } from '../services/api';
import type { SatelliteData, DataStatistics } from '../types';
import { StatCard } from '../components/StatCard';
import { GaugeChart } from '../components/GaugeChart';
import { StatusBadge } from '../components/StatusBadge';
import { cn } from '../lib/utils';

const dataTypeLabels: Record<string, string> = {
  TELEMETRY: '遥测数据',
  COMMAND: '指令数据',
  IMAGE: '图像数据',
  SENSOR: '传感器数据',
  POSITION: '位置数据',
  STATUS: '状态数据',
};

export default function Dashboard() {
  const {
    realtimeStats,
    simulatorStatus,
    fetchRealtimeStats,
    fetchHistoryStats,
    fetchSimulatorStatus,
    startSimulator,
    stopSimulator,
    startAutoRefresh,
    stopAutoRefresh,
    historyStats,
  } = useSystemStore();

  const [latestData, setLatestData] = useState<SatelliteData[]>([]);

  useEffect(() => {
    fetchRealtimeStats();
    fetchHistoryStats(30);
    fetchSimulatorStatus();
    fetchLatestData();
    startAutoRefresh();

    const dataInterval = setInterval(fetchLatestData, 3000);
    const historyInterval = setInterval(() => fetchHistoryStats(30), 10000);

    return () => {
      stopAutoRefresh();
      clearInterval(dataInterval);
      clearInterval(historyInterval);
    };
  }, []);

  const fetchLatestData = async () => {
    try {
      const data = await dataApi.getLatestData(10);
      setLatestData(data);
    } catch (e) {
      console.error('Failed to fetch latest data:', e);
    }
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const chartData = historyStats.map((s: DataStatistics) => ({
    time: new Date(s.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    接收: s.receivedCount,
    处理: s.processedCount,
    错误: s.errorCount,
    吞吐量: s.throughput,
  }));

  const throughput = realtimeStats?.throughput || 0;
  const maxThroughput = 50;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">实时监控面板</h1>
          <p className="text-slate-400 mt-1">卫星数据接收与处理实时监控</p>
        </div>
        <button
          onClick={simulatorStatus?.running ? stopSimulator : startSimulator}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200',
            simulatorStatus?.running
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
          )}
        >
          {simulatorStatus?.running ? (
            <>
              <Pause className="w-4 h-4" />
              停止模拟
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              启动模拟
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总记录数"
          value={realtimeStats?.totalRecords || 0}
          icon={Database}
          color="cyan"
          delay={0}
        />
        <StatCard
          title="今日接收"
          value={realtimeStats?.todayRecords || 0}
          icon={Activity}
          color="emerald"
          delay={100}
        />
        <StatCard
          title="已处理"
          value={realtimeStats?.processedCount || 0}
          icon={HardDrive}
          color="purple"
          delay={200}
        />
        <StatCard
          title="错误数"
          value={realtimeStats?.errorCount || 0}
          icon={AlertTriangle}
          color="red"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">数据吞吐量</h3>
          </div>
          <div className="flex justify-center">
            <GaugeChart
              value={throughput}
              maxValue={maxThroughput}
              label="条/秒"
              unit="条/秒"
              color="cyan"
              size="lg"
            />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-900/50 rounded-xl">
              <p className="text-xs text-slate-400">队列积压</p>
              <p className="mt-1 text-xl font-mono font-bold text-amber-400">
                {realtimeStats?.queueSize || 0}
              </p>
            </div>
            <div className="text-center p-3 bg-slate-900/50 rounded-xl">
              <p className="text-xs text-slate-400">处理速率</p>
              <p className="mt-1 text-xl font-mono font-bold text-emerald-400">
                {throughput.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">数据处理趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="接收"
                  stroke="#0ea5e9"
                  fill="url(#colorReceived)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="处理"
                  stroke="#10b981"
                  fill="url(#colorProcessed)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">吞吐量曲线</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="吞吐量"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">最新数据</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-breathe" />
              <span className="text-xs text-slate-400">实时更新</span>
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
            {latestData.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>暂无数据</p>
              </div>
            ) : (
              latestData.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/30 hover:bg-slate-900/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm truncate">
                        {item.satelliteName}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {dataTypeLabels[item.dataType] || item.dataType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400 font-mono">
                        #{item.id}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatBytes(item.dataSize)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatTime(item.receivedTime)}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
