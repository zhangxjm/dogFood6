import { useEffect } from 'react';
import {
  HardDrive,
  Cpu,
  MemoryStick,
  Database,
  MessageSquare,
  Clock,
  Server,
  Activity,
} from 'lucide-react';
import { useSystemStore } from '../store/useSystemStore';
import { GaugeChart } from '../components/GaugeChart';
import { StatusBadge } from '../components/StatusBadge';

export default function SystemStatus() {
  const {
    systemStatus,
    fetchSystemStatus,
    startAutoRefresh,
    stopAutoRefresh,
  } = useSystemStore();

  useEffect(() => {
    fetchSystemStatus();
    startAutoRefresh();
    return () => stopAutoRefresh();
  }, []);

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}天 ${hours % 24}小时 ${minutes % 60}分钟`;
    }
    if (hours > 0) {
      return `${hours}小时 ${minutes % 60}分钟 ${seconds % 60}秒`;
    }
    if (minutes > 0) {
      return `${minutes}分钟 ${seconds % 60}秒`;
    }
    return `${seconds}秒`;
  };

  const services = [
    {
      name: 'Kafka 消息队列',
      icon: MessageSquare,
      status: systemStatus?.kafkaStatus || 'DISCONNECTED',
      description: '用于高吞吐量数据传输的分布式消息系统',
      color: 'amber',
    },
    {
      name: 'SQLite 数据库',
      icon: Database,
      status: systemStatus?.databaseStatus || 'DISCONNECTED',
      description: '轻量级嵌入式关系型数据库，存储卫星数据',
      color: 'purple',
    },
    {
      name: '数据处理服务',
      icon: Activity,
      status: 'CONNECTED',
      description: '负责卫星数据的格式解析和校验处理',
      color: 'cyan',
    },
    {
      name: 'API 服务',
      icon: Server,
      status: 'CONNECTED',
      description: '提供RESTful API接口供前端调用',
      color: 'emerald',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">系统状态</h1>
        <p className="text-slate-400 mt-1">实时监控系统运行状态和资源使用情况</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-slate-400">系统运行时间</span>
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            {formatUptime(systemStatus?.uptime || 0)}
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-slate-400">总记录数</span>
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            {(systemStatus?.totalRecords || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-slate-400">今日新增</span>
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            {(systemStatus?.todayRecords || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">资源使用率</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <GaugeChart
            value={systemStatus?.cpuUsage || 0}
            maxValue={100}
            label="CPU 使用率"
            unit="%"
            color="cyan"
            size="md"
          />
          <GaugeChart
            value={systemStatus?.memoryUsage || 0}
            maxValue={100}
            label="内存使用率"
            unit="%"
            color="emerald"
            size="md"
          />
          <GaugeChart
            value={systemStatus?.diskUsage || 0}
            maxValue={100}
            label="磁盘使用率"
            unit="%"
            color="amber"
            size="md"
          />
          <GaugeChart
            value={Math.random() * 30 + 20}
            maxValue={100}
            label="网络使用率"
            unit="%"
            color="purple"
            size="md"
          />
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-400">CPU</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${systemStatus?.cpuUsage || 0}%` }}
              />
            </div>
            <p className="mt-1 text-sm font-mono text-cyan-400">
              {systemStatus?.cpuUsage?.toFixed(1) || 0}%
            </p>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MemoryStick className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">内存</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${systemStatus?.memoryUsage || 0}%` }}
              />
            </div>
            <p className="mt-1 text-sm font-mono text-emerald-400">
              {systemStatus?.memoryUsage?.toFixed(1) || 0}%
            </p>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400">磁盘</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${systemStatus?.diskUsage || 0}%` }}
              />
            </div>
            <p className="mt-1 text-sm font-mono text-amber-400">
              {systemStatus?.diskUsage?.toFixed(1) || 0}%
            </p>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-400">网络</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.random() * 30 + 20}%` }}
              />
            </div>
            <p className="mt-1 text-sm font-mono text-purple-400">
              {(Math.random() * 30 + 20).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">服务状态</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.name}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/30 hover:bg-slate-900/50 transition-colors"
              >
                <div
                  className={`p-3 rounded-xl ${
                    service.color === 'amber'
                      ? 'bg-amber-500/10 text-amber-400'
                      : service.color === 'purple'
                        ? 'bg-purple-500/10 text-purple-400'
                        : service.color === 'cyan'
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">{service.name}</h4>
                    <StatusBadge status={service.status as any} size="sm" />
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">系统信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900/30 rounded-xl">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">操作系统</p>
            <p className="mt-1 text-white">Linux / Windows Server</p>
          </div>
          <div className="p-4 bg-slate-900/30 rounded-xl">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Java 版本</p>
            <p className="mt-1 text-white font-mono">OpenJDK 17</p>
          </div>
          <div className="p-4 bg-slate-900/30 rounded-xl">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Spring Boot</p>
            <p className="mt-1 text-white font-mono">3.2.5</p>
          </div>
          <div className="p-4 bg-slate-900/30 rounded-xl">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Kafka 版本</p>
            <p className="mt-1 text-white font-mono">2.8.x</p>
          </div>
          <div className="p-4 bg-slate-900/30 rounded-xl">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">数据库</p>
            <p className="mt-1 text-white font-mono">SQLite 3.x</p>
          </div>
          <div className="p-4 bg-slate-900/30 rounded-xl">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">前端框架</p>
            <p className="mt-1 text-white font-mono">React 18 + TypeScript</p>
          </div>
        </div>
      </div>
    </div>
  );
}
