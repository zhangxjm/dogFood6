<template>
  <div>
    <div style="display: flex; align-items: center; margin-bottom: 20px">
      <el-button @click="$router.back()" style="margin-right: 15px">
        ← 返回
      </el-button>
      <h2>🔍 货物溯源详情 - {{ trackingId }}</h2>
    </div>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header>货物信息</template>
          <el-descriptions :column="1" v-if="traceData.shipment">
            <el-descriptions-item label="运单号">{{ traceData.shipment.tracking_number }}</el-descriptions-item>
            <el-descriptions-item label="货物名称">{{ traceData.shipment.product_name }}</el-descriptions-item>
            <el-descriptions-item label="货物类型">{{ traceData.shipment.product_type }}</el-descriptions-item>
            <el-descriptions-item label="启运地">{{ traceData.shipment.origin }}</el-descriptions-item>
            <el-descriptions-item label="目的地">{{ traceData.shipment.destination }}</el-descriptions-item>
            <el-descriptions-item label="设备ID">{{ traceData.shipment.device_id }}</el-descriptions-item>
            <el-descriptions-item label="运输状态">
              <el-tag type="primary">{{ traceData.shipment.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="温度范围">
              {{ traceData.shipment.min_temp }} ~ {{ traceData.shipment.max_temp }}°C
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card style="margin-top: 20px" v-if="traceData.customs">
          <template #header>海关核验信息</template>
          <el-descriptions :column="1">
            <el-descriptions-item label="核验状态">
              <el-tag type="success">已核验</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="海关编号">{{ traceData.customs.customs_code }}</el-descriptions-item>
            <el-descriptions-item label="核验人员">{{ traceData.customs.inspector }}</el-descriptions-item>
            <el-descriptions-item label="核验时间">
              {{ formatTime(traceData.customs.verified_at) }}
            </el-descriptions-item>
            <el-descriptions-item label="核验备注">{{ traceData.customs.remark }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card>
          <template #header>温度监控曲线（近7天）</template>
          <div ref="tempChartRef" style="height: 300px"></div>
        </el-card>

        <el-card style="margin-top: 20px">
          <template #header>湿度监控曲线（近7天）</template>
          <div ref="humChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const route = useRoute()
const trackingId = ref(route.params.id)
const traceData = ref({
  shipment: null,
  customs: null,
  temperature: [],
  humidity: [],
  temp_threshold: { min: 0, max: 10 }
})
const tempChartRef = ref(null)
const humChartRef = ref(null)
let tempChart = null
let humChart = null

const fetchData = async () => {
  try {
    const res = await axios.get(`/api/shipments/${trackingId.value}/trace`)
    traceData.value = res.data
    await nextTick()
    initCharts()
  } catch (e) {
    ElMessage.error('获取溯源数据失败')
  }
}

const initCharts = () => {
  if (tempChart) tempChart.dispose()
  if (humChart) humChart.dispose()

  if (tempChartRef.value) {
    tempChart = echarts.init(tempChartRef.value)
    const tempOption = {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: traceData.value.temperature.map(d => new Date(d.time).toLocaleString())
      },
      yAxis: { type: 'value', name: '°C' },
      series: [
        {
          name: '温度',
          type: 'line',
          smooth: true,
          data: traceData.value.temperature.map(d => d.value),
          itemStyle: { color: '#ff6b6b' },
          markLine: {
            data: [
              { yAxis: traceData.value.temp_threshold.max, name: '上限' },
              { yAxis: traceData.value.temp_threshold.min, name: '下限' }
            ]
          }
        }
      ]
    }
    tempChart.setOption(tempOption)
  }

  if (humChartRef.value) {
    humChart = echarts.init(humChartRef.value)
    const humOption = {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: traceData.value.humidity.map(d => new Date(d.time).toLocaleString())
      },
      yAxis: { type: 'value', name: '%' },
      series: [{
        name: '湿度',
        type: 'line',
        smooth: true,
        data: traceData.value.humidity.map(d => d.value),
        itemStyle: { color: '#4ecdc4' }
      }]
    }
    humChart.setOption(humOption)
  }
}

const formatTime = (time) => {
  return new Date(time).toLocaleString()
}

onMounted(fetchData)

onUnmounted(() => {
  if (tempChart) tempChart.dispose()
  if (humChart) humChart.dispose()
})
</script>
