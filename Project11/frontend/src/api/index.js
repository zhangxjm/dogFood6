import request from './request'

export const commandApi = {
  sendCommand: (data) => request.post('/command/send', data),
  executeCommand: (id) => request.post(`/command/execute/${id}`),
  getCommandStatus: (id) => request.get(`/command/status/${id}`),
  listCommands: (params) => request.get('/command/list', { params }),
  updateCommandStatus: (id, status, result) => request.post(`/command/update/${id}`, null, { params: { status, result } }),
  batchSendCommands: (data) => request.post('/command/batch', data),
  cancelCommand: (id) => request.post(`/command/cancel/${id}`)
}

export const payloadApi = {
  collectData: (data) => request.post('/payload/collect', data),
  getRealtimeData: (deviceCode) => request.get(`/payload/realtime/${deviceCode}`),
  listData: (params) => request.get('/payload/list', { params }),
  getDeviceList: () => request.get('/payload/devices'),
  addDevice: (data) => request.post('/payload/device', data),
  updateDevice: (data) => request.put('/payload/device', data),
  deleteDevice: (id) => request.delete(`/payload/device/${id}`),
  getDeviceStatus: (deviceCode) => request.get(`/payload/device/status/${deviceCode}`),
  getHistoryData: (params) => request.get('/payload/history', { params }),
  getDataStatistics: () => request.get('/payload/statistics')
}

export const monitorApi = {
  createAlert: (data) => request.post('/monitor/alert', data),
  handleAlert: (id, params) => request.post(`/monitor/alert/handle/${id}`, params),
  listAlerts: (params) => request.get('/monitor/alerts', { params }),
  getAlertStatistics: () => request.get('/monitor/alert/statistics'),
  openCircuitBreaker: (data) => request.post('/monitor/circuit/open', data),
  closeCircuitBreaker: (id) => request.post(`/monitor/circuit/close/${id}`),
  halfOpenCircuitBreaker: (id) => request.post(`/monitor/circuit/halfopen/${id}`),
  listCircuitBreakers: () => request.get('/monitor/circuits'),
  checkCircuitBreaker: (resourceName) => request.get(`/monitor/circuit/check/${resourceName}`),
  getSystemStatus: () => request.get('/monitor/system/status')
}
