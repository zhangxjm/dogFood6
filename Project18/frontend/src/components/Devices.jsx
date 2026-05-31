import { createSignal, onMount, Show, For } from 'solid-js';

export default function Devices(props) {
  const [devices, setDevices] = createSignal([]);
  const [productLines, setProductLines] = createSignal([]);
  const [showModal, setShowModal] = createSignal(false);
  const [editingDevice, setEditingDevice] = createSignal(null);
  const [formData, setFormData] = createSignal({
    name: '',
    ip_address: '',
    product_line: '',
    status: 'offline',
  });

  const fetchData = async () => {
    try {
      const [devicesRes, linesRes] = await Promise.all([
        fetch(`${props.apiBase}/devices`),
        fetch(`${props.apiBase}/product-lines`),
      ]);
      const devicesData = await devicesRes.json();
      const linesData = await linesRes.json();

      if (devicesData.success) {
        setDevices(devicesData.data);
      }
      if (linesData.success) {
        setProductLines(linesData.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  onMount(() => {
    fetchData();
  });

  const openCreateModal = () => {
    setEditingDevice(null);
    setFormData({ name: '', ip_address: '', product_line: '', status: 'offline' });
    setShowModal(true);
  };

  const openEditModal = (device) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      ip_address: device.ip_address,
      product_line: device.product_line || '',
      status: device.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData().name.trim()) {
      alert('请输入设备名称');
      return;
    }

    try {
      let res;
      if (editingDevice()) {
        res = await fetch(`${props.apiBase}/devices/${editingDevice().id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData()),
        });
      } else {
        res = await fetch(`${props.apiBase}/devices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData()),
        });
      }

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchData();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (err) {
      alert('请求失败: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除此设备吗？')) return;

    try {
      const res = await fetch(`${props.apiBase}/devices/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (err) {
      alert('删除失败: ' + err.message);
    }
  };

  const formatTime = (time) => {
    if (!time) return '-';
    const date = new Date(time);
    return date.toLocaleString('zh-CN');
  };

  const getLineName = (lineId) => {
    const line = productLines().find((l) => l.id === lineId);
    return line ? line.name : '-';
  };

  return (
    <div>
      <div class="page-header">
        <h2>设备管理</h2>
        <p>管理边缘计算设备和网关</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>设备列表</h3>
          <button class="btn btn-primary" onClick={openCreateModal}>
            + 新增设备
          </button>
        </div>

        {devices().length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>设备名称</th>
                <th>IP地址</th>
                <th>所属产线</th>
                <th>状态</th>
                <th>CPU使用率</th>
                <th>内存使用率</th>
                <th>最后在线</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <For each={devices()}>
                {(device) => (
                  <tr>
                    <td><strong>{device.name}</strong></td>
                    <td>{device.ip_address}</td>
                    <td>{getLineName(device.product_line)}</td>
                    <td>
                      <span class={`status-badge status-${device.status}`}>
                        {device.status === 'online' ? '在线' : '离线'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
                        <div class="progress-bar" style={{ width: '80px' }}>
                          <div class="progress-fill cpu" style={{ width: `${device.cpu_usage}%` }}></div>
                        </div>
                        <span style={{ 'font-size': '12px' }}>{device.cpu_usage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
                        <div class="progress-bar" style={{ width: '80px' }}>
                          <div class="progress-fill memory" style={{ width: `${device.memory_usage}%` }}></div>
                        </div>
                        <span style={{ 'font-size': '12px' }}>{device.memory_usage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>{formatTime(device.last_seen)}</td>
                    <td>
                      <div class="actions-cell">
                        <button class="btn btn-outline btn-sm" onClick={() => openEditModal(device)}>
                          编辑
                        </button>
                        <button class="btn btn-danger btn-sm" onClick={() => handleDelete(device.id)}>
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        ) : (
          <div class="empty-state">
            <div class="empty-state-icon">⚙️</div>
            <p>暂无设备数据</p>
          </div>
        )}
      </div>

      <Show when={showModal()}>
        <div class="modal-overlay" onClick={() => setShowModal(false)}>
          <div class="modal" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>{editingDevice() ? '编辑设备' : '新增设备'}</h3>
              <button class="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div class="form-group">
              <label>设备名称 *</label>
              <input
                type="text"
                value={formData().name}
                onInput={(e) => setFormData({ ...formData(), name: e.target.value })}
                placeholder="请输入设备名称"
              />
            </div>
            <div class="form-group">
              <label>IP地址</label>
              <input
                type="text"
                value={formData().ip_address}
                onInput={(e) => setFormData({ ...formData(), ip_address: e.target.value })}
                placeholder="192.168.1.100"
              />
            </div>
            <div class="form-group">
              <label>所属产线</label>
              <select
                value={formData().product_line}
                onChange={(e) => setFormData({ ...formData(), product_line: e.target.value })}
              >
                <option value="">无</option>
                <For each={productLines()}>
                  {(line) => (
                    <option value={line.id}>{line.name}</option>
                  )}
                </For>
              </select>
            </div>
            <div class="form-group">
              <label>状态</label>
              <select
                value={formData().status}
                onChange={(e) => setFormData({ ...formData(), status: e.target.value })}
              >
                <option value="online">在线</option>
                <option value="offline">离线</option>
              </select>
            </div>
            <div class="form-actions">
              <button class="btn btn-outline" onClick={() => setShowModal(false)}>取消</button>
              <button class="btn btn-primary" onClick={handleSubmit}>
                {editingDevice() ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
