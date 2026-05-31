import { createSignal, onMount, Show } from 'solid-js';

export default function ProductLines(props) {
  const [lines, setLines] = createSignal([]);
  const [showModal, setShowModal] = createSignal(false);
  const [editingLine, setEditingLine] = createSignal(null);
  const [formData, setFormData] = createSignal({ name: '', description: '', status: 'active' });

  const fetchLines = async () => {
    try {
      const res = await fetch(`${props.apiBase}/product-lines`);
      const data = await res.json();
      if (data.success) {
        setLines(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch product lines:', err);
    }
  };

  onMount(() => {
    fetchLines();
  });

  const openCreateModal = () => {
    setEditingLine(null);
    setFormData({ name: '', description: '', status: 'active' });
    setShowModal(true);
  };

  const openEditModal = (line) => {
    setEditingLine(line);
    setFormData({
      name: line.name,
      description: line.description || '',
      status: line.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData().name.trim()) {
      alert('请输入产线名称');
      return;
    }

    try {
      let res;
      if (editingLine()) {
        res = await fetch(`${props.apiBase}/product-lines/${editingLine().id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData()),
        });
      } else {
        res = await fetch(`${props.apiBase}/product-lines`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData()),
        });
      }

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchLines();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (err) {
      alert('请求失败: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除此产线吗？关联设备将被解除关联。')) return;

    try {
      const res = await fetch(`${props.apiBase}/product-lines/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchLines();
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

  return (
    <div>
      <div class="page-header">
        <h2>产线管理</h2>
        <p>管理生产产线及其相关设备</p>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>产线列表</h3>
          <button class="btn btn-primary" onClick={openCreateModal}>
            + 新建产线
          </button>
        </div>

        {lines().length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>产线名称</th>
                <th>描述</th>
                <th>设备数量</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {lines().map((line) => (
                <tr>
                  <td><strong>{line.name}</strong></td>
                  <td>{line.description || '-'}</td>
                  <td>{line.device_count}</td>
                  <td>
                    <span class={`status-badge status-${line.status === 'active' ? 'online' : 'offline'}`}>
                      {line.status === 'active' ? '运行中' : '已停用'}
                    </span>
                  </td>
                  <td>{formatTime(line.created_at)}</td>
                  <td>
                    <div class="actions-cell">
                      <button class="btn btn-outline btn-sm" onClick={() => openEditModal(line)}>
                        编辑
                      </button>
                      <button class="btn btn-danger btn-sm" onClick={() => handleDelete(line.id)}>
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div class="empty-state">
            <div class="empty-state-icon">🏭</div>
            <p>暂无产线数据</p>
          </div>
        )}
      </div>

      <Show when={showModal()}>
        <div class="modal-overlay" onClick={() => setShowModal(false)}>
          <div class="modal" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>{editingLine() ? '编辑产线' : '新建产线'}</h3>
              <button class="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div class="form-group">
              <label>产线名称 *</label>
              <input
                type="text"
                value={formData().name}
                onInput={(e) => setFormData({ ...formData(), name: e.target.value })}
                placeholder="请输入产线名称"
              />
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea
                value={formData().description}
                onInput={(e) => setFormData({ ...formData(), description: e.target.value })}
                placeholder="请输入产线描述"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label>状态</label>
              <select
                value={formData().status}
                onChange={(e) => setFormData({ ...formData(), status: e.target.value })}
              >
                <option value="active">运行中</option>
                <option value="inactive">已停用</option>
              </select>
            </div>
            <div class="form-actions">
              <button class="btn btn-outline" onClick={() => setShowModal(false)}>取消</button>
              <button class="btn btn-primary" onClick={handleSubmit}>
                {editingLine() ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
