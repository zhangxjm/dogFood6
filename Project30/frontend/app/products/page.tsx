'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import { productApi } from '@/lib/api'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    price: 0,
    bonded_duty: 0,
    unit: '',
    expiry_days: 0,
  })

  useEffect(() => {
    loadData()
  }, [selectedCategory])

  const loadData = async () => {
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        productApi.getList({ category: selectedCategory }),
        productApi.getCategories(),
      ])
      
      if (productsResult.success) {
        setProducts(productsResult.data.list || [])
      } else {
        setProducts(getMockProducts())
      }
      
      if (categoriesResult.success) {
        setCategories(categoriesResult.data || [])
      } else {
        setCategories(['食品', '酒类', '美妆', '保健'])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      setProducts(getMockProducts())
      setCategories(['食品', '酒类', '美妆', '保健'])
    } finally {
      setLoading(false)
    }
  }

  const getMockProducts = () => [
    { id: 1, sku: 'SKU001', name: '进口奶粉', category: '食品', price: 298, bonded_duty: 29.8, unit: '罐', expiry_days: 730 },
    { id: 2, sku: 'SKU002', name: '红酒', category: '酒类', price: 588, bonded_duty: 88.2, unit: '瓶', expiry_days: 3650 },
    { id: 3, sku: 'SKU003', name: '护肤品套装', category: '美妆', price: 1280, bonded_duty: 192, unit: '套', expiry_days: 1095 },
    { id: 4, sku: 'SKU004', name: '保健品', category: '保健', price: 399, bonded_duty: 39.9, unit: '盒', expiry_days: 730 },
    { id: 5, sku: 'SKU005', name: '进口零食大礼包', category: '食品', price: 168, bonded_duty: 16.8, unit: '包', expiry_days: 180 },
    { id: 6, sku: 'SKU006', name: '香水', category: '美妆', price: 680, bonded_duty: 102, unit: '瓶', expiry_days: 1825 },
  ]

  const handleSearch = async () => {
    if (searchKeyword) {
      const result = await productApi.search(searchKeyword)
      if (result.success) {
        setProducts(result.data || [])
      }
    } else {
      loadData()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let result
      if (editingProduct) {
        result = await productApi.update(editingProduct.id, formData)
      } else {
        result = await productApi.create(formData)
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

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setFormData({
      sku: product.sku,
      name: product.name,
      category: product.category,
      price: product.price,
      bonded_duty: product.bonded_duty,
      unit: product.unit,
      expiry_days: product.expiry_days,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这个商品吗？')) {
      try {
        const result = await productApi.delete(id)
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
    setFormData({ sku: '', name: '', category: '', price: 0, bonded_duty: 0, unit: '', expiry_days: 0 })
    setEditingProduct(null)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">商品管理</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索商品..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-64 rounded-lg border pl-10 pr-4 py-2"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border px-3 py-2"
            >
              <option value="">全部分类</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              onClick={() => { resetForm(); setShowModal(true) }}
              className="flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              <Plus size={18} className="mr-2" />
              新增商品
            </button>
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">商品名称</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">分类</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">价格</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">保税税额</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">单位</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">保质期(天)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{p.sku}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">¥{p.price?.toFixed(2)}</td>
                    <td className="px-4 py-3">¥{p.bonded_duty?.toFixed(2)}</td>
                    <td className="px-4 py-3">{p.unit}</td>
                    <td className="px-4 py-3">{p.expiry_days}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(p)} className="text-blue-500 hover:text-blue-700">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">
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
              <h2 className="mb-4 text-xl font-bold">{editingProduct ? '编辑商品' : '新增商品'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">商品名称</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">分类</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">单位</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">价格</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">保税税额</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.bonded_duty}
                      onChange={(e) => setFormData({ ...formData, bonded_duty: parseFloat(e.target.value) })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">保质期(天)</label>
                    <input
                      type="number"
                      value={formData.expiry_days}
                      onChange={(e) => setFormData({ ...formData, expiry_days: parseInt(e.target.value) })}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                      required
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
