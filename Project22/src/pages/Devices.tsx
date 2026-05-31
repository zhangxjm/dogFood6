import { useEffect, useState } from 'react';
import { Camera, Cpu, Box, Power, Wifi, WifiOff, Activity, Server } from 'lucide-react';
import { useAppStore } from '@/store';
import { fetchCameras, fetchEdgeNodes, fetchModels, activateModel } from '@/api';
import { cn } from '@/lib/utils';

type TabType = 'cameras' | 'models' | 'edges';

export default function Devices() {
  const [activeTab, setActiveTab] = useState<TabType>('cameras');
  const { cameras, edgeNodes, models, setCameras, setEdgeNodes, setModels } = useAppStore();

  useEffect(() => {
    const loadData = async () => {
      const camData = await fetchCameras();
      setCameras(camData);
      const nodeData = await fetchEdgeNodes();
      setEdgeNodes(nodeData);
      const modelData = await fetchModels();
      setModels(modelData);
    };
    loadData();
  }, [setCameras, setEdgeNodes, setModels]);

  const handleActivateModel = async (id: number) => {
    await activateModel(id);
    const modelData = await fetchModels();
    setModels(modelData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">设备与模型管理</h2>
        <p className="text-gray-500 text-sm mt-1">管理相机、边缘节点与视觉检测模型</p>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <TabButton active={activeTab === 'cameras'} onClick={() => setActiveTab('cameras')} icon={Camera} label="相机管理" />
        <TabButton active={activeTab === 'models'} onClick={() => setActiveTab('models')} icon={Box} label="模型部署" />
        <TabButton active={activeTab === 'edges'} onClick={() => setActiveTab('edges')} icon={Server} label="边缘节点" />
      </div>

      {activeTab === 'cameras' && (
        <div className="grid grid-cols-3 gap-4">
          {cameras.map((camera) => (
            <div key={camera.id} className="card p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    camera.status === 'ONLINE' ? 'bg-green-100' : 'bg-gray-100'
                  )}>
                    <Camera className={cn(
                      'w-6 h-6',
                      camera.status === 'ONLINE' ? 'text-green-600' : 'text-gray-400'
                    )} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{camera.name}</p>
                    <p className="text-sm text-gray-500">{camera.ipAddress}</p>
                  </div>
                </div>
                <span className={cn(
                  'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                  camera.status === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                )}>
                  {camera.status === 'ONLINE' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {camera.status === 'ONLINE' ? '在线' : '离线'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-gray-500 text-xs">分辨率</p>
                  <p className="font-medium">{camera.resolution}</p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-gray-500 text-xs">帧率</p>
                  <p className="font-medium">{camera.fps} FPS</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'models' && (
        <div className="space-y-4">
          {models.map((model) => (
            <div key={model.id} className={cn(
              'card p-4 transition-all',
              model.active ? 'border-2 border-brand-400' : ''
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'p-3 rounded-lg',
                    model.active ? 'bg-brand-100' : 'bg-gray-100'
                  )}>
                    <Box className={cn(
                      'w-8 h-8',
                      model.active ? 'text-brand-600' : 'text-gray-400'
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{model.name}</p>
                      {model.active && (
                        <span className="px-2 py-0.5 bg-accent-100 text-accent-600 text-xs rounded-full">
                          当前使用
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">版本 {model.version}</p>
                    <p className="text-xs text-gray-400 mt-1">{model.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{model.accuracy}%</p>
                    <p className="text-xs text-gray-500">准确率</p>
                  </div>
                  {!model.active && (
                    <button
                      onClick={() => handleActivateModel(model.id)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Power className="w-4 h-4" />
                      激活
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'edges' && (
        <div className="grid grid-cols-2 gap-4">
          {edgeNodes.map((node) => (
            <div key={node.id} className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    node.status === 'ONLINE' ? 'bg-green-100' : 'bg-gray-100'
                  )}>
                    <Cpu className={cn(
                      'w-6 h-6',
                      node.status === 'ONLINE' ? 'text-green-600' : 'text-gray-400'
                    )} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{node.name}</p>
                    <p className="text-sm text-gray-500">{node.ipAddress}</p>
                  </div>
                </div>
                <Activity className={cn(
                  'w-5 h-5',
                  node.status === 'ONLINE' ? 'text-green-500 animate-pulse' : 'text-gray-400'
                )} />
              </div>
              <div className="space-y-3">
                <MetricBar label="CPU使用率" value={node.cpuUsage} color="bg-blue-500" />
                <MetricBar label="内存使用率" value={node.memoryUsage} color="bg-purple-500" />
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-gray-500">推理延迟</span>
                  <span className="font-mono font-semibold text-brand-600">{node.inferenceLatency.toFixed(1)} ms</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 pb-3 px-2 font-medium text-sm transition-colors',
        active
          ? 'text-brand-500 border-b-2 border-brand-500'
          : 'text-gray-500 hover:text-gray-700'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
