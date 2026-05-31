import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Search, Filter, Play, BookOpen, Zap, Clock, Users, 
  ChevronRight, Plus, Grid, List, Loader2
} from 'lucide-react';
import { trainingApi } from '../lib/api';
import { useAuthStore } from '../store';

export default function Training() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterModules();
  }, [modules, selectedCategory, selectedDifficulty, searchQuery]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [modulesData, categoriesData] = await Promise.all([
        trainingApi.getModules(),
        trainingApi.getCategories()
      ]);
      setModules(modulesData.modules || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error('Failed to load modules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterModules = () => {
    let filtered = [...modules];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(m => m.difficulty === selectedDifficulty);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query)
      );
    }

    setFilteredModules(filtered);
  };

  const getCategoryInfo = (key) => {
    return categories.find(c => c.key === key) || { key, name: key };
  };

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      easy: { text: '初级', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
      medium: { text: '中级', class: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
      hard: { text: '高级', class: 'bg-red-500/20 text-red-400 border-red-500/30' }
    };
    return badges[difficulty] || badges.easy;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      electronics: '⚡',
      mechanical: '⚙️',
      chemistry: '🧪',
      automation: '🤖',
      robotics: '🦾',
      networking: '🌐'
    };
    return icons[category] || '📚';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyber-500 animate-spin mx-auto" />
          <p className="mt-4 text-slate-400">加载实训模块...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">实训模块中心</h1>
            <p className="text-slate-400">选择一个实训模块开始你的虚拟实训之旅</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <button className="px-4 py-2 bg-gradient-cyber text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2">
              <Plus className="w-5 h-5" />
              创建模块
            </button>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索实训模块..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyber-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyber-500"
            >
              <option value="all">全部分类</option>
              {categories.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.name}</option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyber-500"
            >
              <option value="all">全部难度</option>
              <option value="easy">初级</option>
              <option value="medium">中级</option>
              <option value="hard">高级</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-cyber-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-cyber-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModules.map((module) => {
            const category = getCategoryInfo(module.category);
            const difficultyBadge = getDifficultyBadge(module.difficulty);
            return (
              <div
                key={module.id}
                className="glass rounded-2xl overflow-hidden hover:border-cyber-500/50 transition-all group cursor-pointer"
                onClick={() => router.push(`/training/${module.id}`)}
              >
                <div className="h-32 bg-gradient-cyber flex items-center justify-center relative overflow-hidden">
                  <span className="text-5xl">{getCategoryIcon(module.category)}</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${difficultyBadge.class}`}>
                      {difficultyBadge.text}
                    </span>
                    <span className="text-xs text-slate-400">{category.name}</span>
                  </div>
                  
                  <h3 className="font-semibold text-white mb-2 group-hover:text-cyber-400 transition-colors">
                    {module.name}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                    {module.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {module.duration}分钟
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      满分{module.max_score}
                    </span>
                  </div>

                  <button className="w-full mt-4 py-2 bg-slate-700/50 hover:bg-cyber-500 text-slate-300 hover:text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    开始实训
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredModules.map((module) => {
            const category = getCategoryInfo(module.category);
            const difficultyBadge = getDifficultyBadge(module.difficulty);
            return (
              <div
                key={module.id}
                className="glass rounded-2xl p-4 hover:border-cyber-500/50 transition-all cursor-pointer flex items-center gap-4"
                onClick={() => router.push(`/training/${module.id}`)}
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-cyber flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{getCategoryIcon(module.category)}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">{module.name}</h3>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${difficultyBadge.class}`}>
                      {difficultyBadge.text}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 truncate">{module.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>{category.name}</span>
                    <span>·</span>
                    <span>{module.duration}分钟</span>
                    <span>·</span>
                    <span>满分{module.max_score}</span>
                  </div>
                </div>

                <button className="px-4 py-2 bg-cyber-500 hover:bg-cyber-600 text-white rounded-xl font-medium transition-all flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  开始
                </button>
              </div>
            );
          })}
        </div>
      )}

      {filteredModules.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">没有找到匹配的实训模块</h3>
          <p className="text-slate-400">尝试调整筛选条件或搜索关键词</p>
        </div>
      )}
    </div>
  );
}
