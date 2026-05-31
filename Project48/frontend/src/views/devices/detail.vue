<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { ArrowLeft, RefreshCw, Activity, AlertTriangle, Clock, MapPin, Calendar, Info } from 'lucide-vue-next'
import { deviceApi } from '@/api/device'
import { formatDate, getStatusText, getStatusType, getHealthColor, getHealthStatus } from '@/utils'
import type { Device, RealtimeDataResponse, HistoryDataResponse, Sensor } from '@/types'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const device = ref<Device | null>(null)
const realtimeData = ref<RealtimeDataResponse | null>(null)
const historyData = ref<HistoryDataResponse | null>(null)
const timeRange = ref(24)

const historyChartRef = ref<HTMLDivElement>()
let historyChart: echarts.ECharts | null = null
let refreshTimer: ReturnType<typeof setInterval> | null = null

const deviceId = computed(() => Number(route.params.id))

const healthColor = computed(() => {
  if (!device.value) return '#165DFF'
  return getHealthColor(device.value.healthScore)
})

const healthStatus = computed(() => {
  if (!device.value) return '未知'
  return getHealthStatus(device.value.healthScore)
})

const deviceTypes = [
  { value: 'motor', label: '电机' },
  { value: 'pump', label: '泵' },
  { value: 'compressor', label: '压缩机' },
  { value: 'fan', label: '风机' },
  { value: 'conveyor', label: '传送带' },
  { value: 'other', label: '其他' }
]

const deviceTypeLabel = computed(() => {
  if (!device.value) return '-'
  return deviceTypes.find(t => t.value === device.value?.type)?.label || device.value.type
})

function goBack() {
  router.back()
}

function getSensorValue(sensor: Sensor): number {
  if (realtimeData.value?.data) {
    return realtimeData.value.data[sensor.name] ?? sensor.minValue
  }
  return sensor.minValue
}

function getSensorStatus(sensor: Sensor): 'normal' | 'warning' | 'danger' {
  const value = getSensorValue(sensor)
  const range = sensor.maxValue - sensor.minValue
  const warningThreshold = sensor.minValue + range * 0.8
  const dangerThreshold = sensor.minValue + range * 0.9
  
  if (value >= dangerThreshold) return 'danger'
  if (value >= warningThreshold) return 'warning'
  return 'normal'
}

