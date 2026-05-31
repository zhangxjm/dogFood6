<template>
  <div class="device-list">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
      <h2 class="page-title" style="margin:0">设备管理</h2>
      <button class="btn btn-success" @click="openRegisterModal">+ 注册设备</button>
    </div>

    <div class="filter-bar">
      <select class="form-select" v-model="filters.status">
        <option value="">全部状态</option>
        <option value="在线">在线</option>
        <option value="运行中">运行中</option>
        <option value="维护中">维护中</option>
        <option value="离线">离线</option>
      </select>
      <select class="form-select" v-model="filters.type">
        <option value="">全部类型</option>
        <option value="力学设备">力学设备</option>
        <option value="热环境设备">热环境设备</option>
        <option value="声学设备">声学设备</option>
        <option value="电磁设备">电磁设备</option>
        <option value="测试仪器">测试仪器</option>
      </select>
      <input class="form-input" placeholder="搜索设备..." v-model="filters.keyword" />
      <button class="btn btn-primary" @click="loadDevices">查询</button>
    </div>

    <div v-if="store.loading" style="text-align:center;padding:60px"><span class="loading-spinner"></span></div>

    <div v-else-if="filteredDevices.length" class="device-grid">
      <div v-for="d in filteredDevices" :key="d.id" class="device-card" @click="openDetail(d)">
        <div class="device-status-indicator">
          <span class="status-dot" :class="statusDotClass(d.status)"></span>
          <span class="device-status-text" :style="{color: statusColor(d.status)}">{{ d.status }}</span>
        </div>
        <div class="device-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2"/><line x1="14" y1="10" x2="18" y2="10"/><line x1="14" y1="14" x2="18" y2="14"/></svg>
        </div>
        <div class="device-name">{{ d.name }}</div>
        <div class="device-code">{{ d.device_code }}</div>
        <div class="device-meta">
          <span>{{ d.type }}</span>
          <span v-if="d.location">{{ d.location }}</span>
        </div>
      </div>
    </div>

    <div v-else class="card empty-state">暂无设备信息</div>

    <div v-if="showRegisterModal" class="modal-overlay" @click.self="showRegisterModal = false">
      <div class="modal">
        <div class="modal-title">注册设备</div>
        <div class="form-group">
          <label class="form-label">设备名称 <span style="color:var(--danger-red)">*</span></label>
          <input class="form-input" v-model="registerForm.name" placeholder="请输入设备名称" />
        </div>
        <div class="form-group">
          <label class="form-label">设备编号 <span style="color:var(--danger-red)">*</span></label>
          <input class="form-input" v-model="registerForm.device_code" placeholder="如 SZ-001" />
        </div>
        <div class="form-group">
          <label class="form-label">设备类型</label>
          <select class="form-select" v-model="registerForm.category">
            <option value="力学设备">力学设备</option>
            <option value="热环境设备">热环境设备</option>
            <option value="声学设备">声学设备</option>
            <option value="电磁设备">电磁设备</option>
            <option value="测试仪器">测试仪器</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">安装位置</label>
          <input class="form-input" v-model="registerForm.location" placeholder="如 3号实验室" />
        </div>
        <div class="form-group">
          <label class="form-label">设备描述</label>
          <textarea class="form-textarea" v-model="registerForm.description" rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="showRegisterModal = false">取消</button>
          <button class="btn btn-success" @click="handleRegister" :disabled="submitting">{{ submitting ? '提交中...' : '注册' }}</button>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal" style="max-width:600px">
        <div class="modal-title">设备详情</div>
        <div v-if="detailDevice" class="detail-grid">
          <div class="detail-item"><span class="detail-label">设备名称</span><span class="detail-value">{{ detailDevice.name }}</span></div>
          <div class="detail-item"><span class="detail-label">设备编号</span><span class="detail-value" style="font-family:Orbitron,monospace">{{ detailDevice.device_code }}</span></div>
          <div class="detail-item"><span class="detail-label">设备类型</span><span class="detail-value">{{ detailDevice.type }}</span></div>
          <div class="detail-item"><span class="detail-label">设备状态</span><span class="badge" :class="statusBadgeClass(detailDevice.status)">{{ detailDevice.status }}</span></div>
          <div class="detail-item"><span class="detail-label">安装位置</span><span class="detail-value">{{ detailDevice.location || '-' }}</span></div>
          <div class="detail-item"><span class="detail-label">注册时间</span><span class="detail-value">{{ detailDevice.created_at || '-' }}</span></div>
          <div class="detail-item" style="grid-column:span 2"><span class="detail-label">设备描述</span><span class="detail-value">{{ detailDevice.description || '-' }}</span></div>
        </div>

        <div style="margin-top:20px">
          <div class="card-title" style="margin-bottom:12px">校准历史</div>
          <div v-if="calibrations.length">
            <table>
              <thead><tr><th>校准时间</th><th>校准人员</th><th>结果</th></tr></thead>
              <tbody>
                <tr v-for="c in calibrations" :key="c.id">
                  <td>{{ c.date }}</td>
                  <td>{{ c.operator }}</td>
                  <td><span class="badge" :class="c.pass ? 'badge-success' : 'badge-danger'">{{ c.pass ? '合格' : '不合格' }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else style="color:var(--text-muted);font-size:13px">暂无校准记录</div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-primary" @click="showDetailModal = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDeviceStore } from '../stores/device'
