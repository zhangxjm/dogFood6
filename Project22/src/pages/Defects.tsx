import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Image, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore, DefectType } from '@/store';
import { fetchDefectTypes, fetchInspectionRecords, updateDefectType, deleteDefectType } from '@/api';
import { cn } from '@/lib/utils';

export default function Defects() {
  const { defectTypes, setDefectTypes } = useAppStore();
  const [records, setRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'types' | 'records'>('types');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDefect, setEditingDefect] = useState<DefectType | null>(null);
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    severity: 'MINOR',
    colorCode: '#FBBF24',
    description: '',
  });

  useEffect(() => {
    const loadData = async () => {
      const types = await fetchDefectTypes();
      setDefectTypes(types);
      const recordsData = await fetchInspectionRecords(0, 50);
      setRecords(recordsData.content || []);
    };
    loadData();
  }, [setDefectTypes]);

  const handleSave = async () => {
    await updateDefectType({ ...editingDefect, ...formData });
    const types = await fetchDefectTypes();
    setDefectTypes(types);
    setShowAddModal(false);
    setEditingDefect(null);
    setFormData({ name: '', severity: 'MINOR', colorCode: '#FBBF24', description: '' });
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定删除此缺陷类型？')) {
      await deleteDefectType(id);
      const types = await fetchDefectTypes();
      setDefectTypes(types);
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'MINOR': return '轻微';
      case 'MAJOR': return '主要';
      case 'CRITICAL': return '严重';
      default: return severity;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">缺陷管理</h2>
          <p className="text-gray-500 text-sm mt-1">配置缺陷类型与查看检测记录</p>
        </div>
        <button
          onClick={() => {
            setEditingDefect(null);
            setFormData({ name: '', severity: 'MINOR', colorCode: '#FBBF24', description: '' });
            setShowAddModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加缺陷类型
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('types')}
          className={cn(
            'pb-3 px-2 font-medium text-sm transition-colors',
            activeTab === 'types'
              ? 'text-brand-500 border-b-2 border-brand-500'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          缺陷类型配置
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={cn(
            'pb-3 px-2 font-medium text-sm transition-colors',
            activeTab === 'records'
              ? 'text-brand-500 border-b-2 border-brand-500'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          检测记录
        </button>
      </div>

      {activeTab === 'types' ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">严重程度</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">标识颜色</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {defectTypes.map((defect) => (
                  <tr key={defect.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{defect.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'badge',
                          defect.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-700'
                            : defect.severity === 'MAJOR'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-yellow-100 text-yellow-700'
                        )}
                      >
                        {getSeverityLabel(defect.severity)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: defect.colorCode }}
                        ></span>
                        <span className="text-sm text-gray-600 font-mono">{defect.colorCode}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{defect.description}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingDefect(defect);
                            setFormData({
                              name: defect.name,
                              severity: defect.severity,
                              colorCode: defect.colorCode,
                              description: defect.description || '',
                            });
                            setShowAddModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-500"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(defect.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
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
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((record: any) => (
            <div key={record.id} className="card">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      'w-3 h-3 rounded-full',
                      record.result === 'PASS' ? 'bg-green-500' : 'bg-red-500'
                    )}
                  ></span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {record.result === 'PASS' ? '合格' : record.defectTypeName || '不合格'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {record.lineName} | 置信度: {(record.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {new Date(record.inspectedAt).toLocaleString()}
                  </span>
                  {expandedRecord === record.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              {expandedRecord === record.id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">产线</p>
                      <p className="text-sm font-medium">{record.lineName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">相机ID</p>
                      <p className="text-sm font-medium">{record.cameraId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">置信度</p>
                      <p className="text-sm font-medium">{(record.confidence * 100).toFixed(1)}%</p>
                    </div>
                    {record.imagePath && (
                      <div className="col-span-3">
                        <p className="text-xs text-gray-500 mb-2">检测图像</p>
                        <div className="flex gap-4">
                          <div className="bg-gray-200 rounded-lg h-40 w-60 flex items-center justify-center">
                            <Image className="w-8 h-8 text-gray-400" />
                          </div>
                          {record.annotatedImagePath && (
                            <div className="bg-gray-200 rounded-lg h-40 w-60 flex items-center justify-center">
                              <Image className="w-8 h-8 text-gray-400" />
                              <span className="ml-2 text-sm text-gray-500">标注图</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {editingDefect ? '编辑缺陷类型' : '添加缺陷类型'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="例如：表面划痕"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">严重程度</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="input-field"
                >
                  <option value="MINOR">轻微</option>
                  <option value="MAJOR">主要</option>
                  <option value="CRITICAL">严重</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标识颜色</label>
                <input
                  type="color"
                  value={formData.colorCode}
                  onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                  className="input-field h-10 p-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="缺陷描述信息"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button onClick={handleSave} className="btn-primary">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
