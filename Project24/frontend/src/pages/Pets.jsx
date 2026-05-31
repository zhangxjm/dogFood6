import { createSignal, onMount } from 'solid-js';

const Pets = () => {
  const [pets, setPets] = createSignal([]);
  const [selectedPet, setSelectedPet] = createSignal(null);
  const [showModal, setShowModal] = createSignal(false);
  const [editMode, setEditMode] = createSignal(false);
  const [formData, setFormData] = createSignal({
    name: '',
    species: '狗',
    breed: '',
    age: '',
    weight: '',
    daily_portion: ''
  });

  onMount(() => {
    fetchPets();
  });

  const fetchPets = async () => {
    try {
      const res = await fetch('/api/pets');
      const data = await res.json();
      setPets(data);
    } catch (e) {
      console.error('Failed to fetch pets');
    }
  };

  const fetchPetDetails = async (petId) => {
    try {
      const [petRes, schedulesRes, recordsRes, statsRes] = await Promise.all([
        fetch(`/api/pets/${petId}`),
        fetch(`/api/pets/${petId}/schedules`),
        fetch(`/api/pets/${petId}/records?days=7`),
        fetch(`/api/pets/${petId}/stats?days=7`)
      ]);
      
      const pet = await petRes.json();
      const schedules = await schedulesRes.json();
      const records = await recordsRes.json();
      const stats = await statsRes.json();
      
      setSelectedPet({ pet, schedules, records, stats });
    } catch (e) {
      console.error('Failed to fetch pet details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editMode() ? `/api/pets/${selectedPet()?.pet.id}` : '/api/pets';
      const method = editMode() ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData())
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchPets();
        if (editMode() && selectedPet()) {
          fetchPetDetails(selectedPet().pet.id);
        }
      }
    } catch (e) {
      console.error('Failed to save pet');
    }
  };

  const handleDelete = async (petId) => {
    if (!confirm('确定要删除这只宠物吗？')) return;
    try {
      await fetch(`/api/pets/${petId}`, { method: 'DELETE' });
      fetchPets();
      setSelectedPet(null);
    } catch (e) {
      console.error('Failed to delete pet');
    }
  };

  const openEditModal = (pet) => {
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      age: pet.age || '',
      weight: pet.weight || '',
      daily_portion: pet.daily_portion
    });
    setEditMode(true);
    setShowModal(true);
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      species: '狗',
      breed: '',
      age: '',
      weight: '',
      daily_portion: ''
    });
    setEditMode(false);
    setShowModal(true);
  };

  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">宠物管理</h1>
        <button onClick={openAddModal} class="btn btn-primary">
          + 添加宠物
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
          <div class="card">
            <h2 class="text-lg font-semibold mb-4">宠物列表</h2>
            <div class="space-y-2">
              {pets().map(pet => (
                <div
                  onClick={() => fetchPetDetails(pet.id)}
                  class={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPet()?.pet.id === pet.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="font-medium text-gray-800">{pet.name}</p>
                      <p class="text-sm text-gray-500">{pet.species} · {pet.breed || '未知品种'}</p>
                    </div>
                    <span class="text-2xl">{pet.species === '狗' ? '🐕' : '🐱'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          {selectedPet() ? (
            <div class="space-y-6">
              <div class="card">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h2 class="text-xl font-bold text-gray-800">{selectedPet().pet.name}</h2>
                    <p class="text-gray-500">{selectedPet().pet.species} · {selectedPet().pet.breed || '未知品种'}</p>
                  </div>
                  <div class="space-x-2">
                    <button onClick={() => openEditModal(selectedPet().pet)} class="btn btn-secondary text-sm">
                      编辑
                    </button>
                    <button onClick={() => handleDelete(selectedPet().pet.id)} class="btn btn-danger text-sm">
                      删除
                    </button>
                  </div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">年龄</p>
                    <p class="font-semibold">{selectedPet().pet.age || '未设置'} 岁</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">体重</p>
                    <p class="font-semibold">{selectedPet().pet.weight || '未设置'} kg</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">日投喂量</p>
                    <p class="font-semibold">{selectedPet().pet.daily_portion} g</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">创建时间</p>
                    <p class="font-semibold text-sm">{new Date(selectedPet().pet.created_at).toLocaleDateString('zh-CN')}</p>
                  </div>
                </div>
              </div>

              <div class="card">
                <h3 class="text-lg font-semibold mb-4">投喂统计（近7天）</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="bg-blue-50 p-4 rounded-lg">
                    <p class="text-sm text-blue-600">总投喂量</p>
                    <p class="text-2xl font-bold text-blue-700">{selectedPet().stats.total_portion.toFixed(1)} g</p>
                  </div>
                  <div class="bg-green-50 p-4 rounded-lg">
                    <p class="text-sm text-green-600">日均投喂量</p>
                    <p class="text-2xl font-bold text-green-700">{selectedPet().stats.avg_daily_portion.toFixed(1)} g</p>
                  </div>
                  <div class="bg-yellow-50 p-4 rounded-lg">
                    <p class="text-sm text-yellow-600">投喂次数</p>
                    <p class="text-2xl font-bold text-yellow-700">{selectedPet().stats.feeding_count}</p>
                  </div>
                  <div class="bg-purple-50 p-4 rounded-lg">
                    <p class="text-sm text-purple-600">目标完成率</p>
                    <p class="text-2xl font-bold text-purple-700">
                      {((selectedPet().stats.avg_daily_portion / selectedPet().stats.target_daily_portion) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              <div class="card">
                <h3 class="text-lg font-semibold mb-4">投喂计划</h3>
                <div class="space-y-2">
                  {selectedPet().schedules.length === 0 ? (
                    <p class="text-gray-500">暂无投喂计划</p>
                  ) : (
                    selectedPet().schedules.map(schedule => (
                      <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p class="font-medium">⏰ {schedule.time}</p>
                          <p class="text-sm text-gray-500">投喂量: {schedule.portion}g</p>
                        </div>
                        <span class={`status-badge ${schedule.enabled ? 'status-online' : 'status-offline'}`}>
                          {schedule.enabled ? '已启用' : '已禁用'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div class="card">
                <h3 class="text-lg font-semibold mb-4">最近投喂记录</h3>
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead>
                      <tr class="border-b">
                        <th class="text-left py-2 text-sm font-medium text-gray-500">时间</th>
                        <th class="text-left py-2 text-sm font-medium text-gray-500">投喂量</th>
                        <th class="text-left py-2 text-sm font-medium text-gray-500">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPet().records.slice(0, 10).map(record => (
                        <tr class="border-b border-gray-100">
                          <td class="py-2 text-sm">{new Date(record.timestamp).toLocaleString('zh-CN')}</td>
                          <td class="py-2 text-sm">{record.portion}g</td>
                          <td class="py-2">
                            <span class={`status-badge ${record.status === 'success' ? 'status-online' : 'status-offline'}`}>
                              {record.status === 'success' ? '成功' : record.status === 'pending' ? '待处理' : '失败'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div class="card text-center py-12">
              <span class="text-6xl">🐾</span>
              <p class="mt-4 text-gray-500">选择左侧宠物查看详情</p>
            </div>
          )}
        </div>
      </div>

      {showModal() && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">{editMode() ? '编辑宠物' : '添加宠物'}</h2>
            <form onSubmit={handleSubmit} class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input
                  type="text"
                  value={formData().name}
                  onInput={(e) => setFormData({ ...formData(), name: e.target.value })}
                  class="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">物种</label>
                <select
                  value={formData().species}
                  onChange={(e) => setFormData({ ...formData(), species: e.target.value })}
                  class="w-full px-3 py-2 border rounded-md"
                >
                  <option value="狗">狗</option>
                  <option value="猫">猫</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">品种</label>
                <input
                  type="text"
                  value={formData().breed}
                  onInput={(e) => setFormData({ ...formData(), breed: e.target.value })}
                  class="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">年龄（岁）</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData().age}
                    onInput={(e) => setFormData({ ...formData(), age: parseFloat(e.target.value) || 0 })}
                    class="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">体重（kg）</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData().weight}
                    onInput={(e) => setFormData({ ...formData(), weight: parseFloat(e.target.value) || 0 })}
                    class="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">日投喂量（g）</label>
                <input
                  type="number"
                  value={formData().daily_portion}
                  onInput={(e) => setFormData({ ...formData(), daily_portion: parseFloat(e.target.value) || 0 })}
                  class="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div class="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} class="btn btn-secondary">
                  取消
                </button>
                <button type="submit" class="btn btn-primary">
                  {editMode() ? '保存' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pets;