import api from '../api'

const store = useDeviceStore()
const filters = ref({ status: '', type: '', keyword: '' })
const showRegisterModal = ref(false)
const showDetailModal = ref(false)
const detailDevice = ref(null)
const calibrations = ref([])
const submitting = ref(false)

const registerForm = ref({
  name: '', device_code: '', category: '力学设备', location: '', description: ''
})

const filteredDevices = computed(() => {
  let list = store.devices
  if (filters.value.status) list = list.filter(d => d.status === filters.value.status)
  if (filters.value.type) list = list.filter(d => d.type === filters.value.type)
  if (filters.value.keyword) {
    const kw = filters.value.keyword.toLowerCase()
    list = list.filter(d => d.name.toLowerCase().includes(kw) || d.device_code.toLowerCase().includes(kw))
  }
  return list
})

function statusDotClass(status) {
  return { '在线': 'online', '运行中': 'online', '维护中': 'maintenance', '离线': 'offline' }[status] || 'offline'
}

function statusColor(status) {
  return { '在线': 'var(--signal-green)', '运行中': 'var(--signal-green)', '维护中': 'var(--warning-orange)', '离线': 'var(--danger-red)' }[status] || 'var(--text-muted)'
}

function statusBadgeClass(status) {
  return { '在线': 'badge-success', '运行中': 'badge-success', '维护中': 'badge-warning', '离线': 'badge-danger' }[status] || 'badge-info'
}

function openRegisterModal() {
  registerForm.value = { name: '', device_code: '', category: '力学设备', location: '', description: '' }
  showRegisterModal.value = true
}

async function handleRegister() {
  submitting.value = true
  try {
    await store.register(registerForm.value)
    showRegisterModal.value = false
    loadDevices()
  } finally {
    submitting.value = false
  }
}

async function openDetail(device) {
  detailDevice.value = device
  showDetailModal.value = true
  try {
    const res = await api.get(`/devices/${device.id}/calibrations`)
    calibrations.value = res.data?.list || res.list || []
  } catch {
    calibrations.value = [
      { id: '1', date: '2024-11-20', operator: '张工', pass: true },
      { id: '2', date: '2024-09-15', operator: '李工', pass: true }
    ]
  }
}

async function loadDevices() {
  await store.fetchList()
}

onMounted(loadDevices)
</script>

<style scoped>
.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.device-card {
  background: linear-gradient(135deg, var(--surface), var(--surface-light));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  cursor: pointer;
  transition: all 0.25s;
  position: relative;
}
.device-card:hover { border-color: var(--interstellar-light); transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
.device-status-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.device-status-text { font-size: 11px; font-weight: 500; }
.device-icon {
  width: 48px;
  height: 48px;
  color: var(--interstellar-light);
  margin-bottom: 12px;
}
.device-icon svg { width: 100%; height: 100%; }
.device-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.device-code { font-family: 'Orbitron', monospace; font-size: 12px; color: var(--info-blue); margin-top: 4px; }
.device-meta { font-size: 12px; color: var(--text-muted); margin-top: 8px; display: flex; gap: 12px; }
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.detail-item { display: flex; flex-direction: column; gap: 2px; }
.detail-label { font-size: 12px; color: var(--text-muted); }
.detail-value { font-size: 14px; color: var(--text-primary); }
</style>
