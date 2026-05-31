<template>
  <div class="dashboard">
    <h2 class="page-title">数据概览</h2>
    
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon product">
              <el-icon size="32"><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dashboardData.products?.total || 0 }}</div>
              <div class="stat-label">监测商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon confirmed">
              <el-icon size="32"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dashboardData.products?.confirmed || 0 }}</div>
              <div class="stat-label">确认侵权</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon evidence">
              <el-icon size="32"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dashboardData.evidence?.total || 0 }}</div>
              <div class="stat-label">已收集证据</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon legal">
              <el-icon size="32"><Scale /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ dashboardData.cases?.active || 0 }}</div>
              <div class="stat-label">进行中案件</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>商品侵权状态分布</span>
            </div>
          </template>
          <div ref="productChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>维权案件状态统计</span>
            </div>
          </template>
          <div ref="caseChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="recent-row">
      <el-col :span="12">
        <el-card class="list-card">
          <template #header>
            <div class="card-header">
              <span>最近侵权商品</span>
              <el-button type="primary" link @click="$router.push('/products')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentProducts" style="width: 100%" size="small">
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="platform" label="平台" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.infringementStatus)" size="small">
                  {{ getStatusText(row.infringementStatus) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="list-card">
          <template #header>
            <div class="card-header">
              <span>最近维权案件</span>
              <el-button type="primary" link @click="$router.push('/cases')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentCases" style="width: 100%" size="small">
            <el-table-column prop="caseNumber" label="案件编号" width="160" />
            <el-table-column prop="caseTitle" label="案件名称" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getCaseStatusType(row.status)" size="small">
                  {{ getCaseStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const dashboardData = ref({})
const recentProducts = ref([])
const recentCases = ref([])
const productChartRef = ref(null)
const caseChartRef = ref(null)

const fetchDashboardData = async () => {
  try {
    const res = await axios.get('/api/dashboard/summary')
    dashboardData.value = res.data
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  }
}

const fetchProducts = async () => {
  try {
    const res = await axios.get('/api/products')
    recentProducts.value = res.data.slice(0, 5)
  } catch (error) {
    console.error('Failed to fetch products:', error)
  }
}

const fetchCases = async () => {
  try {
    const res = await axios.get('/api/cases')
    recentCases.value = res.data.slice(0, 5)
  } catch (error) {
    console.error('Failed to fetch cases:', error)
  }
}

const getStatusType = (status) => {
  const types = {
    PENDING: 'info',
    SUSPECTED: 'warning',
    CONFIRMED: 'danger',
    CLEARED: 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    PENDING: '待检测',
    SUSPECTED: '疑似侵权',
    CONFIRMED: '确认侵权',
    CLEARED: '无侵权'
  }
  return texts[status] || status
}

const getCaseStatusType = (status) => {
  if (status?.includes('CLOSED') || status === 'SETTLED') return 'success'
  if (status === 'JUDGEMENT' || status === 'HEARING') return 'warning'
  return 'primary'
}

const getCaseStatusText = (status) => {
  const texts = {
    DRAFT: '草稿',
    PREPARING: '准备中',
    FILED: '已立案',
    HEARING: '审理中',
    JUDGEMENT: '判决中',
    APPEAL: '上诉中',
    CLOSED_WON: '已胜诉',
    CLOSED_LOST: '已败诉',
    SETTLED: '已和解'
  }
  return texts[status] || status
}

const initProductChart = () => {
  if (!productChartRef.value) return
  const chart = echarts.init(productChartRef.value)
  const data = dashboardData.value.products || {}
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
      labelLine: { show: false },
      data: [
        { value: data.pending || 0, name: '待检测', itemStyle: { color: '#909399' } },
        { value: data.suspected || 0, name: '疑似侵权', itemStyle: { color: '#e6a23c' } },
        { value: data.confirmed || 0, name: '确认侵权', itemStyle: { color: '#f56c6c' } },
        { value: data.cleared || 0, name: '无侵权', itemStyle: { color: '#67c23a' } }
      ]
    }]
  })
}

const initCaseChart = () => {
  if (!caseChartRef.value) return
  const chart = echarts.init(caseChartRef.value)
  const data = dashboardData.value.cases || {}
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['准备中', '已立案', '审理中', '已结案', '胜诉'] },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: [
        data.preparing || 0,
        data.filed || 0,
        data.hearing || 0,
        data.closed || 0,
        data.won || 0
      ],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#1890ff' },
          { offset: 1, color: '#096dd9' }
        ]),
        borderRadius: [4, 4, 0, 0]
      }
    }]
  })
}

onMounted(async () => {
  await Promise.all([fetchDashboardData(), fetchProducts(), fetchCases()])
  await nextTick()
  initProductChart()
  initCaseChart()
  window.addEventListener('resize', () => {
    initProductChart()
    initCaseChart()
  })
})
</script>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #303133;
}

.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.product {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.confirmed {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.evidence {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.legal {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.charts-row {
  margin-bottom: 24px;
}

.chart-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chart-container {
  height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.list-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
