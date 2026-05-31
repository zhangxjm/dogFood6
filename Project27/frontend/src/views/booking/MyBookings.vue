<template>
  <div class="my-bookings-page">
    <h2 class="page-title">我的预订</h2>

    <el-table :data="bookings" style="width: 100%">
      <el-table-column prop="orderNo" label="订单号" width="180" />
      <el-table-column prop="roomName" label="房间" width="150">
        <template #default="{ row }">
          {{ row.roomId }}号房
        </template>
      </el-table-column>
      <el-table-column label="入住时间" width="220">
        <template #default="{ row }">
          {{ row.checkInDate }} 至 {{ row.checkOutDate }}
        </template>
      </el-table-column>
      <el-table-column prop="days" label="天数" width="80" />
      <el-table-column prop="totalAmount" label="金额" width="120">
        <template #default="{ row }">
          ¥{{ row.totalAmount }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            size="small" 
            v-if="row.status === 'PENDING'"
            @click="handlePay(row)"
          >
            去支付
          </el-button>
          <el-button 
            type="danger" 
            size="small" 
            v-if="row.status === 'PENDING'"
            @click="handleCancel(row.id)"
          >
            取消预订
          </el-button>
          <el-button 
            type="success" 
            size="small" 
            v-if="row.status === 'PAID'"
            @click="handleChat(row)"
          >
            联系客服
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="bookings.length === 0" description="暂无预订记录" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyBookings, cancelBooking } from '@/api/booking'
import { createPayment, mockPayment } from '@/api/payment'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const bookings = ref([])

const getStatusType = (status) => {
  const map = {
    PENDING: 'warning',
    PAID: 'success',
    CANCELLED: 'info',
    COMPLETED: 'success',
    CHECKED_IN: 'primary'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    PENDING: '待支付',
    PAID: '已支付',
    CANCELLED: '已取消',
    COMPLETED: '已完成',
    CHECKED_IN: '已入住'
  }
  return map[status] || status
}

const handlePay = async (row) => {
  try {
    await ElMessageBox.confirm('确定要支付此订单吗？系统将模拟微信支付。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })

    const payRes = await createPayment(row.id)
    if (payRes.code === 200) {
      await mockPayment(payRes.data.paymentId)
      ElMessage.success('支付成功')
      loadBookings()
    }
  } catch (e) {
  }
}

const handleCancel = async (id) => {
  try {
    await ElMessageBox.confirm('确定要取消此预订吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await cancelBooking(id)
    ElMessage.success('取消成功')
    loadBookings()
  } catch (e) {
  }
}

const handleChat = (row) => {
  router.push('/chat')
}

const loadBookings = async () => {
  const res = await getMyBookings()
  if (res.code === 200) {
    bookings.value = res.data
  }
}

onMounted(() => {
  loadBookings()
})
</script>

<style scoped>
.my-bookings-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  min-height: calc(100vh - 100px);
}
</style>
