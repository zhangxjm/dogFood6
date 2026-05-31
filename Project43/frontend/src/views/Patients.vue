<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userAPI, sessionAPI, progressAPI } from '@/api'
import type { User, ProgressSummary, TrainingSession } from '@/api'
import dayjs from 'dayjs'

const loading = ref(false)
const patients = ref<User[]>([])
const selectedPatient = ref<User | null>(null)
const progress = ref<ProgressSummary | null>(null)
const recentSessions = ref<TrainingSession[]>([])
const detailVisible = ref(false)

const loadPatients = async () => {
  loading.value = true
  try {
    patients.value = await userAPI.getPatients()
  } catch (e) {
    console.error('Failed to load patients:', e)
    ElMessage.error('加载患者列表失败')
  } finally {
    loading.value = false
  }
}

const viewDetail = async (patient: User) => {
  selectedPatient.value = patient
  detailVisible.value = true
  
  try {
    const [prog, sessions] = await Promise.all([
      progressAPI.getProgress(patient.id),
      sessionAPI.list(patient.id, 10)
    ])
    progress.value = prog
    recentSessions.value = sessions
  } catch (e) {
    console.error('Failed to load patient detail:', e)
  }
}

const getGenderText = (gender: string) => {
  return gender === 'male' ? '男' : gender === 'female' ? '女' : '未知'
}

const getProgressLevel = (value: number) => {
  if (value >= 80) return { level: '优秀', color: '#67c23a' }
  if (value >= 60) return { level: '良好', color: '#409eff' }
  if (value >= 40) return { level: '一般', color: '#e6a23c' }
  return { level: '需加强', color: '#f56c6c' }
}

const getStatusTag = (status: string) => {
  const statusMap: Record<string, { type: string; text: string }> = {
    active: { type: 'success', text: '进行中' },
    completed: { type: 'info', text: '已完成' },
    cancelled: { type: 'info', text: '已取消' }
  }
  return statusMap[status] || { type: 'info', text: status }
}

const formatDuration = (seconds: number) => {
  if (!seconds) return '--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`
}

onMounted(() => {
  loadPatients()
})
</script>

