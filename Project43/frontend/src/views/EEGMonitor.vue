<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { sessionAPI } from '@/api'
import type { EEGSignal, TrainingSession } from '@/api'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const sessionId = Number(route.params.sessionId)
const loading = ref(false)
const session = ref<TrainingSession | null>(null)
const eegData = ref<EEGSignal[]>([])

const eegChartData = reactive({
  times: [] as string[],
  channels: [[], [], [], [], [], [], [], []] as number[][]
})

const chartColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#8e44ad', '#16a085', '#d35400']

const eegChartOption = computed(() => ({
  grid: { top: 30, right: 20, bottom: 30, left: 50 },
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      let html = `<div>${params[0].axisValue}</div>`
      params.forEach((p: any) => {
        html += `<div style="color:${p.color}">${p.seriesName}: ${p.value.toFixed(2)}uV</div>`
      })
      return html
    }
  },
  legend: {
    data: ['CH1', 'CH2', 'CH3', 'CH4', 'CH5', 'CH6', 'CH7', 'CH8'],
    top: 0
  },
  dataZoom: [
    { type: 'inside', start: 0, end: 100 },
    { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
  ],
  xAxis: {
    type: 'category',
    data: eegChartData.times,
    axisLabel: { fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    name: '幅值(uV)',
    nameTextStyle: { fontSize: 12 }
  },
  series: [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({
    name: `CH${i + 1}`,
    type: 'line',
    showSymbol: false,
    smooth: true,
    sampling: 'lttb',
    lineStyle: {
      width: 1.5,
      color: chartColors[i]
    },
    data: eegChartData.channels[i]
  }))
}))

const qualityChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { top: 30, right: 20, bottom: 30, left: 50 },
  xAxis: {
    type: 'category',
    data: eegChartData.times,
    axisLabel: { fontSize: 10, show: false }
  },
  yAxis: {
    type: 'value',
    name: '质量(%)',
    min: 0,
    max: 100,
    nameTextStyle: { fontSize: 12 }
  },
  series: [{
    type: 'line',
    data: eegData.value.map(d => d.signal_quality),
    showSymbol: false,
    smooth: true,
    lineStyle: {
      width: 2,
      color: '#67c23a'
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
          { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
        ]
      }
    }
  }]
}))

const avgQuality = computed(() => {
  if (eegData.value.length === 0) return 0
  const sum = eegData.value.reduce((acc, d) => acc + d.signal_quality, 0)
  return Math.round(sum / eegData.value.length * 10) / 10
})

const loadData = async () => {
  loading.value = true
  try {
    const sessions = await sessionAPI.list()
    session.value = sessions.find(s => s.id === sessionId) || null
    eegData.value = await sessionAPI.getEEGData(sessionId, 500)
    
    eegChartData.times = eegData.value.map(d => dayjs(d.timestamp).format('HH:mm:ss.SSS'))
    for (let i = 0; i < 8; i++) {
      const key = `ch${i + 1}` as keyof EEGSignal
      eegChartData.channels[i] = eegData.value.map(d => d[key] as number)
    }
  } catch (e) {
    console.error('Failed to load data:', e)
  } finally {
    loading.value = false
  }
}

const formatDuration = (seconds: number) => {
  if (!seconds) return '--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`
}

const getQualityClass = (quality: number) => {
  if (quality >= 80) return 'quality-excellent'
  if (quality >= 60) return 'quality-good'
  if (quality >= 40) return 'quality-medium'
  return 'quality-poor'
}

