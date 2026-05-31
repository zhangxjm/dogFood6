<template>
  <div class="package-detail" v-if="packageInfo">
    <van-nav-bar title="套餐详情" left-text="返回" left-arrow @click-left="router.back()" />
    <img :src="packageInfo.coverImage" class="cover" />
    <div class="content">
      <div class="header">
        <h2>{{ packageInfo.name }}</h2>
        <div class="price">¥{{ packageInfo.price }}</div>
      </div>
      <div class="meta">
        <van-tag type="primary">{{ packageInfo.scene }}</van-tag>
        <van-tag type="success">{{ packageInfo.duration }}分钟</van-tag>
        <van-tag type="warning">{{ packageInfo.clothingCount }}</van-tag>
        <van-tag type="danger">{{ packageInfo.photoCount }}张精修</van-tag>
      </div>
      <div class="section">
        <div class="section-title">套餐介绍</div>
        <div class="section-content">{{ packageInfo.description }}</div>
      </div>
      <div class="section" v-if="packageInfo.images">
        <div class="section-title">样片展示</div>
        <van-image :src="img" v-for="(img, idx) in packageInfo.images.split(',')" :key="idx" class="sample-img" />
      </div>
    </div>
    <div class="footer">
      <van-button type="primary" block @click="goReserve">立即预约</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPackageDetail } from '../api'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const packageInfo = ref(null)

const loadData = async () => {
  try {
    packageInfo.value = await getPackageDetail(route.params.id)
  } catch (e) {
    showToast('加载失败')
  }
}

const goReserve = () => router.push(`/reservation/create/${route.params.id}`)

onMounted(loadData)
</script>

<style lang="less" scoped>
.cover {
  width: 100%;
  height: 220px;
  object-fit: cover;
}
.content {
  padding: 16px;
  background: #fff;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    h2 {
      font-size: 18px;
    }
    .price {
      font-size: 22px;
      color: #ff4444;
      font-weight: bold;
    }
  }
  .meta {
    margin-bottom: 20px;
    .van-tag {
      margin-right: 8px;
    }
  }
  .section {
    margin-bottom: 20px;
    .section-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      padding-left: 8px;
      border-left: 3px solid #1989fa;
    }
    .section-content {
      color: #666;
      line-height: 1.8;
    }
    .sample-img {
      width: 100%;
      height: 200px;
      margin-bottom: 10px;
      border-radius: 4px;
    }
  }
}
.footer {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  padding: 12px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
</style>
