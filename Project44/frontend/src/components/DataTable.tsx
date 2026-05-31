import { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import type { SatelliteData } from '../types';
import { StatusBadge } from './StatusBadge';
import DataDetailModal from './DataDetailModal';

interface DataTableProps {
  data: SatelliteData[];
  totalElements: number;
  pageNumber: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onFilterChange?: (filters: any) => void;
}

const dataTypeLabels: Record<string, string> = {
  TELEMETRY: '遥测数据',
  COMMAND: '指令数据',
  IMAGE: '图像数据',
  SENSOR: '传感器数据',
  POSITION: '位置数据',
  STATUS: '状态数据',
};

export default function DataTable({
  data,
  totalElements,
  pageNumber,
  pageSize,
  onPageChange,
}: DataTableProps) {
  const [selectedData, setSelectedData] = useState<SatelliteData | null>(null);
  const totalPages = Math.ceil(totalElements / pageSize);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <>
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">ID</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">卫星</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">数据类型</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">数据大小</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">接收时间</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">状态</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">操作</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>暂无数据</p>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={item.id}
                    className={cn(
                      'border-b border-slate-700/30 transition-colors hover:bg-slate-700/20',
                      index % 2 === 0 ? 'bg-slate-800/0' : 'bg-slate-800/30'
                    )}
                  >
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm text-slate-300">#{item.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-white">{item.satelliteName}</p>
                        <p className="text-xs text-slate-400 font-mono">{item.satelliteId}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {dataTypeLabels[item.dataType] || item.dataType}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm text-slate-300">{formatBytes(item.dataSize)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-300">{formatTime(item.receivedTime)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setSelectedData(item)}
                        className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              共 <span className="text-white font-medium">{totalElements}</span> 条记录，
              第 <span className="text-white font-medium">{pageNumber + 1}</span> / {totalPages} 页
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(pageNumber - 1)}
                disabled={pageNumber === 0}
                className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(pageNumber + 1)}
                disabled={pageNumber >= totalPages - 1}
                className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedData && (
        <DataDetailModal data={selectedData} onClose={() => setSelectedData(null)} />
      )}
    </>
  );
}
