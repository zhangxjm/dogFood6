import { createSignal, onMount, createEffect } from 'solid-js'
import { commandApi } from '../api'

export default function CommandCenter() {
  const [commands, setCommands] = createSignal([])
  const [total, setTotal] = createSignal(0)
  const [page, setPage] = createSignal(1)
  const [size, setSize] = createSignal(10)
  const [statusFilter, setStatusFilter] = createSignal('')
  const [showModal, setShowModal] = createSignal(false)
  const [newCommand, setNewCommand] = createSignal({})

  const getStatusBadge = (status) => {
    const statusMap = {
      0: { text: '待发送', class: 'badge-info' },
      1: { text: '发送中', class: 'badge-info' },
      2: { text: '执行中', class: 'badge-warning' },
      3: { text: '成功', class: 'badge-success' },
      4: { text: '失败', class: 'badge-danger' },
      5: { text: '超时', class: 'badge-danger' }
    }
    return statusMap[status] || { text: '未知', class: 'badge-info' }
  }

  const fetchCommands = async () => {
    try {
      const params = { page: page(), size: size() }
      if (statusFilter() !== '') {
        params.status = parseInt(statusFilter())
      }
      const res = await commandApi.listCommands(params)
      setCommands(res.data.list || [])
      setTotal(res.data.total || 0)
    } catch (e) {
      setCommands([])
      setTotal(0)
    }
  }

  onMount(() => {
    fetchCommands()
  })

  createEffect(() => {
    fetchCommands()
  })

  const handleSendCommand = async () => {
    setNewCommand({})
    setShowModal(true)
  }

  const submitCommand = async () => {
    const cmd = newCommand()
    if (!cmd.commandName || !cmd.targetDevice) {
      alert('请填写完整信息')
      return
    }
    try {
      await commandApi.sendCommand(cmd)
      setShowModal(false)
      fetchCommands()
    } catch (e) {
      alert('发送失败: ' + e.message)
    }
  }

  const handleExecute = async (id) => {
    try {
      await commandApi.executeCommand(id)
      fetchCommands()
    } catch (e) {
      alert('执行失败: ' + e.message)
    }
  }

  const handleCancel = async (id) => {
    if (confirm('确定取消该指令？')) {
      try {
        await commandApi.cancelCommand(id)
        fetchCommands()
      } catch (e) {
        alert('取消失败: ' + e.message)
      }
    }
  }

  return (
    <div>
      <div class="page-header">
        <h1>指令中心</h1>
        <p>测控指令发送与管理</p>
      </div>

      <div class="header-bar">
        <div class="search-box">
          <select value={statusFilter()} onInput={(e) => setStatusFilter(e.target.value)}>
            <option value="">全部状态</option>
            <option value="0">待发送</option>
            <option value="3">已完成</option>
            <option value="2">执行中</option>
            <option value="4">失败</option>
          </select>
        </div>
        <button class="btn btn-primary" onClick={handleSendCommand}>发送指令</button>
      </div>

      <div class="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>指令编号</th>
              <th>指令名称</th>
              <th>类型</th>
              <th>目标设备</th>
              <th>优先级</th>
              <th>状态</th>
              <th>操作人</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {commands().map(cmd => (
              <tr>
                <td>{cmd.id}</td>
                <td>{cmd.commandCode}</td>
                <td>{cmd.commandName}</td>
                <td>{cmd.commandType || '-'}</td>
                <td>{cmd.targetDevice}</td>
                <td>{cmd.priority}</td>
                <td>
                  <span class={`badge ${getStatusBadge(cmd.status).class}`}>
                    {getStatusBadge(cmd.status).text}
                  </span>
                </td>
                <td>{cmd.operator || '-'}</td>
                <td>{cmd.createTime || '-'}</td>
                <td>
                  {cmd.status === 0 && (
                    <>
                      <button class="btn btn-success" onClick={() => handleExecute(cmd.id)}>执行</button>
                      <button class="btn btn-danger" onClick={() => handleCancel(cmd.id)}>取消</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {total() > 0 && (
          <div class="pagination">
            <button onClick={() => setPage(Math.max(1, page() - 1))}>上一页</button>
            <button class="active">{page()}</button>
            <button onClick={() => setPage(page() + 1)}>下一页</button>
            <span style={{ marginLeft: '12px', color: '#7a8aa8' }}>共 {total()} 条</span>
          </div>
        )}
      </div>

      {showModal() && (
        <div class="modal-overlay" onClick={() => setShowModal(false)}>
          <div class="modal" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>发送新指令</h3>
              <button class="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div class="form-group">
              <label>指令名称</label>
              <input type="text" value={newCommand().commandName || ''}
                onInput={(e) => setNewCommand({ ...newCommand(), commandName: e.target.value })} />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>目标设备</label>
                <input type="text" value={newCommand().targetDevice || ''}
                  onInput={(e) => setNewCommand({ ...newCommand(), targetDevice: e.target.value })} />
              </div>
              <div class="form-group">
                <label>指令类型</label>
                <select value={newCommand().commandType || ''}
                  onInput={(e) => setNewCommand({ ...newCommand(), commandType: e.target.value })}>
                  <option value="check">检查</option>
                  <option value="control">控制</option>
                  <option value="prepare">准备</option>
                  <option value="monitor">监控</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>优先级</label>
                <select value={newCommand().priority || 1}
                  onInput={(e) => setNewCommand({ ...newCommand(), priority: parseInt(e.target.value) })}>
                  <option value="1">高</option>
                  <option value="2">中</option>
                  <option value="3">低</option>
                </select>
              </div>
              <div class="form-group">
                <label>操作人</label>
                <input type="text" value={newCommand().operator || ''}
                  onInput={(e) => setNewCommand({ ...newCommand(), operator: e.target.value })} />
              </div>
            </div>
            <div class="form-group">
              <label>指令内容</label>
              <textarea rows="3" value={newCommand().commandContent || ''}
                onInput={(e) => setNewCommand({ ...newCommand(), commandContent: e.target.value })} />
            </div>
            <div class="modal-footer">
              <button class="btn" onClick={() => setShowModal(false)}>取消</button>
              <button class="btn btn-primary" onClick={submitCommand}>确定发送</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
