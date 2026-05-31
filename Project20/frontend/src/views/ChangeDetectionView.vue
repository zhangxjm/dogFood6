<template>
  <div>
    <h2 class="page-title">变化检测</h2>
    
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="page-card">
          <template #header>
            <span>选择影像</span>
          </template>
          
          <div class="image-select-section">
            <h4>时相 1 (较早)</h4>
            <div class="image-grid-small">
              <div
                v-for="image in images"
                :key="'img1-' + image.id"
                class="image-select-item"
                :class="{ active: selectedImage1?.id === image.id }"
                @click="selectedImage1 = image"
              >
                <img :src="imageApi.getThumbnail(image.id)" :alt="image.original_name" />
                <span>{{ image.original_name }}</span>
              </div>
            </div>
          </div>
          
          <el-divider />
          
          <div class="image-select-section">
            <h4>时相 2 (较新)</h4>
            <div class="image-grid-small">
              <div
                v-for="image in images"
                :key="'img2-' + image.id"
                class="image-select-item"
                :class="{ active: selectedImage2?.id === image.id }"
                @click="selectedImage2 = image"
              >
                <img :src="imageApi.getThumbnail(image.id)" :alt="image.original_name" />
                <span>{{ image.original_name }}</span>
              </div>
            </div>
          </div>
          
          <el-divider />
          
          <el-button
            type="primary"
            style="width: 100%;"
            @click="runChangeDetection"
            :loading="detecting"
            :disabled="!selectedImage1 || !selectedImage2"
          >
            <el-icon><VideoPlay /></el-icon>
            开始变化检测
          </el-button>
        </el-card>
        
        <el-card class="page-card mt-20" style="max-height: 300px; overflow-y: auto;">
          <template #header>
            <span>历史记录</span>
          </template>
          <div class="history-list">
            <div
              v-for="record in historyRecords"
              :key="record.id"
              class="history-item"
              @click="loadHistory(record)"
            >
              <span>#{{ record.id }}</span>
              <span class="history-percentage" :style="{ color: getChangeColor(record.change_percentage) }">
                {{ record.change_percentage }}%
              </span>
            </div>
          </div>
          <el-empty v-if="historyRecords.length === 0" description="暂无历史记录" :image-size="60" />
        </el-card>
      </el-col>
      
      <el-col :span="16">
        <el-card class="page-card">
          <template #header>
            <div class="flex-between">
              <span>变化检测结果</span>
              <el-tag v-if="currentResult" type="danger">
                变化率: {{ currentResult.change_percentage }}%
              </el-tag>
            </div>
          </template>
          
          <el-row :gutter="20" v-if="selectedImage1 && selectedImage2">
            <el-col :span="8">
              <h4 style="margin-bottom: 12px; text-align: center;">时相 1</h4>
              <div class="image-display">
                <img :src="imageApi.getImageFile(selectedImage1.id)" style="max-width: 100%;" />
                <p class="image-label">{{ selectedImage1.original_name }}</p>
              </div>
            </el-col>
            <el-col :span="8">
              <h4 style="margin-bottom: 12px; text-align: center;">时相 2</h4>
              <div class="image-display">
                <img :src="imageApi.getImageFile(selectedImage2.id)" style="max-width: 100%;" />
                <p class="image-label">{{ selectedImage2.original_name }}</p>
              </div>
            </el-col>
            <el-col :span="8">
              <h4 style="margin-bottom: 12px; text-align: center;">变化区域</h4>
              <div class="image-display">
                <img
                  v-if="currentResult"
                  :src="detectionApi.getChangeMask(currentResult.id)"
                  style="max-width: 100%;"
                />
                <el-empty v-else description="请先执行变化检测" :image-size="80" />
              </div>
            </el-col>
          </el-row>
          
          <el-empty v-else description="请选择两张影像进行变化检测" />
        </el-card>
        
        <el-card class="page-card mt-20" v-if="currentResult">
          <template #header>
            <span>变化详情</span>
          </template>
          
          <el-descriptions :column="3" border>
            <el-descriptions-item label="变化区域数量">
              {{ getChangeAreas().length }}
            </el-descriptions-item>
            <el-descriptions-item label="总变化面积占比">
              <el-tag type="danger" size="large">{{ currentResult.change_percentage }}%</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="检测时间">
              {{ formatDate(currentResult.created_at) }}
            </el-descriptions-item>
          </el-descriptions>
          
          <el-table
            v-if="getChangeAreas().length > 0"
            :data="getChangeAreas()"
            stripe
            style="margin-top: 20px;"
          >
            <el-table-column type="index" label="序号" width="80" />
            <el-table-column prop="area" label="面积 (像素)" width="150">
              <template #default="{ row }">
                {{ Math.round(row.area) }}
              </template>
            </el-table-column>
            <el-table-column label="位置" width="180">
              <template #default="{ row }">
                ({{ Math.round(row.x) }}, {{ Math.round(row.y) }})
              </template>
            </el-table-column>
            <el-table-column label="尺寸" width="180">
              <template #default="{ row }">
                {{ Math.round(row.width) }} x {{ Math.round(row.height) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { imageApi, detectionApi } from '@/api'

const images = ref([])
const selectedImage1 = ref(null)
const selectedImage2 = ref(null)
const currentResult = ref(null)
const historyRecords = ref([])
const detecting = ref(false)

const loadImages = async () => {
  try {
    const res = await imageApi.getImages({ limit: 20 })
    images.value = res.data
    if (res.data.length >= 2) {
      selectedImage1.value = res.data[0]
      selectedImage2.value = res.data[1]
    }
  } catch (e) {
    console.error('Failed to load images:', e)
  }
}

const loadHistory = async () => {
  try {
    const res = await detectionApi.getChangeDetections({ limit: 20 })
    historyRecords.value = res.data
  } catch (e) {
    console.error('Failed to load history:', e)
  }
}

const runChangeDetection = async () => {
  if (!selectedImage1.value || !selectedImage2.value) {
    ElMessage.warning('请选择两张影像')
    return
  }
  
  if (selectedImage1.value.id === selectedImage2.value.id) {
    ElMessage.warning('请选择不同的两张影像')
    return
  }
  
  detecting.value = true
  try {
    const res = await detectionApi.detectChanges({
      image1_id: selectedImage1.value.id,
      image2_id: selectedImage2.value.id
    })
    currentResult.value = res.data
    ElMessage.success('变化检测完成')
    loadHistory()
  } catch (e) {
    console.error('Change detection failed:', e)
    ElMessage.error('变化检测失败')
  } finally {
    detecting.value = false
  }
}

const loadHistory = (record) => {
  currentResult.value = record
}

const getChangeAreas = () => {
  if (!currentResult.value?.change_areas) return []
  try {
    return JSON.parse(currentResult.value.change_areas)
  } catch {
    return []
  }
}

const getChangeColor = (percentage) => {
  if (percentage >= 20) return '#f56c6c'
  if (percentage >= 10) return '#e6a23c'
  return '#67c23a'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadImages()
  loadHistory()
})
</script>

<style scoped>
.image-select-section {
  margin-bottom: 16px;
}

.image-select-section h4 {
  margin-bottom: 12px;
  color: #606266;
  font-size: 14px;
}

.image-grid-small {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.image-select-item {
  border: 2px solid #ebeef5;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.image-select-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.image-select-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.image-select-item img {
  width: 100%;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 4px;
}

.image-select-item span {
  display: block;
  font-size: 11px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  background: #ecf5ff;
}

.history-percentage {
  font-weight: 600;
}

.image-display {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  background: #f5f7fa;
  text-align: center;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-label {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
