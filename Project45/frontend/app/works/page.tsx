'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shirt, Search, Filter, Shield, Plus, QrCode } from 'lucide-react';
import { workApi, craftApi } from '@/lib/api';
import WorkCard from '@/components/WorkCard';
import { useAuthStore } from '@/store/authStore';

export default function WorksPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [crafts, setCrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified'>('all');
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      const [worksRes, craftsRes] = await Promise.all([
        workApi.getWorks({
          quality_verified: filter === 'verified' ? true : undefined,
        }),
        craftApi.getCrafts({ limit: 100 }),
      ]);
      setWorks(worksRes.data);
      setCrafts(craftsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCode = async () => {
    if (!searchCode.trim()) return;

    try {
      const res = await workApi.getTraceability(searchCode.trim());
      setSearchResult(res.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        alert('未找到对应作品，请检查溯源码是否正确');
      }
      setSearchResult(null);
    }
  };

  const verifiedCount = works.filter((w) => w.quality_verified).length;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-heritage-ink mb-2 font-serif">
              🏆 作品溯源
            </h1>
            <p className="text-gray-600">
              每件作品都有唯一溯源码，全程可追溯，确保工艺正宗
            </p>
          </div>
          {isAuthenticated && (
            <Link
              href="/works/create"
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 btn-primary"
            >
              <Plus size={20} />
              <span>上传作品</span>
            </Link>
          )}
        </div>

        <div className="bg-gradient-to-br from-heritage-gold/10 to-heritage-red/10 rounded-2xl p-8 mb-8 border border-heritage-gold/20">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-heritage-gold rounded-xl flex items-center justify-center">
              <QrCode className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-heritage-ink">溯源查询</h3>
              <p className="text-gray-600">输入作品溯源码，查询完整创作历史</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchCode()}
                placeholder="输入溯源码，例如：HC20240101120000A1B2C3D4E5F678"
                className="w-full pl-12 pr-4 py-4 bg-white border border-heritage-gold/30 rounded-xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none transition-all text-lg"
              />
            </div>
            <button
              onClick={handleSearchCode}
              className="px-8 py-4 bg-heritage-red text-white rounded-xl font-bold hover:bg-red-600 transition-colors whitespace-nowrap"
            >
              查询溯源
            </button>
          </div>

          {searchResult && (
            <div className="mt-6 bg-white rounded-xl p-6 border border-heritage-gold/30">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="w-32 h-32 bg-gradient-to-br from-heritage-gold/20 to-heritage-red/20 rounded-xl flex items-center justify-center text-5xl flex-shrink-0">
                  🏺
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-xl font-bold text-heritage-ink">{searchResult.work.title}</h4>
                    {searchResult.work.quality_verified && (
                      <span className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        <Shield size={12} />
                        <span>已认证</span>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{searchResult.work.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">溯源码：</span>
                      <span className="font-mono text-heritage-red">{searchResult.work.traceability_code}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">创作者：</span>
                      <span>{searchResult.work.creator?.full_name || '未知'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">溯源记录：</span>
                      <span>{searchResult.trace_records.length} 条</span>
                    </div>
                    <div>
                      <span className="text-gray-500">完整性评分：</span>
                      <span className="font-bold text-heritage-gold">{searchResult.integrity.integrity_score.toFixed(1)}</span>
                    </div>
                  </div>
                  <Link
                    href={`/works/${searchResult.work.id}`}
                    className="mt-4 inline-flex items-center space-x-1 text-heritage-red hover:text-red-600 font-medium"
                  >
                    <span>查看完整溯源信息</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-heritage-red text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            全部作品 ({works.length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              filter === 'verified'
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Shield size={16} />
            <span>已认证 ({verifiedCount})</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : works.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl">
            <Shirt size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">暂无作品</h3>
            <p className="text-gray-400 mb-6">成为第一个上传作品的人吧！</p>
            {isAuthenticated && (
              <Link href="/works/create" className="btn-primary">
                上传作品
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
