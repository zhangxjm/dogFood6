<template>
  <div>
    <h2 style="margin-bottom: 20px">📡 设备管理</h2>
    
    <el-card>
      <el-table :data="devices" style="width: 100%" v-loading="loading">
        <el-table-column prop="device_id" label="设备ID" width="140" />
        <el-table-column prop="device_name" label="设备名称" width="180" />
        <el-table-column prop="device_type" label="设备类型" width="140" />
        <el-table-column prop="location" label="位置" width="140" />
        <el-table-column prop="temperature" label="温度(°C)" width="120">
          <template #default="{ row }">
            <span :style="{ color: getTempColor(row.temperature) }">
              {{ row.temperature.toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="humidity" label="湿度(%)" width="120">
          <template #default="{ row }">
            {{ row.humidity.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'online' ? 'success' : 'danger'" size="small">
              {{ row.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_online" label="最后在线时间" width="200">
          <template #default="{ row }">
            {{ formatTime(row.last_online) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" :title="`设备详情 - ${selectedDevice?.device_name}`" width="800px">
      <div v-if="selectedDevice">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备ID">{{ selectedDevice.device_id }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ selectedDevice.device_name }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">{{ selectedDevice.device_type }}</el-descriptions-item>
          <el-descriptions-item label="位置">{{ selectedDevice.location }}</el-descriptions-item>
          <el-descriptions-item label="当前温度">
            <span :style="{ color: getTempColor(selectedDevice.temperature) }">
              {{ selectedDevice.temperature.toFixed(2) }}°C
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="当前湿度">{{ selectedDevice.humidity.toFixed(2) }}%</el-descriptions-item>
        </el-descriptions>
        <div style="margin-top: 20px">
          <h4>温湿度趋势（近24小时）</h4>
          <div ref="chartRef" style="height: 300px; margin-top: 10px"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const devices = ref([])
const loading = ref(false)
const detailVisible = ref(false)
const selectedDevice = ref(null)
const chartRef = ref(null)
let chart = null

const fetchDevices = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/devices')
    devices.value = res.data
  } catch (e) {
    ElMessage.error('获取设备列表失败')
  } finally {
    loading.value = false
  }
}

const viewDetail = async (device) => {
  selectedDevice.value = device
  detailVisible.value = true
  
  try {
    const res = await axios.get(`/api/devices/${device.device_id}/data`)
    await nextTick()
    initChart(res.data)
  } catch (e) {
    console.error('获取设备数据失败', e)
  }
}

const initChart = (data) => {
  if (!chartRef.value) return
  if (chart) chart.dispose()
  
  chart = echarts.init(chartRef.value)
  
  const tempData = data.filter(d => d.field === 'temperature').map(d => ({
    name: new Date(d.time).toLocaleTimeString(),
    value: d.value
  }))
  const humData = data.filter(d => d.field === 'humidity').map(d => ({
    name: new Date(d.time).toLocaleTimeString(),
    value: d.value
  }))

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['温度(°C)', '湿度(%)'] },
    xAxis: { type: 'category', data: tempData.map(d => d.name) },
    yAxis: { type: 'value' },
    series: [
      { name: '温度(°C)', type: 'line', data: tempData.map(d => d.value), smooth: true },
      { name: '湿度(%)', type: 'line', data: humData.map(d => d.value), smooth: true }
    ]
  }
  chart.setOption(option)
}

const getTempColor = (temp) => {
  if (temp > 8) return '#ff4d4f'
  if (temp > 5) return '#fa8c16'
  if (temp < -2) return '#ff4d4f'
  return '#52c41a'
}

const formatTime = (time) => {
  return new Date(time).toLocaleString()
}

onMounted(fetchDevices)

watch(detailVisible, (val) => {
  if (!val && chart) {
    chart.dispose()
    chart = null
  }
})
</script>
