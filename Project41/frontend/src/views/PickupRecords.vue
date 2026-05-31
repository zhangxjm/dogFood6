<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">核销记录</h1>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号/取货码"
          clearable
          style="width: 200px;"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <el-card>
      <el-table :data="filteredRecords" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column prop="customerName" label="客户姓名" width="100" />
        <el-table-column prop="customerPhone" label="联系电话" width="130" />
        <el-table-column prop="pickupCode" label="取货码" width="120">
          <template #default="{ row }">
            <el-tag type="success">{{ row.pickupCode }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="核销时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.pickupTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-empty v-if="filteredRecords.length === 0" description="暂无核销记录" />

    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-num">{{ totalRecords }}</div>
            <div class="stat-label">总核销数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-num">{{ todayRecords }}</div>
            <div class="stat-label">今日核销</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-num">{{ totalAmount }}</div>
            <div class="stat-label">今日金额</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { pickupApi, orderApi } from '@/api'
import dayjs from 'dayjs'

const records = ref([])
const orders = ref([])
const searchKeyword = ref('')

const filteredRecords = computed(() => {
  if (!searchKeyword.value) return records.value
  return records.value.filter(r => 
    r.orderNo.includes(searchKeyword.value) || 
    r.pickupCode.includes(searchKeyword.value) ||
    r.customerName.includes(searchKeyword.value)
  )
})

const totalRecords = computed(() => records.value.length)

const todayRecords = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  return records.value.filter(r => 
    dayjs(r.pickupTime).format('YYYY-MM-DD') === today
  ).length
})

const totalAmount = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  const todayPickups = records.value.filter(r => 
    dayjs(r.pickupTime).format('YYYY-MM-DD') === today
  )
  
  let total = 0
  todayPickups.forEach(pickup => {
    const order = orders.value.find(o => o.id === pickup.orderId)
    if (order) {
      total += order.totalPrice
    }
  })
  return '¥' + total.toFixed(2)
})

const formatDateTime = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const loadData = async () => {
  try {
    const res = await pickupApi.getAll()
    if (res.success) {
      records.value = res.data
    }
    
    const orderRes = await orderApi.getAll()
    if (orderRes.success) {
      orders.value = orderRes.data
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

const handleSearch = () => {
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stats-row {
  margin-top: 20px;
}

.stat-card {
  text-align: center;
}

.stat-item {
  padding: 10px 0;
}

.stat-num {
  font-size: 32px;
  font-weight: bold;
  color: #d2691e;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #888;
}
</style>
