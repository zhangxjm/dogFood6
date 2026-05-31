<template>
  <div class="home-page">
    <div class="welcome-card">
      <h2>欢迎回来，{{ userStore.user?.realName }}！</h2>
      <p>银发旅居康养服务预订系统 - 让您的晚年生活更精彩</p>
    </div>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon room-icon">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ roomCount }}</div>
              <div class="stat-label">可预订房间</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon booking-icon">
              <el-icon><Tickets /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ bookingCount }}</div>
              <div class="stat-label">我的预订</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon package-icon">
              <el-icon><Present /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ packageCount }}</div>
              <div class="stat-label">服务套餐</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon health-icon">
              <el-icon><Heart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ healthCount }}</div>
              <div class="stat-label">健康记录</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>推荐房间</span>
              <el-button type="primary" link @click="$router.push('/rooms')">查看更多</el-button>
            </div>
          </template>
          <el-carousel :interval="4000" type="card" height="300px">
            <el-carousel-item v-for="room in featuredRooms" :key="room.id">
              <div class="carousel-item">
                <div class="room-info">
                  <h3>{{ room.name }}</h3>
                  <p>{{ room.description }}</p>
                  <div class="room-price">
                    <span class="price">¥{{ room.price }}</span>
                    <span>/天</span>
                  </div>
                  <el-button type="primary" @click="goToRoomDetail(room.id)">立即预订</el-button>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>快捷入口</span>
          </template>
          <div class="quick-actions">
            <div class="quick-item" @click="$router.push('/rooms')">
              <el-icon :size="40"><OfficeBuilding /></el-icon>
              <span>房间预订</span>
            </div>
            <div class="quick-item" @click="$router.push('/packages')">
              <el-icon :size="40"><Present /></el-icon>
              <span>服务套餐</span>
            </div>
            <div class="quick-item" @click="$router.push('/health')">
              <el-icon :size="40"><Heart /></el-icon>
              <span>健康管理</span>
            </div>
            <div class="quick-item" @click="$router.push('/chat')">
              <el-icon :size="40"><ChatDotRound /></el-icon>
              <span>在线咨询</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>服务套餐</span>
          </template>
          <el-row :gutter="20">
            <el-col :span="6" v-for="pkg in packages" :key="pkg.id">
              <el-card class="package-card" :body-style="{ padding: 0 }">
                <div class="package-header">
                  <h3>{{ pkg.name }}</h3>
                  <p class="package-price">¥{{ pkg.price }}</p>
                </div>
                <div class="package-body">
                  <p class="package-desc">{{ pkg.description }}</p>
                  <div class="package-services">
                    <el-tag v-for="(service, idx) in pkg.services.split(',')" :key="idx" size="small" class="mr-10 mb-10">
                      {{ service }}
                    </el-tag>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { getRoomList } from '@/api/room'
import { getPackageList } from '@/api/package'
import { getMyBookings } from '@/api/booking'
import { getMyHealthData } from '@/api/health'

const router = useRouter()
const userStore = useUserStore()

const roomCount = ref(0)
const bookingCount = ref(0)
const packageCount = ref(0)
const healthCount = ref(0)
const featuredRooms = ref([])
const packages = ref([])

const goToRoomDetail = (id) => {
  router.push(`/room-detail/${id}`)
}

onMounted(async () => {
  const roomRes = await getRoomList(1)
  if (roomRes.code === 200) {
    roomCount.value = roomRes.data.length
    featuredRooms.value = roomRes.data.slice(0, 5)
  }

  const pkgRes = await getPackageList(1)
  if (pkgRes.code === 200) {
    packageCount.value = pkgRes.data.length
    packages.value = pkgRes.data.slice(0, 4)
  }

  const bookingRes = await getMyBookings()
  if (bookingRes.code === 200) {
    bookingCount.value = bookingRes.data.length
  }

  const healthRes = await getMyHealthData()
  if (healthRes.code === 200) {
    healthCount.value = healthRes.data.length
  }
})
</script>

<style scoped>
.home-page {
  padding: 0;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.welcome-card h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
}

.welcome-card p {
  margin: 0;
  opacity: 0.9;
}

.stat-card {
  border: none;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  margin-right: 20px;
}

.room-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.booking-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.package-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.health-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.carousel-item {
  height: 100%;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.room-info {
  text-align: center;
  padding: 20px;
}

.room-info h3 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 10px;
}

.room-info p {
  color: #606266;
  margin-bottom: 15px;
}

.room-price {
  margin-bottom: 15px;
}

.room-price .price {
  font-size: 32px;
  font-weight: bold;
  color: #f56c6c;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-item:hover {
  background: #e6f7ff;
  transform: translateY(-2px);
}

.quick-item span {
  margin-top: 10px;
  color: #606266;
}

.package-card {
  overflow: hidden;
}

.package-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 20px;
  text-align: center;
}

.package-header h3 {
  margin: 0 0 10px 0;
}

.package-price {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
}

.package-body {
  padding: 20px;
}

.package-desc {
  color: #606266;
  margin-bottom: 15px;
}
</style>
