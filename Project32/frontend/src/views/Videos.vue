<template>
  <div class="videos-page">
    <div class="page-header">
      <h2 class="page-title">视频上传与分析</h2>
    </div>

    <el-card class="upload-card">
      <template #header>
        <span class="card-header">上传视频</span>
      </template>
      <el-form :inline="true" label-width="80px">
        <el-form-item label="选择宠物">
          <el-select v-model="selectedPet" placeholder="请选择宠物" style="width: 200px">
            <el-option
              v-for="pet in pets"
              :key="pet.id"
              :label="pet.name"
              :value="pet.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <el-upload
        class="upload-demo"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        :file-list="fileList"
        accept="video/*"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将视频文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 MP4、AVI、MOV 等常见视频格式
          </div>
        </template>
      </el-upload>
      <el-button
        type="primary"
        :loading="uploading"
        @click="uploadVideo"
        style="margin-top: 20px"
      >
        {{ uploading ? '上传中...' : '上传视频' }}
      </el-button>
    </el-card>

    <el-card class="content-card" style="margin-top: 20px">
      <template #header>
        <span class="card-header">视频列表</span>
      </template>
      <el-table :data="videos" stripe style="width: 100%">
        <el-table-column prop="file_name" label="文件名" />
        <el-table-column prop="pet_name" label="宠物" width="120" />
        <el-table-column prop="file_size" label="文件大小" width="120">
          <template #default="{ row }">{{ formatSize(row.file_size) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="upload_time" label="上传时间" width="180">
          <template #default="{ row }">{{ formatDate(row.upload_time) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="playVideo(row)">播放</el-button>
            <el-button
              size="small"
              type="primary"
              :disabled="row.status === 'analyzing' || row.status === 'completed'"
              @click="analyzeVideo(row)"
            >
              {{ row.status === 'analyzing' ? '分析中...' : '开始分析' }}
            </el-button>
            <el-button size="small" type="danger" @click="deleteVideo(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="videoDialogVisible" title="视频播放" width="800px">
      <video v-if="currentVideoUrl" :src="currentVideoUrl" controls style="width: 100%" />
      <span v-else>加载中...</span>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { petsApi, videosApi } from '@/api'
import { ElMessage } from 'element-plus'

const pets = ref([])
const videos = ref([])
const selectedPet = ref('')
const fileList = ref([])
const uploading = ref(false)
const videoDialogVisible = ref(false)
const currentVideoUrl = ref('')

const loadPets = async () => {
  try {
    const res = await petsApi.list()
    pets.value = res.data.results || res.data
  } catch (e) {
    ElMessage.error('加载宠物列表失败')
  }
}

const loadVideos = async () => {
  try {
    const res = await videosApi.list()
    videos.value = res.data.results || res.data
  } catch (e) {
    ElMessage.error('加载视频列表失败')
  }
}

const handleFileChange = (file) => {
  fileList.value = [file]
}

const uploadVideo = async () => {
  if (!selectedPet.value) {
    ElMessage.warning('请先选择宠物')
    return
  }
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择视频文件')
    return
  }
  
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', fileList.value[0].raw)
    formData.append('pet_id', selectedPet.value)
    
    await videosApi.upload(formData)
    ElMessage.success('上传成功')
    fileList.value = []
    loadVideos()
  } catch (e) {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

const playVideo = async (row) => {
  try {
    const res = await videosApi.getUrl(row.id)
    currentVideoUrl.value = res.data.url
    videoDialogVisible.value = true
  } catch (e) {
    ElMessage.error('获取视频地址失败')
  }
}

const analyzeVideo = async (row) => {
  try {
    row.status = 'analyzing'
    await videosApi.analyze(row.id)
    ElMessage.success('分析完成')
    loadVideos()
  } catch (e) {
    row.status = 'failed'
    ElMessage.error('分析失败')
  }
}

const deleteVideo = async (row) => {
  try {
    await videosApi.delete(row.id)
    ElMessage.success('删除成功')
    loadVideos()
  } catch (e) {
    ElMessage.error('删除失败')
  }
}

const getStatusType = (status) => {
  const map = {
    pending: 'info',
    uploaded: 'warning',
    analyzing: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    pending: '待处理',
    uploaded: '已上传',
    analyzing: '分析中',
    completed: '已完成',
    failed: '失败'
  }
  return map[status] || status
}

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + 'KB'
  return (bytes / 1024 / 1024).toFixed(2) + 'MB'
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadPets()
  loadVideos()
})
</script>

<style scoped>
.videos-page {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  color: #303133;
  margin: 0;
}

.upload-card, .content-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.upload-demo {
  margin-top: 20px;
}
</style>
