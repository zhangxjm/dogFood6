<template>
  <div class="admin-page">
    <h2 class="page-title">预订管理</h2>

    <el-card>
      <el-table :data="bookings" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="roomId" label="房间ID" width="100" />
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
        <el-table-column prop="elderName" label="入住人" width="120" />
        <el-table-column prop="elderPhone" label="联系电话" width="140" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-select 
              v-model="row.tempStatus" 
              placeholder="更新状态" 
              size="small" 
              style="width: 100px;"
              @change="handleStatusChange(row)"
            >
              <el-option label="已支付" value="PAID" />
              <el-option label="已入住" value="CHECKED_IN" />
              <el-option label="已完成" value="COMPLETED" />
              <el-option label="已取消" value="CANCELLED" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBookingList, updateBookingStatus } from '@/api/booking'
import { ElMessage } from 'element-plus'

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

const handleStatusChange = async (row) => {
  const res = await updateBookingStatus(row.id, row.tempStatus)
  if (res.code === 200) {
    ElMessage.success('状态更新成功')
    row.status = row.tempStatus
  }
}

const loadBookings = async () => {
  const res = await getBookingList()
  if (res.code === 200) {
    bookings.value = res.data.map(item => ({ ...item, tempStatus: item.status }))
  }
}

onMounted(() => {
  loadBookings()
})
</script>

<style scoped>
.admin-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  min-height: calc(100vh - 100px);
}
</style>
