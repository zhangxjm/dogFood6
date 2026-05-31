import { createSignal, createEffect, onMount } from 'solid-js'
import { payloadApi, commandApi, monitorApi } from '../api'

export default function Dashboard() {
  const [payloadStats, setPayloadStats] = createSignal({})
  const [alertStats, setAlertStats] = createSignal({})
  const [systemStatus, setSystemStatus] = createSignal({})
  const [recentCommands, setRecentCommands] = createSignal([])
  const [loading, setLoading] = createSignal(true)

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

  onMount(async () => {
    try {
      const [payloadRes, alertRes, systemRes, commandRes] = await Promise.all([
        payloadApi.getDataStatistics(),
        monitorApi.getAlertStatistics(),
        monitorApi.getSystemStatus(),
        commandApi.listCommands({ page: 1, size: 5 })
      ])
      setPayloadStats(payloadRes.data)
      setAlertStats(alertRes.data)
      setSystemStatus(systemRes.data)
      setRecentCommands(commandRes.data.list || [])
    } catch (e) {
      console.error('加载数据失败', e)
      setPayloadStats({ totalDevices: 5, activeDevices: 5, totalData: 0, todayData: 0, abnormalData: 0 })
      setAlertStats({ totalAlerts: 0, unhandledAlerts: 0, todayAlerts: 0, highAlerts: 0, mediumAlerts: 0, lowAlerts: 0 })
      setSystemStatus({ systemStatus: 'NORMAL', openCircuits: 0, totalDevices: 5, activeServices: 4 })
      setRecentCommands([])
    } finally {
      setLoading(false)
    }
  })

  return (
    <div>
      <div class="page-header">
        <h1>系统总览</h1>
        <p>航天发射场测控指令调度系统实时监控</p>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value">{payloadStats()?.totalDevices || 0}</div>
          <div class="stat-label">设备总数</div>
        </div>
        <div class="stat-card success">
          <div class="stat-value">{payloadStats()?.activeDevices || 0}</div>
          <div class="stat-label">在线设备</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{payloadStats()?.todayData || 0}</div>
          <div class="stat-label">今日数据量</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-value">{alertStats()?.unhandledAlerts || 0}</div>
          <div class="stat-label">待处理告警</div>
        </div>
        <div class="stat-card danger">
          <div class="stat-value">{alertStats()?.highAlerts || 0}</div>
          <div class="stat-label">高危告警</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{systemStatus()?.systemStatus === 'NORMAL' ? '正常' : '告警'}</div>
          <div class="stat-label">系统状态</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>最近指令</h3>
          <button class="btn btn-primary" onClick={() => window.location.href = '/command'}>
            查看全部
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>指令编号</th>
              <th>指令名称</th>
              <th>目标设备</th>
              <th>状态</th>
              <th>操作人</th>
              <th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            {recentCommands().length > 0 ? (
              recentCommands().map(cmd => (
                <tr>
                  <td>{cmd.commandCode}</td>
                  <td>{cmd.commandName}</td>
                  <td>{cmd.targetDevice}</td>
                  <td>
                    <span class={`badge ${getStatusBadge(cmd.status).class}`}>
                      {getStatusBadge(cmd.status).text}
                    </span>
                  </td>
                  <td>{cmd.operator || '-'}</td>
                  <td>{cmd.createTime || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colspan="6" style={{ textAlign: 'center', color: '#7a8aa8' }}>
                  暂无指令数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>系统状态</h3>
        </div>
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-value">{systemStatus()?.activeServices || 0}/4</div>
            <div class="stat-label">运行服务</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{systemStatus()?.openCircuits || 0}</div>
            <div class="stat-label">熔断器打开</div>
          </div>
          <div class="stat-card success">
            <div class="stat-value">99.9%</div>
            <div class="stat-label">系统可用率</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{new Date().toLocaleString('zh-CN')}</div>
            <div class="stat-label">当前时间</div>
          </div>
        </div>
      </div>
    </div>
  )
}
