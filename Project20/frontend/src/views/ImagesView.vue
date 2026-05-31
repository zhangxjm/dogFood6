<template>
  <div>
    <h2 class="page-title">影像管理</h2>
    
    <div class="page-card">
      <div class="toolbar flex-between">
        <div class="toolbar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索影像..."
            style="width: 300px;"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-select v-model="filterSource" placeholder="卫星来源" clearable style="width: 150px;">
            <el-option label="高分七号" value="高分七号" />
            <el-option label="高分六号" value="高分六号" />
            <el-option label="资源三号" value="资源三号" />
            <el-option label="高分五号" value="高分五号" />
            <el-option label="海洋一号" value="海洋一号" />
          </el-select>
        </div>
        <el-button type="primary" @click="showUploadDialog = true">
          <el-icon><Upload /></el-icon>
          上传影像
        </el-button>
      </div>

      <div class="image-grid">
        <div
          v-for="image in images" :key="image.id"
          class="image-card"
          @click="viewImageDetail(image)"
        >
          <img :src="imageApi.getThumbnail(image.id)" :alt="image.original_name" />
          <div class="image-info">
            <div class="image-info-title">{{ image.original_name }}</div>
            <div class="image-info-meta">{{ image.location || '未知位置' }}</div>
            <div class="image-info-meta">{{ image.satellite_source || '未知来源' }}</div>
          </div>
          <div class="image-actions">
            <el-button size="small" type="primary" link @click.stop="viewImageDetail(image)">
              <el-icon><View /></el-icon>
            </el-button>
            <el-button size="small" type="danger" link @click.stop="deleteImage(image)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <el-empty v-if="images.length === 0" description="暂无影像数据" />
    </div>

    <el-dialog v-model="showUploadDialog" title="上传影像" width="600px">
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="选择文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept="image/*"
            :on-change="handleFileChange"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持 jpg、png 等常见图片格式</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="卫星来源">
          <el-input v-model="uploadForm.satellite_source" placeholder="如：高分七号" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="uploadForm.location" placeholder="如：北京市朝阳区" />
        </el-form-item>
        <el-form-item label="纬度">
          <el-input-number v-model="uploadForm.latitude" :precision="6" :min="-90" :max="90" />
        </el-form-item>
        <el-form-item label="经度">
          <el-input-number v-model="uploadForm.longitude" :precision="6" :min="-180" :max="180" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="uploadForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="uploadForm.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="uploadImage" :loading="uploading">上传</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetailDialog" title="影像详情" width="800px">
      <div v-if="selectedImage" class="image-detail">
        <el-row :gutter="20">
          <el-col :span="14">
            <img :src="imageApi.getImageFile(selectedImage.id)" style="width: 100%; border-radius: 8px;" />
          </el-col>
          <el-col :span="10">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="文件名">{{ selectedImage.original_name }}</el-descriptions-item>
              <el-descriptions-item label="卫星来源">{{ selectedImage.satellite_source || '-' }}</el-descriptions-item>
              <el-descriptions-item label="位置">{{ selectedImage.location || '-' }}</el-descriptions-item>
              <el-descriptions-item label="坐标">
                {{ selectedImage.latitude?.toFixed(6) }}, {{ selectedImage.longitude?.toFixed(6) }}
              </el-descriptions-item>
              <el-descriptions-item label="尺寸">{{ selectedImage.width }} x {{ selectedImage.height }}</el-descriptions-item>
              <el-descriptions-item label="大小">{{ formatFileSize(selectedImage.file_size) }}</el-descriptions-item>
              <el-descriptions-item label="标签">{{ selectedImage.tags || '-' }}</el-descriptions-item>
            </el-descriptions>
            <div class="detail-actions mt-20">
              <el-button type="primary" @click="goToAnnotation">
                <el-icon><Edit /></el-icon>
                去标注
              </el-button>
              <el-button type="success" @click="goToDetection">
                <el-icon><Search /></el-icon>
                去识别
              </el-button>
            </div>
          </el-col>
        </el-row>
        <el-divider />
        <div>
          <h4>描述</h4>
          <p>{{ selectedImage.description || '暂无描述' }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { imageApi } from '@/api'

const router = useRouter()

const images = ref([])
const searchKeyword = ref('')
const filterSource = ref('')
const showUploadDialog = ref(false)
const showDetailDialog = ref(false)
const selectedImage = ref(null)
const uploading = ref(false)
const uploadRef = ref(null)

const uploadForm = ref({
  satellite_source: '',
  location: '',
  latitude: 0,
  longitude: 0,
  description: '',
  tags: ''
})

const selectedFile = ref(null)

const loadImages = async () => {
  try {
    const params = {}
    if (filterSource.value) {
      params.satellite_source = filterSource.value
    }
    const res = await imageApi.getImages(params)
    images.value = res.data
  } catch (e) {
    console.error('Failed to load images:', e)
    ElMessage.error('加载影像列表失败')
  }
}

const handleSearch = async () => {
  if (searchKeyword.value) {
    try {
      const res = await imageApi.searchImages(searchKeyword.value)
      images.value = res.data
    } catch (e) {
      console.error('Search failed:', e)
      ElMessage.error('搜索失败')
    }
  } else {
    loadImages()
  }
}

const handleFileChange = (file) => {
  selectedFile.value = file.raw
}

const uploadImage = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择文件')
    return
  }
  
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('satellite_source', uploadForm.value.satellite_source)
    formData.append('location', uploadForm.value.location)
    formData.append('latitude', uploadForm.value.latitude)
    formData.append('longitude', uploadForm.value.longitude)
    formData.append('description', uploadForm.value.description)
    formData.append('tags', uploadForm.value.tags)
    
    await imageApi.uploadImage(formData)
    ElMessage.success('上传成功')
    showUploadDialog.value = false
    loadImages()
    
    uploadForm.value = {
      satellite_source: '',
      location: '',
      latitude: 0,
      longitude: 0,
      description: '',
      tags: ''
    }
    selectedFile.value = null
  } catch (e) {
    console.error('Upload failed:', e)
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

const viewImageDetail = (image) => {
  selectedImage.value = image
  showDetailDialog.value = true
}

const deleteImage = async (image) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除影像 "${image.original_name}" 吗？`,
      '确认删除',
      { type: 'warning' }
    )
    
    await imageApi.deleteImage(image.id)
    ElMessage.success('删除成功')
    loadImages()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('Delete failed:', e)
      ElMessage.error('删除失败')
    }
  }
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

const goToAnnotation = () => {
  showDetailDialog.value = false
  router.push('/annotation')
}

const goToDetection = () => {
  showDetailDialog.value = false
  router.push('/detection')
}

onMounted(() => {
  loadImages()
})
</script>

<style scoped>
.image-card {
  position: relative;
}

.image-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
}

.detail-actions {
  display: flex;
  gap: 12px;
}
</style>
