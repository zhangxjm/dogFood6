<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">制作进度管理</h1>
      <div class="header-actions">
        <el-select v-model="progressFilter" placeholder="进度状态" clearable style="width: 150px; margin-right: 10px;" @change="handleProgressFilter">
          <el-option label="等待制作" value="WAITING" />
          <el-option label="准备中" value="PREPARING" />
          <el-option label="制作中" value="MAKING" />
          <el-option label="装饰中" value="DECORATING" />
          <el-option label="待取货" value="READY" />
          <el-option label="已取货" value="PICKED_UP" />
        </el-select>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="10">
        <el-card>
          <div class="list-header">
            <h3>订单列表</h3>
          </div>
          <div class="order-list">
            <div
              v-for="order in orders"
              :key="order.id"
              class="order-item card-hover"
              :class="{ active: selectedOrderId === order.id }"
              @click="selectOrder(order.id)"
            >
              <div class="order-item-header">
                <span class="order-no">{{ order.orderNo }}</span>
                <span :class="['status-tag', `status-${order.progressStatus?.toLowerCase()}`]">
                  {{ getProgressText(order.progressStatus) }}
                </span>
              </div>
              <div class="order-item-info">
                <span class="customer">{{ order.customerName }}</span>
                <span class="dessert">{{ order.dessertName }}</span>
              </div>
              <div class="order-item-footer">
                <span class="quantity">x{{ order.quantity }}</span>
                <span class="time">{{ formatDateTime(order.pickupTime) }}</span>
              </div>
            </div>
          </div>
          <el-empty v-if="orders.length === 0" description="暂无订单" />
        </el-card>
      </el-col>

      <el-col :span="14">
        <el-card v-if="selectedOrder">
          <div class="detail-header">
            <h3>订单详情</h3>
            <el-button type="primary" size="small" @click="openProgressDialog">
              <el-icon><Edit /></el-icon>
              更新进度
            </el-button>
          </div>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ selectedOrder.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="客户姓名">{{ selectedOrder.customerName }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ selectedOrder.customerPhone }}</el-descriptions-item>
            <el-descriptions-item label="甜品名称">{{ selectedOrder.dessertName }}</el-descriptions-item>
            <el-descriptions-item label="数量">{{ selectedOrder.quantity }}</el-descriptions-item>
            <el-descriptions-item label="总价">¥{{ selectedOrder.totalPrice }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="getStatusType(selectedOrder.status)">{{ getStatusText(selectedOrder.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="制作进度">
              <span :class="['status-tag', `status-${selectedOrder.progressStatus?.toLowerCase()}`]">
                {{ getProgressText(selectedOrder.progressStatus) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="自提时间" :span="2">{{ formatDateTime(selectedOrder.pickupTime) }}</el-descriptions-item>
            <el-descriptions-item label="定制要求" :span="2">{{ selectedOrder.customization || '无' }}</el-descriptions-item>
            <el-descriptions-item label="特殊要求" :span="2">{{ selectedOrder.specialRequests || '无' }}</el-descriptions-item>
          </el-descriptions>

          <div class="progress-timeline">
            <h4>制作进度记录</h4>
            <el-timeline>
              <el-timeline-item
                v-for="(record, index) in progressRecords"
                :key="record.id"
                :timestamp="formatDateTime(record.createdAt)"
                placement="top"
                :type="getTimelineType(record.status)"
              >
                <el-card>
                  <h4>{{ getProgressText(record.status) }}</h4>
                  <p>{{ record.remark }}</p>
                  <p class="operator">操作人: {{ record.operator }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-if="progressRecords.length === 0" description="暂无进度记录" />
          </div>

          <div class="action-buttons" v-if="selectedOrder.progressStatus === 'DECORATING'">
            <el-button type="success" size="large" @click="generatePickupCode">
              <el-icon><Check /></el-icon>
              制作完成，生成取货码
            </el-button>
          </div>
        </el-card>

        <el-card v-else class="empty-detail">
          <el-empty description="请选择订单查看详情" />
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="progressDialogVisible" title="更新制作进度" width="500px">
      <el-form :model="progressForm" label-width="100px">
        <el-form-item label="进度状态">
          <el-select v-model="progressForm.status" style="width: 100%;">
            <el-option label="准备中" value="PREPARING" />
            <el-option label="制作中" value="MAKING" />
            <el-option label="装饰中" value="DECORATING" />
            <el-option label="待取货" value="READY" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="progressForm.remark" type="textarea" :rows="3" placeholder="请输入进度备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProgress">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { orderApi, progressApi, pickupApi } from '@/api'
import dayjs from 'dayjs'

const route = useRoute()

const orders = ref([])
const progressRecords = ref([])
const selectedOrderId = ref(null)
const progressFilter = ref('')
const progressDialogVisible = ref(false)

const progressForm = reactive({
  status: '',
  remark: ''
})

const selectedOrder = computed(() => {
  return orders.value.find(o => o.id === selectedOrderId.value)
})

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

const getTimelineType = (status) => {
  const types = {
    'WAITING': 'warning',
    'PREPARING': 'primary',
    'MAKING': 'primary',
    'DECORATING': 'primary',
    'READY': 'success',
    'PICKED_UP': 'success'
  }
  return types[status] || 'primary'
}

const formatDateTime = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

const loadOrders = async () => {
  try {
    let res
    if (progressFilter.value) {
      res = await orderApi.getByProgress(progressFilter.value)
    } else {
      res = await orderApi.getAll()
    }
    if (res.success) {
      orders.value = res.data
      
      if (route.query.orderId && !selectedOrderId.value) {
        selectedOrderId.value = Number(route.query.orderId)
        loadProgressRecords()
      }
    }
  } catch (error) {
    ElMessage.error('加载订单数据失败')
  }
}

const selectOrder = (orderId) => {
  selectedOrderId.value = orderId
  loadProgressRecords()
}

const loadProgressRecords = async () => {
  if (!selectedOrderId.value) return
  try {
    const res = await progressApi.getByOrderId(selectedOrderId.value)
    if (res.success) {
      progressRecords.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载进度记录失败')
  }
}

const handleProgressFilter = () => {
  loadOrders()
}

const openProgressDialog = () => {
  progressForm.status = selectedOrder.value?.progressStatus || ''
  progressForm.remark = ''
  progressDialogVisible.value = true
}

const submitProgress = async () => {
  try {
    const res = await orderApi.updateProgress(selectedOrderId.value, progressForm.status, progressForm.remark)
    if (res.success) {
      ElMessage.success('进度更新成功')
      progressDialogVisible.value = false
      loadOrders()
      loadProgressRecords()
    }
  } catch (error) {
    ElMessage.error('进度更新失败')
  }
}

const generatePickupCode = async () => {
  try {
    const codeRes = await orderApi.generatePickupCode()
    if (codeRes.success) {
      const pickupCode = codeRes.data
      const res = await pickupApi.create(selectedOrderId.value, pickupCode)
      if (res.success) {
        ElMessage.success(`取货码已生成: ${pickupCode}`)
        loadOrders()
        loadProgressRecords()
      }
    }
  } catch (error) {
    ElMessage.error('生成取货码失败')
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.list-header {
  margin-bottom: 16px;
}

.list-header h3 {
  margin: 0;
  color: #8b4513;
}

.order-list {
  max-height: 600px;
  overflow-y: auto;
}

.order-item {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.order-item:hover {
  border-color: #d2691e;
}

.order-item.active {
  border-color: #d2691e;
  background-color: #fff5e6;
}

.order-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.order-no {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.order-item-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
}

.order-item-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-header h3 {
  margin: 0;
  color: #8b4513;
}

.progress-timeline {
  margin-top: 24px;
}

.progress-timeline h4 {
  margin: 0 0 16px 0;
  color: #8b4513;
}

.operator {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.action-buttons {
  margin-top: 24px;
  text-align: center;
}

.empty-detail {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
