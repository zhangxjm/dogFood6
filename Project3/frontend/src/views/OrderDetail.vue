<template>
  <div class="order-detail" v-if="order">
    <van-nav-bar title="订单详情" left-text="返回" left-arrow @click-left="router.back()" />
    <div class="page-container">
      <div class="card">
        <div class="card-header">
          <span :class="['status-tag', getStatusClass(order.orderStatus)]">{{ getStatusText(order.orderStatus) }}</span>
        </div>
        <div class="card-body">
          <div class="row">
            <span class="label">订单号：</span>
            <span>{{ order.orderNo }}</span>
          </div>
          <div class="row">
            <span class="label">套餐名称：</span>
            <span>{{ order.packageName }}</span>
          </div>
          <div class="row">
            <span class="label">客户姓名：</span>
            <span>{{ order.customerName }}</span>
          </div>
          <div class="row">
            <span class="label">联系电话：</span>
            <span>{{ order.phone }}</span>
          </div>
          <div class="row">
            <span class="label">订单金额：</span>
            <span class="price">¥{{ order.amount }}</span>
          </div>
          <div class="row">
            <span class="label">支付状态：</span>
            <span :class="order.payStatus === 1 ? 'status-success' : 'status-pending'">{{ order.payStatus === 1 ? '已支付' : '待支付' }}</span>
          </div>
          <div class="row" v-if="order.payTime">
            <span class="label">支付时间：</span>
            <span>{{ order.payTime }}</span>
          </div>
          <div class="row" v-if="order.remark">
            <span class="label">备注：</span>
            <span>{{ order.remark }}</span>
          </div>
          <div class="row">
            <span class="label">创建时间：</span>
            <span>{{ order.createTime }}</span>
          </div>
        </div>
      </div>
      <div v-if="order.payStatus === 0" class="action-bar">
        <van-button type="primary" block @click="pay">立即支付</van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getOrderDetail, payOrder } from '../api'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const route = useRoute()
const order = ref(null)

const loadData = async () => {
  try {
    order.value = await getOrderDetail(route.params.id)
  } catch (e) {
    showToast('加载失败')
  }
}

const getStatusText = status => {
  const map = { 0: '待支付', 1: '拍摄中', 2: '后期处理', 3: '成片已交付', 4: '已完成', 5: '已取消' }
  return map[status] || '未知'
}

const getStatusClass = status => {
  if (status === 5) return 'status-cancel'
  if (status === 4 || status === 3) return 'status-success'
  return 'status-pending'
}

const pay = async () => {
  try {
    await showConfirmDialog({ title: '提示', message: '确认支付该订单？' })
    await payOrder(route.params.id)
    showToast('支付成功')
    loadData()
  } catch (e) {}
}

onMounted(loadData)
</script>

<style lang="less" scoped>
.card {
  background: #fff;
  border-radius: 8px;
  .card-header {
    padding: 12px;
    border-bottom: 1px solid #eee;
  }
  .card-body {
    padding: 12px;
    .row {
      margin-bottom: 10px;
      font-size: 13px;
      display: flex;
      .label {
        color: #999;
        width: 80px;
        flex-shrink: 0;
      }
      .price {
        color: #ff4444;
        font-weight: bold;
      }
    }
  }
}
.action-bar {
  margin-top: 20px;
}
</style>
