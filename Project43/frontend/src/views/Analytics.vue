<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { progressAPI, userAPI } from '@/api'
import type { AnalyticsData, User } from '@/api'

const authStore = useAuthStore()
const loading = ref(false)
const analytics = ref<AnalyticsData | null>(null)
const patients = ref<User[]>([])
const selectedPatient = ref(0)
const selectedDays = ref(30)

const canSelectPatient = computed(() => 
  authStore.userRole === 'admin' || authStore.userRole === 'doctor'
)

const lineChartOption = computed(() => {
  if (!analytics.value) return {}
  
  const dates = analytics.value.daily_data.map(d => d.date.slice(5))
  const accuracyData = analytics.value.daily_data.map(d => d.avg_accuracy)
  const successData = analytics.value.daily_data.map(d => d.success_rate)
  const sessionData = analytics.value.daily_data.map(d => d.sessions)
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['准确率', '成功率', '训练次数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: [
      {
        type: 'value',
        name: '百分比(%)',
        min: 0,
        max: 100,
        position: 'left'
      },
      {
        type: 'value',
        name: '次数',
        min: 0,
        position: 'right'
      }
    ],
    series: [
      {
        name: '准确率',
        type: 'line',
        smooth: true,
        data: accuracyData,
        lineStyle: { width: 3 },
        itemStyle: { color: '#409eff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ]
          }
        }
      },
      {
        name: '成功率',
        type: 'line',
        smooth: true,
        data: successData,
        lineStyle: { width: 3 },
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '训练次数',
        type: 'bar',
        yAxisIndex: 1,
        data: sessionData,
        itemStyle: { color: '#e6a23c', borderRadius: [4, 4, 0, 0] },
        barWidth: '30%'
      }
    ]
  }
})

const commandChartOption = computed(() => {
  if (!analytics.value) return {}
  
  const data = analytics.value.command_stats.slice(0, 8)
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '次数'
    },
    yAxis: {
      type: 'category',
      data: data.map(d => d.command_name || d.command),
      inverse: true
    },
    series: [
      {
        name: '训练次数',
        type: 'bar',
        data: data.map(d => d.count),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' }
            ]
          },
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}次'
        }
      }
    ]
  }
})

const categoryPieOption = computed(() => {
  if (!analytics.value) return {}
  
  const data = analytics.value.category_stats.map(c => ({
    value: c.count,
    name: c.category_name || c.category
  }))
  
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}次 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: data,
        color: colors
      }
    ]
  }
})

const loadData = async () => {
  loading.value = true
  try {
    const userId = canSelectPatient.value && selectedPatient.value > 0 
      ? selectedPatient.value 
      : undefined
    analytics.value = await progressAPI.getAnalytics(userId, selectedDays.value)
  } catch (e) {
    console.error('Failed to load analytics:', e)
  } finally {
    loading.value = false
  }
}

const loadPatients = async () => {
  if (canSelectPatient.value) {
    try {
      patients.value = await userAPI.getPatients()
      if (patients.value.length > 0) {
        selectedPatient.value = patients.value[0].id
      }
    } catch (e) {
      console.error('Failed to load patients:', e)
    }
  }
}

const getQualityClass = (quality: number) => {
  if (quality >= 80) return 'quality-excellent'
  if (quality >= 60) return 'quality-good'
  if (quality >= 40) return 'quality-medium'
  return 'quality-poor'
}

onMounted(async () => {
  await loadPatients()
  await loadData()
})
</script>

<template>
  <div v-loading="loading" class="analytics-container">
    <el-card class="card-shadow filter-card">
      <el-row :gutter="20" align="middle">
        <el-col :xs="24" :sm="8" v-if="canSelectPatient">
          <el-select 
            v-model="selectedPatient" 
            style="width: 100%" 
            @change="loadData"
            placeholder="选择患者"
          >
            <el-option
              v-for="p in patients"
              :key="p.id"
              :value="p.id"
              :label="`${p.name} (${p.age}岁)`"
            />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-select v-model="selectedDays" style="width: 100%" @change="loadData">
            <el-option :value="7" label="最近7天" />
            <el-option :value="14" label="最近14天" />
            <el-option :value="30" label="最近30天" />
            <el-option :value="90" label="最近90天" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="canSelectPatient ? 8 : 16">
          <h2 class="page-title">
            <el-icon color="#409eff"><DataAnalysis /></el-icon>
            数据分析
          </h2>
        </el-col>
      </el-row>
    </el-card>
    
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">
              <el-icon color="#409eff"><TrendCharts /></el-icon>
              训练趋势
            </span>
          </template>
          <v-chart :option="lineChartOption" autoresize style="height: 350px; width: 100%;" />
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :xs="24" :lg="14">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">
              <el-icon color="#67c23a"><List /></el-icon>
              指令训练统计
            </span>
          </template>
          <v-chart :option="commandChartOption" autoresize style="height: 350px; width: 100%;" />
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="10">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">
              <el-icon color="#e6a23c"><PieChart /></el-icon>
              训练类别分布
            </span>
          </template>
          <v-chart :option="categoryPieOption" autoresize style="height: 350px; width: 100%;" />
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="card-shadow" style="margin-top: 20px;">
      <template #header>
        <span class="card-title">
          <el-icon color="#409eff"><List /></el-icon>
          指令详情统计
        </span>
      </template>
      <el-table :data="analytics?.command_stats || []" style="width: 100%" stripe>
        <el-table-column prop="command_name" label="指令名称" />
        <el-table-column prop="count" label="训练次数" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="primary" size="small">{{ row.count }} 次</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="total_time" label="总时长" width="120" align="center">
          <template #default="{ row }">
            {{ Math.round(row.total_time / 60) }} 分钟
          </template>
        </el-table-column>
        <el-table-column prop="avg_accuracy" label="平均准确率" width="150">
          <template #default="{ row }">
            <span :class="['quality-indicator', getQualityClass(row.avg_accuracy)]"></span>
            {{ row.avg_accuracy.toFixed(1) }}%
          </template>
        </el-table-column>
        <el-table-column label="表现评级" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.avg_accuracy >= 80 ? 'success' : row.avg_accuracy >= 60 ? 'primary' : row.avg_accuracy >= 40 ? 'warning' : 'danger'"
              size="small"
            >
              {{ row.avg_accuracy >= 80 ? '优秀' : row.avg_accuracy >= 60 ? '良好' : row.avg_accuracy >= 40 ? '一般' : '需加强' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!analytics?.command_stats?.length" description="暂无数据" />
    </el-card>
  </div>
</template>

<style scoped>
.analytics-container {
  padding: 0;
}

.filter-card {
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-title {
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
