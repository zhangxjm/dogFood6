import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export const useDeviceStore = defineStore('device', () => {
  const devices = ref([])
  const loading = ref(false)
  const total = ref(0)

  const onlineDevices = computed(() =>
    devices.value.filter(d => d.status === '在线')
  )

  const offlineDevices = computed(() =>
    devices.value.filter(d => d.status === '离线')
  )

  async function fetchList(params = {}) {
    loading.value = true
    try {
      const res = await api.get('/devices', { params })
      devices.value = res.data?.list || res.list || []
      total.value = res.data?.total || res.total || 0
    } finally {
      loading.value = false
    }
  }

  async function register(data) {
    const res = await api.post('/devices', data)
    return res.data || res
  }

  async function update(id, data) {
    const res = await api.put(`/devices/${id}`, data)
    return res.data || res
  }

  async function remove(id) {
    await api.delete(`/devices/${id}`)
  }

  return { devices, loading, total, onlineDevices, offlineDevices, fetchList, register, update, remove }
})
