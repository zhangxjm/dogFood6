<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import { AlertTriangle, TrendingUp, Shield, AlertCircle } from 'lucide-vue-next'
import { predictionApi } from '@/api/prediction'
import { deviceApi } from '@/api/device'
import type { Prediction, PredictionStats, Device } from '@/types'
import { formatDate, getStatusText, getRiskColor } from '@/utils'

const loading = ref(false)
const predictionStats = ref<PredictionStats>({ low: 0, medium: 0, high: 0, critical: 0 })
const highRiskPredictions = ref<Prediction[]>([])
const deviceList = ref<Device[]>([])

const riskDistributionChartRef = ref<HTMLDivElement>()
const riskTrendChartRef = ref<HTMLDivElement>()
let riskDistributionChart: echarts.ECharts | null = null
let riskTrendChart: echarts.ECharts | null = null

const totalPredictions = computed(() => {
  const stats = predictionStats.value
  return stats.low + stats.medium + stats.high + stats.critical
})

const highRiskCount = computed(() => {
  return predictionStats.value.high + predictionStats.value.critical
})

const riskLevel = computed(() => {
  if (highRiskCount.value === 0) return { text: '低', color: '#00B42A', bgColor: 'bg-success-100' }
  if (highRiskCount.value <= 3) return { text: '中', color: '#FF7D00', bgColor: 'bg-warning-100' }
  if (highRiskCount.value <= 5) return { text: '高', color: '#F53F3F', bgColor: 'bg-danger-100' }
  return { text: '严重', color: '#CB2634', bgColor: 'bg-danger-200' }
})

async function loadData() {
  loading.value = true
  try {
    const [stats, highRisk, devices] = await Promise.all([
      predictionApi.getStats(),
      predictionApi.getHighRisk(),
      deviceApi.list({ pageSize: 1000 })
    ])
    
    predictionStats.value = stats
    highRiskPredictions.value = highRisk
    deviceList.value = devices.items
    
    setTimeout(() => {
      initRiskDistributionChart()
      initRiskTrendChart()
    }, 100)
  } catch (error) {
    console.error('加载风险分析数据失败:', error)
  } finally {
    loading.value = false
  }
}

function initRiskDistributionChart() {
  if (!riskDistributionChartRef.value) return
  
  riskDistributionChart = echarts.init(riskDistributionChartRef.value)
  
  const data = [
    { value: predictionStats.value.low, name: '低风险', itemStyle: { color: '#00B42A' } },
    { value: predictionStats.value.medium, name: '中风险', itemStyle: { color: '#FF7D00' } },
    { value: predictionStats.value.high, name: '高风险', itemStyle: { color: '#F53F3F' } },
    { value: predictionStats.value.critical, name: '严重风险', itemStyle: { color: '#CB2634' } }
  ]
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#4E5969', fontSize: 13 }
    },
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 3
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 18,
          fontWeight: 'bold',
          formatter: '{b}\n{c}个'
        }
      },
      labelLine: {
        show: false
      },
      data
    }]
  }
  
  riskDistributionChart.setOption(option)
}

