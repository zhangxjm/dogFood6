<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { RefreshCw, Download, FileText, PieChart, BarChart3, LineChart, Calendar } from 'lucide-vue-next'
import { formatDate } from '@/utils'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const reportType = ref('device')
const dateRange = ref<[string, string]>(['', ''])

const deviceTypeChartRef = ref<HTMLElement>()
const statusPieChartRef = ref<HTMLElement>()
const maintenanceTypeChartRef = ref<HTMLElement>()
const costChartRef = ref<HTMLElement>()

let deviceTypeChart: echarts.ECharts | null = null
let statusPieChart: echarts.ECharts | null = null
let maintenanceTypeChart: echarts.ECharts | null = null
let costChart: echarts.ECharts | null = null

const reportOptions = [
  { value: 'device', label: '设备统计报表' },
  { value: 'maintenance', label: '维护统计报表' },
  { value: 'inventory', label: '库存统计报表' },
  { value: 'prediction', label: '预测统计报表' }
]

const reportData = reactive({
  totalDevices: 56,
  onlineDevices: 52,
  offlineDevices: 2,
  warningDevices: 1,
  errorDevices: 1,
  avgHealth: 87.5,
  totalMaintenance: 248,
  completedMaintenance: 215,
  maintenanceCost: 156800,
  avgMaintenanceTime: 2.5,
  totalParts: 156,
  lowStockParts: 12,
  outStockParts: 3,
  totalInventoryValue: 856000,
  totalPredictions: 89,
  highRiskPredictions: 12,
  predictionAccuracy: 92.3
})

function initDeviceTypeChart() {
  if (!deviceTypeChartRef.value) return
  
  deviceTypeChart = echarts.init(deviceTypeChartRef.value)
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 18, name: '电机', itemStyle: { color: '#165DFF' } },
          { value: 12, name: '泵', itemStyle: { color: '#00B42A' } },
          { value: 8, name: '压缩机', itemStyle: { color: '#FF7D00' } },
          { value: 10, name: '风机', itemStyle: { color: '#F53F3F' } },
          { value: 5, name: '传送带', itemStyle: { color: '#722ED1' } },
          { value: 3, name: '其他', itemStyle: { color: '#86909C' } }
        ]
      }
    ]
  }
  
  deviceTypeChart.setOption(option)
}

function initStatusPieChart() {
  if (!statusPieChartRef.value) return
  
  statusPieChart = echarts.init(statusPieChartRef.value)
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '60%',
        center: ['60%', '50%'],
        data: [
          { value: reportData.onlineDevices, name: '在线', itemStyle: { color: '#00B42A' } },
          { value: reportData.offlineDevices, name: '离线', itemStyle: { color: '#9CA3AF' } },
          { value: reportData.warningDevices, name: '预警', itemStyle: { color: '#FF7D00' } },
          { value: reportData.errorDevices, name: '故障', itemStyle: { color: '#F53F3F' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  statusPieChart.setOption(option)
}

function initMaintenanceTypeChart() {
  if (!maintenanceTypeChartRef.value) return
  
  maintenanceTypeChart = echarts.init(maintenanceTypeChartRef.value)
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['预防性维护', '纠错性维护', '预测性维护', '例行检查'],
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
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
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
        name: '预防性维护',
        type: 'bar',
        data: [12, 15, 18, 14, 16, 20],
        itemStyle: { color: '#165DFF' }
      },
      {
        name: '纠错性维护',
        type: 'bar',
        data: [8, 6, 5, 9, 7, 4],
        itemStyle: { color: '#F53F3F' }
      },
      {
        name: '预测性维护',
        type: 'bar',
        data: [5, 8, 12, 15, 18, 22],
        itemStyle: { color: '#00B42A' }
      },
      {
        name: '例行检查',
        type: 'bar',
        data: [10, 10, 12, 11, 13, 12],
        itemStyle: { color: '#FF7D00' }
      }
    ]
  }
  
  maintenanceTypeChart.setOption(option)
}

function initCostChart() {
  if (!costChartRef.value) return
  
  costChart = echarts.init(costChartRef.value)
  
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  const costData = [22000, 25000, 28000, 23000, 31000, 27800]
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>维护成本: ¥{c}',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' }
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
      data: months,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#6b7280',
        formatter: '¥{value}'
      },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      splitLine: { lineStyle: { color: '#f3f4f6' } }
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: costData,
        itemStyle: { color: '#165DFF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(22, 93, 255, 0.3)' },
            { offset: 1, color: 'rgba(22, 93, 255, 0.05)' }
          ])
        },
        lineStyle: { width: 3 }
      }
    ]
  }
  
  costChart.setOption(option)
}

function handleRefresh() {
  loading.value = true
  nextTick(() => {
    initDeviceTypeChart()
    initStatusPieChart()
    initMaintenanceTypeChart()
    initCostChart()
    loading.value = false
    ElMessage.success('刷新成功')
  })
}

function handleExport() {
  ElMessage.success('报表导出成功')
}

function handlePrint() {
  window.print()
}

