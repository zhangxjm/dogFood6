import { useEffect, useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { fetchDailyReport, fetchWeeklyReport, fetchMonthlyReport } from '@/api';
import { ReportData } from '@/store';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

type PeriodType = 'daily' | 'weekly' | 'monthly';

export default function Reports() {
  const [periodType, setPeriodType] = useState<PeriodType>('daily');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadReport();
  }, [periodType, selectedDate]);

  const loadReport = async () => {
    let data;
    if (periodType === 'daily') {
      data = await fetchDailyReport(selectedDate);
    } else if (periodType === 'weekly') {
      data = await fetchWeeklyReport(selectedDate);
    } else {
      data = await fetchMonthlyReport(selectedDate.substring(0, 7));
    }
    setReportData(data);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#EF4444';
      case 'MAJOR': return '#F97316';
      case 'MINOR': return '#FBBF24';
      default: return '#6B7280';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">质检报表中心</h2>
          <p className="text-gray-500 text-sm mt-1">生成与查看质检统计报表</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" />
          导出报表
        </button>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setPeriodType('daily')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                periodType === 'daily'
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              日报
            </button>
            <button
              onClick={() => setPeriodType('weekly')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                periodType === 'weekly'
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              周报
            </button>
            <button
              onClick={() => setPeriodType('monthly')}
              className={cn(
                'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                periodType === 'monthly'
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              月报
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field w-auto"
            />
          </div>
        </div>
      </div>

      {reportData && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              label="检测总数"
              value={reportData.totalInspected.toLocaleString()}
              color="text-brand-500"
              subValue={`${reportData.startDate} ~ ${reportData.endDate}`}
            />
            <StatCard
              label="合格数"
              value={reportData.passed.toLocaleString()}
              color="text-green-600"
              subValue={`占比 ${((reportData.passed / reportData.totalInspected) * 100).toFixed(1)}%`}
            />
            <StatCard
              label="不合格数"
              value={reportData.failed.toLocaleString()}
              color="text-red-600"
              subValue={`占比 ${((reportData.failed / reportData.totalInspected) * 100).toFixed(1)}%`}
            />
            <StatCard
              label="综合合格率"
              value={`${reportData.passRate.toFixed(1)}%`}
              color={reportData.passRate >= 95 ? 'text-green-600' : reportData.passRate >= 90 ? 'text-yellow-600' : 'text-red-600'}
              subValue={reportData.passRate >= 95 ? '优秀' : reportData.passRate >= 90 ? '良好' : '需改进'}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-gray-800">检测趋势</h3>
              </div>
              <div className="card-body h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" fontSize={11} />
                    <YAxis yAxisId="left" fontSize={11} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#C5D4E8" yAxisId="left" radius={[4, 4, 0, 0]} name="检测数" />
                    <Line type="monotone" dataKey="passRate" stroke="#1B2A4A" strokeWidth={2} yAxisId="right" name="合格率%" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-gray-800">缺陷分布</h3>
              </div>
              <div className="card-body h-72">
                {reportData.defectDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.defectDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="count"
                        nameKey="defectName"
                        label={({ defectName, percentage }) => `${defectName} ${percentage.toFixed(1)}%`}
                      >
                        {reportData.defectDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getSeverityColor(entry.defectSeverity)} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    暂无缺陷数据
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-800">各产线统计</h3>
            </div>
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">产线名称</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">检测总数</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">合格数</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">不合格数</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">合格率</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.lineStatistics.map((line) => (
                      <tr key={line.lineId}>
                        <td className="px-4 py-3 font-medium text-gray-900">{line.lineName}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{line.totalInspected.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-green-600">{line.passed.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-red-600">{line.failed.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            'font-medium',
                            line.passRate >= 95 ? 'text-green-600' : line.passRate >= 90 ? 'text-yellow-600' : 'text-red-600'
                          )}>
                            {line.passRate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color, subValue }: any) {
  return (
    <div className="card p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={cn('text-2xl font-bold mt-1', color)}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{subValue}</p>
    </div>
  );
}
