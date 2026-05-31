'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import { warehouseApi } from '@/lib/api'

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    bonded_quota: 0,
    status: 'active',
  })

  useEffect(() => {
    loadWarehouses()
  }, [])

  const loadWarehouses = async () => {
    try {
      const result = await warehouseApi.getList()
      if (result.success) {
        setWarehouses(result.data.list || [])
      } else {
        setWarehouses(getMockWarehouses())
      }
    } catch (error) {
      console.error('Failed to load warehouses:', error)
      setWarehouses(getMockWarehouses())
    } finally {
      setLoading(false)
    }
  }

  const getMockWarehouses = () => [
    { id: 1, name: '上海保税仓', location: '上海浦东新区', bonded_quota: 1000000, used_quota: 156700, status: 'active' },
    { id: 2, name: '深圳保税仓', location: '深圳前海自贸区', bonded_quota: 800000, used_quota: 120720, status: 'active' },
    { id: 3, name: '广州保税仓', location: '广州南沙保税区', bonded_quota: 600000, used_quota: 81000, status: 'active' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let result
      if (editingWarehouse) {
        result = await warehouseApi.update(editingWarehouse.id, formData)
      } else {
        result = await warehouseApi.create(formData)
      }
      if (result.success) {
        loadWarehouses()
        setShowModal(false)
        resetForm()
      } else {
        alert('操作失败: ' + result.error)
      }
    } catch (error) {
      alert('操作失败')
    }
  }

  const handleEdit = (warehouse: any) => {
    setEditingWarehouse(warehouse)
    setFormData({
      name: warehouse.name,
      location: warehouse.location,
      bonded_quota: warehouse.bonded_quota,
      status: warehouse.status,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这个仓库吗？')) {
      try {
        const result = await warehouseApi.delete(id)
        if (result.success) {
          loadWarehouses()
        } else {
          alert('删除失败: ' + result.error)
        }
      } catch (error) {
        alert('删除失败')
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: '', location: '', bonded_quota: 0, status: 'active' })
    setEditingWarehouse(null)
  }

  const getUsagePercent = (used: number, total: number) => {
    if (total === 0) return '0.0'
    return ((used / total) * 100).toFixed(1)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">仓库管理</h1>
          <button
            onClick={() => { resetForm(); setShowModal(true) }}
            className="flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            <Plus size={18} className="mr-2" />
            新增仓库
          </button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">仓库名称</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">位置</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">保税额度</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">已使用</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">使用率</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map((wh) => (
                  <tr key={wh.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{wh.name}</td>
                    <td className="px-4 py-3 text-gray-600">{wh.location}</td>
                    <td className="px-4 py-3">¥{wh.bonded_quota?.toLocaleString()}</td>
                    <td className="px-4 py-3">¥{wh.used_quota?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="mr-2 h-2 w-20 overflow-hidden rounded-full bg-gray-200">
                          <div 
                            className={`h-full ${parseFloat(getUsagePercent(wh.used_quota, wh.bonded_quota)) > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${getUsagePercent(wh.used_quota, wh.bonded_quota)}%` }}
                          />
                        </div>
                        <span className="text-sm">{getUsagePercent(wh.used_quota, wh.bonded_quota)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${wh.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {wh.status === 'active' ? '正常' : '停用'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(wh)} className="text-blue-500 hover:text-blue-700">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(wh.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <h2 className="mb-4 text-xl font-bold">{editingWarehouse ? '编辑仓库' : '新增仓库'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">仓库名称</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">位置</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">保税额度</label>
                  <input
                    type="number"
                    value={formData.bonded_quota}
                    onChange={(e) => setFormData({ ...formData, bonded_quota: parseFloat(e.target.value) })}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    保存
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
