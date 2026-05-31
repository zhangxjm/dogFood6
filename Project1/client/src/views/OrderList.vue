<template>
  <div>
    <div class="page-header">
      <h2>订单列表</h2>
      <p>管理所有开锁服务订单</p>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="订单状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable @change="loadOrders">
            <el-option label="全部" value="all" />
            <el-option label="待处理" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input
            v-model="filters.keyword"
            placeholder="输入姓名/电话/地址"
            clearable
            style="width: 250px"
            @keyup.enter="loadOrders"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadOrders">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="success" @click="$router.push('/orders/new')">
            <el-icon><Plus /></el-icon>
            新增订单
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table :data="orders" style="width: 100%" v-loading="loading" empty-text="暂无订单数据">
        <el-table-column prop="id" label="订单号" width="80" />
        <el-table-column prop="customer_name" label="客户姓名" width="110" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="address" label="服务地址" show-overflow-tooltip />
        <el-table-column prop="service_type" label="服务类型" width="110" />
        <el-table-column prop="appointment_time" label="预约时间" width="160" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
            <el-button type="warning" link size="small" @click="editOrder(row)">编辑</el-button>
            <el-dropdown trigger="click" @command="(cmd) => handleStatusChange(row, cmd)">
              <el-button type="success" link size="small">更改状态</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="pending" :disabled="row.status === 'pending'">待处理</el-dropdown-item>
                  <el-dropdown-item command="in_progress" :disabled="row.status === 'in_progress'">进行中</el-dropdown-item>
                  <el-dropdown-item command="completed" :disabled="row.status === 'completed'">已完成</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { getOrders, updateOrderStatus, deleteOrder as apiDeleteOrder } from '../api'

const router = useRouter()
const orders = ref([])
const loading = ref(false)
const filters = ref({ status: 'all', keyword: '' })

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

const loadOrders = async () => {
  loading.value = true
  try {
    orders.value = await getOrders(filters.value)
  } catch (e) {
    ElMessage.error('加载订单失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = { status: 'all', keyword: '' }
  loadOrders()
}

const viewDetail = (row) => {
  router.push(`/orders/${row.id}`)
}

const editOrder = (row) => {
  router.push(`/orders/${row.id}/edit`)
}

const handleStatusChange = async (row, status) => {
  try {
    await updateOrderStatus(row.id, status)
    ElMessage.success('状态更新成功')
    loadOrders()
  } catch (e) {
    ElMessage.error('状态更新失败')
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除订单 #${row.id} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await apiDeleteOrder(row.id)
    ElMessage.success('删除成功')
    loadOrders()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(loadOrders)
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

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.el-card {
  border-radius: 8px;
}
</style>