function handleResize() {
  deviceTypeChart?.resize()
  statusPieChart?.resize()
  maintenanceTypeChart?.resize()
  costChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    initDeviceTypeChart()
    initStatusPieChart()
    initMaintenanceTypeChart()
    initCostChart()
  })
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  deviceTypeChart?.dispose()
  statusPieChart?.dispose()
  maintenanceTypeChart?.dispose()
  costChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <el-radio-group v-model="reportType" size="large">
            <el-radio-button
              v-for="option in reportOptions"
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
        <div class="flex items-center gap-2">
          <el-button @click="handlePrint">
            <FileText class="w-4 h-4 mr-2" />
            打印
          </el-button>
          <el-button @click="handleExport">
            <Download class="w-4 h-4 mr-2" />
            导出
          </el-button>
          <el-button type="primary" @click="handleRefresh" :loading="loading">
            <RefreshCw class="w-4 h-4 mr-2" />
            刷新数据
          </el-button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">设备总数</p>
            <p class="text-2xl font-bold text-primary-500 mt-1">{{ reportData.totalDevices }}</p>
          </div>
          <div class="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
            <PieChart class="w-6 h-6 text-primary-500" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">维护任务总数</p>
            <p class="text-2xl font-bold text-success-500 mt-1">{{ reportData.totalMaintenance }}</p>
          </div>
          <div class="w-12 h-12 bg-success-50 rounded-full flex items-center justify-center">
            <BarChart3 class="w-6 h-6 text-success-500" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">维护总成本</p>
            <p class="text-2xl font-bold text-warning-500 mt-1">¥{{ reportData.maintenanceCost.toLocaleString() }}</p>
          </div>
          <div class="w-12 h-12 bg-warning-50 rounded-full flex items-center justify-center">
            <LineChart class="w-6 h-6 text-warning-500" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">预测准确率</p>
            <p class="text-2xl font-bold text-primary-500 mt-1">{{ reportData.predictionAccuracy }}%</p>
          </div>
          <div class="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
            <Calendar class="w-6 h-6 text-primary-500" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <PieChart class="w-5 h-5 text-primary-500" />
          设备类型分布
        </h3>
        <div ref="deviceTypeChartRef" class="w-full h-80"></div>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <PieChart class="w-5 h-5 text-primary-500" />
          设备状态分布
        </h3>
        <div ref="statusPieChartRef" class="w-full h-80"></div>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 class="w-5 h-5 text-primary-500" />
          维护类型统计
        </h3>
        <div ref="maintenanceTypeChartRef" class="w-full h-80"></div>
      </div>
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <LineChart class="w-5 h-5 text-primary-500" />
          维护成本趋势
        </h3>
        <div ref="costChartRef" class="w-full h-80"></div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FileText class="w-5 h-5 text-primary-500" />
          详细统计数据
        </h3>
      </div>
      <div class="p-6">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="设备总数">
            <span class="font-semibold">{{ reportData.totalDevices }}</span> 台
          </el-descriptions-item>
          <el-descriptions-item label="在线设备">
            <span class="font-semibold text-success-500">{{ reportData.onlineDevices }}</span> 台
          </el-descriptions-item>
          <el-descriptions-item label="离线设备">
            <span class="font-semibold text-gray-500">{{ reportData.offlineDevices }}</span> 台
          </el-descriptions-item>
          <el-descriptions-item label="预警设备">
            <span class="font-semibold text-warning-500">{{ reportData.warningDevices }}</span> 台
          </el-descriptions-item>
          <el-descriptions-item label="故障设备">
            <span class="font-semibold text-danger-500">{{ reportData.errorDevices }}</span> 台
          </el-descriptions-item>
          <el-descriptions-item label="平均健康度">
            <span class="font-semibold text-primary-500">{{ reportData.avgHealth }}%</span>
          </el-descriptions-item>
          <el-descriptions-item label="维护任务总数">
            <span class="font-semibold">{{ reportData.totalMaintenance }}</span> 次
          </el-descriptions-item>
          <el-descriptions-item label="已完成任务">
            <span class="font-semibold text-success-500">{{ reportData.completedMaintenance }}</span> 次
          </el-descriptions-item>
          <el-descriptions-item label="维护总成本">
            <span class="font-semibold text-warning-500">¥{{ reportData.maintenanceCost.toLocaleString() }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="平均维护时长">
            <span class="font-semibold">{{ reportData.avgMaintenanceTime }}</span> 小时
          </el-descriptions-item>
          <el-descriptions-item label="备件总数">
            <span class="font-semibold">{{ reportData.totalParts }}</span> 种
          </el-descriptions-item>
          <el-descriptions-item label="库存总价值">
            <span class="font-semibold text-success-500">¥{{ reportData.totalInventoryValue.toLocaleString() }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="低库存备件">
            <span class="font-semibold text-warning-500">{{ reportData.lowStockParts }}</span> 种
          </el-descriptions-item>
          <el-descriptions-item label="缺货备件">
            <span class="font-semibold text-danger-500">{{ reportData.outStockParts }}</span> 种
          </el-descriptions-item>
          <el-descriptions-item label="预测总数">
            <span class="font-semibold">{{ reportData.totalPredictions }}</span> 次
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>
</template>
