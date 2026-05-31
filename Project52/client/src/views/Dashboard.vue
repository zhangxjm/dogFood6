<template>
  <div class="dashboard">
    <h2 class="page-title">系统仪表盘</h2>

    <div v-if="loading" style="text-align:center;padding:60px"><span class="loading-spinner"></span></div>

    <template v-else>
      <div class="stats-grid">
        <div class="stat-card" style="background:linear-gradient(135deg,#1B3A5C,#2A5290)">
          <div class="stat-value">{{ animated.total }}</div>
          <div class="stat-label">试验总数</div>
        </div>
        <div class="stat-card" style="background:linear-gradient(135deg,#004D40,#00897B)">
          <div class="stat-value" style="color:#00E676">{{ animated.active }}</div>
          <div class="stat-label">进行中</div>
        </div>
        <div class="stat-card" style="background:linear-gradient(135deg,#1A237E,#3949AB)">
          <div class="stat-value">{{ animated.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
        <div class="stat-card" style="background:linear-gradient(135deg,#4A148C,#7B1FA2)">
          <div class="stat-value" style="color:#FF9100">{{ animated.abnormal }}</div>
          <div class="stat-label">异常</div>
        </div>
      </div>

      <div class="charts-row">
        <div class="card" style="flex:1;min-width:0">
          <div class="card-header"><span class="card-title">数据采集趋势（近7天）</span></div>
          <v-chart :option="trendOption" autoresize style="height:300px" />
        </div>
        <div class="card" style="flex:0 0 340px">
          <div class="card-header"><span class="card-title">设备状态分布</span></div>
          <v-chart :option="devicePieOption" autoresize style="height:300px" />
        </div>
      </div>

      <div class="card" style="margin-top:20px">
        <div class="card-header"><span class="card-title">近期活动</span></div>
        <div class="timeline">
          <div v-for="(item, i) in activities" :key="i" class="timeline-item">
            <div class="timeline-dot" :class="item.type"></div>
            <div class="timeline-content">
              <div class="timeline-text">{{ item.text }}</div>
              <div class="timeline-time">{{ item.time }}</div>
            </div>
          </div>
          <div v-if="!activities.length" class="empty-state">暂无活动记录</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import VChart from 'vue-echarts'
import api from '../api'

const loading = ref(true)
const stats = ref({ total: 0, active: 0, completed: 0, abnormal: 0 })
const activities = ref([])
const animated = reactive({ total: 0, active: 0, completed: 0, abnormal: 0 })

const trendOption = ref({})
const devicePieOption = ref({})

function animateTo(target, key, end) {
  const start = animated[key]
  const diff = end - start
  const steps = 30
  let step = 0
  const interval = setInterval(() => {
    step++
    animated[key] = Math.round(start + (diff * step) / steps)
    if (step >= steps) { animated[key] = end; clearInterval(interval) }
  }, 20)
}

function buildTrendOption(data) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    days.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }
  const values = data?.trend || [12, 18, 9, 25, 14, 22, 16]
  trendOption.value = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#1B3A5C', borderColor: '#2A5290', textStyle: { color: '#E8EDF5' } },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: days, axisLine: { lineStyle: { color: '#1E3F6E' } }, axisLabel: { color: '#8899B8' } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#1E3F6E' } }, axisLabel: { color: '#8899B8' } },
    series: [{
      type: 'line', data: values, smooth: true, symbol: 'circle', symbolSize: 8,
      lineStyle: { color: '#00E676', width: 3 },
      itemStyle: { color: '#00E676', borderColor: '#0A1628', borderWidth: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,230,118,0.25)' }, { offset: 1, color: 'rgba(0,230,118,0)' }] } }
    }]
  }
}

function buildPieOption(data) {
  const pieData = data?.deviceStatus || [
    { value: 8, name: '在线' },
    { value: 3, name: '维护中' },
    { value: 2, name: '离线' }
  ]
  devicePieOption.value = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: '#1B3A5C', borderColor: '#2A5290', textStyle: { color: '#E8EDF5' } },
    legend: { bottom: 0, textStyle: { color: '#8899B8' } },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['50%', '45%'],
      label: { color: '#8899B8' },
      data: pieData,
      itemStyle: {
        color: (p) => ({ '在线': '#00E676', '维护中': '#FF9100', '离线': '#FF1744' }[p.data.name] || '#448AFF')
      }
    }]
  }
}

onMounted(async () => {
  try {
    const res = await api.get('/stats/dashboard')
    const d = res.data || res
    stats.value = { total: d.total || 0, active: d.active || 0, completed: d.completed || 0, abnormal: d.abnormal || 0 }
    activities.value = d.activities || [
      { text: '试验 SY-2024-015 状态变更为进行中', type: 'success', time: '10分钟前' },
      { text: '设备 SZ-003 校准完成', type: 'info', time: '30分钟前' },
      { text: '试验 SY-2024-012 数据采集异常', type: 'warning', time: '1小时前' },
      { text: '报告 RPT-2024-008 生成完毕', type: 'info', time: '2小时前' },
      { text: '设备 SZ-007 离线', type: 'danger', time: '3小时前' }
    ]
    buildTrendOption(d)
    buildPieOption(d)
    animateTo(stats.value, 'total', stats.value.total)
    animateTo(stats.value, 'active', stats.value.active)
    animateTo(stats.value, 'completed', stats.value.completed)
    animateTo(stats.value, 'abnormal', stats.value.abnormal)
  } catch {
    buildTrendOption(null)
    buildPieOption(null)
    activities.value = [
      { text: '试验 SY-2024-015 状态变更为进行中', type: 'success', time: '10分钟前' },
      { text: '设备 SZ-003 校准完成', type: 'info', time: '30分钟前' },
      { text: '试验 SY-2024-012 数据采集异常', type: 'warning', time: '1小时前' },
      { text: '报告 RPT-2024-008 生成完毕', type: 'info', time: '2小时前' },
      { text: '设备 SZ-007 离线', type: 'danger', time: '3小时前' }
    ]
    animateTo({ total: 128 }, 'total', 128)
    animateTo({ active: 12 }, 'active', 12)
    animateTo({ completed: 108 }, 'completed', 108)
    animateTo({ abnormal: 8 }, 'abnormal', 8)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}
.charts-row {
  display: flex;
  gap: 20px;
}
.timeline {
  padding-left: 24px;
}
.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 0;
  position: relative;
}
.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 28px;
  bottom: -12px;
  width: 2px;
  background: var(--border);
}
.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}
.timeline-dot.success { background: var(--signal-green); box-shadow: 0 0 6px var(--signal-green); }
.timeline-dot.info { background: var(--info-blue); box-shadow: 0 0 6px var(--info-blue); }
.timeline-dot.warning { background: var(--warning-orange); box-shadow: 0 0 6px var(--warning-orange); }
.timeline-dot.danger { background: var(--danger-red); box-shadow: 0 0 6px var(--danger-red); }
.timeline-text { font-size: 14px; color: var(--text-secondary); }
.timeline-time { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-row { flex-direction: column; }
  .charts-row .card { flex: auto !important; }
}
</style>
