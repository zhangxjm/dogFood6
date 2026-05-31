<template>
  <div class="experiment-create">
    <h2 class="page-title">新建试验</h2>
    <div class="card" style="max-width:700px">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">试验名称 <span style="color:var(--danger-red)">*</span></label>
          <input class="form-input" v-model="form.name" placeholder="请输入试验名称" />
          <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
        </div>
        <div class="form-group">
          <label class="form-label">试验编号 <span style="color:var(--danger-red)">*</span></label>
          <input class="form-input" v-model="form.experiment_code" placeholder="如 SY-2024-001" />
          <div v-if="errors.experiment_code" class="form-error">{{ errors.experiment_code }}</div>
        </div>
        <div class="form-group">
          <label class="form-label">试验类型 <span style="color:var(--danger-red)">*</span></label>
          <select class="form-select" v-model="form.type">
            <option value="">请选择</option>
            <option value="热真空试验">热真空试验</option>
            <option value="力学试验">力学试验</option>
            <option value="电磁兼容试验">电磁兼容试验</option>
            <option value="空间环境试验">空间环境试验</option>
          </select>
          <div v-if="errors.type" class="form-error">{{ errors.type }}</div>
        </div>
        <div class="form-group">
          <label class="form-label">关联设备</label>
          <select class="form-select" v-model="form.device_id">
            <option value="">请选择设备</option>
            <option v-for="d in devices" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">试验描述</label>
          <textarea class="form-textarea" v-model="form.description" placeholder="请输入试验描述..." rows="4"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">试验参数（JSON格式）</label>
          <textarea class="form-textarea" v-model="form.parameters" placeholder='{"temperature": -40, "pressure": 0.01}' rows="5" style="font-family:monospace"></textarea>
          <div v-if="errors.parameters" class="form-error">{{ errors.parameters }}</div>
        </div>
        <div style="display:flex;gap:12px">
          <button type="submit" class="btn btn-success" :disabled="submitting">
            {{ submitting ? '提交中...' : '提交' }}
          </button>
          <router-link to="/experiments"><button type="button" class="btn btn-primary">取消</button></router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExperimentStore } from '../stores/experiment'
import { useDeviceStore } from '../stores/device'
import api from '../api'

const router = useRouter()
const store = useExperimentStore()
const deviceStore = useDeviceStore()
const devices = ref([])
const submitting = ref(false)

const form = ref({
  name: '', experiment_code: '', type: '', device_id: '',
  description: '', parameters: '{}'
})

const errors = ref({})

function validate() {
  errors.value = {}
  if (!form.value.name.trim()) errors.value.name = '试验名称不能为空'
  if (!form.value.experiment_code.trim()) errors.value.experiment_code = '试验编号不能为空'
  if (!form.value.type) errors.value.type = '请选择试验类型'
  if (form.value.parameters.trim()) {
    try { JSON.parse(form.value.parameters) } catch { errors.value.parameters = '参数格式不正确，请输入有效的JSON' }
  }
  return !Object.keys(errors.value).length
}

async function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  try {
    const payload = { ...form.value }
    if (payload.parameters) {
      try { payload.parameters = JSON.parse(payload.parameters) } catch { /* already validated */ }
    }
    await store.create(payload)
    router.push('/experiments')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    await deviceStore.fetchList()
    devices.value = deviceStore.devices
  } catch { /* ignore */ }
})
</script>
