<template>
  <div class="evidence">
    <div class="page-header">
      <h2 class="page-title">证据管理</h2>
    </div>

    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-label">已收集证据</div>
          <div class="stat-value">{{ statistics.collected || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card verifying">
          <div class="stat-label">验证中</div>
          <div class="stat-value">{{ statistics.verifying || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card verified">
          <div class="stat-label">已验证</div>
          <div class="stat-value">{{ statistics.verified || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card notarized">
          <div class="stat-label">已公证</div>
          <div class="stat-value">{{ statistics.notarized || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card">
      <el-table :data="evidenceList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="productId" label="商品ID" width="100" />
        <el-table-column label="证据类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)" size="small">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fileName" label="文件名" min-width="200" />
        <el-table-column prop="fileSize" label="文件大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="fileHash" label="文件哈希" width="180" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="notaryId" label="公证编号" width="140" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="notarize(row.id)">公证</el-button>
            <el-button type="danger" link size="small" @click="deleteEvidence(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const evidenceList = ref([])
const loading = ref(false)
const statistics = ref({})

const fetchEvidence = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/evidence')
    evidenceList.value = res.data
  } catch (error) {
    ElMessage.error('获取证据列表失败')
  } finally {
    loading.value = false
  }
}

const fetchStatistics = async () => {
  try {
    const res = await axios.get('/api/evidence/statistics')
    statistics.value = res.data
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  }
}

const notarize = async (id) => {
  try {
    await ElMessageBox.confirm('确定要对该证据进行公证吗？', '提示', { type: 'info' })
    await axios.put(`/api/evidence/${id}/status?status=NOTARIZED`)
    ElMessage.success('公证成功')
    fetchEvidence()
    fetchStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('公证失败')
    }
  }
}

const deleteEvidence = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该证据吗？', '提示', { type: 'warning' })
    await axios.delete(`/api/evidence/${id}`)
    ElMessage.success('删除成功')
    fetchEvidence()
    fetchStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const getTypeText = (type) => {
  const texts = { SCREENSHOT: '页面截图', PAGE_SOURCE: '页面源码', TRANSACTION_RECORD: '交易记录', OTHER: '其他' }
  return texts[type] || type
}

const getTypeColor = (type) => {
  const colors = { SCREENSHOT: 'primary', PAGE_SOURCE: 'success', TRANSACTION_RECORD: 'warning', OTHER: 'info' }
  return colors[type] || 'info'
}

const getStatusType = (status) => {
  const types = { COLLECTED: 'info', VERIFYING: 'warning', VERIFIED: 'primary', NOTARIZED: 'success', REJECTED: 'danger' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { COLLECTED: '已收集', VERIFYING: '验证中', VERIFIED: '已验证', NOTARIZED: '已公证', REJECTED: '已驳回' }
  return texts[status] || status
}

const formatFileSize = (bytes) => {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

onMounted(() => {
  fetchEvidence()
  fetchStatistics()
})
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  border-left: 4px solid #409eff;
}

.stat-card.verifying {
  border-left-color: #e6a23c;
}

.stat-card.verified {
  border-left-color: #67c23a;
}

.stat-card.notarized {
  border-left-color: #f56c6c;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
}

.table-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