<template>
  <div v-loading="loading" class="patients-container">
    <el-card class="card-shadow header-card">
      <el-row align="middle">
        <el-col :span="12">
          <h2 class="page-title">
            <el-icon color="#409eff"><User /></el-icon>
            患者管理
          </h2>
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-tag type="info">共 {{ patients.length }} 位患者</el-tag>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" v-for="patient in patients" :key="patient.id">
        <el-card class="card-shadow patient-card" shadow="hover">
          <div class="patient-header">
            <div class="patient-avatar">
              {{ patient.name.charAt(0) }}
            </div>
            <div class="patient-info">
              <h3 class="patient-name">{{ patient.name }}</h3>
              <p class="patient-meta">
                {{ getGenderText(patient.gender) }} · {{ patient.age }}岁
              </p>
            </div>
          </div>
          
          <div class="patient-diagnosis" v-if="patient.diagnosis">
            <el-icon color="#f56c6c"><Warning /></el-icon>
            <span>{{ patient.diagnosis }}</span>
          </div>
          
          <el-divider style="margin: 12px 0" />
          
          <div class="patient-stats">
            <div class="stat-item">
              <span class="stat-label">注册时间</span>
              <span class="stat-value">{{ dayjs(patient.created_at).format('YYYY-MM-DD') }}</span>
            </div>
          </div>
          
          <el-button 
            type="primary" 
            style="width: 100%; margin-top: 12px"
            @click="viewDetail(patient)"
          >
            查看详情
          </el-button>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="patients.length === 0" description="暂无患者数据" />

    <el-dialog 
      v-model="detailVisible" 
      :title="`${selectedPatient?.name} - 详细信息`"
      width="900px"
      destroy-on-close
    >
      <div v-if="selectedPatient" class="patient-detail">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="card-shadow">
              <div class="detail-avatar">
                {{ selectedPatient.name.charAt(0) }}
              </div>
              <h3 class="detail-name" style="text-align: center; margin-top: 12px">
                {{ selectedPatient.name }}
              </h3>
              <p style="text-align: center; color: #909399; margin-bottom: 16px">
                {{ getGenderText(selectedPatient.gender) }} · {{ selectedPatient.age }}岁
              </p>
              
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="用户名">
                  {{ selectedPatient.username }}
                </el-descriptions-item>
                <el-descriptions-item label="诊断">
                  {{ selectedPatient.diagnosis || '未填写' }}
                </el-descriptions-item>
                <el-descriptions-item label="注册时间">
                  {{ dayjs(selectedPatient.created_at).format('YYYY-MM-DD HH:mm') }}
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>
          
          <el-col :span="16">
            <el-card class="card-shadow" v-if="progress">
              <h4 class="section-title">训练统计</h4>
              <el-row :gutter="12">
                <el-col :span="6">
                  <div class="mini-stat gradient-bg">
                    <div class="mini-stat-value">{{ progress.total_sessions }}</div>
                    <div class="mini-stat-label">总训练次数</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="mini-stat success-bg">
                    <div class="mini-stat-value">{{ Math.round(progress.total_duration / 60) }}</div>
                    <div class="mini-stat-label">总时长(分钟)</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="mini-stat warning-bg">
                    <div class="mini-stat-value">{{ progress.avg_accuracy.toFixed(1) }}%</div>
                    <div class="mini-stat-label">平均准确率</div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="mini-stat info-bg">
                    <div class="mini-stat-value">{{ progress.streak_days }}</div>
                    <div class="mini-stat-label">连续训练天数</div>
                  </div>
                </el-col>
              </el-row>
              
              <el-divider />
              
              <div class="progress-section">
                <div class="progress-header">
                  <span>康复进度</span>
                  <el-tag :color="getProgressLevel(progress.avg_accuracy).color" effect="dark" size="small">
                    {{ getProgressLevel(progress.avg_accuracy).level }}
                  </el-tag>
                </div>
                <el-progress 
                  :percentage="Math.round(progress.avg_accuracy)" 
                  :stroke-width="16"
                  :color="getProgressLevel(progress.avg_accuracy).color"
                />
              </div>
              
              <div class="progress-section" style="margin-top: 16px">
                <div class="progress-header">
                  <span>本周训练</span>
                  <el-tag type="primary" size="small">{{ progress.weekly_sessions }} 次</el-tag>
                </div>
                <div class="week-indicator">
                  <div 
                    v-for="i in 7" 
                    :key="i" 
                    :class="['week-day', i <= progress.weekly_sessions ? 'active' : '']"
                  >
                    {{ ['一','二','三','四','五','六','日'][i-1] }}
                  </div>
                </div>
              </div>
            </el-card>
            
            <el-card class="card-shadow" style="margin-top: 20px">
              <h4 class="section-title">最近训练记录</h4>
              <el-table :data="recentSessions" size="small" style="width: 100%">
                <el-table-column label="训练类型" width="100">
                  <template #default="{ row }">
                    <el-tag size="small" type="info">{{ row.type }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="command" label="指令" width="100" />
                <el-table-column label="时间" width="150">
                  <template #default="{ row }">
                    {{ dayjs(row.start_time).format('MM-DD HH:mm') }}
                  </template>
                </el-table-column>
                <el-table-column label="时长" width="80" align="center">
                  <template #default="{ row }">
                    {{ formatDuration(row.duration) }}
                  </template>
                </el-table-column>
                <el-table-column label="准确率" width="100" align="center">
                  <template #default="{ row }">
                    {{ row.avg_accuracy ? row.avg_accuracy.toFixed(1) + '%' : '--' }}
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="80" align="center">
                  <template #default="{ row }">
                    <el-tag :type="getStatusTag(row.status).type" size="small">
                      {{ getStatusTag(row.status).text }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="recentSessions.length === 0" description="暂无训练记录" :image-size="80" />
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.patients-container {
  padding: 0;
}

.header-card {
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.patient-card {
  margin-bottom: 20px;
}

.patient-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.patient-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
}

.patient-info {
  flex: 1;
}

.patient-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.patient-meta {
  margin: 4px 0 0;
  color: #909399;
  font-size: 13px;
}

.patient-diagnosis {
  margin-top: 12px;
  padding: 8px 12px;
  background: #fef0f0;
  border-radius: 6px;
  font-size: 13px;
  color: #f56c6c;
  display: flex;
  align-items: center;
  gap: 6px;
}

.patient-stats {
  font-size: 13px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.stat-label {
  color: #909399;
}

.stat-value {
  color: #303133;
  font-weight: 500;
}

.detail-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  margin: 0 auto;
}

.detail-name {
  font-size: 20px;
  margin: 0;
}

.section-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.mini-stat {
  padding: 16px;
  border-radius: 8px;
  color: white;
  text-align: center;
}

.mini-stat-value {
  font-size: 24px;
  font-weight: 700;
}

.mini-stat-label {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
}

.progress-section {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
}

.week-indicator {
  display: flex;
  gap: 8px;
}

.week-day {
  flex: 1;
  padding: 8px;
  text-align: center;
  background: #e4e7ed;
  border-radius: 6px;
  font-size: 12px;
  color: #909399;
}

.week-day.active {
  background: #409eff;
  color: white;
}
</style>
