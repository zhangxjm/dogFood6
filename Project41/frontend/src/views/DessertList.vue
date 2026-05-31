<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">甜品款式</h1>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索甜品名称"
          clearable
          style="width: 200px; margin-right: 10px;"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="selectedCategory" placeholder="选择分类" clearable style="width: 150px;" @change="handleCategoryChange">
          <el-option label="蛋糕" value="蛋糕" />
          <el-option label="慕斯" value="慕斯" />
          <el-option label="西点" value="西点" />
        </el-select>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="6" v-for="dessert in filteredDesserts" :key="dessert.id">
        <el-card class="dessert-card card-hover" :body-style="{ padding: 0 }">
          <img :src="dessert.image" :alt="dessert.name" class="dessert-image" />
          <div class="dessert-info">
            <div class="dessert-top">
              <span class="dessert-category">{{ dessert.category }}</span>
              <span v-if="dessert.customizable" class="custom-tag">可定制</span>
            </div>
            <h3 class="dessert-name">{{ dessert.name }}</h3>
            <p class="dessert-desc">{{ dessert.description }}</p>
            <div class="dessert-meta">
              <span class="prep-time">
                <el-icon><Clock /></el-icon>
                制作时间: {{ dessert.prepTime }}分钟
              </span>
            </div>
            <div class="dessert-footer">
              <span class="dessert-price">¥{{ dessert.price }}</span>
              <el-button type="primary" size="small" @click="goToOrder(dessert.id)">
                <el-icon><ShoppingCart /></el-icon>
                预定
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="filteredDesserts.length === 0" description="暂无甜品数据" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { dessertApi } from '@/api'

const router = useRouter()

const desserts = ref([])
const searchKeyword = ref('')
const selectedCategory = ref('')

const filteredDesserts = computed(() => {
  let result = desserts.value
  if (searchKeyword.value) {
    result = result.filter(d => d.name.includes(searchKeyword.value))
  }
  if (selectedCategory.value) {
    result = result.filter(d => d.category === selectedCategory.value)
  }
  return result
})

const loadDesserts = async () => {
  try {
    const res = await dessertApi.getAvailable()
    if (res.success) {
      desserts.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载甜品数据失败')
  }
}

const handleSearch = () => {
  if (searchKeyword.value) {
    dessertApi.search(searchKeyword.value).then(res => {
      if (res.success) {
        desserts.value = res.data
      }
    })
  } else {
    loadDesserts()
  }
}

const handleCategoryChange = () => {
  if (selectedCategory.value) {
    dessertApi.getByCategory(selectedCategory.value).then(res => {
      if (res.success) {
        desserts.value = res.data
      }
    })
  } else {
    loadDesserts()
  }
}

const goToOrder = (dessertId) => {
  router.push({ path: '/orders/create', query: { dessertId } })
}

onMounted(() => {
  loadDesserts()
})
</script>

<style scoped>
.dessert-card {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.dessert-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.dessert-info {
  padding: 16px;
}

.dessert-top {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.dessert-category {
  display: inline-block;
  background: #ffe4c4;
  color: #d2691e;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.custom-tag {
  display: inline-block;
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
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
  min-height: 36px;
}

.dessert-meta {
  margin-bottom: 12px;
}

.prep-time {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dessert-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dessert-price {
  font-size: 20px;
  font-weight: bold;
  color: #e74c3c;
}
</style>
