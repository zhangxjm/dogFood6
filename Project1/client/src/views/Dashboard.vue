<template>
  <div>
    <div class="page-header">
      <h2>数据概览</h2>
      <p>实时了解开锁服务运营数据</p>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card">
          <el-icon :size="48" color="#409eff"><Document /></el-icon>
          <div class="stat-label">订单总数</div>
          <div class="stat-value">{{ stats.total }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <el-icon :size="48" color="#e6a23c"><Clock /></el-icon>
          <div class="stat-label">待处理</div>
          <div class="stat-value" style="color: #e6a23c">{{ stats.pending }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <el-icon :size="48" color="#67c23a"><Loading /></el-icon>
          <div class="stat-label">进行中</div>
          <div class="stat-value" style="color: #67c23a">{{ stats.inProgress }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <el-icon :size="48" color="#909399"><CircleCheck /></el-icon>
          <div class="stat-label">已完成</div>
          <div class="stat-value" style="color: #909399">{{ stats.completed }}</div>
        </div>
      </el-col>
    </el-row>

    <el-card class="recent-orders">
      <template #header>
        <div class="card-header">
          <span>最新订单</span>
          <el-button type="primary" link @click="$router.push('/orders')">查看全部</el-button>
        </div>
      </template>
      <el-table :data="recentOrders" style="width: 100%" empty-text="暂无订单数据">
        <el-table-column prop="id" label="订单号" width="100" />
        <el-table-column prop="customer_name" label="客户姓名" width="120" />
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column prop="address" label="服务地址" show-overflow-tooltip />
        <el-table-column prop="service_type" label="服务类型" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getStats, getOrders } from '../api'

const stats = ref({ total: 0, pending: 0, inProgress: 0, completed: 0, reviewed: 0 })
const recentOrders = ref([])

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成'
  }
  return texts[status] || status
}

onMounted(async () => {
  try {
    stats.value = await getStats()
    const orders = await getOrders({})
    recentOrders.value = orders.slice(0, 5)
  } catch (e) {
    console.error('Failed to load data:', e)
  }
})
</script>

<style scoped>
.page-header {
  background: white;
  padding: 20px 30px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 8px;
}

.page-header p {
  color: #909399;
  font-size: 14px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card .stat-label {
  color: #666;
  font-size: 14px;
  margin-top: 10px;
}

.stat-card .stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
  margin-top: 8px;
}

.recent-orders {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}
</style>
