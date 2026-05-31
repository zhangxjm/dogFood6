'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Shield,
  User,
  Calendar,
  Hash,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { workApi } from '@/lib/api';
import TraceTimeline from '@/components/TraceTimeline';
import { formatDate, isValidImageUrl } from '@/lib/utils';

export default function WorkDetailPage() {
  const params = useParams();
  const [work, setWork] = useState<any>(null);
  const [traceability, setTraceability] = useState<any>(null);
  const [integrity, setIntegrity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const workId = Number(params.id);

  useEffect(() => {
    if (isNaN(workId)) {
      setLoading(false);
      return;
    }
    loadData();
  }, [workId]);

  const loadData = async () => {
    try {
      const [workRes, integrityRes] = await Promise.all([
        workApi.getWork(workId),
        workApi.getIntegrity(workId),
      ]);
      setWork(workRes.data);

      if (workRes.data.traceability_code) {
        const traceRes = await workApi.getTraceability(workRes.data.traceability_code);
        setTraceability(traceRes.data);
      }

      setIntegrity(integrityRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-heritage-red border-t-transparent"></div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-500 mb-4">作品不存在</h3>
          <Link href="/works" className="btn-primary">
            返回作品列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/works"
            className="flex items-center space-x-2 text-gray-600 hover:text-heritage-red transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回作品列表</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="relative h-80">
                {isValidImageUrl(work.image_url) ? (
                  <Image
                    src={work.image_url}
                    alt={work.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-heritage-gold/30 to-heritage-red/30 flex items-center justify-center text-8xl">
                    🏺
                  </div>
                )}

                <div className="absolute top-4 right-4">
                  {work.quality_verified ? (
                    <span className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full font-medium">
                      <Shield size={18} />
                      <span>平台品质认证</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-full">
                      <AlertCircle size={18} />
                      <span>待认证</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="p-8">
                <h1 className="text-3xl font-bold text-heritage-ink mb-4 font-serif">
                  {work.title}
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">{work.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-2">👤</div>
                    <div className="text-sm text-gray-500">创作者</div>
                    <div className="font-semibold text-heritage-ink">
                      {work.creator?.full_name || work.creator?.username || '未知'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-2">🎨</div>
                    <div className="text-sm text-gray-500">所属技艺</div>
                    <div className="font-semibold text-heritage-ink">
                      {work.craft?.title || '未分类'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-2">📅</div>
                    <div className="text-sm text-gray-500">创建时间</div>
                    <div className="font-semibold text-heritage-ink">
                      {formatDate(work.created_at).split(' ')[0]}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-2">📝</div>
                    <div className="text-sm text-gray-500">溯源记录</div>
                    <div className="font-semibold text-heritage-ink">
                      {traceability?.trace_records?.length || 0} 条
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {traceability && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-heritage-ink mb-6 font-serif flex items-center space-x-2">
                  <Hash className="text-heritage-gold" size={24} />
                  <span>作品溯源档案</span>
                </h2>

                <div className="bg-heritage-paper p-6 rounded-xl mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">唯一溯源码</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(work.traceability_code);
                        alert('溯源码已复制到剪贴板');
                      }}
                      className="flex items-center space-x-2 text-sm text-heritage-red hover:text-red-600"
                    >
                      <span>复制</span>
                    </button>
                  </div>
                  <div className="text-2xl font-mono font-bold text-heritage-ink tracking-wider">
                    {work.traceability_code}
                  </div>
                </div>

                <TraceTimeline
                  records={traceability.trace_records}
                  integrityScore={traceability.integrity.integrity_score}
                  isVerified={work.quality_verified}
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-lg text-heritage-ink mb-4 flex items-center space-x-2">
                <FileText size={20} className="text-heritage-gold" />
                <span>材料来源</span>
              </h3>
              <p className="text-gray-600 text-sm">
                {work.material_sources || '暂无材料来源信息'}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-lg text-heritage-ink mb-4 flex items-center space-x-2">
                <MapPin size={20} className="text-heritage-gold" />
                <span>创作工艺</span>
              </h3>
              <p className="text-gray-600 text-sm">
                {work.creation_process || '暂无创作工艺信息'}
              </p>
            </div>

            {integrity && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-lg text-heritage-ink mb-4 flex items-center space-x-2">
                  <CheckCircle size={20} className="text-heritage-gold" />
                  <span>完整性验证</span>
                </h3>

                <div className="text-center py-4">
                  <div className={`text-4xl font-bold mb-2 ${
                    integrity.valid ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {integrity.valid ? '✓' : '✗'}
                  </div>
                  <div className="text-gray-600">
                    {integrity.valid ? '溯源数据完整' : '溯源数据存在问题'}
                  </div>
                  <div className="text-3xl font-bold text-heritage-gold mt-2">
                    {integrity.integrity_score.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">完整性评分</div>
                </div>

                {integrity.issues && integrity.issues.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {integrity.issues.map((issue: string, i: number) => (
                      <div key={i} className="flex items-start space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-gradient-to-br from-heritage-gold to-heritage-red rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4">🔍 查询其他作品</h3>
              <p className="text-white/80 text-sm mb-4">
                每件作品都有唯一溯源码，您可以在作品列表页输入溯源码查询任意作品的完整溯源信息。
              </p>
              <Link
                href="/works"
                className="w-full block text-center bg-white text-heritage-red font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                前往查询
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
