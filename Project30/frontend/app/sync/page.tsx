'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, ArrowRightLeft, CheckCircle, XCircle } from 'lucide-react'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import { inventoryApi, warehouseApi, productApi } from '@/lib/api'
import dayjs from 'dayjs'

export default function SyncPage() {
  const [syncLogs, setSyncLogs] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [syncForm, setSyncForm] = useState({
    source_warehouse_id: 0,
    target_warehouse_id: 0,
    product_id: 0,
    quantity: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [logsResult, whResult, prodResult] = await Promise.all([
        inventoryApi.getSyncLogs(),
        warehouseApi.getList(),
        productApi.getList(),
      ])
      
      if (logsResult.success) {
        setSyncLogs(logsResult.data.list || [])
      } else {
        setSyncLogs(getMockSyncLogs())
      }
      
      if (whResult.success) {
        setWarehouses(whResult.data.list || [])
      } else {
        setWarehouses(getMockWarehouses())
      }
      
      if (prodResult.success) {
        setProducts(prodResult.data.list || [])
      } else {
        setProducts(getMockProducts())
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      setSyncLogs(getMockSyncLogs())
      setWarehouses(getMockWarehouses())
      setProducts(getMockProducts())
    } finally {
      setLoading(false)
    }
  }

  const getMockWarehouses = () => [
    { id: 1, name: '上海保税仓', bonded_quota: 1000000, used_quota: 156700 },
    { id: 2, name: '深圳保税仓', bonded_quota: 800000, used_quota: 120720 },
    { id: 3, name: '广州保税仓', bonded_quota: 600000, used_quota: 81000 },
  ]

  const getMockProducts = () => [
    { id: 1, name: '进口奶粉' },
    { id: 2, name: '红酒' },
    { id: 3, name: '护肤品套装' },
    { id: 4, name: '保健品' },
    { id: 5, name: '进口零食大礼包' },
    { id: 6, name: '香水' },
  ]

  const getMockSyncLogs = () => [
    { id: 1, sync_id: 'SYNC-001', source_warehouse_id: 1, target_warehouse_id: 2, product_id: 1, quantity: 50, status: 'completed', created_at: dayjs().subtract(1, 'hour').toISOString() },
    { id: 2, sync_id: 'SYNC-002', source_warehouse_id: 2, target_warehouse_id: 3, product_id: 2, quantity: 30, status: 'completed', created_at: dayjs().subtract(3, 'hour').toISOString() },
    { id: 3, sync_id: 'SYNC-003', source_warehouse_id: 1, target_warehouse_id: 3, product_id: 4, quantity: 100, status: 'processing', created_at: dayjs().subtract(5, 'minute').toISOString() },
  ]

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault()
    if (syncForm.source_warehouse_id === syncForm.target_warehouse_id) {
      alert('源仓库和目标仓库不能相同')
      return
    }
    try {
      const result = await inventoryApi.sync({
        source_warehouse_id: syncForm.source_warehouse_id,
        target_warehouse_id: syncForm.target_warehouse_id,
        product_id: syncForm.product_id,
        quantity: syncForm.quantity,
      })
      if (result.success) {
        setShowSyncModal(false)
        setSyncForm({ source_warehouse_id: 0, target_warehouse_id: 0, product_id: 0, quantity: 0 })
        loadData()
        alert('库存同步成功')
      } else {
        alert('同步失败: ' + result.error)
      }
    } catch (error) {
      alert('同步失败')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500'
      case 'processing': return 'text-blue-500'
      case 'failed': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={18} className="text-green-500" />
      case 'failed': return <XCircle size={18} className="text-red-500" />
      default: return <RefreshCw size={18} className="text-blue-500 animate-spin" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成'
      case 'processing': return '处理中'
      case 'failed': return '失败'
      default: return status
    }
  }

  const getWarehouseName = (id: number) => {
    const wh = warehouses.find((w) => w.id === id)
    return wh?.name || '-'
  }

  const getProductName = (id: number) => {
    const p = products.find((prod) => prod.id === id)
    return p?.name || '-'
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">库存同步</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadData}
              className="flex items-center rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw size={18} className="mr-2" />
              刷新
            </button>
            <button
              onClick={() => setShowSyncModal(true)}
              className="flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              <ArrowRightLeft size={18} className="mr-2" />
              新建同步任务
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {warehouses.map((wh) => (
            <Card key={wh.id} className="text-center">
              <h3 className="font-semibold text-gray-800">{wh.name}</h3>
              <p className="mt-2 text-sm text-gray-600">保税额度使用率</p>
              <p className="mt-1 text-2xl font-bold text-blue-500">
                {wh.bonded_quota > 0 ? ((wh.used_quota / wh.bonded_quota) * 100).toFixed(1) : 0}%
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${wh.bonded_quota > 0 ? (wh.used_quota / wh.bonded_quota) * 100 : 0}%` }}
                />
              </div>
            </Card>
          ))}
        </div>

        <Card title="同步记录">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">同步ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">源仓库</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">目标仓库</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">商品</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">数量</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">同步时间</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      暂无同步记录
                    </td>
                  </tr>
                ) : (
                  syncLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">{log.sync_id}</td>
                      <td className="px-4 py-3">{getWarehouseName(log.source_warehouse_id)}</td>
                      <td className="px-4 py-3">{getWarehouseName(log.target_warehouse_id)}</td>
                      <td className="px-4 py-3">{getProductName(log.product_id)}</td>
                      <td className="px-4 py-3">{log.quantity}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(log.status)}
                          <span className={getStatusColor(log.status)}>{getStatusText(log.status)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {dayjs(log.created_at).format('YYYY-MM-DD HH:mm:ss')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {showSyncModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <h2 className="mb-4 text-xl font-bold">新建库存同步</h2>
              <form onSubmit={handleSync} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">源仓库</label>
                  <select
                    value={syncForm.source_warehouse_id}
                    onChange={(e) => setSyncForm({ ...syncForm, source_warehouse_id: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    required
                  >
                    <option value={0}>选择源仓库</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">目标仓库</label>
                  <select
                    value={syncForm.target_warehouse_id}
                    onChange={(e) => setSyncForm({ ...syncForm, target_warehouse_id: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    required
                  >
                    <option value={0}>选择目标仓库</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">商品</label>
                  <select
                    value={syncForm.product_id}
                    onChange={(e) => setSyncForm({ ...syncForm, product_id: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    required
                  >
                    <option value={0}>选择商品</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">同步数量</label>
                  <input
                    type="number"
                    min="1"
                    value={syncForm.quantity}
                    onChange={(e) => setSyncForm({ ...syncForm, quantity: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSyncModal(false)}
                    className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    开始同步
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
