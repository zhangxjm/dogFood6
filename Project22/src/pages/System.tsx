import { useEffect, useState } from 'react';
import { Users, Settings, Factory, Plus, Edit2, Trash2, Power, PowerOff } from 'lucide-react';
import { useAppStore } from '@/store';
import { fetchUsers, fetchSystemSettings, fetchProductionLines, updateProductionLine, deleteProductionLine } from '@/api';
import { cn } from '@/lib/utils';

type TabType = 'users' | 'lines' | 'settings';

export default function System() {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const { setDefectTypes } = useAppStore();
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [showLineModal, setShowLineModal] = useState(false);
  const [editingLine, setEditingLine] = useState<any>(null);
  const [lineForm, setLineForm] = useState({ name: '', status: 'STOPPED', speed: 0, description: '' });

  useEffect(() => {
    const loadData = async () => {
      const userData = await fetchUsers();
      setUsers(userData);
      const settingData = await fetchSystemSettings();
      setSettings(settingData);
      const lineData = await fetchProductionLines();
      setLines(lineData);
    };
    loadData();
  }, []);

  const handleSaveLine = async () => {
    await updateProductionLine({ ...editingLine, ...lineForm });
    const lineData = await fetchProductionLines();
    setLines(lineData);
    setShowLineModal(false);
    setEditingLine(null);
  };

  const handleDeleteLine = async (id: number) => {
    if (confirm('确定删除此产线？')) {
      await deleteProductionLine(id);
      const lineData = await fetchProductionLines();
      setLines(lineData);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return '管理员';
      case 'MANAGER': return '生产主管';
      case 'OPERATOR': return '操作员';
      default: return role;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'RUNNING': return '运行中';
      case 'STOPPED': return '已停止';
      case 'ERROR': return '故障';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">系统管理</h2>
        <p className="text-gray-500 text-sm mt-1">用户管理、产线配置与系统参数设置</p>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label="用户管理" />
        <TabButton active={activeTab === 'lines'} onClick={() => setActiveTab('lines')} icon={Factory} label="产线配置" />
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Settings} label="系统参数" />
      </div>

      {activeTab === 'users' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户名</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">显示名称</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-700">{user.username}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{user.displayName}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'badge',
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      )}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-500">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user.role !== 'ADMIN' && (
                          <button className="p-1 text-gray-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'lines' && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingLine(null);
                setLineForm({ name: '', status: 'STOPPED', speed: 0, description: '' });
                setShowLineModal(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加产线
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {lines.map((line) => (
              <div key={line.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      line.status === 'RUNNING' ? 'bg-green-100' : 'bg-gray-100'
                    )}>
                      <Factory className={cn(
                        'w-6 h-6',
                        line.status === 'RUNNING' ? 'text-green-600' : 'text-gray-400'
                      )} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{line.name}</p>
                      <p className="text-sm text-gray-500">{line.description}</p>
                    </div>
                  </div>
                  <span className={cn(
                    'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                    line.status === 'RUNNING' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {line.status === 'RUNNING' ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                    {getStatusLabel(line.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm">
                    <span className="text-gray-500">运行速度: </span>
                    <span className="font-medium">{line.speed} 件/分钟</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingLine(line);
                        setLineForm({
                          name: line.name,
                          status: line.status,
                          speed: line.speed,
                          description: line.description || '',
                        });
                        setShowLineModal(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-500"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLine(line.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'settings' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">参数</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">当前值</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {settings.map((setting) => (
                  <tr key={setting.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm text-gray-700">{setting.settingKey}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        defaultValue={setting.settingValue}
                        className="input-field w-32 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{setting.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t bg-gray-50">
            <button className="btn-primary">保存设置</button>
          </div>
        </div>
      )}

      {showLineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {editingLine ? '编辑产线' : '添加产线'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">产线名称</label>
                <input
                  type="text"
                  value={lineForm.name}
                  onChange={(e) => setLineForm({ ...lineForm, name: e.target.value })}
                  className="input-field"
                  placeholder="例如：A1-外壳产线"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                <select
                  value={lineForm.status}
                  onChange={(e) => setLineForm({ ...lineForm, status: e.target.value })}
                  className="input-field"
                >
                  <option value="RUNNING">运行中</option>
                  <option value="STOPPED">已停止</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">运行速度 (件/分钟)</label>
                <input
                  type="number"
                  value={lineForm.speed}
                  onChange={(e) => setLineForm({ ...lineForm, speed: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={lineForm.description}
                  onChange={(e) => setLineForm({ ...lineForm, description: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowLineModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button onClick={handleSaveLine} className="btn-primary">
                保存
              </button>
            </div>
          </div>
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
