<template>
  <div class="room-list-page">
    <div class="page-header flex-between">
      <h2 class="page-title">康养房源</h2>
      <div class="filter-area">
        <el-select v-model="filterType" placeholder="房间类型" clearable style="width: 150px; margin-right: 10px;">
          <el-option label="标准单人间" value="标准单人间" />
          <el-option label="标准双人间" value="标准双人间" />
          <el-option label="豪华套房" value="豪华套房" />
          <el-option label="康养套房" value="康养套房" />
        </el-select>
        <el-input v-model="searchKeyword" placeholder="搜索房间名称" style="width: 200px;" clearable />
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="8" v-for="room in filteredRooms" :key="room.id">
        <el-card class="room-card" :body-style="{ padding: 0 }">
          <div class="room-image">
            <el-icon :size="80" color="#fff"><OfficeBuilding /></el-icon>
          </div>
          <div class="room-content">
            <div class="room-header flex-between">
              <h3>{{ room.name }}</h3>
              <el-tag :type="room.status === 1 ? 'success' : 'danger'">
                {{ room.status === 1 ? '可预订' : '已占用' }}
              </el-tag>
            </div>
            <p class="room-type">房间类型：{{ room.type }}</p>
            <p class="room-facilities">设施：{{ room.facilities }}</p>
            <div class="room-footer flex-between">
              <div class="room-price">
                <span class="price">¥{{ room.price }}</span>
                <span class="unit">/天</span>
              </div>
              <el-button type="primary" @click="goToDetail(room.id)">查看详情</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="filteredRooms.length === 0" description="暂无符合条件的房间" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRoomList } from '@/api/room'

const router = useRouter()
const rooms = ref([])
const filterType = ref('')
const searchKeyword = ref('')

const filteredRooms = computed(() => {
  return rooms.value.filter(room => {
    const matchType = !filterType.value || room.type === filterType.value
    const matchKeyword = !searchKeyword.value || 
      room.name.includes(searchKeyword.value) || 
      room.type.includes(searchKeyword.value)
    return matchType && matchKeyword
  })
})

const goToDetail = (id) => {
  router.push(`/room-detail/${id}`)
}

onMounted(async () => {
  const res = await getRoomList(1)
  if (res.code === 200) {
    rooms.value = res.data
  }
})
</script>

<style scoped>
.room-list-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  min-height: calc(100vh - 100px);
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
}

.room-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.room-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.room-image {
  height: 180px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.room-content {
  padding: 20px;
}

.room-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.room-type {
  color: #606266;
  margin: 10px 0;
}

.room-facilities {
  color: #909399;
  font-size: 13px;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.room-footer {
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.room-price .price {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.room-price .unit {
  color: #909399;
  font-size: 14px;
}
</style>
