import { createSignal, onMount, onCleanup } from 'solid-js'
import { payloadApi } from '../api'

export default function PayloadMonitor() {
  const [devices, setDevices] = createSignal([])
  const [selectedDevice, setSelectedDevice] = createSignal(null)
  const [realtimeData, setRealtimeData] = createSignal({})
  const [payloadData, setPayloadData] = createSignal([])
  const [activeTab, setActiveTab] = createSignal('realtime')
  let timer = null

  const fetchDevices = async () => {
    try {
      const res = await payloadApi.getDeviceList()
      setDevices(res.data || [])
    } catch (e) {
        setDevices([])
    }
  }

  const fetchRealtimeData = async (deviceCode) => {
    try {
      const res = await payloadApi.getRealtimeData(deviceCode)
      setRealtimeData(res.data || {})
    } catch (e) {
        setRealtimeData({})
    }
  }

  const fetchPayloadData = async (deviceCode) => {
    try {
      const res = await payloadApi.listData({ page: 1, size: 20, deviceCode })
      setPayloadData(res.data?.list || [])
    } catch (e) {
        setPayloadData([])
    }
  }

  const getStatusBadge = (status) => {
    return status === 1 ? { text: '在线', class: 'badge-success' } : { text: '离线', class: 'badge-danger' }
  }

  const getDataStatusBadge = (status) => {
    if (status === 0) return { text: '正常', class: 'badge-success' }
    if (status === 1) return { text: '异常', class: 'badge-danger' }
    return { text: '熔断', class: 'badge-warning' }
  }

  const handleDeviceClick = (device) => {
    setSelectedDevice(device)
    fetchRealtimeData(device.deviceCode)
    fetchPayloadData(device.deviceCode)
  }

  onMount(async () => {
    await fetchDevices()
    timer = setInterval(() => {
      if (selectedDevice()) {
        fetchRealtimeData(selectedDevice().deviceCode)
      }
    }, 3000)
  })

  onCleanup(() => {
    if (timer) clearInterval(timer)
  })

  return (
    <div>
      <div class="page-header">
        <h1>载荷监控</h1>
        <p>实时载荷数据采集与监控</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        <div>
          <div class="card">
            <div class="card-header">
              <h3>设备列表</h3>
            </div>
            <div class="device-grid" style={{ gridTemplateColumns: '1fr' }}>
              {devices().map(device => (
                <div 
                  class="device-card" 
                  style={{ 
                    cursor: 'pointer', 
                    borderColor: selectedDevice()?.deviceCode === device.deviceCode ? '#4aa8ff' : undefined
                  }}
                  onClick={() => handleDeviceClick(device)}
                >
                  <div class="device-name">{device.deviceName}</div>
                  <div class="device-code">{device.deviceCode}</div>
                  <div class="device-info">
                    <div>类型: {device.deviceType || '-'}</div>
                    <div>位置: {device.location || '-'}</div>
                  </div>
                  <div class="device-status">
                    <span class={`badge ${getStatusBadge(device.status).class}`}>
                      {getStatusBadge(device.status).text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          {selectedDevice() ? (
            <div>
              <div class="card">
                <div class="card-header">
                  <h3>{selectedDevice().deviceName} - 实时数据</h3>
                  <span class="badge badge-info">每3秒自动刷新</span>
                </div>
                <div class="stat-grid">
                  {Object.entries(realtimeData()).map(([key, data]) => (
                    <div class="stat-card">
                      <div class="stat-value" style={{ fontSize: '20px' }}>{data.dataValue} {data.unit || ''}</div>
                      <div class="stat-label">{data.dataType}</div>
                      <div style={{ marginTop: '8px' }}>
                        <span class={`badge ${getDataStatusBadge(data.status).class}`}>
                          {getDataStatusBadge(data.status).text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div class="tabs">
                <div 
                  class={`tab ${activeTab() === 'realtime' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('realtime')}
                >
                  实时数据
                </div>
                <div 
                  class={`tab ${activeTab() === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  历史数据
                </div>
              </div>

              {activeTab() === 'realtime' && (
                <div class="card">
                  <div class="card-header">
                    <h3>数据详情</h3>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>数据类型</th>
                        <th>数值</th>
                        <th>单位</th>
                        <th>阈值范围</th>
                        <th>状态</th>
                        <th>采集时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(realtimeData()).map(([key, data]) => (
                        <tr>
                          <td>{data.dataType}</td>
                          <td>{data.dataValue}</td>
                          <td>{data.unit || '-'}</td>
                          <td>{data.thresholdMin || '-'} ~ {data.thresholdMax || '-'}</td>
                          <td>
                            <span class={`badge ${getDataStatusBadge(data.status).class}`}>
                              {getDataStatusBadge(data.status).text}
                            </span>
                          </td>
                          <td>{data.collectTime || '-'}</td>
                        </tr>
                      ))}
                      {Object.keys(realtimeData()).length === 0 && (
                        <tr>
                          <td colspan="6" style={{ textAlign: 'center', color: '#7a8aa8' }}>
                            暂无实时数据
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab() === 'history' && (
                <div class="card">
                  <div class="card-header">
                    <h3>历史数据</h3>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>数据类型</th>
                        <th>数值</th>
                        <th>单位</th>
                        <th>状态</th>
                        <th>采集时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payloadData().map(data => (
                        <tr>
                          <td>{data.id}</td>
                          <td>{data.dataType}</td>
                          <td>{data.dataValue}</td>
                          <td>{data.unit || '-'}</td>
                          <td>
                            <span class={`badge ${getDataStatusBadge(data.status).class}`}>
                              {getDataStatusBadge(data.status).text}
                            </span>
                          </td>
                          <td>{data.collectTime || '-'}</td>
                        </tr>
                      ))}
                      {payloadData().length === 0 && (
                        <tr>
                          <td colspan="6" style={{ textAlign: 'center', color: '#7a8aa8' }}>
                            暂无历史数据
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div class="card" style={{ textAlign: 'center', padding: '60px', color: '#7a8aa8' }}>
              请选择左侧设备查看详细数据
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
