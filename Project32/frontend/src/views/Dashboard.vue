<template>
  <div class="dashboard">
    <h2 class="page-title">数据概览</h2>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#409EFF"><OfficeBuilding /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total_pets || 0 }}</div>
              <div class="stat-label">宠物总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#67C23A"><VideoCamera /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total_videos || 0 }}</div>
              <div class="stat-label">视频总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#E6A23C"><TrendCharts /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completed_analyses || 0 }}</div>
              <div class="stat-label">已完成分析</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#F56C6C"><Warning /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.negative_behaviors_detected || 0 }}</div>
              <div class="stat-label">不良行为检测</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :span="14">
        <el-card class="content-card">
          <template #header>
            <span class="card-header">最近分析记录</span>
          </template>
          <el-table :data="recentAnalyses" stripe style="width: 100%">
            <el-table-column prop="behavior_name" label="行为类型" width="150" />
            <el-table-column prop="confidence" label="置信度" width="120">
              <template #default="{ row }">
                <el-progress :percentage="Math.round(row.confidence * 100)" :stroke-width="8" />
              </template>
            </el-table-column>
            <el-table-column label="是否不良" width="100">
              <template #default="{ row }">
                <el-tag :type="row.is_negative ? 'danger' : 'success'">
                  {{ row.is_negative ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="start_time" label="开始时间" width="100">
              <template #default="{ row }">{{ row.start_time }}s</template>
            </el-table-column>
            <el-table-column prop="end_time" label="结束时间" width="100">
              <template #default="{ row }">{{ row.end_time }}s</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="content-card">
          <template #header>
            <span class="card-header">系统状态</span>
          </template>
          <div class="system-status">
            <div class="status-item">
              <span class="status-label">激活训练方案</span>
              <el-tag type="primary" size="large">{{ stats.active_plans || 0 }}</el-tag>
            </div>
            <div class="status-item">
              <span class="status-label">MinIO存储</span>
              <el-tag type="success" size="large">运行中</el-tag>
            </div>
            <div class="status-item">
              <span class="status-label">AI模型</span>
              <el-tag type="success" size="large">就绪</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { dashboardApi } from '@/api'
import { ElMessage } from 'element-plus'

const stats = ref({})
const recentAnalyses = ref([])

const loadStats = async () => {
  try {
    const res = await dashboardApi.getStats()
    stats.value = res.data
    recentAnalyses.value = res.data.recent_analyses || []
  } catch (e) {
    ElMessage.error('加载数据失败')
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #303133;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 48px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.content-row {
  margin-top: 20px;
}

.content-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.system-status {
  padding: 10px 0;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-size: 14px;
  color: #606266;
}
</style>
