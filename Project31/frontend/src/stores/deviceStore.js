import { writable } from 'svelte/store'

function createDeviceStore() {
  const { subscribe, set, update } = writable({
    devices: [],
    selectedDevice: null
  })

  return {
    subscribe,
    set,
    setDevices: (devices) => update(state => ({ ...state, devices })),
    updateDevice: (status) => update(state => {
      const devices = state.devices.map(d => {
        if (d.deviceCode === status.deviceCode) {
          return {
            ...d,
            temperature: status.temperature,
            humidity: status.humidity,
            pressure: status.pressure,
            vibration: status.vibration,
            rpm: status.rpm,
            powerConsumption: status.powerConsumption,
            efficiency: status.efficiency,
            status: status.status,
            alarmLevel: status.alarmLevel,
            alarmMessage: status.alarmMessage,
            lastUpdateTime: status.timestamp
          }
        }
        return d
      })
      return { ...state, devices }
    }),
    selectDevice: (device) => update(state => ({ ...state, selectedDevice: device }))
  }
}

export const deviceStore = createDeviceStore()
