import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export const useExperimentStore = defineStore('experiment', () => {
  const experiments = ref([])
  const current = ref(null)
  const loading = ref(false)
  const total = ref(0)

  const activeExperiments = computed(() =>
    experiments.value.filter(e => e.status === '进行中')
  )

  async function fetchList(params = {}) {
    loading.value = true
    try {
      const res = await api.get('/experiments', { params })
      experiments.value = res.data?.list || res.list || []
      total.value = res.data?.total || res.total || 0
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id) {
    loading.value = true
    try {
      const res = await api.get(`/experiments/${id}`)
      current.value = res.data || res
    } finally {
      loading.value = false
    }
  }

  async function create(data) {
    const res = await api.post('/experiments', data)
    return res.data || res
  }

  async function updateStatus(id, status) {
    const res = await api.patch(`/experiments/${id}/status`, { status })
    return res.data || res
  }

  async function remove(id) {
    await api.delete(`/experiments/${id}`)
  }

  return { experiments, current, loading, total, activeExperiments, fetchList, fetchById, create, updateStatus, remove }
})
