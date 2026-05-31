'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Clock,
  Play,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  List,
  Hammer,
  Box,
  Radio,
} from 'lucide-react';
import { craftApi, liveApi } from '@/lib/api';
import { formatDuration, getDifficultyLabel, getDifficultyColor, isValidImageUrl } from '@/lib/utils';

interface CraftStep {
  id: number;
  step_number: number;
  title: string;
  description: string;
  image_url: string | null;
  video_url: string | null;
  tips: string | null;
  duration_seconds: number;
}

export default function CraftDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [craft, setCraft] = useState<any>(null);
  const [steps, setSteps] = useState<CraftStep[]>([]);
  const [relatedLives, setRelatedLives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const craftId = Number(params.id);

  useEffect(() => {
    loadData();
  }, [craftId]);

  const loadData = async () => {
    try {
      const [craftRes, stepsRes, livesRes] = await Promise.all([
        craftApi.getCraft(craftId),
        craftApi.getCraftSteps(craftId),
        liveApi.getLiveRooms({ craft_id: craftId, is_live: true }),
      ]);
      setCraft(craftRes.data);
      setSteps(stepsRes.data.steps || []);
      setRelatedLives(livesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (stepId: number) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const toggleComplete = (stepId: number) => {
    if (completedSteps.includes(stepId)) {
      setCompletedSteps(completedSteps.filter((id) => id !== stepId));
    } else {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const progress = steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-heritage-red border-t-transparent"></div>
      </div>
    );
  }

  if (!craft) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-500 mb-4">技艺不存在</h3>
          <Link href="/crafts" className="btn-primary">
            返回技艺列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-96 overflow-hidden">
        {isValidImageUrl(craft.cover_image) ? (
          <Image
            src={craft.cover_image}
            alt={craft.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-heritage-gold/30 to-heritage-red/30"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        <div className="absolute top-6 left-6">
          <Link
            href="/crafts"
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回列表</span>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {craft.category && (
              <span className="bg-heritage-gold text-white px-3 py-1 rounded-full text-sm">
                {craft.category.name}
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(craft.difficulty_level)}`}>
              {getDifficultyLabel(craft.difficulty_level)}
            </span>
            {craft.estimated_time && (
              <span className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                <Clock size={14} />
                <span>{formatDuration(craft.estimated_time * 60)}</span>
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif">
            {craft.title}
          </h1>
          <p className="text-white/80 text-lg max-w-3xl">{craft.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {relatedLives.length > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-heritage-red rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <Radio className="animate-pulse" size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">正在直播：{craft.title}</h3>
                  <p className="text-white/80">当前有 {relatedLives[0].viewer_count} 人正在学习</p>
                </div>
              </div>
              <Link
                href={`/live/${relatedLives[0].id}`}
                className="bg-white text-heritage-red px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                观看直播
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {steps.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-heritage-ink font-serif flex items-center space-x-2">
                    <List size={24} className="text-heritage-gold" />
                    <span>步骤拆解</span>
                    <span className="text-sm font-normal text-gray-500">
                      ({completedSteps.length}/{steps.length} 已完成)
                    </span>
                  </h2>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>学习进度</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-heritage-gold to-heritage-red transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-4">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                        expandedStep === step.id
                          ? 'border-heritage-gold shadow-md'
                          : 'border-gray-100 hover:border-gray-200'
                      } ${
                        completedSteps.includes(step.id) ? 'bg-green-50/50' : ''
                      }`}
                    >
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => toggleStep(step.id)}
                      >
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleComplete(step.id);
                            }}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                              completedSteps.includes(step.id)
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-heritage-gold'
                            }`}
                          >
                            {completedSteps.includes(step.id) && <CheckCircle size={16} />}
                          </button>

                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-heritage-gold/10 text-heritage-gold px-2 py-0.5 rounded-full">
                                步骤 {step.step_number}
                              </span>
                              {step.duration_seconds > 0 && (
                                <span className="text-xs text-gray-400 flex items-center space-x-1">
                                  <Clock size={10} />
                                  <span>{formatDuration(step.duration_seconds)}</span>
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-heritage-ink mt-1">{step.title}</h3>
                          </div>
                        </div>

                        {expandedStep === step.id ? (
                          <ChevronDown size={20} className="text-gray-400" />
                        ) : (
                          <ChevronRight size={20} className="text-gray-400" />
                        )}
                      </div>

                      {expandedStep === step.id && (
                        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                          {isValidImageUrl(step.image_url) && (
                            <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                              <Image
                                src={step.image_url}
                                alt={step.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}

                          <p className="text-gray-700 mb-4 leading-relaxed">
                            {step.description}
                          </p>

                          {step.tips && (
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                              <h4 className="font-semibold text-amber-800 mb-2 flex items-center space-x-2">
                                <span>💡</span>
                                <span>小贴士</span>
                              </h4>
                              <p className="text-amber-700 text-sm">{step.tips}</p>
                            </div>
                          )}

                          {step.video_url && (
                            <button className="mt-4 flex items-center space-x-2 bg-heritage-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                              <Play size={18} />
                              <span>观看视频演示</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg text-heritage-ink mb-4 flex items-center space-x-2">
                <Box size={20} className="text-heritage-gold" />
                <span>所需材料</span>
              </h3>
              {craft.materials ? (
                <div className="space-y-2">
                  {craft.materials.split(/[,，、]/).map((material: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-heritage-red rounded-full"></div>
                      <span className="text-gray-700">{material.trim()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">暂无材料清单</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg text-heritage-ink mb-4 flex items-center space-x-2">
                <Hammer size={20} className="text-heritage-gold" />
                <span>所需工具</span>
              </h3>
              {craft.tools ? (
                <div className="space-y-2">
                  {craft.tools.split(/[,，、]/).map((tool: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-heritage-gold rounded-full"></div>
                      <span className="text-gray-700">{tool.trim()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">暂无工具清单</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-heritage-gold/10 to-heritage-red/10 rounded-xl p-6 border border-heritage-gold/20">
              <h3 className="font-bold text-lg text-heritage-ink mb-3">
                🎓 完成学习
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                完成所有步骤后，您可以创建自己的作品并获得溯源认证
              </p>
              <Link href="/works/create" className="w-full btn-primary text-center block">
                创建我的作品
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
