<template>
  <div class="package-list-page">
    <h2 class="page-title">服务套餐</h2>

    <el-row :gutter="20">
      <el-col :span="8" v-for="pkg in packages" :key="pkg.id">
        <el-card class="package-card" :body-style="{ padding: 0 }">
          <div class="package-header">
            <h3>{{ pkg.name }}</h3>
            <p class="package-price">¥{{ pkg.price }}</p>
            <p class="package-duration">{{ pkg.duration }}天</p>
          </div>
          <div class="package-body">
            <p class="package-desc">{{ pkg.description }}</p>
            <div class="package-suitable">
              <span>适用人群：</span>
              <el-tag type="info">{{ pkg.suitableFor }}</el-tag>
            </div>
            <div class="package-services">
              <h4>包含服务</h4>
              <div class="service-list">
                <div class="service-item" v-for="(service, idx) in pkg.services.split(',')" :key="idx">
                  <el-icon><Check /></el-icon>
                  <span>{{ service }}</span>
                </div>
              </div>
            </div>
            <el-button type="primary" style="width: 100%; margin-top: 15px;" @click="goToBooking(pkg.id)">
              选择此套餐
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPackageList } from '@/api/package'

const router = useRouter()
const packages = ref([])

const goToBooking = (packageId) => {
  router.push({ path: '/rooms', query: { packageId } })
}

onMounted(async () => {
  const res = await getPackageList(1)
  if (res.code === 200) {
    packages.value = res.data
  }
})
</script>

<style scoped>
.package-list-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  min-height: calc(100vh - 100px);
}

.package-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.package-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.package-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 25px;
  text-align: center;
}

.package-header h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
}

.package-price {
  font-size: 36px;
  font-weight: bold;
  margin: 10px 0;
}

.package-duration {
  opacity: 0.9;
  margin: 0;
}

.package-body {
  padding: 20px;
}

.package-desc {
  color: #606266;
  margin-bottom: 15px;
}

.package-suitable {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  color: #909399;
}

.package-suitable .el-tag {
  margin-left: 10px;
}

.package-services h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.service-item {
  display: flex;
  align-items: center;
  color: #606266;
}

.service-item .el-icon {
  color: #67c23a;
  margin-right: 8px;
}
</style>
