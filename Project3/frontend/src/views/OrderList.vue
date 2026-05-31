<template>
  <div class="order-list">
    <div class="page-title">我的订单</div>
    <div class="page-container">
      <div class="phone-input">
        <van-field
          v-model="phone"
          placeholder="请输入手机号查询订单"
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
        <div v-for="item in orders" :key="item.id" class="card" @click="goDetail(item.id)">
          <div class="card-header">
            <span class="order-no">订单号：{{ item.orderNo }}</span>
            <span :class="['status-tag', getStatusClass(item.orderStatus)]">{{ getStatusText(item.orderStatus) }}</span>
          </div>
          <div class="card-body">
            <div class="row">
              <span class="label">套餐名称：</span>
              <span>{{ item.packageName }}</span>
            </div>
            <div class="row">
              <span class="label">客户姓名：</span>
              <span>{{ item.customerName }}</span>
            </div>
            <div class="row">
              <span class="label">联系电话：</span>
              <span>{{ item.phone }}</span>
            </div>
            <div class="row">
              <span class="label">订单金额：</span>
              <span class="price">¥{{ item.amount }}</span>
            </div>
            <div class="row">
              <span class="label">支付状态：</span>
              <span :class="item.payStatus === 1 ? 'status-success' : 'status-pending'">{{ item.payStatus === 1 ? '已支付' : '待支付' }}</span>
            </div>
          </div>
          <div class="card-footer" v-if="item.payStatus === 0">
            <van-button size="small" type="primary" @click.stop="pay(item.id)">立即支付</van-button>
          </div>
        </div>
        <van-empty v-if="orders.length === 0" description="暂无订单" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getOrderList, payOrder } from '../api'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const loading = ref(true)
const phone = ref('')
const orders = ref([])

const loadData = async () => {
  loading.value = true
  try {
    orders.value = await getOrderList(phone.value)
  } catch (e) {
    showToast('加载失败')
  } finally {
    loading.value = false
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

const pay = async id => {
  try {
    await showConfirmDialog({ title: '提示', message: '确认支付该订单？' })
    await payOrder(id)
    showToast('支付成功')
    loadData()
  } catch (e) {}
}

const goDetail = id => router.push(`/order/${id}`)

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
    .order-no {
      font-size: 13px;
      color: #666;
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
      .price {
        color: #ff4444;
        font-weight: bold;
      }
    }
  }
  .card-footer {
    padding: 12px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
  }
}
.loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
</style>
