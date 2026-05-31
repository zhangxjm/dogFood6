'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Barcode } from 'lucide-react'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import { inventoryApi, warehouseApi, productApi, stockTakeApi } from '@/lib/api'
import dayjs from 'dayjs'

export default function InventoriesPage() {
  const [inventories, setInventories] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingInventory, setEditingInventory] = useState<any>(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [formData, setFormData] = useState({
    warehouse_id: 0,
    product_id: 0,
    rfid_tag: '',
    quantity: 0,
    batch_number: '',
    expiry_date: '',
  })

  useEffect(() => {
    loadData()
  }, [selectedWarehouse])

  const loadData = async () => {
    try {
      const [invResult, whResult, prodResult] = await Promise.all([
        inventoryApi.getList({ warehouse_id: parseInt(selectedWarehouse) || 0 }),
        warehouseApi.getList(),
        productApi.getList(),
      ])
      
      if (invResult.success) {
        setInventories(invResult.data.list || [])
      } else {
        setInventories(getMockInventories())
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
      setInventories(getMockInventories())
      setWarehouses(getMockWarehouses())
      setProducts(getMockProducts())
    } finally {
      setLoading(false)
    }
  }

  const getMockWarehouses = () => [
    { id: 1, name: '上海保税仓' },
    { id: 2, name: '深圳保税仓' },
    { id: 3, name: '广州保税仓' },
  ]

  const getMockProducts = () => [
    { id: 1, name: '进口奶粉', unit: '罐' },
    { id: 2, name: '红酒', unit: '瓶' },
    { id: 3, name: '护肤品套装', unit: '套' },
    { id: 4, name: '保健品', unit: '盒' },
    { id: 5, name: '进口零食大礼包', unit: '包' },
    { id: 6, name: '香水', unit: '瓶' },
  ]

  const getMockInventories = () => {
    const now = dayjs()
    return [
      { id: 1, warehouse_id: 1, warehouse: { name: '上海保税仓' }, product_id: 1, product: { name: '进口奶粉', unit: '罐' }, rfid_tag: 'RFID-001-001', quantity: 500, batch_number: 'B20240101', expiry_date: now.add(60, 'day').toISOString(), status: 'in_stock' },
      { id: 2, warehouse_id: 1, warehouse: { name: '上海保税仓' }, product_id: 2, product: { name: '红酒', unit: '瓶' }, rfid_tag: 'RFID-001-002', quantity: 200, batch_number: 'B20240102', expiry_date: now.add(180, 'day').toISOString(), status: 'in_stock' },
      { id: 3, warehouse_id: 2, warehouse: { name: '深圳保税仓' }, product_id: 1, product: { name: '进口奶粉', unit: '罐' }, rfid_tag: 'RFID-002-001', quantity: 300, batch_number: 'B20240104', expiry_date: now.add(60, 'day').toISOString(), status: 'in_stock' },
      { id: 4, warehouse_id: 2, warehouse: { name: '深圳保税仓' }, product_id: 4, product: { name: '保健品', unit: '盒' }, rfid_tag: 'RFID-002-002', quantity: 400, batch_number: 'B20240105', expiry_date: now.add(180, 'day').toISOString(), status: 'in_stock' },
      { id: 5, warehouse_id: 3, warehouse: { name: '广州保税仓' }, product_id: 2, product: { name: '红酒', unit: '瓶' }, rfid_tag: 'RFID-003-001', quantity: 180, batch_number: 'B20240107', expiry_date: now.add(365, 'day').toISOString(), status: 'in_stock' },
    ]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
      }
      let result
      if (editingInventory) {
        result = await inventoryApi.update(editingInventory.id, data)
      } else {
        result = await inventoryApi.create(data)
      }
      if (result.success) {
        loadData()
        setShowModal(false)
        resetForm()
      } else {
        alert('操作失败: ' + result.error)
      }
    } catch (error) {
      alert('操作失败')
    }
  }

  const handleAutoStockTake = async (warehouseId: number) => {
    try {
      const result = await stockTakeApi.autoStockTake(warehouseId)
      if (result.success) {
        alert('自动盘点完成')
        loadData()
      } else {
        alert('盘点失败: ' + result.error)
      }
    } catch (error) {
      alert('盘点失败')
    }
  }

  const handleEdit = (inv: any) => {
    setEditingInventory(inv)
    setFormData({
      warehouse_id: inv.warehouse_id,
      product_id: inv.product_id,
      rfid_tag: inv.rfid_tag,
      quantity: inv.quantity,
      batch_number: inv.batch_number,
      expiry_date: inv.expiry_date ? dayjs(inv.expiry_date).format('YYYY-MM-DD') : '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这条库存记录吗？')) {
      try {
        const result = await inventoryApi.delete(id)
        if (result.success) {
          loadData()
        } else {
          alert('删除失败: ' + result.error)
        }
      } catch (error) {
        alert('删除失败')
      }
    }
  }

  const resetForm = () => {
    setFormData({ warehouse_id: 0, product_id: 0, rfid_tag: '', quantity: 0, batch_number: '', expiry_date: '' })
    setEditingInventory(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-700'
      case 'low_stock': return 'bg-yellow-100 text-yellow-700'
      case 'out_of_stock': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock': return '在库'
      case 'low_stock': return '低库存'
      case 'out_of_stock': return '缺货'
      default: return status
    }
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    if (!expiryDate) return null
    const days = dayjs(expiryDate).diff(dayjs(), 'day')
    return days
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
          <h1 className="text-2xl font-bold text-gray-800">库存管理</h1>
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
            {selectedWarehouse && (
              <button
                onClick={() => handleAutoStockTake(parseInt(selectedWarehouse))}
                className="flex items-center rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
              >
                <Barcode size={18} className="mr-2" />
                RFID自动盘点
              </button>
            )}
            <button
              onClick={() => { resetForm(); setShowModal(true) }}
              className="flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              <Plus size={18} className="mr-2" />
              新增库存
            </button>
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">RFID标签</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">仓库</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">商品</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">数量</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">批次号</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">过期日期</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {inventories.map((inv) => {
                  const daysLeft = getDaysUntilExpiry(inv.expiry_date)
                  const isExpiringSoon = daysLeft !== null && daysLeft <= 30
                  return (
                    <tr key={inv.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm text-blue-600">{inv.rfid_tag}</td>
                      <td className="px-4 py-3">{inv.warehouse?.name || getWarehouseName(inv.warehouse_id)}</td>
                      <td className="px-4 py-3 font-medium">{inv.product?.name || getProductName(inv.product_id)}</td>
                      <td className="px-4 py-3">{inv.quantity} {inv.product?.unit}</td>
                      <td className="px-4 py-3">{inv.batch_number}</td>
                      <td className="px-4 py-3">
                        <span className={isExpiringSoon ? 'text-red-500 font-semibold' : ''}>
                          {inv.expiry_date ? dayjs(inv.expiry_date).format('YYYY-MM-DD') : '-'}
                          {isExpiringSoon && ` (${daysLeft}天后过期)`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(inv.status)}`}>
                          {getStatusText(inv.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button onClick={() => handleEdit(inv)} className="text-blue-500 hover:text-blue-700">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(inv.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <h2 className="mb-4 text-xl font-bold">{editingInventory ? '编辑库存' : '新增库存'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">仓库</label>
                  <select
                    value={formData.warehouse_id}
                    onChange={(e) => setFormData({ ...formData, warehouse_id: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    required
                  >
                    <option value={0}>选择仓库</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">商品</label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    required
                  >
                    <option value={0}>选择商品</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">RFID标签</label>
                    <input
                      type="text"
                      value={formData.rfid_tag}
                      onChange={(e) => setFormData({ ...formData, rfid_tag: e.target.value })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">数量</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">批次号</label>
                    <input
                      type="text"
                      value={formData.batch_number}
                      onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">过期日期</label>
                    <input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>
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
