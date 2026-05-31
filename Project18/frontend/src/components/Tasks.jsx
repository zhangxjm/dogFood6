import { createSignal, onMount, Show, For } from 'solid-js';

const taskTypes = [
  { value: 'data_collection', label: '数据采集' },
  { value: 'diagnostic', label: '设备诊断' },
  { value: 'anomaly_detection', label: '异常检测' },
  { value: 'energy_analysis', label: '能耗分析' },
  { value: 'predictive_maintenance', label: '预测性维护' },
];

export default function Tasks(props) {
  const [tasks, setTasks] = createSignal([]);
  const [devices, setDevices] = createSignal([]);
  const [showModal, setShowModal] = createSignal(false);
  const [formData, setFormData] = createSignal({
    name: '',
    type: 'data_collection',
    device_id: '',
    priority: 5,
    payload: '{}',
  });

  const fetchData = async () => {
    try {
      const [tasksRes, devicesRes] = await Promise.all([
        fetch(`${props.apiBase}/tasks`),
        fetch(`${props.apiBase}/devices`),
      ]);
      const tasksData = await tasksRes.json();
      const devicesData = await devicesRes.json();

      if (tasksData.success) {
        setTasks(tasksData.data);
      }
      if (devicesData.success) {
        setDevices(devicesData.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  onMount(() => {
    fetchData();
  });

  const openCreateModal = () => {
    setFormData({
      name: '',
      type: 'data_collection',
      device_id: '',
      priority: 5,
      payload: '{}',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData().name.trim()) {
      alert('请输入任务名称');
      return;
    }

    try {
      const res = await fetch(`${props.apiBase}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData()),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchData();
      } else {
        alert(data.error || '创建失败');
      }
    } catch (err) {
      alert('请求失败: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除此任务吗？')) return;

    try {
      const res = await fetch(`${props.apiBase}/tasks/${id}`, {
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

  const getDeviceName = (deviceId) => {
    if (!deviceId) return '-';
    const device = devices().find((d) => d.id === deviceId);
    return device ? device.name : '-';
  };

  const getTypeLabel = (type) => {
    const t = taskTypes.find((t) => t.value === type);
    return t ? t.label : type;
  };

  return (
    <div>
      <div class="page-header">
        <h2>任务调度</h2>
        <p>管理边缘计算任务的分发与执行</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>任务列表</h3>
          <button class="btn btn-primary" onClick={openCreateModal}>
            + 新建任务
          </button>
        </div>

        {tasks().length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>任务名称</th>
                <th>类型</th>
                <th>目标设备</th>
                <th>优先级</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>完成时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <For each={tasks()}>
                {(task) => (
                  <tr>
                    <td><strong>{task.name}</strong></td>
                    <td>{getTypeLabel(task.type)}</td>
                    <td>{getDeviceName(task.device_id)}</td>
                    <td>
                      <span style={{
                        background: task.priority > 7 ? 'rgba(239, 68, 68, 0.2)' :
                                   task.priority > 4 ? 'rgba(245, 158, 11, 0.2)' :
                                   'rgba(59, 130, 246, 0.2)',
                        color: task.priority > 7 ? 'var(--danger)' :
                               task.priority > 4 ? 'var(--warning)' : 'var(--primary)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span class={`status-badge status-${task.status}`}>
                        {task.status === 'pending' ? '等待中' :
                         task.status === 'running' ? '运行中' :
                         task.status === 'completed' ? '已完成' :
                         task.status === 'error' ? '错误' : task.status}
                      </span>
                    </td>
                    <td>{formatTime(task.created_at)}</td>
                    <td>{formatTime(task.completed_at)}</td>
                    <td>
                      <button class="btn btn-danger btn-sm" onClick={() => handleDelete(task.id)}>
                        删除
                      </button>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        ) : (
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <p>暂无任务数据</p>
          </div>
        )}
      </div>

      <Show when={showModal()}>
        <div class="modal-overlay" onClick={() => setShowModal(false)}>
          <div class="modal" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>新建任务</h3>
              <button class="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div class="form-group">
              <label>任务名称 *</label>
              <input
                type="text"
                value={formData().name}
                onInput={(e) => setFormData({ ...formData(), name: e.target.value })}
                placeholder="请输入任务名称"
              />
            </div>
            <div class="form-group">
              <label>任务类型</label>
              <select
                value={formData().type}
                onChange={(e) => setFormData({ ...formData(), type: e.target.value })}
              >
                <For each={taskTypes}>
                  {(type) => (
                    <option value={type.value}>{type.label}</option>
                  )}
                </For>
              </select>
            </div>
            <div class="form-group">
              <label>目标设备</label>
              <select
                value={formData().device_id}
                onChange={(e) => setFormData({ ...formData(), device_id: e.target.value })}
              >
                <option value="">全部设备</option>
                <For each={devices()}>
                  {(device) => (
                    <option value={device.id}>{device.name}</option>
                  )}
                </For>
              </select>
            </div>
            <div class="form-group">
              <label>优先级 (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData().priority}
                onInput={(e) => setFormData({ ...formData(), priority: parseInt(e.target.value) || 5 })}
              />
            </div>
            <div class="form-group">
              <label>任务参数 (JSON)</label>
              <textarea
                value={formData().payload}
                onInput={(e) => setFormData({ ...formData(), payload: e.target.value })}
                rows="3"
                placeholder='{"key": "value"}'
              ></textarea>
            </div>
            <div class="form-actions">
              <button class="btn btn-outline" onClick={() => setShowModal(false)}>取消</button>
              <button class="btn btn-primary" onClick={handleSubmit}>创建</button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
