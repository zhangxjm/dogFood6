import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Play, ArrowLeft, Clock, Zap, Users, CheckCircle, XCircle,
  RotateCcw, Pause, Save, AlertCircle, Loader2
} from 'lucide-react';
import { trainingApi, sessionApi, collaborativeApi } from '../../lib/api';
import { useAuthStore, useTrainingStore } from '../../store';
import VirtualScene from '../../components/VirtualScene';

export default function TrainingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const user = useAuthStore((state) => state.user);
  
  const [module, setModule] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [operations, setOperations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [operationCount, setOperationCount] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  useEffect(() => {
    if (id) {
      loadModule();
    }
  }, [id]);

  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const loadModule = async () => {
    setIsLoading(true);
    try {
      const data = await trainingApi.getModule(id);
      setModule(data.module);
      setUserStats(data.userStats);
    } catch (error) {
      console.error('Failed to load module:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTraining = async () => {
    try {
      const data = await sessionApi.startSession(id);
      setSession(data.session);
      setIsTraining(true);
      setElapsedTime(0);
      setOperations([]);
      setConnections([]);
      setErrorCount(0);
      setOperationCount(0);
      
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } catch (error) {
      console.error('Failed to start training:', error);
    }
  };

  const pauseTraining = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const resumeTraining = () => {
    if (!timerInterval) {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    }
  };

  const logOperation = useCallback(async (operationType, operationData, isCorrect = true) => {
    if (!session) return;

    setOperationCount(prev => prev + 1);
    if (!isCorrect) {
      setErrorCount(prev => prev + 1);
    }

    setOperations(prev => [...prev, {
      type: operationType,
      data: operationData,
      isCorrect,
      timestamp: Date.now()
    }]);

    try {
      await sessionApi.logOperation(session.id, {
        operation_type: operationType,
        operation_data: operationData,
        is_correct: isCorrect
      });
    } catch (error) {
      console.error('Failed to log operation:', error);
    }
  }, [session]);

  const handleComponentClick = (component) => {
    if (!isTraining) return;

    setSelectedComponent(component);
    
    const operationData = {
      component_id: component.id,
      component_type: component.type,
      component_name: component.name,
      action: 'select'
    };

    logOperation('component_select', operationData, true);
  };

  const handleCompleteTraining = async () => {
    if (!session) return;

    pauseTraining();

    const maxScore = module?.max_score || 100;
    const accuracy = operationCount > 0 ? (operationCount - errorCount) / operationCount : 0;
    const timeBonus = Math.max(0, 1 - elapsedTime / (module?.duration * 60 || 1800));
    const score = Math.round((accuracy * 0.7 + timeBonus * 0.3) * maxScore);

    try {
      await sessionApi.completeSession(session.id, {
        score,
        operations_count: operationCount,
        error_count: errorCount,
        data_record: {
          operations,
          connections,
          elapsed_time: elapsedTime,
          final_score: score
        }
      });

      setSession(prev => ({ ...prev, status: 'completed', score }));
      setIsTraining(false);
    } catch (error) {
      console.error('Failed to complete training:', error);
    }
  };

  const handleResetTraining = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setIsTraining(false);
    setSession(null);
    setElapsedTime(0);
    setOperations([]);
    setConnections([]);
    setErrorCount(0);
    setOperationCount(0);
    setSelectedComponent(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      easy: { text: '初级', class: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
      medium: { text: '中级', class: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
      hard: { text: '高级', class: 'bg-red-500/20 text-red-400 border-red-500/30' }
    };
    return badges[difficulty] || badges.easy;
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

  if (!module) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-white mb-2">模块不存在</h2>
        <button
          onClick={() => router.push('/training')}
          className="text-cyber-400 hover:text-cyber-300"
        >
          返回实训列表
        </button>
      </div>
    );
  }

  const difficultyBadge = getDifficultyBadge(module.difficulty);
  const accuracy = operationCount > 0 ? Math.round((operationCount - errorCount) / operationCount * 100) : 100;

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/training')}
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{module.name}</h1>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${difficultyBadge.class}`}>
                  {difficultyBadge.text}
                </span>
              </div>
              <p className="text-slate-400">{module.description}</p>
            </div>
          </div>

          {!isTraining && session?.status !== 'completed' && (
            <button
              onClick={startTraining}
              className="px-6 py-3 bg-gradient-cyber text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center gap-2 cyber-button"
            >
              <Play className="w-5 h-5" />
              开始实训
            </button>
          )}
        </div>

        {userStats && userStats.completed_count > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-cyber-400">{userStats.completed_count}</p>
              <p className="text-sm text-slate-400">完成次数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{Math.round(userStats.avg_score || 0)}</p>
              <p className="text-sm text-slate-400">平均分</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">{Math.round(userStats.best_score || 0)}</p>
              <p className="text-sm text-slate-400">最高分</p>
            </div>
          </div>
        )}
      </div>

      {isTraining && (
        <div className="glass rounded-2xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyber-400" />
                <span className="text-2xl font-mono font-bold text-white">{formatTime(elapsedTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-lg text-white">{operationCount} 次操作</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-lg text-white">{errorCount} 次错误</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-lg text-white">{accuracy}% 准确率</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={timerInterval ? pauseTraining : resumeTraining}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {timerInterval ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {timerInterval ? '暂停' : '继续'}
              </button>
              <button
                onClick={handleCompleteTraining}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                完成实训
              </button>
              <button
                onClick={handleResetTraining}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                重置
              </button>
            </div>
          </div>
        </div>
      )}

      {session?.status === 'completed' && (
        <div className="glass rounded-2xl p-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">实训完成！</h2>
            <p className="text-4xl font-bold text-gradient my-4">{session.score} 分</p>
            <div className="flex justify-center gap-8 mt-4">
              <div>
                <p className="text-2xl font-bold text-white">{operationCount}</p>
                <p className="text-sm text-slate-400">操作次数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{errorCount}</p>
                <p className="text-sm text-slate-400">错误次数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatTime(elapsedTime)}</p>
                <p className="text-sm text-slate-400">用时</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/training')}
              className="mt-6 px-6 py-3 bg-gradient-cyber text-white rounded-xl font-medium hover:opacity-90 transition-all"
            >
              返回实训列表
            </button>
          </div>
        </div>
      )}

      {session?.status !== 'completed' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="glass rounded-2xl p-4 h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">3D 虚拟实训场景</h2>
                {isTraining && (
                  <span className="text-sm text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    实训进行中
                  </span>
                )}
              </div>
              <VirtualScene
                sceneConfig={module.scene_config || {}}
                interactive={isTraining}
                selectedComponent={selectedComponent}
                onComponentClick={handleComponentClick}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">实训信息</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">分类</span>
                  <span className="text-white">{module.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">建议时长</span>
                  <span className="text-white">{module.duration} 分钟</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">满分</span>
                  <span className="text-white">{module.max_score} 分</span>
                </div>
              </div>
            </div>

            {selectedComponent && (
              <div className="glass rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">选中组件</h3>
                <div className="p-3 bg-slate-800/50 rounded-xl">
                  <p className="font-medium text-white">{selectedComponent.name || selectedComponent.type}</p>
                  <p className="text-sm text-slate-400">类型: {selectedComponent.type}</p>
                </div>
              </div>
            )}

            <div className="glass rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">操作提示</h3>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-cyber-400">•</span>
                  点击组件进行选择
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyber-400">•</span>
                  拖拽旋转3D场景视角
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyber-400">•</span>
                  滚轮缩放场景
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyber-400">•</span>
                  完成后点击完成实训提交
                </li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">协同实训</h3>
              <p className="text-sm text-slate-400 mb-4">邀请同学一起进行实训，实时同步操作</p>
              <button
                onClick={() => router.push('/collaborative')}
                className="w-full py-2 bg-cyber-500/20 hover:bg-cyber-500/30 text-cyber-400 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                进入协同模式
              </button>
            </div>
          </div>
        </div>
      )}

      {operations.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4">操作记录</h3>
          <div className="max-h-48 overflow-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm">
                  <th className="pb-2">时间</th>
                  <th className="pb-2">操作类型</th>
                  <th className="pb-2">组件</th>
                  <th className="pb-2">状态</th>
                </tr>
              </thead>
              <tbody>
                {operations.slice(-10).reverse().map((op, index) => (
                  <tr key={index} className="text-sm border-t border-slate-700/50">
                    <td className="py-2 text-slate-400">
                      {new Date(op.timestamp).toLocaleTimeString('zh-CN')}
                    </td>
                    <td className="py-2 text-white">{op.type}</td>
                    <td className="py-2 text-slate-300">{op.data?.component_name || '-'}</td>
                    <td className="py-2">
                      {op.isCorrect ? (
                        <span className="text-emerald-400">正确</span>
                      ) : (
                        <span className="text-red-400">错误</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
