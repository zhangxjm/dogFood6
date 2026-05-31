import { writable } from 'svelte/store'

function createWebSocketStore() {
  const { subscribe, set, update } = writable({
    connected: false,
    messages: [],
    statuses: {}
  })

  let ws = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 10
  let reconnectTimer = null

  const connect = () => {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/ws/device`
      console.log('WebSocket 连接中:', wsUrl)
      
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket 已连接')
        reconnectAttempts = 0
        update(state => ({ ...state, connected: true }))
      }

      ws.onmessage = (event) => {
        const data = event.data
        if (data.startsWith('STATUS:')) {
          try {
            const status = JSON.parse(data.substring(7))
            update(state => ({
              ...state,
              statuses: { ...state.statuses, [status.deviceCode]: status }
            }))
          } catch (e) {
            console.error('解析状态消息失败:', e)
          }
        } else if (data.startsWith('COMMAND:')) {
          try {
            const command = JSON.parse(data.substring(8))
            update(state => ({
              ...state,
              messages: [...state.messages, { type: 'command', data: command }]
            }))
          } catch (e) {
            console.error('解析命令消息失败:', e)
          }
        } else if (data.startsWith('ALARM:')) {
          update(state => ({
            ...state,
            messages: [...state.messages, { type: 'alarm', data: data.substring(6) }]
          }))
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket 错误:', error)
        update(state => ({ ...state, connected: false }))
      }

      ws.onclose = (event) => {
        console.log('WebSocket 已断开:', event.code, event.reason)
        update(state => ({ ...state, connected: false }))
        scheduleReconnect()
      }
    } catch (e) {
      console.error('创建 WebSocket 失败:', e)
      scheduleReconnect()
    }
  }

  const scheduleReconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
    }

    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log('达到最大重连次数，停止重连')
      return
    }

    reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
    console.log(`将在 ${delay}ms 后重试 (${reconnectAttempts}/${maxReconnectAttempts})`)
    
    reconnectTimer = setTimeout(() => {
      connect()
    }, delay)
  }

  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (ws) {
      ws.close()
      ws = null
    }
    update(state => ({ ...state, connected: false }))
  }

  return {
    subscribe,
    connect,
    disconnect
  }
}

export const websocketStore = createWebSocketStore()
