'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Radio, Search, Trophy, Users, BookOpen, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { dashboardApi, craftApi, liveApi, workApi } from '@/lib/api';
import CraftCard from '@/components/CraftCard';
import LiveCard from '@/components/LiveCard';
import WorkCard from '@/components/WorkCard';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [featured, setFeatured] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, featuredRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getFeatured(),
        ]);
        setStats(statsRes.data);
        setFeatured(featuredRes.data);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-heritage-ink via-heritage-ink/95 to-heritage-red/30">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-20 w-72 h-72 bg-heritage-gold/30 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-heritage-red/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="text-heritage-gold" size={18} />
              <span className="text-white/90 text-sm">传承千年文化 · 弘扬匠人精神</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 font-serif leading-tight">
              非遗手工技艺
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-heritage-gold to-heritage-red">
                数字传承平台
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              基于低延迟直播技术与智能搜索引擎，让古老的非遗技艺焕发新生。
              <br className="hidden md:block" />
              跟随国家级传承人学习陶瓷、刺绣、木雕等精湛技艺，每一件作品都可溯源。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/live" className="group flex items-center space-x-2 bg-heritage-red hover:bg-red-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                <Radio className="group-hover:animate-pulse" size={20} />
                <span>观看直播教学</span>
              </Link>
              <Link href="/crafts" className="group flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-xl font-medium transition-all duration-300">
                <BookOpen size={20} />
                <span>浏览全部技艺</span>
              </Link>
            </div>

            {!loading && stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-heritage-gold mb-1">{stats.craft_count}</div>
                  <div className="text-white/70 text-sm">非遗技艺</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-heritage-gold mb-1">{stats.live_count}</div>
                  <div className="text-white/70 text-sm">正在直播</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-heritage-gold mb-1">{stats.work_count}</div>
                  <div className="text-white/70 text-sm">传承作品</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-heritage-gold mb-1">{stats.current_viewers}</div>
                  <div className="text-white/70 text-sm">在线学习</div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-heritage-gold/20 to-heritage-red/20 rounded-full animate-float"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-heritage-gold/30 to-heritage-red/30 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-8 bg-gradient-to-br from-heritage-gold/40 to-heritage-red/40 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                <div className="text-8xl">🏺</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="section-title mb-2">🔥 热门直播教学</h2>
              <p className="text-gray-600">跟随大师实时学习，互动答疑，低延迟不卡顿</p>
            </div>
            <Link href="/live" className="flex items-center space-x-1 text-heritage-red hover:text-red-600 font-medium transition-colors">
              <span>查看全部</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {!loading && featured?.live_rooms?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.live_rooms.map((live: any) => (
                <LiveCard key={live.id} live={live} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Radio size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">暂无直播，稍后再来看看吧</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-heritage-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="section-title mb-2">✨ 精选非遗技艺</h2>
              <p className="text-gray-600">从入门到精通，每一步都详细拆解</p>
            </div>
            <Link href="/crafts" className="flex items-center space-x-1 text-heritage-red hover:text-red-600 font-medium transition-colors">
              <span>查看全部</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {!loading && featured?.featured_crafts?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.featured_crafts.map((craft: any) => (
                <CraftCard key={craft.id} craft={craft} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">暂无技艺内容</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="section-title mb-2">🏆 溯源认证作品</h2>
              <p className="text-gray-600">每一件作品都有唯一溯源码，全程可追溯</p>
            </div>
            <Link href="/works" className="flex items-center space-x-1 text-heritage-red hover:text-red-600 font-medium transition-colors">
              <span>查看全部</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {!loading && featured?.featured_works?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.featured_works.map((work: any) => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Trophy size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">暂无作品展示</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-heritage-ink to-heritage-ink/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 font-serif">核心优势</h2>
            <p className="text-white/70">技术赋能非遗传承，让文化走得更远</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-heritage-gold/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-heritage-gold/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Radio className="text-heritage-gold" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">低延迟直播</h3>
              <p className="text-white/60">
                采用WebRTC+优化HLS技术，直播延迟低至500ms，实时互动不卡顿，仿佛亲临现场学习。
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-heritage-gold/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-heritage-red/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Search className="text-heritage-red" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">智能搜索</h3>
              <p className="text-white/60">
                基于Elasticsearch的全文搜索引擎，支持中文分词、模糊搜索，快速找到想学的内容。
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-heritage-gold/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-heritage-jade/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="text-heritage-jade" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">步骤拆解</h3>
              <p className="text-white/60">
                复杂技艺拆解为详细步骤，配合图文视频讲解，从基础到进阶循序渐进。
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-heritage-gold/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="text-blue-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">作品溯源</h3>
              <p className="text-white/60">
                区块链式溯源技术，每件作品唯一溯源码，材料、工艺、创作者全程可追溯。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-heritage-paper">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-heritage-ink mb-6 font-serif">开始您的非遗学习之旅</h2>
          <p className="text-xl text-gray-600 mb-8">
            加入我们，与成千上万的非遗爱好者一起，传承千年文化瑰宝
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link href="/register" className="btn-primary px-10 py-4 text-lg">
                  免费注册
                </Link>
                <Link href="/crafts" className="btn-secondary px-10 py-4 text-lg">
                  先逛一逛
                </Link>
              </>
            ) : (
              <>
                <Link href="/live" className="btn-primary px-10 py-4 text-lg">
                  观看直播
                </Link>
                <Link href="/search" className="btn-secondary px-10 py-4 text-lg">
                  搜索技艺
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
