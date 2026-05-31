'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Clock, TrendingUp, BookOpen, Shirt, Radio } from 'lucide-react';
import { searchApi, craftApi } from '@/lib/api';
import CraftCard from '@/components/CraftCard';
import WorkCard from '@/components/WorkCard';
import SearchSuggestions from '@/components/SearchSuggestions';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [trendingSearches] = useState([
    '青花瓷', '苏绣', '木雕', '剪纸', '皮影', '景德镇', '传统工艺'
  ]);

  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  useEffect(() => {
    if (query.trim().length > 0) {
      const timer = setTimeout(async () => {
        try {
          const res = await searchApi.getSuggestions(query);
          setSuggestions(res.data.suggestions || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to get suggestions:', error);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setShowSuggestions(false);

    const newHistory = [q, ...searchHistory.filter((h) => h !== q)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    try {
      const res = await searchApi.search({
        q,
        type: typeFilter || undefined,
        page: 1,
        page_size: 50,
      });
      setResults(res.data);
      setQuery(q);
    } catch (error) {
      console.error('Search failed:', error);
      setResults({ total: 0, results: [], query: q });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (term: string) => {
    setQuery(term);
    handleSearch(term);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const typeOptions = [
    { value: null, label: '全部', icon: Search },
    { value: 'craft', label: '技艺', icon: BookOpen },
    { value: 'work', label: '作品', icon: Shirt },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-heritage-ink mb-4 font-serif">
            🔍 内容检索
          </h1>
          <p className="text-gray-600">
            基于 Elasticsearch 的智能搜索，快速找到您想学的非遗技艺
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => query && setShowSuggestions(true)}
              placeholder="搜索非遗技艺、作品、传承人..."
              className="w-full pl-16 pr-32 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-heritage-gold focus:border-transparent outline-none transition-all text-xl"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-heritage-red hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {loading ? '搜索中...' : '搜索'}
            </button>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-10">
                <SearchSuggestions
                  suggestions={suggestions}
                  onSelect={handleSelectSuggestion}
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 mr-2">类型：</span>
            {typeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value || 'all'}
                  onClick={() => {
                    setTypeFilter(option.value);
                    if (query) handleSearch();
                  }}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    typeFilter === option.value
                      ? 'bg-heritage-red text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={16} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {!results && (
          <div className="space-y-8">
            {searchHistory.length > 0 && (
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-heritage-ink flex items-center space-x-2">
                    <Clock size={18} className="text-gray-400" />
                    <span>搜索历史</span>
                  </h3>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                  >
                    清空
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(term)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-600 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-heritage-ink mb-4 flex items-center space-x-2">
                <TrendingUp size={18} className="text-heritage-gold" />
                <span>热门搜索</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {trendingSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSuggestion(term)}
                    className="flex items-center space-x-1 px-5 py-2.5 bg-gradient-to-r from-heritage-gold/10 to-heritage-red/10 hover:from-heritage-gold/20 hover:to-heritage-red/20 rounded-full text-sm font-medium text-heritage-ink transition-all"
                  >
                    <span className="text-heritage-gold">{index + 1}</span>
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                找到 <span className="font-bold text-heritage-ink">{results.total}</span> 个结果
                {results.fallback && (
                  <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    数据库搜索模式
                  </span>
                )}
              </p>
            </div>

            {results.results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.results.map((item: any, index: number) => (
                  <div key={`${item.type}-${item.id}-${index}`}>
                    {item.type === 'craft' && (
                      <CraftCard
                        craft={{
                          id: item.id,
                          title: item.title,
                          description: item.description,
                          cover_image: item.image_url,
                          difficulty_level: 'beginner',
                          estimated_time: null,
                        }}
                      />
                    )}
                    {item.type === 'work' && (
                      <WorkCard
                        work={{
                          id: item.id,
                          title: item.title,
                          description: item.description,
                          image_url: item.image_url,
                          traceability_code: `HC${Date.now()}`,
                          quality_verified: true,
                          created_at: new Date().toISOString(),
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <Search size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">未找到相关内容</h3>
                <p className="text-gray-400">试试其他关键词吧</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
