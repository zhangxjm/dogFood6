'use client'

import { useEffect, useState } from 'react'
import { FileCheck, Plus, Eye, Send, CheckCircle } from 'lucide-react'
import { complianceAPI } from '@/lib/api'

export default function CompliancePage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showGenerate, setShowGenerate] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await complianceAPI.getReports({ page, size: 20 })
        setReports(res.data.list)
        setTotal(res.data.total)
      } catch (error) {
        console.error('Failed to fetch reports:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page])

  const generateReport = async (type: string) => {
    try {
      await complianceAPI.generateReport(type)
      alert('报告生成中，请稍后刷新查看')
      setShowGenerate(false)
      const res = await complianceAPI.getReports({ page, size: 20 })
      setReports(res.data.list)
      setTotal(res.data.total)
    } catch (error) {
      console.error('Failed to generate report:', error)
    }
  }

  const submitReport = async (id: number) => {
    try {
      await complianceAPI.submitReport(id)
      alert('报告已提交')
      const res = await complianceAPI.getReports({ page, size: 20 })
      setReports(res.data.list)
    } catch (error) {
      console.error('Failed to submit report:', error)
    }
  }

  const getStatusBadge = (status: string, ack: boolean) => {
    if (ack) {
      return <span className="badge badge-success">监管已确认</span>
    }
    switch (status) {
      case 'submitted':
        return <span className="badge badge-info">已提交</span>
      default:
        return <span className="badge badge-warning">草稿</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">合规上报</h1>
          <p className="text-gray-500 mt-1">生成和提交合规监管报告</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowGenerate(true)}>
          <Plus className="w-4 h-4" />
          生成报告
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-primary-50 rounded-lg">
            <FileCheck className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">报告总数</p>
            <p className="text-xl font-bold text-gray-900">{total}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-info-50 rounded-lg">
            <Send className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">已提交</p>
            <p className="text-xl font-bold text-gray-900">{reports.filter((r) => r.status === 'submitted').length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-success-50 rounded-lg">
            <CheckCircle className="w-6 h-6 text-success-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">监管已确认</p>
            <p className="text-xl font-bold text-gray-900">{reports.filter((r) => r.regulatorAck).length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-warning-50 rounded-lg">
            <FileCheck className="w-6 h-6 text-warning-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">草稿</p>
            <p className="text-xl font-bold text-gray-900">{reports.filter((r) => r.status === 'draft').length}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">报告ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">类型</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">周期</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">交易数</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">异常数</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    暂无报告
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-900">{report.reportId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">
                        {report.reportType === 'daily' ? '日报' : report.reportType === 'weekly' ? '周报' : '月报'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{report.reportPeriod}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{report.totalTxCount}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-danger-600">{report.anomalyCount}</span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(report.status, report.regulatorAck)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          className="p-1 hover:bg-gray-100 rounded"
                          title="查看"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        {report.status === 'draft' && (
                          <button
                            className="p-1 hover:bg-gray-100 rounded"
                            title="提交"
                            onClick={() => submitReport(report.id)}
                          >
                            <Send className="w-4 h-4 text-gray-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">共 {total} 条记录</span>
          <div className="flex gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              上一页
            </button>
            <span className="px-4 py-2 text-gray-600">{page}</span>
            <button
              className="btn btn-secondary"
              onClick={() => setPage((p) => p + 1)}
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {showGenerate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowGenerate(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">生成合规报告</h3>
            <div className="space-y-3">
              <button
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 text-left transition-colors"
                onClick={() => generateReport('daily')}
              >
                <div className="font-medium text-gray-900">日报</div>
                <div className="text-sm text-gray-500 mt-1">生成昨日的合规审计报告</div>
              </button>
              <button
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 text-left transition-colors"
                onClick={() => generateReport('weekly')}
              >
                <div className="font-medium text-gray-900">周报</div>
                <div className="text-sm text-gray-500 mt-1">生成上周的合规审计报告</div>
              </button>
              <button
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 text-left transition-colors"
                onClick={() => generateReport('monthly')}
              >
                <div className="font-medium text-gray-900">月报</div>
                <div className="text-sm text-gray-500 mt-1">生成上月的合规审计报告</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedReport(null)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">报告详情</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">报告ID</span>
                  <p className="font-medium">{selectedReport.reportId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">类型</span>
                  <p className="font-medium">
                    {selectedReport.reportType === 'daily' ? '日报' : selectedReport.reportType === 'weekly' ? '周报' : '月报'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">总交易数</span>
                  <p className="font-medium text-xl">{selectedReport.totalTxCount}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">异常交易数</span>
                  <p className="font-medium text-xl text-danger-600">{selectedReport.anomalyCount}</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">总交易额</span>
                <p className="font-medium">{selectedReport.totalVolume?.toFixed(4)} ETH</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">上报交易数</span>
                <p className="font-medium">{selectedReport.reportedCount}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">状态</span>
                {getStatusBadge(selectedReport.status, selectedReport.regulatorAck)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
