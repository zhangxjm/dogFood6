<template>
  <div class="package-list">
    <div class="page-title">摄影套餐</div>
    <van-loading v-if="loading" class="loading" />
    <div v-else class="page-container">
      <div v-for="item in packages" :key="item.id" class="card" @click="goDetail(item.id)">
        <img :src="item.coverImage" class="cover" />
        <div class="info">
          <div class="name">{{ item.name }}</div>
          <div class="desc">{{ item.description }}</div>
          <div class="meta">
            <span>{{ item.scene }}</span>
            <span>{{ item.duration }}分钟</span>
            <span>{{ item.photoCount }}张精修</span>
          </div>
          <div class="bottom">
            <span class="price">¥{{ item.price }}</span>
            <van-button type="primary" size="small" @click.stop="goReserve(item.id)">立即预约</van-button>
          </div>
        </div>
      </div>
      <van-empty v-if="packages.length === 0" description="暂无套餐" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPackageList } from '../api'
import { showToast } from 'vant'

const router = useRouter()
const loading = ref(true)
const packages = ref([])

const loadData = async () => {
  loading.value = true
  try {
    packages.value = await getPackageList()
  } catch (e) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

const goDetail = id => router.push(`/package/${id}`)
const goReserve = id => router.push(`/reservation/create/${id}`)

onMounted(loadData)
</script>

<style lang="less" scoped>
.cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
.info {
  padding: 12px;
  .name {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  .desc {
    color: #666;
    font-size: 13px;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .meta {
    font-size: 12px;
    color: #999;
    margin-bottom: 12px;
    span {
      margin-right: 12px;
    }
  }
  .bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .price {
      font-size: 20px;
    }
  }
}
.loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
</style>
