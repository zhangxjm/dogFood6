import { useEffect, useState, useRef, useCallback } from 'react';
import { Search, Upload, Download, Trash2, FileText, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import Modal from '@/components/Modal';

export default function Materials() {
  const {
    materials,
    materialsTotal,
    materialsPage,
    materialsPageSize,
    categories,
    fetchMaterials,
    fetchCategories,
    uploadMaterial,
    deleteMaterial,
    loading,
  } = useStore();

  const [search, setSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategoryId, setUploadCategoryId] = useState<number>(0);
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalPages = Math.ceil(materialsTotal / materialsPageSize);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchMaterials({
      category_id: activeCategoryId || undefined,
      search: search || undefined,
      page: materialsPage,
      page_size: materialsPageSize,
    });
  }, [activeCategoryId, search, materialsPage, materialsPageSize, fetchMaterials]);

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除这份资料吗？')) {
      await deleteMaterial(id);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadFile(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  };

  const handleUpload = async () => {
    if (!uploadTitle || !uploadCategoryId) return;
    const formData = new FormData();
    if (uploadFile) {
      formData.append('file', uploadFile);
    }
    formData.append('title', uploadTitle);
    formData.append('category_id', String(uploadCategoryId));
    formData.append('description', uploadDesc);
    await uploadMaterial(formData);
    setUploadOpen(false);
    setUploadTitle('');
    setUploadCategoryId(0);
    setUploadDesc('');
    setUploadFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">资料中心</h2>
        <button onClick={() => setUploadOpen(true)} className="btn-primary flex items-center gap-2">
          <Upload className="w-4 h-4" />
          上传资料
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索资料..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategoryId(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeCategoryId === null
              ? 'bg-primary-700 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategoryId === cat.id
                ? 'bg-primary-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name} ({cat.material_count})
          </button>
        ))}
      </div>

      {loading.materials ? (
        <div className="text-center py-16 text-gray-400">加载中...</div>
      ) : materials.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">暂无资料</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {materials.map((material) => (
              <div key={material.id} className="card p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-base font-semibold text-gray-800 line-clamp-1 flex-1">{material.title}</h4>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 whitespace-nowrap">
                    {getCategoryName(material.category_id)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                  {material.description || '暂无描述'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    {material.created_at ? new Date(material.created_at).toLocaleDateString('zh-CN') : ''} · {formatFileSize(material.file_size)}
                  </div>
                  <div className="flex items-center gap-1">
                    {material.file_path && (
                      <a
                        href={`/api/materials/${material.id}/download`}
                        className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors"
                        title="下载"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => fetchMaterials({ category_id: activeCategoryId || undefined, search: search || undefined, page: Math.max(1, materialsPage - 1) })}
                disabled={materialsPage <= 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                上一页
              </button>
              <span className="text-sm text-gray-500">
                第 {materialsPage} / {totalPages} 页
              </span>
              <button
                onClick={() => fetchMaterials({ category_id: activeCategoryId || undefined, search: search || undefined, page: Math.min(totalPages, materialsPage + 1) })}
                disabled={materialsPage >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="上传资料">
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            {uploadFile ? (
              <p className="text-sm text-primary-600 font-medium">{uploadFile.name}</p>
            ) : (
              <>
                <p className="text-sm text-gray-500">拖拽文件到此处或点击上传</p>
                <p className="text-xs text-gray-400 mt-1">支持常见文档格式</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm"
              placeholder="输入资料标题"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类 *</label>
            <select
              value={uploadCategoryId}
              onChange={(e) => setUploadCategoryId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm"
            >
              <option value={0}>选择分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm resize-none"
              placeholder="输入资料描述（可选）"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!uploadTitle || !uploadCategoryId || loading.upload}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {loading.upload ? '上传中...' : '确认上传'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
