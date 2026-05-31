<template>
  <div>
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card blue">
          <div class="stat-icon">
            <el-icon size="32"><Goods /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.total_parcels }}</div>
            <div class="stat-label">总包裹数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card orange">
          <div class="stat-icon">
            <el-icon size="32"><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.pending_parcels }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card green">
          <div class="stat-icon">
            <el-icon size="32"><Van /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.shipped_parcels }}</div>
            <div class="stat-label">运输中</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card purple">
          <div class="stat-icon">
            <el-icon size="32"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.delivered_parcels }}</div>
            <div class="stat-label">已送达</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="16">
        <div class="common-card">
          <div class="page-header">
            <span class="page-title">包裹状态分布</span>
          </div>
          <div ref="chartRef" style="height: 350px;"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="common-card">
          <div class="page-header">
            <span class="page-title">仓库概览</span>
          </div>
          <div class="warehouse-list">
            <div v-for="wh in warehouses" :key="wh.id" class="warehouse-item">
              <div class="wh-info">
                <span class="wh-name">{{ wh.name }}</span>
                <span class="wh-location">{{ wh.city }}, {{ wh.country }}</span>
              </div>
              <el-tag size="small">{{ wh.capacity }} 容量</el-tag>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="common-card">
      <div class="page-header">
        <span class="page-title">最近动态</span>
      </div>
      <el-table :data="recentActivity" style="width: 100%">
        <el-table-column prop="parcel.tracking_number" label="运单号" width="180">
          <template #default="{ row }">
            <span style="color: #409eff; font-weight: 500;">{{ row.parcel?.tracking_number }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" width="150" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="created_at" label="时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getStatistics, getRecentActivity, getWarehouses } from '../api'

const statistics = ref({
  total_parcels: 0,
  pending_parcels: 0,
  shipped_parcels: 0,
  delivered_parcels: 0,
  total_warehouses: 0,
  today_parcels: 0
})

const recentActivity = ref([])
const warehouses = ref([])
const chartRef = ref(null)
let chart = null

const loadData = async () => {
  try {
    const [statsRes, activityRes, whRes] = await Promise.all([
      getStatistics(),
      getRecentActivity(),
      getWarehouses()
    ])
    statistics.value = statsRes.data
    recentActivity.value = activityRes.data
    warehouses.value = whRes.data
    await nextTick()
    initChart()
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '包裹状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: statistics.value.pending_parcels, name: '待处理', itemStyle: { color: '#e6a23c' } },
          { value: statistics.value.shipped_parcels, name: '运输中', itemStyle: { color: '#409eff' } },
          { value: statistics.value.delivered_parcels, name: '已送达', itemStyle: { color: '#67c23a' } }
        ]
      }
    ]
  }
  
  chart.setOption(option)
}

const getStatusType = (status) => {
  const types = {
    'created': 'info',
    'pending': 'warning',
    'sorted': 'primary',
    'routed': 'success',
    'shipped': 'warning',
    'in_transit': 'primary',
    'out_for_delivery': 'info',
    'delivered': 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'created': '已创建',
    'pending': '待处理',
    'sorted': '已分拣',
    'routed': '已规划路线',
    'shipped': '已发货',
    'in_transit': '运输中',
    'out_for_delivery': '派送中',
    'delivered': '已送达'
  }
  return texts[status] || status
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.blue {
  border-left: 4px solid #409eff;
}

.stat-card.orange {
  border-left: 4px solid #e6a23c;
}

.stat-card.green {
  border-left: 4px solid #67c23a;
}

.stat-card.purple {
  border-left: 4px solid #909399;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-card.blue .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.orange .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.green .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.purple .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.warehouse-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.warehouse-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.wh-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wh-name {
  font-weight: 500;
  color: #303133;
}

.wh-location {
  font-size: 12px;
  color: #909399;
}
</style>
