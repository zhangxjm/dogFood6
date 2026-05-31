<template>
  <div>
    <h2 style="margin-bottom: 20px">📊 监控概览</h2>
    
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #1890ff">📡</div>
            <div class="stat-info">
              <div class="stat-value">{{ dashboard.device_count }}</div>
              <div class="stat-label">设备总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #52c41a">✅</div>
            <div class="stat-info">
              <div class="stat-value">{{ dashboard.online_count }}</div>
              <div class="stat-label">在线设备</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #fa8c16">📦</div>
            <div class="stat-info">
              <div class="stat-value">{{ dashboard.shipment_count }}</div>
              <div class="stat-label">运输单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #ff4d4f">⚠️</div>
            <div class="stat-info">
              <div class="stat-value">{{ dashboard.alert_count }}</div>
              <div class="stat-label">未处理告警</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>实时温湿度监控</template>
          <div ref="chartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>设备在线状态</template>
          <div ref="pieChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>最新告警</template>
          <el-table :data="recentAlerts" size="small">
            <el-table-column prop="alert_type" label="告警类型" width="100" />
            <el-table-column prop="device_id" label="设备" width="120" />
            <el-table-column prop="message" label="消息" />
            <el-table-column prop="level" label="级别" width="80">
              <template #default="{ row }">
                <el-tag :type="row.level === 'critical' ? 'danger' : 'warning'" size="small">
                  {{ row.level === 'critical' ? '严重' : '警告' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>运输中货物</template>
          <el-table :data="activeShipments" size="small">
            <el-table-column prop="tracking_number" label="运单号" width="140" />
            <el-table-column prop="product_name" label="货物" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag type="info" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'

const dashboard = ref({
  device_count: 0,
  online_count: 0,
  shipment_count: 0,
  alert_count: 0
})

const recentAlerts = ref([])
const activeShipments = ref([])
const chartRef = ref(null)
const pieChartRef = ref(null)
let chart = null
let pieChart = null
let refreshTimer = null

const fetchData = async () => {
  try {
    const [dashRes, alertsRes, shipmentsRes] = await Promise.all([
      axios.get('/api/dashboard'),
      axios.get('/api/alerts'),
      axios.get('/api/shipments')
    ])
    
    dashboard.value = dashRes.data
    recentAlerts.value = alertsRes.data.slice(0, 5)
    activeShipments.value = shipmentsRes.data.filter(s => s.status === '运输中' || s.status === '清关中')
  } catch (e) {
    console.error('Fetch error:', e)
  }
}

const initChart = () => {
  chart = echarts.init(chartRef.value)
  const now = new Date()
  const times = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now - (11 - i) * 300000)
    return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0')
  })
  
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['温度(°C)', '湿度(%)'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: times },
    yAxis: { type: 'value' },
    series: [
      {
        name: '温度(°C)',
        type: 'line',
        smooth: true,
        data: Array.from({ length: 12 }, () => (Math.random() * 8 - 2).toFixed(1))
      },
      {
        name: '湿度(%)',
        type: 'line',
        smooth: true,
        data: Array.from({ length: 12 }, () => (50 + Math.random() * 30).toFixed(1))
      }
    ]
  }
  chart.setOption(option)

  pieChart = echarts.init(pieChartRef.value)
  const pieOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%', left: 'center' },
    series: [
      {
        name: '设备状态',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 3, name: '在线', itemStyle: { color: '#52c41a' } },
          { value: 1, name: '离线', itemStyle: { color: '#ff4d4f' } }
        ]
      }
    ]
  }
  pieChart.setOption(pieOption)
}

onMounted(() => {
  fetchData()
  initChart()
  refreshTimer = setInterval(fetchData, 5000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  if (chart) chart.dispose()
  if (pieChart) pieChart.dispose()
})
</script>

<style scoped>
.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}
</style>
