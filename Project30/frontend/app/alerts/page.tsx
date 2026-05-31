'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import { expiryApi, warehouseApi } from '@/lib/api'
import dayjs from 'dayjs'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('')

  useEffect(() => {
    loadData()
  }, [selectedLevel, selectedWarehouse])

  const loadData = async () => {
    try {
      const [alertsResult, statsResult, whResult] = await Promise.all([
        expiryApi.getAlerts({ 
          level: selectedLevel, 
          warehouse_id: parseInt(selectedWarehouse) || 0 
        }),
        expiryApi.getStats(),
        warehouseApi.getList(),
      ])
      
      if (alertsResult.success) {
        setAlerts(alertsResult.data.list || [])
      } else {
        setAlerts(getMockAlerts())
      }
      
      if (statsResult.success) {
        setStats(statsResult.data)
      } else {
        setStats({ warning_count: 3, critical_count: 2, total_active: 5 })
      }
      
      if (whResult.success) {
        setWarehouses(whResult.data.list || [])
      } else {
        setWarehouses(getMockWarehouses())
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      setAlerts(getMockAlerts())
      setStats({ warning_count: 3, critical_count: 2, total_active: 5 })
      setWarehouses(getMockWarehouses())
    } finally {
      setLoading(false)
    }
  }

  const getMockWarehouses = () => [
    { id: 1, name: '上海保税仓' },
    { id: 2, name: '深圳保税仓' },
    { id: 3, name: '广州保税仓' },
  ]

  const getMockAlerts = () => {
    const now = dayjs()
    return [
      { id: 1, level: 'critical', days_left: 5, quantity: 500, product: { name: '进口奶粉' }, inventory: { rfid_tag: 'RFID-001-001', batch_number: 'B20240101' } },
      { id: 2, level: 'critical', days_left: 3, quantity: 600, product: { name: '进口零食大礼包' }, inventory: { rfid_tag: 'RFID-002-003', batch_number: 'B20240106' } },
      { id: 3, level: 'warning', days_left: 25, quantity: 300, product: { name: '进口奶粉' }, inventory: { rfid_tag: 'RFID-002-001', batch_number: 'B20240104' } },
      { id: 4, level: 'warning', days_left: 20, quantity: 200, product: { name: '红酒' }, inventory: { rfid_tag: 'RFID-001-002', batch_number: 'B20240102' } },
      { id: 5, level: 'warning', days_left: 15, quantity: 400, product: { name: '保健品' }, inventory: { rfid_tag: 'RFID-002-002', batch_number: 'B20240105' } },
    ]
  }

  const handleCheck = async () => {
    try {
      const result = await expiryApi.checkAlerts()
      if (result.success) {
        loadData()
        alert('预警检查完成')
      } else {
        alert('检查失败: ' + result.error)
      }
    } catch (error) {
      alert('检查失败')
    }
  }

  const handleResolve = async (id: number) => {
    if (confirm('确定要标记为已处理吗？')) {
      try {
        const result = await expiryApi.resolveAlert(id)
        if (result.success) {
          loadData()
        } else {
          alert('操作失败: ' + result.error)
        }
      } catch (error) {
        alert('操作失败')
      }
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'critical': return '紧急'
      case 'warning': return '警告'
      default: return level
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">临期预警</h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="rounded-lg border px-3 py-2"
            >
              <option value="">全部仓库</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </select>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-lg border px-3 py-2"
            >
              <option value="">全部级别</option>
              <option value="critical">紧急</option>
              <option value="warning">警告</option>
            </select>
            <button
              onClick={handleCheck}
              className="flex items-center rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
            >
              <RefreshCw size={18} className="mr-2" />
              检查临期商品
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">紧急预警</p>
                <p className="mt-1 text-3xl font-bold text-red-500">{stats?.critical_count || 0}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">警告预警</p>
                <p className="mt-1 text-3xl font-bold text-yellow-500">{stats?.warning_count || 0}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-yellow-500" />
            </div>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总计预警</p>
                <p className="mt-1 text-3xl font-bold text-blue-500">{stats?.total_active || 0}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-blue-500" />
            </div>
          </Card>
        </div>

        <Card title="预警列表">
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <CheckCircle className="mx-auto mb-2 h-12 w-12 text-green-500" />
                <p>暂无临期预警</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`flex items-center justify-between rounded-lg border p-4 ${getLevelColor(alert.level)}`}
                >
                  <div className="flex items-center space-x-4">
                    <AlertTriangle className={`h-8 w-8 ${alert.level === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{alert.product?.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${getLevelColor(alert.level)}`}>
                          {getLevelText(alert.level)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        库存数量: {alert.quantity} | 剩余天数: <span className={alert.level === 'critical' ? 'text-red-500 font-semibold' : ''}>{alert.days_left}天</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        RFID: {alert.inventory?.rfid_tag} | 批次: {alert.inventory?.batch_number}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    标记已处理
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </Layout>
  )
}