function initHistoryChart() {
  if (!historyChartRef.value || !historyData.value) return
  
  historyChart = echarts.init(historyChartRef.value)
  
  const timestamps = historyData.value.timestamps
  const series: echarts.SeriesOption[] = Object.entries(historyData.value.data).map(([name, data], index) => {
    const colors = ['#165DFF', '#FF7D00', '#00B42A', '#F53F3F', '#722ED1']
    return {
      name,
      type: 'line',
      smooth: true,
      symbol: 'none',
      data,
      lineStyle: { color: colors[index % colors.length], width: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${colors[index % colors.length]}33` },
          { offset: 1, color: `${colors[index % colors.length]}05` }
        ])
      }
    }
  })
  
  const legendData = Object.keys(historyData.value.data)
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: legendData,
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
      data: timestamps,
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      axisLabel: { color: '#86909C', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F2F3F5', type: 'dashed' } },
      axisLabel: { color: '#86909C', fontSize: 11 }
    },
    series
  }
  
  historyChart.setOption(option)
}

async function loadDevice() {
  if (!deviceId.value) return
  
  loading.value = true
  try {
    const [deviceData, realtime, history] = await Promise.all([
      deviceApi.getById(deviceId.value),
      deviceApi.getRealtimeData(deviceId.value),
      deviceApi.getHistoryData(deviceId.value, timeRange.value)
    ])
    
    device.value = deviceData
    realtimeData.value = realtime
    historyData.value = history
    
    setTimeout(() => initHistoryChart(), 100)
  } catch (error) {
    console.error('加载设备详情失败:', error)
  } finally {
    loading.value = false
  }
}

async function refreshRealtimeData() {
  if (!deviceId.value) return
  
  try {
    const realtime = await deviceApi.getRealtimeData(deviceId.value)
    realtimeData.value = realtime
  } catch (error) {
    console.error('刷新实时数据失败:', error)
  }
}

async function handleTimeRangeChange() {
  if (!deviceId.value) return
  
  try {
    const history = await deviceApi.getHistoryData(deviceId.value, timeRange.value)
    historyData.value = history
    setTimeout(() => initHistoryChart(), 50)
  } catch (error) {
    console.error('加载历史数据失败:', error)
  }
}

function handleRefresh() {
  loadDevice()
}

onMounted(() => {
  loadDevice()
  
  refreshTimer = setInterval(refreshRealtimeData, 5000)
  
  window.addEventListener('resize', () => {
    historyChart?.resize()
  })
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  historyChart?.dispose()
})
</script>

<template>
  <div v-loading="loading" class="space-y-6">
    <div class="flex items-center gap-4">
      <el-button @click="goBack">
        <ArrowLeft class="w-4 h-4 mr-2" />
        返回
      </el-button>
      <h2 class="text-xl font-semibold text-gray-800">设备详情</h2>
      <el-button type="primary" @click="handleRefresh">
        <RefreshCw class="w-4 h-4 mr-2" />
        刷新数据
      </el-button>
    </div>

    <div v-if="device" class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="px-6 py-5 border-b border-gray-100">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-2xl font-bold text-gray-800">{{ device.name }}</h3>
              <el-tag :type="getStatusType(device.status)" size="large">
                {{ getStatusText(device.status) }}
              </el-tag>
            </div>
            <p class="text-gray-500">设备编号: {{ device.code }}</p>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-center">
              <div class="text-4xl font-bold" :style="{ color: healthColor }">
                {{ device.healthScore }}%
              </div>
              <div class="text-sm text-gray-500 mt-1">健康度 - {{ healthStatus }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y md:divide-y-0 divide-gray-100">
        <div class="p-6">
          <div class="flex items-center gap-2 text-gray-500 mb-2">
            <Info class="w-4 h-4" />
            <span class="text-sm">设备类型</span>
          </div>
          <div class="text-lg font-medium text-gray-800">{{ deviceTypeLabel }}</div>
        </div>
        <div class="p-6">
          <div class="flex items-center gap-2 text-gray-500 mb-2">
            <MapPin class="w-4 h-4" />
            <span class="text-sm">安装位置</span>
          </div>
          <div class="text-lg font-medium text-gray-800">{{ device.location }}</div>
        </div>
        <div class="p-6">
          <div class="flex items-center gap-2 text-gray-500 mb-2">
            <Calendar class="w-4 h-4" />
            <span class="text-sm">安装日期</span>
          </div>
          <div class="text-lg font-medium text-gray-800">{{ formatDate(device.installDate, 'YYYY-MM-DD') }}</div>
        </div>
        <div class="p-6">
          <div class="flex items-center gap-2 text-gray-500 mb-2">
            <Clock class="w-4 h-4" />
            <span class="text-sm">最近维护</span>
          </div>
          <div class="text-lg font-medium text-gray-800">
            {{ device.lastMaintenance ? formatDate(device.lastMaintenance, 'YYYY-MM-DD') : '暂无' }}
          </div>
        </div>
      </div>

      <div v-if="device.description" class="px-6 py-4 border-t border-gray-100">
        <div class="text-sm text-gray-500 mb-1">设备描述</div>
        <div class="text-gray-700">{{ device.description }}</div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Activity class="w-5 h-5 text-primary-500" />
          实时数据监控
          <span class="text-xs text-gray-400 font-normal">(每5秒自动刷新)</span>
        </h3>
        <div v-if="realtimeData" class="text-sm text-gray-500">
          更新时间: {{ formatDate(realtimeData.timestamp) }}
        </div>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            v-for="sensor in device?.sensors"
            :key="sensor.id"
            class="bg-gray-50 rounded-xl p-5"
          >
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-gray-500">{{ sensor.name }}</span>
              <el-tag
                :type="getSensorStatus(sensor) === 'normal' ? 'success' : getSensorStatus(sensor) === 'warning' ? 'warning' : 'danger'"
                size="small"
              >
                {{ getSensorStatus(sensor) === 'normal' ? '正常' : getSensorStatus(sensor) === 'warning' ? '预警' : '危险' }}
              </el-tag>
            </div>
            <div class="text-3xl font-bold text-gray-800 mb-2">
              {{ getSensorValue(sensor).toFixed(2) }}
              <span class="text-sm font-normal text-gray-500 ml-1">{{ sensor.unit }}</span>
            </div>
            <div class="text-xs text-gray-400">
              范围: {{ sensor.minValue }} - {{ sensor.maxValue }} {{ sensor.unit }}
            </div>
            <el-progress
              class="mt-3"
              :percentage="((getSensorValue(sensor) - sensor.minValue) / (sensor.maxValue - sensor.minValue) * 100)"
              :color="getSensorStatus(sensor) === 'normal' ? '#00B42A' : getSensorStatus(sensor) === 'warning' ? '#FF7D00' : '#F53F3F'"
              :show-text="false"
              :stroke-width="6"
            />
          </div>
        </div>
        <div v-if="!device?.sensors?.length" class="text-center py-12 text-gray-400">
          暂无传感器数据
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp class="w-5 h-5 text-primary-500" />
          历史数据趋势
        </h3>
        <el-radio-group v-model="timeRange" size="small" @change="handleTimeRangeChange">
          <el-radio-button :label="6">6小时</el-radio-button>
          <el-radio-button :label="24">24小时</el-radio-button>
          <el-radio-button :label="72">3天</el-radio-button>
          <el-radio-button :label="168">7天</el-radio-button>
        </el-radio-group>
      </div>
      <div class="p-6">
        <div ref="historyChartRef" class="h-80"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { TrendingUp } from 'lucide-vue-next'
export default {
  components: { TrendingUp }
}
</script>

<style scoped>
</style>
