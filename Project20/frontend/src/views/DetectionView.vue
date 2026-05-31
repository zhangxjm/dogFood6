<template>
  <div>
    <h2 class="page-title">地物识别</h2>
    
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="page-card" style="height: calc(100vh - 140px); overflow-y: auto;">
          <template #header>
            <span>选择影像</span>
          </template>
          <div class="image-list">
            <div
              v-for="image in images"
              :key="image.id"
              class="image-list-item"
              :class="{ active: selectedImage?.id === image.id }"
              @click="selectImage(image)"
            >
              <img :src="imageApi.getThumbnail(image.id)" :alt="image.original_name" />
              <div class="image-list-info">
                <div class="image-list-title">{{ image.original_name }}</div>
                <div class="image-list-meta">{{ image.satellite_source }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="16">
        <el-card class="page-card mb-20">
          <template #header>
            <div class="flex-between">
              <span>识别结果</span>
              <div>
                <el-button type="primary" @click="runDetection" :loading="detecting" :disabled="!selectedImage">
                  <el-icon><VideoPlay /></el-icon>
                  开始识别
                </el-button>
                <el-button type="success" @click="clearResults" :disabled="!detectionResults.length">
                  <el-icon><Delete /></el-icon>
                  清除结果
                </el-button>
              </div>
            </div>
          </template>
          
          <el-row :gutter="20" v-if="selectedImage">
            <el-col :span="12">
              <h4 style="margin-bottom: 12px;">原始影像</h4>
              <div class="image-display">
                <img :src="imageApi.getImageFile(selectedImage.id)" style="max-width: 100%;" />
              </div>
            </el-col>
            <el-col :span="12">
              <h4 style="margin-bottom: 12px;">识别结果</h4>
              <div class="image-display">
                <canvas ref="canvasRef" class="detection-canvas" />
              </div>
            </el-col>
          </el-row>
          
          <el-empty v-else description="请选择一张影像进行识别" />
        </el-card>
        
        <el-card class="page-card" v-if="detectionResults.length > 0">
          <template #header>
            <div class="flex-between">
              <span>检测到的地物 ({{ detectionResults.length }})</span>
              <el-tag type="success">置信度统计</el-tag>
            </div>
          </template>
          
          <el-table :data="detectionResults" stripe>
            <el-table-column prop="label" label="类别" width="120">
              <template #default="{ row }">
                <el-tag :type="getLabelType(row.label)" size="small">{{ row.label }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="confidence" label="置信度" width="120">
              <template #default="{ row }">
                <el-progress
                  :percentage="Math.round(row.confidence * 100)"
                  :stroke-width="10"
                  :color="getConfidenceColor(row.confidence)"
                />
              </template>
            </el-table-column>
            <el-table-column label="位置" width="180">
              <template #default="{ row }">
                ({{ Math.round(row.bbox_x) }}, {{ Math.round(row.bbox_y) }})
              </template>
            </el-table-column>
            <el-table-column label="尺寸" width="150">
              <template #default="{ row }">
                {{ Math.round(row.bbox_width) }} x {{ Math.round(row.bbox_height) }}
              </template>
            </el-table-column>
            <el-table-column prop="detection_type" label="检测类型" width="150" />
            <el-table-column label="操作" width="100">
              <template #default="{ $index }">
                <el-button type="danger" link @click="deleteResult($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { imageApi, detectionApi } from '@/api'

const images = ref([])
const selectedImage = ref(null)
const detectionResults = ref([])
const detecting = ref(false)
const canvasRef = ref(null)

const loadImages = async () => {
  try {
    const res = await imageApi.getImages({ limit: 50 })
    images.value = res.data
  } catch (e) {
    console.error('Failed to load images:', e)
  }
}

const selectImage = async (image) => {
  selectedImage.value = image
  detectionResults.value = []
  
  try {
    const res = await detectionApi.getDetectionResults(image.id)
    detectionResults.value = res.data
    await nextTick()
    drawDetections()
  } catch (e) {
    console.error('Failed to load detection results:', e)
  }
}

const runDetection = async () => {
  if (!selectedImage.value) {
    ElMessage.warning('请先选择影像')
    return
  }
  
  detecting.value = true
  try {
    const res = await detectionApi.detectObjects({
      image_id: selectedImage.value.id,
      model_name: 'default'
    })
    detectionResults.value = res.data
    ElMessage.success(`检测完成，共发现 ${res.data.length} 个地物`)
    await nextTick()
    drawDetections()
  } catch (e) {
    console.error('Detection failed:', e)
    ElMessage.error('检测失败')
  } finally {
    detecting.value = false
  }
}

const drawDetections = async () => {
  if (!canvasRef.value || !selectedImage.value) return
  
  await nextTick()
  
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    
    ctx.drawImage(img, 0, 0)
    
    const colors = {
      '建筑物': '#409eff',
      '道路': '#e6a23c',
      '植被': '#67c23a',
      '水域': '#909399',
      '农田': '#f56c6c'
    }
    
    detectionResults.value.forEach((result) => {
      const color = colors[result.label] || '#409eff'
      
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.strokeRect(
        result.bbox_x,
        result.bbox_y,
        result.bbox_width,
        result.bbox_height
      )
      
      ctx.fillStyle = color
      ctx.globalAlpha = 0.2
      ctx.fillRect(
        result.bbox_x,
        result.bbox_y,
        result.bbox_width,
        result.bbox_height
      )
      ctx.globalAlpha = 1.0
      
      ctx.fillStyle = color
      ctx.font = 'bold 14px sans-serif'
      const text = `${result.label} ${(result.confidence * 100).toFixed(0)}%`
      ctx.fillText(text, result.bbox_x, result.bbox_y - 5)
    })
  }
  img.src = imageApi.getImageFile(selectedImage.value.id)
}

const deleteResult = async (index) => {
  const result = detectionResults.value[index]
  if (result.id) {
    try {
      await detectionApi.deleteDetectionResult(result.id)
    } catch (e) {
      console.error('Failed to delete result:', e)
    }
  }
  detectionResults.value.splice(index, 1)
  drawDetections()
}

const clearResults = () => {
  detectionResults.value = []
  drawDetections()
}

const getLabelType = (label) => {
  const typeMap = {
    '建筑物': 'primary',
    '道路': 'warning',
    '植被': 'success',
    '水域': 'info',
    '农田': 'danger'
  }
  return typeMap[label] || ''
}

const getConfidenceColor = (confidence) => {
  if (confidence >= 0.9) return '#67c23a'
  if (confidence >= 0.7) return '#e6a23c'
  return '#f56c6c'
}

onMounted(() => {
  loadImages()
})
</script>

<style scoped>
.image-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-list-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.image-list-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.image-list-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.image-list-item img {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.image-list-info {
  flex: 1;
  min-width: 0;
}

.image-list-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-list-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.image-display {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  background: #f5f7fa;
  display: flex;
  justify-content: center;
  min-height: 300px;
}

.detection-canvas {
  max-width: 100%;
  max-height: 500px;
}
</style>
