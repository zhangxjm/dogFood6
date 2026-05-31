<template>
  <div class="delivery-list">
    <div class="page-title">成片领取</div>
    <div class="page-container">
      <div class="phone-input">
        <van-field
          v-model="phone"
          placeholder="请输入手机号查询领取记录"
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
        <div v-for="item in deliveries" :key="item.id" class="card">
          <div class="card-header">
            <span class="order-no">订单号：{{ item.orderNo }}</span>
            <span :class="['status-tag', getStatusClass(item.deliveryStatus)]">{{ getStatusText(item.deliveryStatus) }}</span>
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
            <div class="row" v-if="item.deliveryTime">
              <span class="label">交付时间：</span>
              <span>{{ item.deliveryTime }}</span>
            </div>
            <div class="row" v-if="item.receiver">
              <span class="label">领取人：</span>
              <span>{{ item.receiver }}</span>
            </div>
            <div class="row" v-if="item.remark">
              <span class="label">备注：</span>
              <span>{{ item.remark }}</span>
            </div>
            <div class="photos" v-if="item.photos">
              <div class="photos-title">成片预览</div>
              <div class="photos-grid">
                <van-image
                  v-for="(photo, idx) in item.photos.split(',')"
                  :key="idx"
                  :src="photo"
                  class="photo-item"
                  @click="previewPhoto(item.photos.split(','), idx)"
                />
              </div>
            </div>
          </div>
          <div class="card-footer" v-if="item.deliveryStatus === 1">
            <van-button size="small" type="primary" @click="confirm(item.id)">确认领取</van-button>
          </div>
        </div>
        <van-empty v-if="deliveries.length === 0" description="暂无领取记录" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDeliveryList, confirmDelivery } from '../api'
import { showToast, showConfirmDialog, showImagePreview } from 'vant'

const loading = ref(true)
const phone = ref('')
const deliveries = ref([])

const loadData = async () => {
  loading.value = true
  try {
    deliveries.value = await getDeliveryList(phone.value)
  } catch (e) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

const getStatusText = status => {
  const map = { 1: '待领取', 2: '已领取' }
  return map[status] || '未知'
}

const getStatusClass = status => {
  return status === 2 ? 'status-success' : 'status-pending'
}

const confirm = async id => {
  try {
    await showConfirmDialog({ title: '提示', message: '确认已领取成片？' })
    await confirmDelivery(id)
    showToast('确认成功')
    loadData()
  } catch (e) {}
}

const previewPhoto = (photos, index) => {
  showImagePreview({ images: photos, startPosition: index })
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
    }
    .photos {
      margin-top: 12px;
      .photos-title {
        font-weight: bold;
        margin-bottom: 8px;
      }
      .photos-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        .photo-item {
          width: 100%;
          height: 80px;
          border-radius: 4px;
          object-fit: cover;
        }
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
