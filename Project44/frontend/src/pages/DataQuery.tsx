import { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, Calendar } from 'lucide-react';
import { dataApi } from '../services/api';
import type { SatelliteData } from '../types';
import DataTable from '../components/DataTable';
import { PageResult } from '../types';

const satellites = [
  { id: '', name: '全部卫星' },
  { id: 'SAT-001', name: '天宫一号' },
  { id: 'SAT-002', name: '神舟十五号' },
  { id: 'SAT-003', name: '北斗三号G1' },
  { id: 'SAT-004', name: '风云四号A' },
  { id: 'SAT-005', name: '高分七号' },
];

const dataTypes = [
  { value: '', label: '全部类型' },
  { value: 'TELEMETRY', label: '遥测数据' },
  { value: 'COMMAND', label: '指令数据' },
  { value: 'IMAGE', label: '图像数据' },
  { value: 'SENSOR', label: '传感器数据' },
  { value: 'POSITION', label: '位置数据' },
  { value: 'STATUS', label: '状态数据' },
];

const statuses = [
  { value: '', label: '全部状态' },
  { value: 'PROCESSED', label: '已处理' },
  { value: 'RECEIVED', label: '已接收' },
  { value: 'ERROR', label: '错误' },
];

export default function DataQuery() {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState({
    satelliteId: '',
    dataType: '',
    status: '',
    startTime: '',
    endTime: '',
  });
  const [result, setResult] = useState<PageResult<SatelliteData>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    pageNumber: 0,
    pageSize: 20,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await dataApi.getData({
        page,
        size: pageSize,
        ...filters,
      });
      setResult(data);
    } catch (e) {
      console.error('Failed to fetch data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleReset = () => {
    setFilters({
      satelliteId: '',
      dataType: '',
      status: '',
      startTime: '',
      endTime: '',
    });
    setPage(0);
  };

  const formatDateTimeForInput = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">数据查询</h1>
        <p className="text-slate-400 mt-1">多条件筛选和查询卫星历史数据</p>
      </div>

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">筛选条件</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">卫星</label>
            <select
              value={filters.satelliteId}
              onChange={(e) => handleFilterChange('satelliteId', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {satellites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">数据类型</label>
            <select
              value={filters.dataType}
              onChange={(e) => handleFilterChange('dataType', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {dataTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">处理状态</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              开始时间
            </label>
            <input
              type="text"
              placeholder="YYYY-MM-DD HH:mm:ss"
              value={filters.startTime}
              onChange={(e) => handleFilterChange('startTime', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              结束时间
            </label>
            <input
              type="text"
              placeholder="YYYY-MM-DD HH:mm:ss"
              value={filters.endTime}
              onChange={(e) => handleFilterChange('endTime', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono text-sm"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={fetchData}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-medium hover:bg-cyan-500/30 transition-colors"
            >
              <Search className="w-4 h-4" />
              查询
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 bg-slate-700/50 text-slate-400 border border-slate-600 rounded-xl font-medium hover:text-white hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-900/30 rounded-xl">
          <p className="text-xs text-slate-500">
            <span className="text-slate-400 font-medium">提示：</span>
            时间格式示例：{formatDateTimeForInput(new Date())}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <DataTable
          data={result.content}
          totalElements={result.totalElements}
          pageNumber={result.pageNumber}
          pageSize={result.pageSize}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
