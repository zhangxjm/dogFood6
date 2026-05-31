<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { Cpu, AlertTriangle, CheckCircle, XCircle, Gauge, Wrench, TrendingUp, Bell, Eye } from 'lucide-vue-next'
import StatCard from '@/components/StatCard.vue'
import { deviceApi } from '@/api/device'
import { predictionApi } from '@/api/prediction'
import { maintenanceApi } from '@/api/maintenance'
import { getHealthColor, getHealthStatus, formatDate, getStatusText, getStatusType } from '@/utils'
import type { DeviceStats, HealthTrendItem, Prediction, MaintenanceStats } from '@/types'

const router = useRouter()

const loading = ref(true)
const deviceStats = ref<DeviceStats | null>(null)
const predictionStats = ref({ low: 0, medium: 0, high: 0, critical: 0 })
const maintenanceStats = ref<MaintenanceStats | null>(null)
const healthTrend = ref<HealthTrendItem[]>([])
const highRiskPredictions = ref<Prediction[]>([])

const healthChartRef = ref<HTMLDivElement>()
let healthChart: echarts.ECharts | null = null

const avgHealthDisplay = computed(() => {
  if (!deviceStats.value) return '0'
  return deviceStats.value.avgHealth.toFixed(1)
})

const healthColor = computed(() => {
  if (!deviceStats.value) return '#165DFF'
  return getHealthColor(deviceStats.value.avgHealth)
})

const healthStatus = computed(() => {
  if (!deviceStats.value) return '未知'
  return getHealthStatus(deviceStats.value.avgHealth)
})

function initHealthChart() {
  if (!healthChartRef.value) return
  
  healthChart = echarts.init(healthChartRef.value)
  
  const dates = healthTrend.value.map(item => item.date)
  const values = healthTrend.value.map(item => item.avgHealth)
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const p = params as Array<{ axisValue: string; value: number }>
        return `${p[0].axisValue}<br/>平均健康度: ${p[0].value.toFixed(1)}%`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      axisLabel: { color: '#86909C', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#F2F3F5', type: 'dashed' } },
      axisLabel: { color: '#86909C', fontSize: 12, formatter: '{value}%' }
    },
    series: [{
      name: '健康度',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: values,
      lineStyle: { color: '#165DFF', width: 3 },
      itemStyle: { color: '#165DFF' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(22, 93, 255, 0.3)' },
          { offset: 1, color: 'rgba(22, 93, 255, 0.05)' }
        ])
      }
    }]
  }
  
  healthChart.setOption(option)
}

function viewDeviceDetail(deviceId: number) {
  router.push(`/devices/${deviceId}`)
}

