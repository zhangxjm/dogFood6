import { useEffect, useState } from 'react';
import { Activity, CheckCircle, XCircle, TrendingUp, Clock, Camera } from 'lucide-react';
import { useAppStore, InspectionRecord } from '@/store';
import { fetchLineStatuses, fetchSortingStatistics } from '@/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { lineStatuses, recentRecords, setLineStatuses, setSortingStats, addRecentRecord, sortingStats } = useAppStore();
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const statuses = await fetchLineStatuses();
      setLineStatuses(statuses);
      const stats = await fetchSortingStatistics();
      setSortingStats(stats);
    };
    loadData();

    const interval = setInterval(loadData, 5000);

    let client: any = null;
    if (typeof window !== 'undefined' && (window as any).SockJS && (window as any).Stomp) {
      try {
        const SockJS = (window as any).SockJS;
        const Stomp = (window as any).Stomp;
        const ws = new SockJS('/ws');
        client = Stomp.over(ws);
        client.debug = () => {};

        client.connect({}, () => {
          setWsConnected(true);
          client.subscribe('/topic/inspections', (message: any) => {
            const record: InspectionRecord = JSON.parse(message.body);
            addRecentRecord(record);
          });
        }, () => {
          setWsConnected(false);
        });
      } catch (e) {
        console.warn('WebSocket connection failed:', e);
      }
    }

    return () => {
      clearInterval(interval);
      if (client && client.connected) client.disconnect();
    };
  }, [setLineStatuses, setSortingStats, addRecentRecord]);

  const totalInspected = lineStatuses.reduce((sum, l) => sum + (l.totalInspectedToday || 0), 0);
  const totalPassed = lineStatuses.reduce((sum, l) => sum + (l.passedToday || 0), 0);
  const totalFailed = lineStatuses.reduce((sum, l) => sum + (l.failedToday || 0), 0);
  const overallPassRate = totalInspected > 0 ? ((totalPassed / totalInspected) * 100).toFixed(1) : '100.0';

  const trendData = generateTrendData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">实时监控仪表盘</h2>
          <p className="text-gray-500 text-sm mt-1">
            产线运行状态与检测数据实时监控
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', wsConnected ? 'bg-green-500' : 'bg-red-500')}></span>
          <span className="text-sm text-gray-600">{wsConnected ? '实时连接' : '连接断开'}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="今日检测总数"
          value={totalInspected.toLocaleString()}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={CheckCircle}
          label="今日合格数"
          value={totalPassed.toLocaleString()}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          icon={XCircle}
          label="今日不合格数"
          value={totalFailed.toLocaleString()}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatCard
          icon={TrendingUp}
          label="整体合格率"
          value={`${overallPassRate}%`}
          color="text-accent-500"
          bgColor="bg-accent-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-800">产线运行状态</h3>
          </div>
          <div className="card-body space-y-4">
            {lineStatuses.map((line) => (
              <div key={line.lineId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={cn('w-3 h-3 rounded-full', getStatusColor(line.status))}></span>
                  <div>
                    <p className="font-medium text-gray-800">{line.lineName}</p>
                    <p className="text-xs text-gray-500">
                      {line.activeCameraCount}/{line.cameraCount} 相机在线
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-brand-500">{line.passRate?.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">合格率</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-700">{line.totalInspectedToday}</p>
                  <p className="text-xs text-gray-500">检测数</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-800">合格率趋势</h3>
          </div>
          <div className="card-body h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" fontSize={12} />
                <YAxis domain={[80, 100]} fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="passRate"
                  stroke="#1B2A4A"
                  fill="#C5D4E8"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">实时检测流</h3>
          <span className="text-xs text-gray-500">最近 {Math.min(recentRecords.length, 50)} 条记录</span>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-10 gap-2 max-h-80 overflow-y-auto scrollbar-thin">
            {recentRecords.length === 0 ? (
              <div className="col-span-10 text-center py-12 text-gray-400">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>等待检测数据...</p>
              </div>
            ) : (
              recentRecords.slice(0, 50).map((record, idx) => (
                <div
                  key={record.id || idx}
                  className={cn(
                    'aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105',
                    record.result === 'PASS' ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'
                  )}
                  title={`${record.result === 'PASS' ? '合格' : '不合格'} - ${new Date(record.inspectedAt).toLocaleTimeString()}`}
                >
                  {record.result === 'PASS' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
              ))
            )}
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

function getStatusColor(status: string) {
  switch (status) {
    case 'RUNNING': return 'bg-green-500';
    case 'STOPPED': return 'bg-gray-400';
    case 'ERROR': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
}

function generateTrendData() {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    data.push({
      time: `${time.getHours()}:00`,
      passRate: 92 + Math.random() * 7,
    });
  }
  return data;
}
