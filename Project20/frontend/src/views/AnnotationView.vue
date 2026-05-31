<template>
  <div>
    <h2 class="page-title">数据标注</h2>
    
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="page-card" style="height: calc(100vh - 140px); overflow-y: auto;">
          <template #header>
            <div class="flex-between">
              <span>影像列表</span>
            </div>
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
                <div class="image-list-meta">{{ image.location }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="page-card">
          <template #header>
            <div class="flex-between">
              <span>标注画布</span>
              <div>
                <el-button-group>
                  <el-button :type="currentTool === 'select' ? 'primary' : ''" @click="currentTool = 'select'">
                    <el-icon><Pointer /></el-icon>
                    选择
                  </el-button>
                  <el-button :type="currentTool === 'rect' ? 'primary' : ''" @click="currentTool = 'rect'">
                    <el-icon><Crop /></el-icon>
                    矩形框
                  </el-button>
                  <el-button type="success" @click="saveAnnotations" :disabled="!selectedImage">
                    <el-icon><Check /></el-icon>
                    保存
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </template>
          
          <div v-if="selectedImage" class="canvas-wrapper">
            <div class="annotation-canvas-container">
              <img
                ref="imageRef"
                :src="imageApi.getImageFile(selectedImage.id)"
                :style="{ maxWidth: '100%', maxHeight: '500px' }"
                @load="initCanvas"
              />
              <canvas
                ref="canvasRef"
                class="annotation-canvas"
                @mousedown="handleMouseDown"
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp"
              />
            </div>
          </div>
          
          <el-empty v-else description="请选择一张影像进行标注" />
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="page-card" style="height: calc(100vh - 140px); overflow-y: auto;">
          <template #header>
            <div class="flex-between">
              <span>标注列表 ({{ annotations.length }})</span>
              <el-tag size="small" type="info">{{ selectedImage?.original_name || '-' }}</el-tag>
            </div>
          </template>
          
          <div v-if="annotations.length > 0" class="annotation-list">
            <div
              v-for="(ann, index) in annotations"
              :key="index"
              class="annotation-item"
              :class="{ active: editingAnnotation === index }"
              @click="selectAnnotation(index)"
            >
              <div class="annotation-header">
                <el-tag size="small" :type="getLabelType(ann.label)">{{ ann.label }}</el-tag>
                <span class="confidence">{{ (ann.confidence * 100).toFixed(0) }}%</span>
              </div>
              <div class="annotation-info">
                <span>位置: ({{ Math.round(ann.bbox_x) }}, {{ Math.round(ann.bbox_y) }})</span>
                <span>大小: {{ Math.round(ann.bbox_width) }} x {{ Math.round(ann.bbox_height) }}</span>
              </div>
              <div class="annotation-actions" v-if="editingAnnotation === index">
                <el-select v-model="ann.label" size="small" style="width: 100px;">
                  <el-option label="建筑物" value="建筑物" />
                  <el-option label="道路" value="道路" />
                  <el-option label="植被" value="植被" />
                  <el-option label="水域" value="水域" />
                  <el-option label="农田" value="农田" />
                </el-select>
                <el-button size="small" type="danger" link @click.stop="deleteAnnotation(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          
          <el-empty v-else description="暂无标注数据" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { imageApi, annotationApi } from '@/api'

const images = ref([])
const selectedImage = ref(null)
const annotations = ref([])
const currentTool = ref('rect')
const editingAnnotation = ref(null)

const imageRef = ref(null)
const canvasRef = ref(null)

const isDrawing = ref(false)
const startPos = ref({ x: 0, y: 0 })
const tempRect = ref(null)

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
  editingAnnotation.value = null
  
  try {
    const res = await annotationApi.getAnnotations({ image_id: image.id })
    annotations.value = res.data
    await nextTick()
    initCanvas()
  } catch (e) {
    console.error('Failed to load annotations:', e)
    annotations.value = []
  }
}

const initCanvas = () => {
  if (!canvasRef.value || !imageRef.value) return
  
  const img = imageRef.value
  const canvas = canvasRef.value
  
  canvas.width = img.offsetWidth
  canvas.height = img.offsetHeight
  
  canvas.style.position = 'absolute'
  canvas.style.left = '0'
  canvas.style.top = '0'
  
  redrawCanvas()
}

