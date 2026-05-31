<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">订单列表</h1>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号/客户名"
          clearable
          style="width: 200px; margin-right: 10px;"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="statusFilter" placeholder="订单状态" clearable style="width: 150px; margin-right: 10px;" @change="handleStatusFilter">
          <el-option label="待确认" value="PENDING" />
          <el-option label="已确认" value="CONFIRMED" />
          <el-option label="待取货" value="READY" />
          <el-option label="已完成" value="COMPLETED" />
          <el-option label="已取消" value="CANCELLED" />
        </el-select>
        <el-button type="primary" @click="goToCreate">
          <el-icon><Plus /></el-icon>
          新建订单
        </el-button>
      </div>
    </div>

    <el-card>
      <el-table :data="orders" stripe>
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column prop="customerName" label="客户姓名" width="100" />
        <el-table-column prop="customerPhone" label="联系电话" width="130" />
        <el-table-column prop="dessertName" label="甜品名称" width="150" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="totalPrice" label="总价" width="100">
          <template #default="{ row }">
            <span class="price-text">¥{{ row.totalPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="制作进度" width="120">
          <template #default="{ row }">
            <span :class="['status-tag', `status-${row.progressStatus?.toLowerCase()}`]">
              {{ getProgressText(row.progressStatus) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="自提时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.pickupTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="specialRequests" label="特殊要求" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewProgress(row.id)">
              进度
            </el-button>
            <el-button type="success" link size="small" @click="updateStatus(row)" v-if="row.status === 'PENDING'">
              确认
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-empty v-if="orders.length === 0" description="暂无订单数据" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderApi } from '@/api'
import dayjs from 'dayjs'

const router = useRouter()

const orders = ref([])
const searchKeyword = ref('')
const statusFilter = ref('')

const getStatusType = (status) => {
  const types = {
    'PENDING': 'warning',
    'CONFIRMED': 'primary',
    'READY': 'success',
    'COMPLETED': 'info',
    'CANCELLED': 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'PENDING': '待确认',
    'CONFIRMED': '已确认',
    'READY': '待取货',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return texts[status] || status
}

const getProgressText = (progress) => {
  const texts = {
    'WAITING': '等待制作',
    'PREPARING': '准备中',
    'MAKING': '制作中',
    'DECORATING': '装饰中',
    'READY': '待取货',
    'PICKED_UP': '已取货'
  }
  return texts[progress] || progress
}

const formatDateTime = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

const loadOrders = async () => {
  try {
    const res = await orderApi.getAll()
    if (res.success) {
      orders.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载订单数据失败')
  }
}

const handleSearch = () => {
  if (searchKeyword.value) {
    orderApi.search(searchKeyword.value).then(res => {
      if (res.success) {
        orders.value = res.data
      }
    })
  } else {
    loadOrders()
  }
}

const handleStatusFilter = () => {
  if (statusFilter.value) {
    orderApi.getByStatus(statusFilter.value).then(res => {
      if (res.success) {
        orders.value = res.data
      }
    })
  } else {
    loadOrders()
  }
}

const goToCreate = () => {
  router.push('/orders/create')
}

const viewProgress = (orderId) => {
  router.push({ path: '/progress', query: { orderId } })
}

const updateStatus = async (row) => {
  try {
    const res = await orderApi.updateStatus(row.id, 'CONFIRMED')
    if (res.success) {
      ElMessage.success('订单已确认')
      loadOrders()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await orderApi.delete(row.id)
      if (res.success) {
        ElMessage.success('删除成功')
        loadOrders()
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.price-text {
  color: #e74c3c;
  font-weight: bold;
}
</style>
