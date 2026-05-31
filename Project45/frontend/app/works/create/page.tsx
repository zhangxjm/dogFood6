'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Plus, Trash2, Loader2 } from 'lucide-react';
import { workApi, craftApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface TraceEntry {
  step_number: number;
  action: string;
  description: string;
  operator: string;
  location: string;
  temperature: string;
  humidity: string;
}

export default function CreateWorkPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [crafts, setCrafts] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    craft_id: '',
    material_sources: '',
    creation_process: '',
  });

  const [traceEntries, setTraceEntries] = useState<TraceEntry[]>([
    {
      step_number: 1,
      action: '',
      description: '',
      operator: '',
      location: '',
      temperature: '',
      humidity: '',
    },
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadCrafts();
  }, [isAuthenticated]);

  const loadCrafts = async () => {
    try {
      const res = await craftApi.getCrafts({ limit: 100 });
      setCrafts(res.data);
    } catch (err) {
      console.error('Failed to load crafts:', err);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTraceChange = (index: number, field: string, value: string) => {
    setTraceEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addTraceEntry = () => {
    setTraceEntries((prev) => [
      ...prev,
      {
        step_number: prev.length + 1,
        action: '',
        description: '',
        operator: '',
        location: '',
        temperature: '',
        humidity: '',
      },
    ]);
  };

  const removeTraceEntry = (index: number) => {
    if (traceEntries.length <= 1) return;
    setTraceEntries((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((entry, i) => ({ ...entry, step_number: i + 1 }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('请输入作品名称');
      return;
    }

    setSubmitting(true);

    try {
      const payload: any = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null,
        craft_id: form.craft_id ? Number(form.craft_id) : null,
        material_sources: form.material_sources.trim() || null,
        creation_process: form.creation_process.trim() || null,
        trace_records: traceEntries
          .filter((t) => t.action.trim())
          .map((t, i) => ({
            step_number: i + 1,
            action: t.action.trim(),
            description: t.description.trim() || null,
            operator: t.operator.trim() || null,
            location: t.location.trim() || null,
            temperature: t.temperature ? parseFloat(t.temperature) : null,
            humidity: t.humidity ? parseFloat(t.humidity) : null,
          })),
      };

      if (payload.trace_records.length === 0) {
        delete payload.trace_records;
      }

      const res = await workApi.createWork(payload);
      router.push(`/works/${res.data.id}`);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        '创建作品失败，请稍后重试';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/works"
            className="flex items-center space-x-2 text-gray-600 hover:text-heritage-red transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回作品列表</span>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-heritage-ink font-serif">
            上传作品
          </h1>
          <p className="text-gray-600 mt-2">
            上传您的手工作品，系统将自动生成唯一溯源码并创建溯源记录
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-heritage-ink mb-6">基本信息</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  作品名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="例如：青花瓷瓶「花开富贵」"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  作品描述
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="详细描述作品，包括创作理念、工艺特色等"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  图片链接
                </label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => handleFormChange('image_url', e.target.value)}
                  placeholder="作品图片URL地址"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  关联技艺
                </label>
                <select
                  value={form.craft_id}
                  onChange={(e) => handleFormChange('craft_id', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none bg-white"
                >
                  <option value="">-- 请选择关联的非遗技艺 --</option>
                  {crafts.map((craft) => (
                    <option key={craft.id} value={craft.id}>
                      {craft.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  材料来源
                </label>
                <textarea
                  value={form.material_sources}
                  onChange={(e) => handleFormChange('material_sources', e.target.value)}
                  placeholder="描述作品所使用的材料来源，例如：景德镇高岭土、浙江钴料..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  创作工艺
                </label>
                <textarea
                  value={form.creation_process}
                  onChange={(e) => handleFormChange('creation_process', e.target.value)}
                  placeholder="描述主要的制作工艺流程"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-heritage-ink">溯源记录</h2>
              <button
                type="button"
                onClick={addTraceEntry}
                className="flex items-center space-x-2 px-4 py-2 bg-heritage-gold/10 text-heritage-gold rounded-lg hover:bg-heritage-gold/20 transition-colors font-medium"
              >
                <Plus size={16} />
                <span>添加记录</span>
              </button>
            </div>

            <p className="text-gray-500 text-sm mb-6">
              添加作品在创作过程中的关键溯源记录，包括每一步的操作、环境等信息。系统将根据这些记录生成完整的溯源链。
            </p>

            <div className="space-y-6">
              {traceEntries.map((entry, index) => (
                <div
                  key={index}
                  className="border border-gray-100 rounded-xl p-6 bg-gray-50/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex items-center justify-center w-8 h-8 bg-heritage-red text-white rounded-full text-sm font-bold">
                      {index + 1}
                    </span>
                    {traceEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTraceEntry(index)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        操作名称 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={entry.action}
                        onChange={(e) =>
                          handleTraceChange(index, 'action', e.target.value)
                        }
                        placeholder="例如：原料筛选、拉坯成型、施釉、入窑烧制..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        详细描述
                      </label>
                      <textarea
                        value={entry.description}
                        onChange={(e) =>
                          handleTraceChange(index, 'description', e.target.value)
                        }
                        placeholder="详细描述该步骤的具体操作和注意事项"
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        操作人
                      </label>
                      <input
                        type="text"
                        value={entry.operator}
                        onChange={(e) =>
                          handleTraceChange(index, 'operator', e.target.value)
                        }
                        placeholder="执行该步骤的人员姓名"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        操作地点
                      </label>
                      <input
                        type="text"
                        value={entry.location}
                        onChange={(e) =>
                          handleTraceChange(index, 'location', e.target.value)
                        }
                        placeholder="例如：景德镇作坊"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        温度 (°C)
                      </label>
                      <input
                        type="number"
                        value={entry.temperature}
                        onChange={(e) =>
                          handleTraceChange(index, 'temperature', e.target.value)
                        }
                        placeholder="例如：1280"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        湿度 (%)
                      </label>
                      <input
                        type="number"
                        value={entry.humidity}
                        onChange={(e) =>
                          handleTraceChange(index, 'humidity', e.target.value)
                        }
                        placeholder="例如：65"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/works"
              className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 px-8 py-3 bg-heritage-red text-white rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>提交中...</span>
                </>
              ) : (
                <>
                  <Upload size={20} />
                  <span>提交作品</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