const redrawCanvas = () => {
  if (!canvasRef.value) return
  
  const ctx = canvasRef.value.getContext('2d')
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  
  annotations.value.forEach((ann, index) => {
    const isSelected = editingAnnotation.value === index
    ctx.strokeStyle = isSelected ? '#f56c6c' : '#409eff'
    ctx.lineWidth = isSelected ? 3 : 2
    ctx.strokeRect(ann.bbox_x, ann.bbox_y, ann.bbox_width, ann.bbox_height)
    
    ctx.fillStyle = isSelected ? 'rgba(245, 108, 108, 0.3)' : 'rgba(64, 158, 255, 0.2)'
    ctx.fillRect(ann.bbox_x, ann.bbox_y, ann.bbox_width, ann.bbox_height)
    
    ctx.fillStyle = isSelected ? '#f56c6c' : '#409eff'
    ctx.font = '12px sans-serif'
    ctx.fillText(ann.label, ann.bbox_x, ann.bbox_y - 5)
  })
  
  if (tempRect.value) {
    ctx.strokeStyle = '#67c23a'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(
      tempRect.value.x,
      tempRect.value.y,
      tempRect.value.width,
      tempRect.value.height
    )
    ctx.setLineDash([])
  }
}

const handleMouseDown = (e) => {
  if (currentTool.value !== 'rect') return
  
  isDrawing.value = true
  const rect = canvasRef.value.getBoundingClientRect()
  startPos.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

const handleMouseMove = (e) => {
  if (!isDrawing.value) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  const currentX = e.clientX - rect.left
  const currentY = e.clientY - rect.top
  
  tempRect.value = {
    x: Math.min(startPos.value.x, currentX),
    y: Math.min(startPos.value.y, currentY),
    width: Math.abs(currentX - startPos.value.x),
    height: Math.abs(currentY - startPos.value.y)
  }
  
  redrawCanvas()
}

const handleMouseUp = (e) => {
  if (!isDrawing.value || !tempRect.value) {
    isDrawing.value = false
    return
  }
  
  isDrawing.value = false
  
  if (tempRect.value.width > 10 && tempRect.value.height > 10) {
    annotations.value.push({
      image_id: selectedImage.value.id,
      label: '建筑物',
      bbox_x: tempRect.value.x,
      bbox_y: tempRect.value.y,
      bbox_width: tempRect.value.width,
      bbox_height: tempRect.value.height,
      annotation_type: 'manual',
      confidence: 1.0,
      annotated_by: 'user'
    })
  }
  
  tempRect.value = null
  redrawCanvas()
}

const selectAnnotation = (index) => {
  editingAnnotation.value = editingAnnotation.value === index ? null : index
  redrawCanvas()
}

const deleteAnnotation = (index) => {
  annotations.value.splice(index, 1)
  editingAnnotation.value = null
  redrawCanvas()
}

const saveAnnotations = async () => {
  if (!selectedImage.value) {
    ElMessage.warning('请先选择影像')
    return
  }
  
  try {
    const existingRes = await annotationApi.getAnnotations({ image_id: selectedImage.value.id })
    for (const ann of existingRes.data) {
      await annotationApi.deleteAnnotation(ann.id)
    }
    
    for (const ann of annotations.value) {
      await annotationApi.createAnnotation(ann)
    }
    
    ElMessage.success('标注保存成功')
  } catch (e) {
    console.error('Failed to save annotations:', e)
    ElMessage.error('保存失败')
  }
}

const getLabelType = (label) => {
  const typeMap = {
    '建筑物': 'primary',
    '道路': 'warning',
    '植被': 'success',
    '水域': 'info',
    '农田': ''
  }
  return typeMap[label] || ''
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
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.image-list-info {
  flex: 1;
  min-width: 0;
}

.image-list-title {
  font-size: 13px;
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

.canvas-wrapper {
  display: flex;
  justify-content: center;
  min-height: 400px;
}

.annotation-canvas-container {
  position: relative;
  display: inline-block;
}

.annotation-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.annotation-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  cursor: pointer;
}

.annotation-item:hover {
  border-color: #409eff;
}

.annotation-item.active {
  border-color: #f56c6c;
  background: #fef0f0;
}

.annotation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.confidence {
  font-size: 12px;
  color: #67c23a;
}

.annotation-info {
  font-size: 12px;
  color: #909399;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.annotation-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  align-items: center;
}
</style>
