import { createSignal, onMount } from 'solid-js'
import { monitorApi } from '../api'

export default function AlertCenter() {
  const [alerts, setAlerts] = createSignal([])
  const [total, setTotal] = createSignal(0)
  const [page, setPage] = createSignal(1)
  const [size, setSize] = createSignal(10)
  const [statusFilter, setStatusFilter] = createSignal('')
  const [levelFilter, setLevelFilter] = createSignal('')
  const [showModal, setShowModal] = createSignal(false)
  const [selectedAlert, setSelectedAlert] = createSignal(null)
  const [handleForm, setHandleForm] = createSignal({})

  const fetchAlerts = async () => {
    try {
      const params = { page: page(), size: size() }
      if (statusFilter() !== '') params.status = parseInt(statusFilter())
      if (levelFilter() !== '') params.alertLevel = levelFilter()
      const res = await monitorApi.listAlerts(params)
      setAlerts(res.data.list || [])
      setTotal(res.data.total || 0)
    } catch (e) {
        setAlerts([])
        setTotal(0)
    }
  }

  onMount(() => {
    fetchAlerts()
  })

  const getLevelBadge = (level) => {
    const levelMap = {
      'high': { text: '高危', class: 'badge-danger' },
      'medium': { text: '中危', class: 'badge-warning' },
      'low': { text: '低危', class: 'badge-info' }
    }
    return levelMap[level] || { text: '未知', class: 'badge-info' }
  }

  const getStatusBadge = (status) => {
    return status === 0
      ? { text: '待处理', class: 'badge-warning' }
      : { text: '已处理', class: 'badge-success' }
  }

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert)
    setHandleForm({ handler: '', handleResult: '' })
    setShowModal(true)
  }

  const submitHandle = async () => {
    if (!handleForm().handler || !handleForm().handleResult) {
      alert('请填写处理信息')
      return
    }
    try {
      await monitorApi.handleAlert(selectedAlert().id, handleForm())
      setShowModal(false)
      fetchAlerts()
    } catch (e) {
      alert('处理失败: ' + e.message)
    }
  }

  return (
    <div>
      <div class="page-header">
        <h1>告警中心</h1>
        <p>系统告警管理与处理</p>
      </div>

      <div class="stat-grid">
        <div class="stat-card danger">
          <div class="stat-value" style={{ fontSize: '28px' }}>{alerts().filter(a => a.alertLevel === 'high' && a.status === 0).length}</div>
          <div class="stat-label">待处理高危告警</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-value" style={{ fontSize: '28px' }}>{alerts().filter(a => a.alertLevel === 'medium' && a.status === 0).length}</div>
          <div class="stat-label">待处理中危告警</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style={{ fontSize: '28px' }}>{alerts().filter(a => a.status === 0).length}</div>
          <div class="stat-label">待处理总数</div>
        </div>
        <div class="stat-card success">
          <div class="stat-value" style={{ fontSize: '28px' }}>{alerts().filter(a => a.status === 1).length}</div>
          <div class="stat-label">已处理告警</div>
        </div>
      </div>

      <div class="header-bar">
        <div class="search-box">
          <select value={statusFilter()} onInput={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">全部状态</option>
            <option value="0">待处理</option>
            <option value="1">已处理</option>
          </select>
          <select value={levelFilter()} onInput={(e) => { setLevelFilter(e.target.value); setPage(1) }}>
            <option value="">全部级别</option>
            <option value="high">高危</option>
            <option value="medium">中危</option>
            <option value="low">低危</option>
          </select>
        </div>
      </div>

      <div class="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>告警类型</th>
              <th>告警级别</th>
              <th>告警内容</th>
              <th>来源</th>
              <th>设备</th>
              <th>状态</th>
              <th>告警时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {alerts().map(alert => (
              <tr>
                <td>{alert.id}</td>
                <td>{alert.alertType || '-'}</td>
                <td>
                  <span class={`badge ${getLevelBadge(alert.alertLevel).class}`}>
                    {getLevelBadge(alert.alertLevel).text}
                  </span>
                </td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {alert.alertContent}
                </td>
                <td>{alert.source || '-'}</td>
                <td>{alert.deviceCode || '-'}</td>
                <td>
                  <span class={`badge ${getStatusBadge(alert.status).class}`}>
                    {getStatusBadge(alert.status).text}
                  </span>
                </td>
                <td>{alert.alertTime || '-'}</td>
                <td>
                  {alert.status === 0 && (
                    <button class="btn btn-primary" onClick={() => handleAlertClick(alert)}>处理</button>
                  )}
                </td>
              </tr>
            ))}
            {alerts().length === 0 && (
                <tr>
                  <td colspan="9" style={{ textAlign: 'center', color: '#7a8aa8' }}>
                    暂无告警数据
                  </td>
                </tr>
            )}
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
              <h3>处理告警</h3>
              <button class="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div class="form-group">
              <label>告警内容</label>
              <div style={{ padding: '12px', background: 'rgba(13, 26, 48, 0.6)', borderRadius: '4px', color: '#aab8d0' }}>
                {selectedAlert()?.alertContent}
              </div>
            </div>
            <div class="form-group">
              <label>处理人</label>
              <input type="text" value={handleForm().handler || ''}
                onInput={(e) => setHandleForm({ ...handleForm(), handler: e.target.value })} />
            </div>
            <div class="form-group">
              <label>处理结果</label>
              <textarea rows="4" value={handleForm().handleResult || ''}
                onInput={(e) => setHandleForm({ ...handleForm(), handleResult: e.target.value })} />
            </div>
            <div class="modal-footer">
              <button class="btn" onClick={() => setShowModal(false)}>取消</button>
              <button class="btn btn-primary" onClick={submitHandle}>确认处理</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
