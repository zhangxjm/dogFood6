import { createSignal, onMount } from 'solid-js'
import { payloadApi } from '../api'

export default function DeviceManagement() {
  const [devices, setDevices] = createSignal([])
  const [showModal, setShowModal] = createSignal(false)
  const [editingDevice, setEditingDevice] = createSignal(null)
  const [formData, setFormData] = createSignal({})

  const fetchDevices = async () => {
    try {
      const res = await payloadApi.getDeviceList()
      setDevices(res.data || [])
    } catch (e) {
        setDevices([])
    }
  }

  onMount(() => {
    fetchDevices()
  })

  const getStatusBadge = (status) => {
    return status === 1
      ? { text: '在线', class: 'badge-success' }
      : { text: '离线', class: 'badge-danger' }
  }

  const handleAdd = () => {
    setEditingDevice(null)
    setFormData({ status: 1 })
    setShowModal(true)
  }

  const handleEdit = (device) => {
    setEditingDevice(device)
    setFormData({ ...device })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('确定删除该设备？')) {
      try {
        await payloadApi.deleteDevice(id)
        fetchDevices()
      } catch (e) {
        alert('删除失败: ' + e.message)
      }
    }
  }

  const submitForm = async () => {
    const data = formData()
    if (!data.deviceCode || !data.deviceName) {
      alert('请填写设备编码和名称')
      return
    }
    try {
      if (editingDevice()) {
        await payloadApi.updateDevice(data)
      } else {
        await payloadApi.addDevice(data)
      }
      setShowModal(false)
      fetchDevices()
    } catch (e) {
      alert('保存失败: ' + e.message)
    }
  }

  return (
    <div>
      <div class="page-header">
        <h1>设备管理</h1>
        <p>测控设备信息管理</p>
      </div>

      <div class="header-bar">
        <div class="search-box">
          <input type="text" placeholder="搜索设备..." />
        </div>
        <button class="btn btn-primary" onClick={handleAdd}>添加设备</button>
      </div>

      <div class="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>设备编码</th>
              <th>设备名称</th>
              <th>设备类型</th>
              <th>位置</th>
              <th>状态</th>
              <th>描述</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {devices().map(device => (
              <tr>
                <td>{device.id}</td>
                <td>{device.deviceCode}</td>
                <td>{device.deviceName}</td>
                <td>{device.deviceType || '-'}</td>
                <td>{device.location || '-'}</td>
                <td>
                  <span class={`badge ${getStatusBadge(device.status).class}`}>
                    {getStatusBadge(device.status).text}
                  </span>
                </td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {device.description || '-'}
                </td>
                <td>{device.createTime || '-'}</td>
                <td>
                  <button class="btn btn-primary" onClick={() => handleEdit(device)}>编辑</button>
                  <button class="btn btn-danger" onClick={() => handleDelete(device.id)}>删除</button>
                </td>
              </tr>
            ))}
            {devices().length === 0 && (
              <tr>
                <td colspan="9" style={{ textAlign: 'center', color: '#7a8aa8' }}>
                  暂无设备数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal() && (
        <div class="modal-overlay" onClick={() => setShowModal(false)}>
          <div class="modal" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>{editingDevice() ? '编辑设备' : '添加设备'}</h3>
              <button class="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>设备编码</label>
                <input type="text" value={formData().deviceCode || ''}
                  onInput={(e) => setFormData({ ...formData(), deviceCode: e.target.value })} />
              </div>
              <div class="form-group">
                <label>设备名称</label>
                <input type="text" value={formData().deviceName || ''}
                  onInput={(e) => setFormData({ ...formData(), deviceName: e.target.value })} />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>设备类型</label>
                <select value={formData().deviceType || ''}
                  onInput={(e) => setFormData({ ...formData(), deviceType: e.target.value })}>
                  <option value="">请选择</option>
                  <option value="control">控制设备</option>
                  <option value="sensor">传感器</option>
                  <option value="monitor">监控设备</option>
                  <option value="telemetry">遥测设备</option>
                </select>
              </div>
              <div class="form-group">
                <label>状态</label>
                <select value={formData().status || 1}
                  onInput={(e) => setFormData({ ...formData(), status: parseInt(e.target.value) })}>
                  <option value="1">在线</option>
                  <option value="0">离线</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>位置</label>
              <input type="text" value={formData().location || ''}
                onInput={(e) => setFormData({ ...formData(), location: e.target.value })} />
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea rows="3" value={formData().description || ''}
                onInput={(e) => setFormData({ ...formData(), description: e.target.value })} />
            </div>
            <div class="modal-footer">
              <button class="btn" onClick={() => setShowModal(false)}>取消</button>
              <button class="btn btn-primary" onClick={submitForm}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
