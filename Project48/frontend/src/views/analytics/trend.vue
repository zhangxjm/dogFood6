<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { RefreshCw, TrendingUp, Activity, AlertTriangle, Clock, BarChart3 } from 'lucide-vue-next'
import { deviceApi } from '@/api/device'
import { predictionApi } from '@/api/prediction'
import { maintenanceApi } from '@/api/maintenance'
import { inventoryApi } from '@/api/inventory'
import { formatDate } from '@/utils'
import type { HealthTrendItem, Device, PredictionStats, MaintenanceStats, InventoryStats } from '@/types'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const dateRange = ref<[string, string]>(['', ''])
const trendType = ref('health')

const healthChartRef = ref<HTMLElement>()
const deviceChartRef = ref<HTMLElement>()
const predictionChartRef = ref<HTMLElement>()
const maintenanceChartRef = ref<HTMLElement>()

let healthChart: echarts.ECharts | null = null
let deviceChart: echarts.ECharts | null = null
let predictionChart: echarts.ECharts | null = null
let maintenanceChart: echarts.ECharts | null = null

const trendOptions = [
  { value: 'health', label: '健康度趋势' },
  { value: 'device', label: '设备状态趋势' },
  { value: 'prediction', label: '故障预测趋势' },
  { value: 'maintenance', label: '维护任务趋势' }
]

const healthTrendData = ref<HealthTrendItem[]>([])
const predictionStats = ref<PredictionStats>({ low: 0, medium: 0, high: 0, critical: 0 })
const maintenanceStats = ref<MaintenanceStats>({
  pending: 0, approved: 0, inProgress: 0, completed: 0, overdue: 0, today: 0, thisWeek: 0
})
const inventoryStats = ref<InventoryStats>({ totalItems: 0, lowStockItems: 0, outStockItems: 0, totalValue: 0 })

function generateMockHealthTrend() {
  const data: HealthTrendItem[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: formatDate(date, 'YYYY-MM-DD'),
      avgHealth: Math.floor(Math.random() * 20) + 75,
      deviceCount: Math.floor(Math.random() * 10) + 50
    })
  }
  return data
}

function generateMockDeviceStatus() {
  const dates = []
  const onlineData = []
  const offlineData = []
  const warningData = []
  const errorData = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(formatDate(date, 'MM-DD'))
    onlineData.push(Math.floor(Math.random() * 15) + 40)
    offlineData.push(Math.floor(Math.random() * 5) + 2)
    warningData.push(Math.floor(Math.random() * 8) + 3)
    errorData.push(Math.floor(Math.random() * 5) + 1)
  }
  return { dates, onlineData, offlineData, warningData, errorData }
}

function generateMockPredictionTrend() {
  const dates = []
  const lowData = []
  const mediumData = []
  const highData = []
  const criticalData = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(formatDate(date, 'MM-DD'))
    lowData.push(Math.floor(Math.random() * 10) + 5)
    mediumData.push(Math.floor(Math.random() * 8) + 3)
    highData.push(Math.floor(Math.random() * 5) + 1)
    criticalData.push(Math.floor(Math.random() * 3))
  }
  return { dates, lowData, mediumData, highData, criticalData }
}

function generateMockMaintenanceTrend() {
  const dates = []
  const completedData = []
  const inProgressData = []
  const pendingData = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(formatDate(date, 'MM-DD'))
    completedData.push(Math.floor(Math.random() * 8) + 3)
    inProgressData.push(Math.floor(Math.random() * 5) + 1)
    pendingData.push(Math.floor(Math.random() * 6) + 2)
  }
  return { dates, completedData, inProgressData, pendingData }
}

function initHealthChart() {
  if (!healthChartRef.value) return
  
  healthChart = echarts.init(healthChartRef.value)
  const data = generateMockHealthTrend()
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' }
    },
    legend: {
      data: ['平均健康度', '设备数量'],
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
      data: data.map(d => d.date.slice(5)),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' }
    },
    yAxis: [
      {
        type: 'value',
        name: '健康度(%)',
        min: 0,
        max: 100,
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280' },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      },
      {
        type: 'value',
        name: '设备数量',
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '平均健康度',
        type: 'line',
        smooth: true,
        data: data.map(d => d.avgHealth),
        itemStyle: { color: '#165DFF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(22, 93, 255, 0.3)' },
            { offset: 1, color: 'rgba(22, 93, 255, 0.05)' }
          ])
        },
        lineStyle: { width: 2 }
      },
      {
        name: '设备数量',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: data.map(d => d.deviceCount),
        itemStyle: { color: '#00B42A' },
        lineStyle: { width: 2 }
      }
    ]
  }
  
  healthChart.setOption(option)
}

function initDeviceChart() {
  if (!deviceChartRef.value) return
  
  deviceChart = echarts.init(deviceChartRef.value)
  const data = generateMockDeviceStatus()
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' }
    },
    legend: {
      data: ['在线', '离线', '预警', '故障'],
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
      data: data.dates,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    series: [
      {
        name: '在线',
        type: 'bar',
        stack: 'total',
        data: data.onlineData,
        itemStyle: { color: '#00B42A' }
      },
      {
        name: '离线',
        type: 'bar',
        stack: 'total',
        data: data.offlineData,
        itemStyle: { color: '#9CA3AF' }
      },
      {
        name: '预警',
        type: 'bar',
        stack: 'total',
        data: data.warningData,
        itemStyle: { color: '#FF7D00' }
      },
      {
        name: '故障',
        type: 'bar',
        stack: 'total',
        data: data.errorData,
        itemStyle: { color: '#F53F3F' }
      }
    ]
  }
  
  deviceChart.setOption(option)
}

