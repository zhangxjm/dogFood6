<template>
  <div class="analyses-page">
    <div class="page-header">
      <h2 class="page-title">行为分析记录</h2>
    </div>

    <el-card class="content-card">
      <el-table :data="analyses" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="behavior_name" label="行为类型" width="150">
          <template #default="{ row }">
            <el-tag :type="row.is_negative ? 'danger' : 'success'">
              {{ row.behavior_name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="video.file_name" label="视频文件" min-width="200" />
        <el-table-column prop="confidence" label="置信度" width="150">
          <template #default="{ row }">
            <el-progress 
              :percentage="Math.round(row.confidence * 100)" 
              :color="getConfidenceColor(row.confidence)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="start_time" label="开始时间" width="120">
          <template #default="{ row }">{{ row.start_time }}s</template>
        </el-table-column>
        <el-table-column prop="end_time" label="结束时间" width="120">
          <template #default="{ row }">{{ row.end_time }}s</template>
        </el-table-column>
        <el-table-column prop="frame_count" label="帧数" width="100" />
        <el-table-column prop="analyzed_at" label="分析时间" width="180">
          <template #default="{ row }">{{ formatDate(row.analyzed_at) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { analysesApi } from '@/api'
import { ElMessage } from 'element-plus'

const analyses = ref([])

const loadAnalyses = async () => {
  try {
    const res = await analysesApi.list()
    analyses.value = res.data.results || res.data
  } catch (e) {
    ElMessage.error('加载分析记录失败')
  }
}

const getConfidenceColor = (confidence) => {
  if (confidence >= 0.9) return '#67C23A'
  if (confidence >= 0.7) return '#E6A23C'
  return '#F56C6C'
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadAnalyses()
})
</script>

<style scoped>
.analyses-page {
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

.content-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