async function loadData() {
  loading.value = true
  try {
    const [stats, predStats, maintStats, trend, highRisk] = await Promise.all([
      deviceApi.getStats(),
      predictionApi.getStats(),
      maintenanceApi.getPlanStats(),
      deviceApi.getHealthTrend(30),
      predictionApi.getHighRisk()
    ])
    
    deviceStats.value = stats
    predictionStats.value = predStats
    maintenanceStats.value = maintStats
    healthTrend.value = trend
    highRiskPredictions.value = highRisk.slice(0, 5)
    
    setTimeout(() => initHealthChart(), 100)
  } catch (error) {
    console.error('加载仪表盘数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  
  window.addEventListener('resize', () => {
    healthChart?.resize()
  })
})
</script>

<template>
  <div v-loading="loading" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="设备总数"
        :value="deviceStats?.total || 0"
        :icon="Cpu"
        color="primary"
        :trend="5.2"
        suffix="台"
      />
      <StatCard
        title="在线设备"
        :value="deviceStats?.online || 0"
        :icon="CheckCircle"
        color="success"
        :trend="3.1"
        suffix="台"
      />
      <StatCard
        title="预警设备"
        :value="deviceStats?.warning || 0"
        :icon="AlertTriangle"
        color="warning"
        :trend="-2.4"
        suffix="台"
      />
      <StatCard
        title="故障设备"
        :value="deviceStats?.error || 0"
        :icon="XCircle"
        color="danger"
        :trend="-1.8"
        suffix="台"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-800">平均健康度</h3>
          <Gauge class="w-5 h-5 text-gray-400" />
        </div>
        <div class="flex items-center justify-center mb-4">
          <div class="relative w-40 h-40">
            <svg class="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#E5E6EB"
                stroke-width="12"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                :stroke="healthColor"
                stroke-width="12"
                stroke-linecap="round"
                :stroke-dasharray="`${(deviceStats?.avgHealth || 0) * 4.4} 440`"
                class="transition-all duration-1000"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-4xl font-bold" :style="{ color: healthColor }">{{ avgHealthDisplay }}%</span>
              <span class="text-sm text-gray-500">{{ healthStatus }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">健康度趋势（近30天）</h3>
          <TrendingUp class="w-5 h-5 text-gray-400" />
        </div>
        <div ref="healthChartRef" class="h-64"></div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Bell class="w-5 h-5 text-warning-500" />
            故障预警列表
          </h3>
          <el-button type="primary" text @click="$router.push('/predictions/list')">
            查看全部
          </el-button>
        </div>
        <div class="divide-y divide-gray-50">
          <div
            v-for="item in highRiskPredictions"
            :key="item.id"
            class="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="viewDeviceDetail(item.deviceId)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-1">
                  <span class="font-medium text-gray-800">{{ item.deviceName }}</span>
                  <el-tag
                    :type="item.riskLevel === 'critical' || item.riskLevel === 'high' ? 'danger' : 'warning'"
                    size="small"
                  >
                    {{ getStatusText(item.riskLevel) }}风险
                  </el-tag>
                </div>
                <p class="text-sm text-gray-500">{{ item.faultType }}</p>
                <p class="text-xs text-gray-400 mt-1">预测时间: {{ formatDate(item.predictedDate) }}</p>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold" :style="{ color: item.probability > 0.7 ? '#F53F3F' : '#FF7D00' }">
                  {{ (item.probability * 100).toFixed(1) }}%
                </div>
                <div class="text-xs text-gray-400">故障概率</div>
              </div>
            </div>
          </div>
          <div v-if="highRiskPredictions.length === 0" class="px-6 py-12 text-center text-gray-400">
            暂无预警信息
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Wrench class="w-5 h-5 text-primary-500" />
            维护任务统计
          </h3>
          <el-button type="primary" text @click="$router.push('/maintenance/tasks')">
            查看全部
          </el-button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-warning-500">{{ maintenanceStats?.pending || 0 }}</div>
              <div class="text-sm text-gray-500 mt-1">待处理</div>
            </div>
            <div class="text-center p-4 bg-primary-50 rounded-lg">
              <div class="text-2xl font-bold text-primary-500">{{ maintenanceStats?.inProgress || 0 }}</div>
              <div class="text-sm text-gray-500 mt-1">进行中</div>
            </div>
            <div class="text-center p-4 bg-success-50 rounded-lg">
              <div class="text-2xl font-bold text-success-500">{{ maintenanceStats?.completed || 0 }}</div>
              <div class="text-sm text-gray-500 mt-1">已完成</div>
            </div>
          </div>
          <div class="flex items-center justify-between py-3 border-t border-gray-100">
            <span class="text-gray-600">今日待处理</span>
            <span class="font-medium text-warning-500">{{ maintenanceStats?.today || 0 }} 项</span>
          </div>
          <div class="flex items-center justify-between py-3 border-t border-gray-100">
            <span class="text-gray-600">本周待处理</span>
            <span class="font-medium text-warning-500">{{ maintenanceStats?.thisWeek || 0 }} 项</span>
          </div>
          <div class="flex items-center justify-between py-3 border-t border-gray-100">
            <span class="text-gray-600">已逾期</span>
            <span class="font-medium text-danger-500">{{ maintenanceStats?.overdue || 0 }} 项</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">风险等级分布</h3>
        <div class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-600">低风险</span>
              <span class="text-sm font-medium text-success-500">{{ predictionStats.low }}</span>
            </div>
            <el-progress :percentage="predictionStats.low" color="#00B42A" :show-text="false" />
          </div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-600">中风险</span>
              <span class="text-sm font-medium text-warning-500">{{ predictionStats.medium }}</span>
            </div>
            <el-progress :percentage="predictionStats.medium" color="#FF7D00" :show-text="false" />
          </div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-600">高风险</span>
              <span class="text-sm font-medium text-danger-500">{{ predictionStats.high }}</span>
            </div>
            <el-progress :percentage="predictionStats.high" color="#F53F3F" :show-text="false" />
          </div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-600">严重风险</span>
              <span class="text-sm font-medium text-danger-600">{{ predictionStats.critical }}</span>
            </div>
            <el-progress :percentage="predictionStats.critical" color="#CB2634" :show-text="false" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">快捷操作</h3>
        <div class="grid grid-cols-2 gap-4">
          <el-button
            type="primary"
            size="large"
            class="h-20 flex flex-col items-center justify-center gap-2"
            @click="$router.push('/devices/list')"
          >
            <Cpu class="w-6 h-6" />
            <span>设备管理</span>
          </el-button>
          <el-button
            type="warning"
            size="large"
            class="h-20 flex flex-col items-center justify-center gap-2"
            @click="$router.push('/predictions/list')"
          >
            <AlertTriangle class="w-6 h-6" />
            <span>故障预测</span>
          </el-button>
          <el-button
            type="success"
            size="large"
            class="h-20 flex flex-col items-center justify-center gap-2"
            @click="$router.push('/maintenance/calendar')"
          >
            <Wrench class="w-6 h-6" />
            <span>维护计划</span>
          </el-button>
          <el-button
            type="info"
            size="large"
            class="h-20 flex flex-col items-center justify-center gap-2"
            @click="$router.push('/inventory/list')"
          >
            <Eye class="w-6 h-6" />
            <span>库存管理</span>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
