'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Filter, Search, Clock, ChevronDown } from 'lucide-react';
import { craftApi } from '@/lib/api';
import CraftCard from '@/components/CraftCard';
import { getDifficultyLabel, getDifficultyColor } from '@/lib/utils';

export default function CraftsPage() {
  const [crafts, setCrafts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedDifficulty]);

  const loadData = async () => {
    try {
      const [craftsRes, categoriesRes] = await Promise.all([
        craftApi.getCrafts({
          category_id: selectedCategory || undefined,
          difficulty_level: selectedDifficulty || undefined,
        }),
        craftApi.getCategories(),
      ]);
      setCrafts(craftsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCrafts = crafts.filter((craft) =>
    craft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    craft.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const difficulties = [
    { value: 'beginner', label: '入门' },
    { value: 'intermediate', label: '进阶' },
    { value: 'advanced', label: '高级' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-heritage-ink mb-2 font-serif">
            🎨 技艺传承
          </h1>
          <p className="text-gray-600">
            从入门到精通，每一项技艺都经过详细步骤拆解，助您轻松掌握
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索技艺名称或描述..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter size={18} className="text-gray-500" />
                <span className="text-sm text-gray-500">分类：</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedCategory === null
                      ? 'bg-heritage-red text-white'
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
                        ? 'bg-heritage-red text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Clock size={18} className="text-gray-500" />
              <span className="text-sm text-gray-500">难度：</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDifficulty(null)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedDifficulty === null
                    ? 'bg-heritage-gold text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {difficulties.map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => setSelectedDifficulty(diff.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedDifficulty === diff.value
                      ? getDifficultyColor(diff.value)
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500">
            共找到 <span className="font-semibold text-heritage-ink">{filteredCrafts.length}</span> 项技艺
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
        ) : filteredCrafts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCrafts.map((craft) => (
              <CraftCard key={craft.id} craft={craft} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl">
            <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">暂无相关技艺</h3>
            <p className="text-gray-400">试试其他搜索条件吧</p>
          </div>
        )}
      </div>
    </div>
  );
}