const getQualityText = (quality: number) => {
  if (quality >= 80) return '优秀'
  if (quality >= 60) return '良好'
  if (quality >= 40) return '一般'
  return '较差'
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    '上肢训练': '#409eff',
    '下肢训练': '#67c23a',
    '面部训练': '#e6a23c',
    '认知训练': '#f56c6c',
    '基础训练': '#909399'
  }
  return colorMap[type] || '#909399'
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div v-loading="loading" class="eeg-monitor-container">
    <div class="monitor-header">
      <div class="header-left">
        <div class="back-btn" @click="router.push('/history')">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </div>
        <div class="session-info">
          <h2 class="session-title">
            <el-icon color="#409eff"><Monitor /></el-icon>
            脑电信号监测详情
          </h2>
          <div class="session-meta">
            <el-tag 
              size="small" 
              :color="getTypeColor(session?.type || '')"
              effect="dark"
              style="color: white"
            >
              {{ session?.type }}
            </el-tag>
            <el-tag size="small" type="info">{{ session?.command }}</el-tag>
            <span class="meta-item">
              <el-icon><User /></el-icon>
              {{ session?.user_name }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <div class="stat-card gradient-bg">
          <div class="value">{{ session?.duration ? formatDuration(session.duration) : '--' }}</div>
          <div class="label">训练时长</div>
          <el-icon class="icon"><Timer /></el-icon>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card success-bg">
          <div class="value">{{ session?.avg_accuracy?.toFixed(1) || '--' }}%</div>
          <div class="label">平均准确率</div>
          <el-icon class="icon"><Aim /></el-icon>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card warning-bg">
          <div class="value">
            <span :class="['quality-indicator', getQualityClass(avgQuality)]"></span>
            {{ avgQuality }}%
          </div>
          <div class="label">平均信号质量</div>
          <el-icon class="icon"><Cpu /></el-icon>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stat-card info-bg">
          <div class="value">{{ eegData.length }} 条</div>
          <div class="label">采样数</div>
          <el-icon class="icon"><DataLine /></el-icon>
        </div>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">
              <el-icon color="#409eff"><TrendCharts /></el-icon>
              脑电信号波形 ({{ eegData.length }} 采样点)
            </span>
          </template>
          <v-chart :option="eegChartOption" autoresize style="height: 400px; width: 100%;" />
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :md="12">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">
              <el-icon color="#67c23a"><TrendCharts /></el-icon>
              信号质量趋势
            </span>
          </template>
          <v-chart :option="qualityChartOption" autoresize style="height: 250px; width: 100%;" />
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="12">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">
              <el-icon color="#e6a23c"><InfoFilled /></el-icon>
              训练详情
            </span>
          </template>
          <div class="detail-list">
            <div class="detail-item">
              <span class="detail-label">训练指令</span>
              <span class="detail-value">{{ session?.command }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">开始时间</span>
              <span class="detail-value">{{ dayjs(session?.start_time).format('YYYY-MM-DD HH:mm:ss') }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">结束时间</span>
              <span class="detail-value">{{ session?.end_time ? dayjs(session.end_time).format('YYYY-MM-DD HH:mm:ss') : '--' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">训练时长</span>
              <span class="detail-value">{{ formatDuration(session?.duration || 0) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">成功率</span>
              <span class="detail-value">{{ session?.success_rate?.toFixed(1) || 0 }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">平均准确率</span>
              <span class="detail-value">
                <span :class="['quality-indicator', getQualityClass(session?.avg_accuracy || 0)]"></span>
                {{ session?.avg_accuracy?.toFixed(1) || 0 }}%
                ({{ getQualityText(session?.avg_accuracy || 0) }})
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">平均信号质量</span>
              <span class="detail-value">
                <span :class="['quality-indicator', getQualityClass(avgQuality)]"></span>
                {{ avgQuality }}%
                ({{ getQualityText(avgQuality) }})
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="card-shadow" style="margin-top: 20px;">
      <template #header>
        <span class="card-title">
          <el-icon color="#409eff"><List /></el-icon>
          通道详情
        </span>
      </template>
      <el-table :data="eegData.slice(-20).reverse()" style="width: 100%" size="small" stripe>
        <el-table-column label="序号" width="70" align="center">
          <template #default="{ $index }">
            {{ eegData.length - $index }}
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="时间" width="100">
          <template #default="{ row }">
            {{ dayjs(row.timestamp).format('HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column v-for="i in 8" :key="i" :label="`CH${i}`" width="90" align="center">
          <template #default="{ row }">
            <span :style="{ color: chartColors[i - 1] }">{{ (row as any)[`ch${i}`].toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="signal_quality" label="质量" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.signal_quality >= 80 ? 'success' : row.signal_quality >= 60 ? 'primary' : row.signal_quality >= 40 ? 'warning' : 'danger'"
              size="small"
            >
              {{ row.signal_quality.toFixed(0) }}%
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.eeg-monitor-container {
  padding: 0;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: white;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  margin-right: 16px;
}

.back-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.header-left {
  display: flex;
  align-items: center;
}

.session-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-title {
  font-size: 20px;
  font-weight: bold;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.session-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #64748b;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card .value {
  font-size: 28px;
  font-weight: bold;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-card .label {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 8px;
  position: relative;
  z-index: 1;
}

.stat-card .icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 48px;
  opacity: 0.3;
  z-index: 1;
}

.card-title {
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
}

.detail-label {
  font-size: 14px;
  color: #64748b;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
