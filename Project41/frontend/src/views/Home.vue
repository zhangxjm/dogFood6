<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">欢迎来到烘焙私房甜品</h1>
        <p class="hero-subtitle">用心烘焙每一份甜蜜，定制专属于您的美味</p>
        <div class="hero-buttons">
          <el-button type="primary" size="large" @click="goToDesserts">
            <el-icon><Cake /></el-icon>
            浏览甜品
          </el-button>
          <el-button size="large" @click="goToCreateOrder">
            <el-icon><Plus /></el-icon>
            立即预定
          </el-button>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card card-hover">
            <div class="stat-content">
              <div class="stat-icon dessert-icon">🧁</div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.desserts }}</div>
                <div class="stat-label">甜品款式</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card card-hover">
            <div class="stat-content">
              <div class="stat-icon order-icon">📋</div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.orders }}</div>
                <div class="stat-label">订单总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card card-hover">
            <div class="stat-content">
              <div class="stat-icon making-icon">👨‍🍳</div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.making }}</div>
                <div class="stat-label">制作中</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card card-hover">
            <div class="stat-content">
              <div class="stat-icon done-icon">✅</div>
              <div class="stat-info">
                <div class="stat-number">{{ stats.completed }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="featured-section">
      <div class="section-header">
        <h2 class="section-title">精选甜品</h2>
        <el-button type="text" @click="goToDesserts">查看更多 →</el-button>
      </div>
      <el-row :gutter="20">
        <el-col :span="6" v-for="dessert in featuredDesserts" :key="dessert.id">
          <el-card class="dessert-card card-hover" :body-style="{ padding: 0 }">
            <img :src="dessert.image" :alt="dessert.name" class="dessert-image" />
            <div class="dessert-info">
              <div class="dessert-category">{{ dessert.category }}</div>
              <h3 class="dessert-name">{{ dessert.name }}</h3>
              <p class="dessert-desc">{{ dessert.description }}</p>
              <div class="dessert-footer">
                <span class="dessert-price">¥{{ dessert.price }}</span>
                <el-button type="primary" size="small" @click="goToCreateOrder(dessert.id)">
                  立即预定
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="features-section">
      <el-row :gutter="30">
        <el-col :span="8">
          <div class="feature-item">
            <div class="feature-icon">🎂</div>
            <h3>定制甜品</h3>
            <p>支持个性化定制，根据您的喜好制作独一无二的甜品</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="feature-item">
            <div class="feature-icon">📱</div>
            <h3>进度追踪</h3>
            <p>实时查看制作进度，随时掌握订单状态</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="feature-item">
            <div class="feature-icon">🏠</div>
            <h3>到店自提</h3>
            <p>便捷的自提服务，核销码快速取货</p>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { dessertApi, orderApi } from '@/api'

const router = useRouter()

const stats = ref({
  desserts: 0,
  orders: 0,
  making: 0,
  completed: 0
})

const featuredDesserts = ref([])

const loadData = async () => {
  try {
    const dessertRes = await dessertApi.getAvailable()
    if (dessertRes.success) {
      stats.value.desserts = dessertRes.data.length
      featuredDesserts.value = dessertRes.data.slice(0, 4)
    }

    const orderRes = await orderApi.getAll()
    if (orderRes.success) {
      stats.value.orders = orderRes.data.length
      stats.value.making = orderRes.data.filter(o => 
        o.progressStatus === 'MAKING' || o.progressStatus === 'PREPARING'
      ).length
      stats.value.completed = orderRes.data.filter(o => 
        o.status === 'COMPLETED'
      ).length
    }
  } catch (error) {
    console.error('加载数据失败', error)
  }
}

const goToDesserts = () => {
  router.push('/desserts')
}

const goToCreateOrder = (dessertId = null) => {
  if (dessertId) {
    router.push({ path: '/orders/create', query: { dessertId } })
  } else {
    router.push('/orders/create')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-radius: 20px;
  padding: 60px 40px;
  margin-bottom: 40px;
  text-align: center;
}

.hero-title {
  font-size: 36px;
  color: #8b4513;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 18px;
  color: #a0522d;
  margin-bottom: 30px;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.stats-section {
  margin-bottom: 40px;
}

.stat-card {
  border-radius: 12px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 40px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.dessert-icon {
  background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
}

.order-icon {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
}

.making-icon {
  background: linear-gradient(135deg, #55efc4, #00b894);
}

.done-icon {
  background: linear-gradient(135deg, #a29bfe, #6c5ce7);
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #8b4513;
}

.stat-label {
  font-size: 14px;
  color: #888;
}

.featured-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  color: #8b4513;
  margin: 0;
}

.dessert-card {
  border-radius: 12px;
  overflow: hidden;
}

.dessert-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.dessert-info {
  padding: 16px;
}

.dessert-category {
  display: inline-block;
  background: #ffe4c4;
  color: #d2691e;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 8px;
}

.dessert-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
}

.dessert-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dessert-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dessert-price {
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
}

.features-section {
  background: #fff;
  border-radius: 20px;
  padding: 40px;
}

.feature-item {
  text-align: center;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-item h3 {
  font-size: 18px;
  color: #8b4513;
  margin-bottom: 8px;
}

.feature-item p {
  font-size: 14px;
  color: #666;
  margin: 0;
}
</style>