function initPredictionChart() {
  if (!predictionChartRef.value) return
  
  predictionChart = echarts.init(predictionChartRef.value)
  const data = generateMockPredictionTrend()
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' }
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
      data: data.dates,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    series: [
      {
        name: '低风险',
        type: 'line',
        smooth: true,
        data: data.lowData,
        itemStyle: { color: '#00B42A' },
        lineStyle: { width: 2 }
      },
      {
        name: '中风险',
        type: 'line',
        smooth: true,
        data: data.mediumData,
        itemStyle: { color: '#FF7D00' },
        lineStyle: { width: 2 }
      },
      {
        name: '高风险',
        type: 'line',
        smooth: true,
        data: data.highData,
        itemStyle: { color: '#F53F3F' },
        lineStyle: { width: 2 }
      },
      {
        name: '严重风险',
        type: 'line',
        smooth: true,
        data: data.criticalData,
        itemStyle: { color: '#CB2634' },
        lineStyle: { width: 2 }
      }
    ]
  }
  
  predictionChart.setOption(option)
}

function initMaintenanceChart() {
  if (!maintenanceChartRef.value) return
  
  maintenanceChart = echarts.init(maintenanceChartRef.value)
  const data = generateMockMaintenanceTrend()
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' }
    },
    legend: {
      data: ['已完成', '进行中', '待处理'],
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
      data: data.dates,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    series: [
      {
        name: '已完成',
        type: 'bar',
        data: data.completedData,
        itemStyle: { color: '#00B42A' }
      },
      {
        name: '进行中',
        type: 'bar',
        data: data.inProgressData,
        itemStyle: { color: '#165DFF' }
      },
      {
        name: '待处理',
        type: 'bar',
        data: data.pendingData,
        itemStyle: { color: '#FF7D00' }
      }
    ]
  }
  
  maintenanceChart.setOption(option)
}

function handleRefresh() {
  loading.value = true
  nextTick(() => {
    initHealthChart()
    initDeviceChart()
    initPredictionChart()
    initMaintenanceChart()
    loading.value = false
    ElMessage.success('刷新成功')
  })
}

function handleResize() {
  healthChart?.resize()
  deviceChart?.resize()
  predictionChart?.resize()
  maintenanceChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    initHealthChart()
    initDeviceChart()
    initPredictionChart()
    initMaintenanceChart()
  })
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  healthChart?.dispose()
  deviceChart?.dispose()
  predictionChart?.dispose()
  maintenanceChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <el-radio-group v-model="trendType" size="large">
            <el-radio-button
              v-for="option in trendOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </el-radio-button>
          </el-radio-group>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </div>
        <el-button type="primary" @click="handleRefresh" :loading="loading">
          <RefreshCw class="w-4 h-4 mr-2" />
          刷新数据
        </el-button>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">平均健康度</p>
            <p class="text-2xl font-bold text-primary-500 mt-1">87.5%</p>
          </div>
          <div class="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
            <Activity class="w-6 h-6 text-primary-500" />
          </div>
        </div>
        <p class="text-xs text-success-500 mt-2 flex items-center gap-1">
          <TrendingUp class="w-3 h-3" />
          较上周上升 2.3%
        </p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">在线设备</p>
            <p class="text-2xl font-bold text-success-500 mt-1">52</p>
          </div>
          <div class="w-12 h-12 bg-success-50 rounded-full flex items-center justify-center">
            <Activity class="w-6 h-6 text-success-500" />
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2">在线率 92.9%</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">预警设备</p>
            <p class="text-2xl font-bold text-warning-500 mt-1">7</p>
          </div>
          <div class="w-12 h-12 bg-warning-50 rounded-full flex items-center justify-center">
            <AlertTriangle class="w-6 h-6 text-warning-500" />
          </div>
        </div>
        <p class="text-xs text-warning-500 mt-2">需关注</p>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">今日维护</p>
            <p class="text-2xl font-bold text-primary-500 mt-1">5</p>
          </div>
          <div class="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
            <Clock class="w-6 h-6 text-primary-500" />
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2">已完成 3 项</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 class="w-5 h-5 text-primary-500" />
          健康度趋势
        </h3>
        <div ref="healthChartRef" class="w-full h-80"></div>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 class="w-5 h-5 text-primary-500" />
          设备状态趋势
        </h3>
        <div ref="deviceChartRef" class="w-full h-80"></div>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 class="w-5 h-5 text-primary-500" />
          故障预测趋势
        </h3>
        <div ref="predictionChartRef" class="w-full h-80"></div>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 class="w-5 h-5 text-primary-500" />
          维护任务趋势
        </h3>
        <div ref="maintenanceChartRef" class="w-full h-80"></div>
      </div>
    </div>
  </div>
</template>
