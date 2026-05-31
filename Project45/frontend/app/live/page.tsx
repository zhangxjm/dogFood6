'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Radio, Plus, Search, Filter } from 'lucide-react';
import { liveApi, craftApi } from '@/lib/api';
import LiveCard from '@/components/LiveCard';
import { useAuthStore } from '@/store/authStore';

export default function LiveListPage() {
  const [lives, setLives] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'live'>('all');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadData();
  }, [filter, selectedCategory]);

  const loadData = async () => {
    try {
      const [livesRes, categoriesRes] = await Promise.all([
        liveApi.getLiveRooms({
          is_live: filter === 'live' ? true : undefined,
          craft_id: selectedCategory || undefined,
        }),
        craftApi.getCategories(),
      ]);
      setLives(livesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const liveCount = lives.filter((l) => l.is_live).length;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-heritage-ink mb-2 font-serif">
              📺 直播教学
            </h1>
            <p className="text-gray-600">
              跟随国家级传承人实时学习，互动答疑，低延迟不卡顿
            </p>
          </div>
          {isAuthenticated && (
            <Link
              href="/live/create"
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 btn-primary"
            >
              <Plus size={20} />
              <span>创建直播</span>
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">状态：</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-heritage-red text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('live')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                filter === 'live'
                  ? 'bg-heritage-red text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="w-2 h-2 bg-red-500 rounded-full live-indicator"></span>
              <span>直播中 ({liveCount})</span>
            </button>
          </div>

          <div className="flex-1 h-px bg-gray-200 md:h-0 md:w-px md:flex-none"></div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">分类：</span>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedCategory === null
                  ? 'bg-heritage-gold text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-heritage-gold text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
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
        ) : lives.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lives.map((live) => (
              <LiveCard key={live.id} live={live} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl">
            <Radio size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">暂无直播</h3>
            <p className="text-gray-400 mb-6">
              {filter === 'live' ? '当前没有正在进行的直播，' : ''}
              稍后再来看看吧
            </p>
            <Link
              href="/crafts"
              className="inline-flex items-center space-x-2 btn-secondary"
            >
              <Search size={18} />
              <span>浏览技艺教程</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
