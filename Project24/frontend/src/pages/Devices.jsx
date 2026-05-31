import { createSignal, onMount } from 'solid-js';

const Devices = () => {
  const [devices, setDevices] = createSignal([]);
  const [selectedDevice, setSelectedDevice] = createSignal(null);
  const [showModal, setShowModal] = createSignal(false);
  const [feedModal, setFeedModal] = createSignal(false);
  const [feedForm, setFeedForm] = createSignal({ portion: 50, pet_id: 1 });
  const [formData, setFormData] = createSignal({
    name: '',
    device_type: 'feeder',
    mqtt_topic: ''
  });

  onMount(() => {
    fetchDevices();
    setInterval(fetchDevices, 10000);
  });

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      setDevices(data);
    } catch (e) {
      console.error('Failed to fetch devices');
    }
  };

  const fetchDeviceDetails = async (deviceId) => {
    try {
      const [deviceRes, statusRes] = await Promise.all([
        fetch(`/api/devices/${deviceId}`),
        fetch(`/api/devices/${deviceId}/status?days=1`)
      ]);
      
      const device = await deviceRes.json();
      const statusHistory = await statusRes.json();
      
      setSelectedDevice({ device, statusHistory });
    } catch (e) {
      console.error('Failed to fetch device details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData())
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchDevices();
      }
    } catch (e) {
      console.error('Failed to create device');
    }
  };

  const handleDelete = async (deviceId) => {
    if (!confirm('确定要删除这个设备吗？')) return;
    try {
      await fetch(`/api/devices/${deviceId}`, { method: 'DELETE' });
      fetchDevices();
      setSelectedDevice(null);
    } catch (e) {
      console.error('Failed to delete device');
    }
  };

  const sendCommand = async (deviceId, command, extraData = {}) => {
    try {
      const res = await fetch(`/api/devices/${deviceId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, ...extraData })
      });
      const data = await res.json();
      alert(data.message);
    } catch (e) {
      console.error('Failed to send command');
    }
  };

  const handleFeed = async () => {
    if (!selectedDevice()) return;
    try {
      const res = await fetch(`/api/devices/${selectedDevice().device.id}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedForm())
      });
      const data = await res.json();
      alert(data.message);
      setFeedModal(false);
    } catch (e) {
      console.error('Failed to feed');
    }
  };

  const toggleLowPower = async (deviceId, enabled) => {
    sendCommand(deviceId, 'low_power', { enabled });
    fetchDeviceDetails(deviceId);
  };

  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">设备管理</h1>
        <button onClick={() => setShowModal(true)} class="btn btn-primary">
          + 添加设备
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
          <div class="card">
            <h2 class="text-lg font-semibold mb-4">设备列表</h2>
            <div class="space-y-2">
              {devices().map(device => (
                <div
                  onClick={() => fetchDeviceDetails(device.id)}
                  class={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedDevice()?.device.id === device.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="font-medium text-gray-800">{device.name}</p>
                      <p class="text-sm text-gray-500">{device.device_type}</p>
                    </div>
                    <div class="text-right">
                      <span class={`status-badge ${device.status === 'online' ? 'status-online' : 'status-offline'}`}>
                        {device.status === 'online' ? '在线' : '离线'}
                      </span>
                      {device.low_power_mode && (
                        <div class="mt-1">
                          <span class="status-badge status-low-power">低功耗</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div class="mt-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-500">电量</span>
                      <span class={device.battery_level < 20 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                        {device.battery_level.toFixed(1)}%
                      </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        class={`h-2 rounded-full transition-all ${
                          device.battery_level < 20 ? 'bg-red-500' : 
                          device.battery_level < 50 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${device.battery_level}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          {selectedDevice() ? (
            <div class="space-y-6">
              <div class="card">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h2 class="text-xl font-bold text-gray-800">{selectedDevice().device.name}</h2>
                    <p class="text-gray-500">{selectedDevice().device.device_type}</p>
                  </div>
                  <div class="space-x-2">
                    <button onClick={() => setFeedModal(true)} class="btn btn-success text-sm">
                      立即投喂
                    </button>
                    <button onClick={() => handleDelete(selectedDevice().device.id)} class="btn btn-danger text-sm">
                      删除
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p class="text-sm text-gray-500">状态</p>
                    <p class="font-semibold">
                      <span class={`status-badge ${selectedDevice().device.status === 'online' ? 'status-online' : 'status-offline'}`}>
                        {selectedDevice().device.status === 'online' ? '在线' : '离线'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">电量</p>
                    <p class="font-semibold">{selectedDevice().device.battery_level.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">低功耗模式</p>
                    <p class="font-semibold">
                      <span class={`status-badge ${selectedDevice().device.low_power_mode ? 'status-low-power' : 'status-online'}`}>
                        {selectedDevice().device.low_power_mode ? '已开启' : '已关闭'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">最后心跳</p>
                    <p class="font-semibold text-sm">
                      {selectedDevice().device.last_heartbeat 
                        ? new Date(selectedDevice().device.last_heartbeat).toLocaleTimeString('zh-CN')
                        : '未知'}
                    </p>
                  </div>
                </div>

                <div class="space-y-4">
                  <h3 class="font-semibold">设备控制</h3>
                  <div class="flex flex-wrap gap-3">
                    <button 
                      onClick={() => sendCommand(selectedDevice().device.id, 'reboot')}
                      class="btn btn-secondary"
                    >
                      🔄 重启设备
                    </button>
                    <button 
                      onClick={() => toggleLowPower(selectedDevice().device.id, !selectedDevice().device.low_power_mode)}
                      class={`btn ${selectedDevice().device.low_power_mode ? 'btn-success' : 'btn-warning'}`}
                    >
                      ⚡ {selectedDevice().device.low_power_mode ? '退出低功耗' : '进入低功耗'}
                    </button>
                  </div>

                  <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-600">
                      <strong>MQTT 主题:</strong> {selectedDevice().device.mqtt_topic}
                    </p>
                  </div>
                </div>
              </div>

              <div class="card">
                <h3 class="text-lg font-semibold mb-4">状态历史（最近24小时）</h3>
                <div class="h-64 overflow-y-auto">
                  {selectedDevice().statusHistory.length === 0 ? (
                    <p class="text-gray-500 text-center py-8">暂无状态记录</p>
                  ) : (
                    <div class="space-y-2">
                      {selectedDevice().statusHistory.map((status, idx) => (
                        <div key={idx} class="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div class="flex items-center space-x-3">
                            <span class={`status-badge ${status.status === 'online' ? 'status-online' : 'status-offline'}`}>
                              {status.status === 'online' ? '在线' : '离线'}
                            </span>
                            {status.battery_level !== null && (
                              <span class="text-sm text-gray-600">电量: {status.battery_level.toFixed(1)}%</span>
                            )}
                            {status.signal_strength !== null && (
                              <span class="text-sm text-gray-600">信号: {status.signal_strength}%</span>
                            )}
                          </div>
                          <span class="text-xs text-gray-500">
                            {new Date(status.timestamp).toLocaleTimeString('zh-CN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div class="card text-center py-12">
              <span class="text-6xl">📱</span>
              <p class="mt-4 text-gray-500">选择左侧设备查看详情</p>
            </div>
          )}
        </div>
      </div>

      {showModal() && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">添加设备</h2>
            <form onSubmit={handleSubmit} class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">设备名称</label>
                <input
                  type="text"
                  value={formData().name}
                  onInput={(e) => setFormData({ ...formData(), name: e.target.value })}
                  class="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">设备类型</label>
                <select
                  value={formData().device_type}
                  onChange={(e) => setFormData({ ...formData(), device_type: e.target.value })}
                  class="w-full px-3 py-2 border rounded-md"
                >
                  <option value="feeder">喂食器</option>
                  <option value="water_dispenser">饮水机</option>
                  <option value="camera">摄像头</option>
                  <option value="sensor">传感器</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">MQTT 主题</label>
                <input
                  type="text"
                  value={formData().mqtt_topic}
                  onInput={(e) => setFormData({ ...formData(), mqtt_topic: e.target.value })}
                  class="w-full px-3 py-2 border rounded-md"
                  placeholder="petfeeder/device001"
                  required
                />
              </div>
              <div class="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} class="btn btn-secondary">
                  取消
                </button>
                <button type="submit" class="btn btn-primary">
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {feedModal() && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">立即投喂</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">投喂量 (g)</label>
                <input
                  type="number"
                  value={feedForm().portion}
                  onInput={(e) => setFeedForm({ ...feedForm(), portion: parseInt(e.target.value) || 0 })}
                  class="w-full px-3 py-2 border rounded-md"
                  min="1"
                  max="500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">宠物 ID</label>
                <input
                  type="number"
                  value={feedForm().pet_id}
                  onInput={(e) => setFeedForm({ ...feedForm(), pet_id: parseInt(e.target.value) || 1 })}
                  class="w-full px-3 py-2 border rounded-md"
                  min="1"
                />
              </div>
              <div class="flex justify-end space-x-2 pt-4">
                <button onClick={() => setFeedModal(false)} class="btn btn-secondary">
                  取消
                </button>
                <button onClick={handleFeed} class="btn btn-success">
                  确认投喂
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;
