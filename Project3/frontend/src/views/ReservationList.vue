<template>
  <div class="reservation-list">
    <div class="page-title">我的预约</div>
    <div class="page-container">
      <div class="phone-input">
        <van-field
          v-model="phone"
          placeholder="请输入手机号查询预约"
          clearable
          @keyup.enter="loadData"
        >
          <template #button>
            <van-button size="small" type="primary" @click="loadData">查询</van-button>
          </template>
        </van-field>
      </div>
      <van-loading v-if="loading" class="loading" />
      <div v-else>
        <div v-for="item in reservations" :key="item.id" class="card">
          <div class="card-header">
            <span class="package-name">{{ item.packageName }}</span>
            <span :class="['status-tag', getStatusClass(item.status)]">{{ getStatusText(item.status) }}</span>
          </div>
          <div class="card-body">
            <div class="row">
              <span class="label">客户姓名：</span>
              <span>{{ item.customerName }}</span>
            </div>
            <div class="row">
              <span class="label">联系电话：</span>
              <span>{{ item.phone }}</span>
            </div>
            <div class="row">
              <span class="label">预约时间：</span>
              <span>{{ item.appointmentDate }} {{ item.appointmentTime }}</span>
            </div>
            <div class="row" v-if="item.address">
              <span class="label">拍摄地址：</span>
              <span>{{ item.address }}</span>
            </div>
            <div class="row" v-if="item.remark">
              <span class="label">备注：</span>
              <span>{{ item.remark }}</span>
            </div>
          </div>
          <div class="card-footer" v-if="item.status === 0">
            <van-button size="small" type="danger" plain @click="cancel(item.id)">取消预约</van-button>
            <van-button size="small" type="primary" @click="createOrderHandler(item.id, item.packageName)">生成订单</van-button>
          </div>
        </div>
        <van-empty v-if="reservations.length === 0" description="暂无预约记录" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getReservationList, cancelReservation, createOrder } from '../api'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const loading = ref(true)
const phone = ref('')
const reservations = ref([])

const loadData = async () => {
  loading.value = true
  try {
    reservations.value = await getReservationList(phone.value)
  } catch (e) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

const getStatusText = status => {
  const map = { 0: '待确认', 1: '已确认', 2: '已完成', 3: '已取消' }
  return map[status] || '未知'
}

const getStatusClass = status => {
  const map = { 0: 'status-pending', 1: 'status-success', 2: 'status-success', 3: 'status-cancel' }
  return map[status] || ''
}

const cancel = async id => {
  try {
    await showConfirmDialog({ title: '提示', message: '确定要取消该预约吗？' })
    await cancelReservation(id)
    showToast('取消成功')
    loadData()
  } catch (e) {}
}

const createOrderHandler = async (reservationId, packageName) => {
  try {
    await createOrder({ reservationId, packageName })
    showToast('订单创建成功')
    router.push('/order')
  } catch (e) {}
}

onMounted(loadData)
</script>

<style lang="less" scoped>
.phone-input {
  background: #fff;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}
.card {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #eee;
    .package-name {
      font-weight: bold;
      font-size: 15px;
    }
  }
  .card-body {
    padding: 12px;
    .row {
      margin-bottom: 8px;
      font-size: 13px;
      .label {
        color: #999;
      }
    }
  }
  .card-footer {
    padding: 12px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
.loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
</style>
