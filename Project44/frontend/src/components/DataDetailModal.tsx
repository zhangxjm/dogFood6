import { X } from 'lucide-react';
import type { SatelliteData } from '../types';
import { StatusBadge } from './StatusBadge';

interface DataDetailModalProps {
  data: SatelliteData;
  onClose: () => void;
}

export default function DataDetailModal({ data, onClose }: DataDetailModalProps) {
  const formatTime = (time: string) => {
    return new Date(time).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const renderParsedData = () => {
    if (!data.parsedData) return <span className="text-slate-500">无解析数据</span>;

    try {
      return (
        <pre className="bg-slate-900/50 rounded-lg p-4 overflow-x-auto text-sm font-mono text-emerald-400 max-h-64 scrollbar-thin">
          {JSON.stringify(data.parsedData, null, 2)}
        </pre>
      );
    } catch (e) {
      return <span className="text-slate-500">数据格式错误</span>;
    }
  };

  const dataTypeLabels: Record<string, string> = {
    TELEMETRY: '遥测数据',
    COMMAND: '指令数据',
    IMAGE: '图像数据',
    SENSOR: '传感器数据',
    POSITION: '位置数据',
    STATUS: '状态数据',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col animate-slide-in">
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">数据详情</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              {data.satelliteName} · {data.satelliteId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">数据ID</p>
              <p className="mt-1 text-white font-mono">#{data.id}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">状态</p>
              <div className="mt-1">
                <StatusBadge status={data.status} />
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">数据类型</p>
              <p className="mt-1 text-white">{dataTypeLabels[data.dataType] || data.dataType}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">数据大小</p>
              <p className="mt-1 text-white font-mono">{formatBytes(data.dataSize)}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">接收时间</p>
              <p className="mt-1 text-white">{formatTime(data.receivedTime)}</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">处理时间</p>
              <p className="mt-1 text-white">{data.processedTime ? formatTime(data.processedTime) : '-'}</p>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">校验和</p>
            <p className="text-sm font-mono text-cyan-400 break-all">{data.checksum}</p>
          </div>

          {data.errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-xs text-red-400 font-medium uppercase tracking-wider mb-2">错误信息</p>
              <p className="text-sm text-red-300">{data.errorMessage}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-slate-300 mb-2">解析后数据</p>
            {renderParsedData()}
          </div>

          <div>
            <p className="text-sm font-medium text-slate-300 mb-2">原始数据</p>
            <pre className="bg-slate-900/50 rounded-lg p-4 overflow-x-auto text-sm font-mono text-slate-400 max-h-48 scrollbar-thin">
              {data.rawData}
            </pre>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
