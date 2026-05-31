import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import { inspectionApi } from '@/utils/api'
import { useAppStore } from '@/store/appStore'

interface DefectType {
  id: string
  name: string
  severity: string
  colorCode: string
  description: string
}

const emptyForm = { name: '', severity: 'MINOR', colorCode: '#EF4444', description: '' }

export default function DefectTypes() {
  const { addAlert } = useAppStore()
  const [defectTypes, setDefectTypes] = useState<DefectType[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const data = await inspectionApi.getDefectTypes()
      setDefectTypes(data)
    } catch {
      setDefectTypes([
        { id: '1', name: '划痕', severity: 'MINOR', colorCode: '#FBBF24', description: '表面轻微划痕' },
        { id: '2', name: '裂纹', severity: 'CRITICAL', colorCode: '#EF4444', description: '产品出现裂纹' },
        { id: '3', name: '变形', severity: 'MAJOR', colorCode: '#FF6B35', description: '产品外形变形' },
        { id: '4', name: '色差', severity: 'MINOR', colorCode: '#3B82F6', description: '颜色偏差超出标准' },
        { id: '5', name: '缺料', severity: 'CRITICAL', colorCode: '#EF4444', description: '产品缺料不完整' },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await inspectionApi.updateDefectType(editingId, form)
        addAlert({ type: 'success', message: '缺陷类型更新成功' })
      } else {
        await inspectionApi.createDefectType(form)
        addAlert({ type: 'success', message: '缺陷类型创建成功' })
      }
      setShowModal(false)
      setEditingId(null)
      setForm(emptyForm)
      fetchData()
    } catch {
      addAlert({ type: 'error', message: '操作失败，请重试' })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await inspectionApi.deleteDefectType(deleteId)
      addAlert({ type: 'success', message: '缺陷类型已删除' })
      setDeleteId(null)
      fetchData()
    } catch {
      addAlert({ type: 'error', message: '删除失败，请重试' })
    }
  }

  const openEdit = (item: DefectType) => {
    setEditingId(item.id)
    setForm({ name: item.name, severity: item.severity, colorCode: item.colorCode, description: item.description })
    setShowModal(true)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">缺陷类型管理</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-accent-400 hover:bg-accent-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增缺陷类型
        </button>
      </div>

      {defectTypes.length === 0 ? (
        <div className="text-center py-20 text-gray-500">暂无缺陷类型数据</div>
      ) : (
        <div className="bg-brand-600 rounded-xl border border-brand-400/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-400/10">
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">名称</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">严重程度</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">颜色标识</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">描述</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody>
              {defectTypes.map((item) => (
                <tr key={item.id} className="border-b border-brand-400/5 hover:bg-brand-500/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-white font-medium">{item.name}</td>
                  <td className="px-6 py-4"><StatusBadge status={item.severity} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded" style={{ backgroundColor: item.colorCode }} />
                      <span className="text-sm text-gray-300">{item.colorCode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{item.description}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg hover:bg-brand-400/10 text-gray-400 hover:text-accent-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="p-1.5 rounded-lg hover:bg-brand-400/10 text-gray-400 hover:text-danger transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-brand-600 rounded-xl p-6 w-full max-w-md border border-brand-400/10 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {editingId ? '编辑缺陷类型' : '新增缺陷类型'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">名称</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-700 border border-brand-400/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">严重程度</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-700 border border-brand-400/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-400"
                >
                  <option value="MINOR">轻微</option>
                  <option value="MAJOR">重要</option>
                  <option value="CRITICAL">严重</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">颜色标识</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.colorCode}
                    onChange={(e) => setForm({ ...form, colorCode: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    value={form.colorCode}
                    onChange={(e) => setForm({ ...form, colorCode: e.target.value })}
                    className="flex-1 px-3 py-2 bg-brand-700 border border-brand-400/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">描述</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-brand-700 border border-brand-400/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent-400 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-accent-400 hover:bg-accent-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-brand-600 rounded-xl p-6 w-full max-w-sm border border-brand-400/10 animate-fade-in">
            <h3 className="text-lg font-semibold text-white mb-2">确认删除</h3>
            <p className="text-sm text-gray-400 mb-6">确定要删除该缺陷类型吗？此操作不可撤销。</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-danger hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
