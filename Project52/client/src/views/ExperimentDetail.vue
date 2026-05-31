<template>
  <div class="experiment-detail">
    <div v-if="store.loading" style="text-align:center;padding:60px"><span class="loading-spinner"></span></div>

    <template v-else-if="store.current">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
        <router-link to="/experiments"><button class="btn btn-primary btn-sm">← 返回列表</button></router-link>
        <h2 class="page-title" style="margin:0">{{ store.current.name }}</h2>
        <span class="badge" :class="statusClass(store.current.status)" style="margin-left:auto">{{ store.current.status }}</span>
      </div>

      <div class="card" style="margin-bottom:20px">
        <div class="card-header"><span class="card-title">基本信息</span></div>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">试验编号</span><span class="info-value" style="font-family:Orbitron,monospace">{{ store.current.experiment_code }}</span></div>
          <div class="info-item"><span class="info-label">试验类型</span><span class="info-value">{{ store.current.type }}</span></div>
          <div class="info-item"><span class="info-label">关联设备</span><span class="info-value">{{ store.current.device_name || '-' }}</span></div>
          <div class="info-item"><span class="info-label">开始时间</span><span class="info-value">{{ store.current.start_time || '-' }}</span></div>
          <div class="info-item"><span class="info-label">创建时间</span><span class="info-value">{{ store.current.created_at || '-' }}</span></div>
          <div class="info-item"><span class="info-label">试验描述</span><span class="info-value">{{ store.current.description || '-' }}</span></div>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px">
        <div class="card-header"><span class="card-title">试验流程</span></div>
        <div class="process-flow">
          <div v-for="(stage, i) in stages" :key="i" class="process-step" :class="stageClass(i)">
            <div class="step-dot"></div>
            <div class="step-label">{{ stage }}</div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px">
        <div class="card-header"><span class="card-title">状态操作</span></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button v-for="s in nextStatuses" :key="s" class="btn" :class="statusBtnClass(s)" @click="changeStatus(s)">
            {{ s }}
          </button>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px">
        <div class="card-header">
          <span class="card-title">关联数据</span>
          <router-link to="/data-collection"><button class="btn btn-primary btn-sm">采集数据</button></router-link>
        </div>
        <div v-if="dataList.length">
          <table>
            <thead><tr><th>数据编号</th><th>采集时间</th><th>数据量</th><th>状态</th></tr></thead>
            <tbody>
              <tr v-for="d in dataList" :key="d.id">
                <td style="font-family:Orbitron,monospace;font-size:13px">{{ d.code }}</td>
                <td>{{ d.collected_at }}</td>
                <td>{{ d.size }}</td>
                <td><span class="badge" :class="d.status === '已验证' ? 'badge-success' : 'badge-warning'">{{ d.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state">暂无关联数据</div>
      </div>

      <div style="display:flex;gap:12px">
        <router-link :to="`/reports/generate?experimentId=${store.current.id}`">
          <button class="btn btn-success">生成报告</button>
        </router-link>
      </div>
    </template>

    <div v-else class="empty-state">未找到试验信息</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useExperimentStore } from '../stores/experiment'
import api from '../api'

const route = useRoute()
const store = useExperimentStore()
const dataList = ref([])

const stages = ['待启动', '进行中', '数据采集', '数据分析', '已完成']

const stageIndexMap = { '待启动': 0, '进行中': 1, '数据采集中': 2, '数据分析中': 3, '已完成': 4, '异常': -1 }

const currentStageIndex = computed(() => {
  const s = store.current?.status
  if (s === '异常') return -1
  return stageIndexMap[s] ?? 0
})

function stageClass(i) {
  const cur = currentStageIndex.value
  if (cur === -1) return i === 1 ? 'abnormal' : ''
  if (i < cur) return 'done'
  if (i === cur) return 'active'
  return ''
}

const nextStatuses = computed(() => {
  const s = store.current?.status
  const map = {
    '待启动': ['进行中'],
    '进行中': ['数据采集中', '异常'],
    '数据采集中': ['数据分析中', '异常'],
    '数据分析中': ['已完成', '异常'],
    '异常': ['进行中'],
    '已完成': []
  }
  return map[s] || []
})

function statusClass(status) {
  const m = { '进行中': 'badge-success', '已完成': 'badge-info', '异常': 'badge-warning', '待启动': 'badge-warning', '数据采集中': 'badge-success', '数据分析中': 'badge-info', '故障': 'badge-danger' }
  return m[status] || 'badge-info'
}

function statusBtnClass(s) {
  const m = { '进行中': 'btn-success', '数据采集中': 'btn-success', '数据分析中': 'btn-primary', '已完成': 'btn-success', '异常': 'btn-warning' }
  return m[s] || 'btn-primary'
}

async function changeStatus(status) {
  await store.updateStatus(route.params.id, status)
  await store.fetchById(route.params.id)
}

async function loadData() {
  const id = route.params.id
  if (!id) return
  await store.fetchById(id)
  try {
    const res = await api.get(`/experiments/${id}/data`)
    dataList.value = res.data?.list || res.list || []
  } catch { dataList.value = [] }
}

onMounted(loadData)
watch(() => route.params.id, loadData)
</script>

<style scoped>
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-label { font-size: 12px; color: var(--text-muted); }
.info-value { font-size: 14px; color: var(--text-primary); }

.process-flow {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 20px 0;
}
.process-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.process-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 12px;
  left: 50%;
  width: 100%;
  height: 3px;
  background: var(--border);
  z-index: 0;
}
.process-step.done:not(:last-child)::after { background: var(--signal-green); }
.step-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--surface);
  border: 3px solid var(--border);
  z-index: 1;
  position: relative;
}
.process-step.done .step-dot { background: var(--signal-green); border-color: var(--signal-green); }
.process-step.active .step-dot { background: var(--info-blue); border-color: var(--info-blue); box-shadow: 0 0 12px var(--info-blue); animation: pulse 1.5s infinite; }
.process-step.abnormal .step-dot { background: var(--danger-red); border-color: var(--danger-red); box-shadow: 0 0 12px var(--danger-red); }
.step-label { font-size: 12px; color: var(--text-muted); margin-top: 8px; }
.process-step.done .step-label { color: var(--signal-green); }
.process-step.active .step-label { color: var(--info-blue); }
.process-step.abnormal .step-label { color: var(--danger-red); }
</style>