function initRiskTrendChart() {
  if (!riskTrendChartRef.value) return
  
  riskTrendChart = echarts.init(riskTrendChartRef.value)
  
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return `${d.getMonth() + 1}/${d.getDate()}`
  })
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['低风险', '中风险', '高风险', '严重风险'],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: days,
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      axisLabel: { color: '#86909C', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F2F3F5', type: 'dashed' } },
      axisLabel: { color: '#86909C', fontSize: 12 }
    },
    series: [
      {
        name: '低风险',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [12, 15, 13, 18, 16, 14, 17],
        lineStyle: { color: '#00B42A', width: 3 },
        itemStyle: { color: '#00B42A' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 180, 42, 0.3)' },
            { offset: 1, color: 'rgba(0, 180, 42, 0.05)' }
          ])
        }
      },
      {
        name: '中风险',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [8, 6, 9, 7, 10, 8, 9],
        lineStyle: { color: '#FF7D00', width: 3 },
        itemStyle: { color: '#FF7D00' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 125, 0, 0.3)' },
            { offset: 1, color: 'rgba(255, 125, 0, 0.05)' }
          ])
        }
      },
      {
        name: '高风险',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [3, 2, 4, 3, 5, 4, 3],
        lineStyle: { color: '#F53F3F', width: 3 },
        itemStyle: { color: '#F53F3F' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 63, 63, 0.3)' },
            { offset: 1, color: 'rgba(245, 63, 63, 0.05)' }
          ])
        }
      },
      {
        name: '严重风险',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [1, 0, 2, 1, 0, 1, 2],
        lineStyle: { color: '#CB2634', width: 3 },
        itemStyle: { color: '#CB2634' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(203, 38, 52, 0.3)' },
            { offset: 1, color: 'rgba(203, 38, 52, 0.05)' }
          ])
        }
      }
    ]
  }
  
  riskTrendChart.setOption(option)
}

function getDeviceName(deviceId: number): string {
  const device = deviceList.value.find(d => d.id === deviceId)
  return device?.name || `设备#${deviceId}`
}

onMounted(() => {
  loadData()
  
  window.addEventListener('resize', () => {
    riskDistributionChart?.resize()
    riskTrendChart?.resize()
  })
})
</script>

<template>
  <div v-loading="loading" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
            <Shield class="w-7 h-7 text-primary-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">预测总数</p>
            <p class="text-3xl font-bold text-gray-800">{{ totalPredictions }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-danger-100 rounded-xl flex items-center justify-center">
            <AlertTriangle class="w-7 h-7 text-danger-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">高风险设备</p>
            <p class="text-3xl font-bold text-danger-600">{{ highRiskCount }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-4">
          <div :class="['w-14 h-14 rounded-xl flex items-center justify-center', riskLevel.bgColor]">
            <AlertCircle class="w-7 h-7" :style="{ color: riskLevel.color }" />
          </div>
          <div>
            <p class="text-sm text-gray-500">整体风险等级</p>
            <p class="text-3xl font-bold" :style="{ color: riskLevel.color }">{{ riskLevel.text }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-success-100 rounded-xl flex items-center justify-center">
            <TrendingUp class="w-7 h-7 text-success-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">模型准确率</p>
            <p class="text-3xl font-bold text-success-600">92.5%</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">风险等级分布</h3>
        <div ref="riskDistributionChartRef" class="h-80"></div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">风险趋势（近7天）</h3>
        <div ref="riskTrendChartRef" class="h-80"></div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <AlertTriangle class="w-5 h-5 text-danger-500" />
          高风险设备列表
        </h3>
      </div>
      <el-table
        :data="highRiskPredictions"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="设备名称" min-width="160">
          <template #default="{ row }">
            {{ getDeviceName(row.deviceId) }}
          </template>
        </el-table-column>
        <el-table-column prop="faultType" label="故障类型" width="140" />
        <el-table-column label="故障概率" width="120">
          <template #default="{ row }">
            <span class="font-semibold text-danger-600">
              {{ (row.probability * 100).toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="风险等级" width="120">
          <template #default="{ row }">
            <el-tag
              :type="row.riskLevel === 'critical' ? 'danger' : 'warning'"
              size="small"
              effect="dark"
            >
              {{ getStatusText(row.riskLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预测时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.predictedDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="modelVersion" label="模型版本" width="120" />
        <el-table-column label="建议措施" width="200">
          <template #default="{ row }">
            <span v-if="row.riskLevel === 'critical'" class="text-danger-600">
              立即停机检修
            </span>
            <span v-else-if="row.riskLevel === 'high'" class="text-warning-600">
              安排紧急维护
            </span>
            <span v-else class="text-primary-600">
              加强监控频率
            </span>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="highRiskPredictions.length === 0" class="px-6 py-12 text-center text-gray-400">
        暂无高风险设备
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
