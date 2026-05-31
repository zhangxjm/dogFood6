'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react'
import { anomalyAPI } from '@/lib/api'

export default function AnomalyPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('all')
  const [selectedAlert, setSelectedAlert] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params: any = { page, size: 20 }
        if (filter !== 'all') {
          params.status = filter
        }
        const res = await anomalyAPI.getAlerts(params)
        setAlerts(res.data.list)
        setTotal(res.data.total)
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page, filter])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-danger-500'
      case 'high':
        return 'bg-warning-500'
      case 'medium':
        return 'bg-primary-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <span className="badge badge-success">已处理</span>
      case 'investigating':
        return <span className="badge badge-warning">处理中</span>
      default:
        return <span className="badge badge-danger">待处理</span>
    }
  }

  const handleAlert = async (id: number, status: string) => {
    try {
      await anomalyAPI.handleAlert(id, {
        status,
        handledBy: 'admin',
        handleNote: status === 'resolved' ? '已确认处理' : '正在调查中',
      })
      alert('操作成功')
      setSelectedAlert(null)
      const params: any = { page, size: 20 }
      if (filter !== 'all') params.status = filter
      const res = await anomalyAPI.getAlerts(params)
      setAlerts(res.data.list)
    } catch (error) {
      console.error('Failed to handle alert:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">异常预警</h1>
        <p className="text-gray-500 mt-1">监控和处理异常交易预警</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-danger-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-danger-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">待处理预警</p>
            <p className="text-xl font-bold text-gray-900">{alerts.filter((a) => a.status === 'pending').length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-warning-50 rounded-lg">
            <Clock className="w-6 h-6 text-warning-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">处理中</p>
            <p className="text-xl font-bold text-gray-900">{alerts.filter((a) => a.status === 'investigating').length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-success-50 rounded-lg">
            <CheckCircle className="w-6 h-6 text-success-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">已处理</p>
            <p className="text-xl font-bold text-gray-900">{alerts.filter((a) => a.status === 'resolved').length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-danger-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-danger-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">高危预警</p>
            <p className="text-xl font-bold text-gray-900">{alerts.filter((a) => a.severity === 'critical').length}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'pending' ? 'bg-danger-100 text-danger-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setFilter('pending')}
          >
            待处理
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'investigating' ? 'bg-warning-100 text-warning-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setFilter('investigating')}
          >
            处理中
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${filter === 'resolved' ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setFilter('resolved')}
          >
            已处理
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无预警数据</div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-200 transition-colors cursor-pointer"
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity)}`}></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{alert.alertId}</span>
                        {getStatusBadge(alert.status)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">
                          风险评分: {(alert.riskScore * 100).toFixed(0)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          类型: {alert.alertType}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between mt-6">
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

      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedAlert(null)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">预警详情</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">预警ID</span>
                <span className="font-medium">{selectedAlert.alertId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">预警类型</span>
                <span className="font-medium">{selectedAlert.alertType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">风险等级</span>
                <span className={`font-medium ${selectedAlert.severity === 'critical' ? 'text-danger-600' : 'text-warning-600'}`}>
                  {selectedAlert.severity === 'critical' ? '严重' : selectedAlert.severity === 'high' ? '高危' : selectedAlert.severity === 'medium' ? '中等' : '低危'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">风险评分</span>
                <span className="font-medium">{(selectedAlert.riskScore * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">状态</span>
                {getStatusBadge(selectedAlert.status)}
              </div>
              <div>
                <span className="text-gray-500">描述</span>
                <p className="text-sm text-gray-700 mt-1">{selectedAlert.description}</p>
              </div>
            </div>
            {selectedAlert.status !== 'resolved' && (
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 btn btn-secondary"
                  onClick={() => handleAlert(selectedAlert.id, 'investigating')}
                >
                  标记处理中
                </button>
                <button
                  className="flex-1 btn btn-primary"
                  onClick={() => handleAlert(selectedAlert.id, 'resolved')}
                >
                  标记已处理
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
