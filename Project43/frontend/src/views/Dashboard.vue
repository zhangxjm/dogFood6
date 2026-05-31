<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { progressAPI, sessionAPI } from '@/api'
import type { DashboardStats, TrainingSession } from '@/api'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const stats = ref<DashboardStats | null>(null)
const recentSessions = ref<TrainingSession[]>([])

const statCards = computed(() => [
  {
    label: '总训练次数',
    value: stats.value?.total_sessions || 0,
    icon: 'VideoPlay',
    bgClass: 'gradient-bg',
    suffix: '次'
  },
  {
    label: '平均准确率',
    value: stats.value?.avg_accuracy || 0,
    icon: 'Aim',
    bgClass: 'success-bg',
    suffix: '%'
  },
  {
    label: '正在训练',
    value: stats.value?.active_sessions || 0,
    icon: 'Cpu',
    bgClass: 'warning-bg',
    suffix: '人'
  },
  {
    label: '系统用户',
    value: stats.value?.total_patients || 0,
    icon: 'User',
    bgClass: 'info-bg',
    suffix: '人'
  }
])

const loadData = async () => {
  loading.value = true
  try {
    stats.value = await progressAPI.getDashboard()
    recentSessions.value = stats.value.recent_sessions || []
  } catch (e) {
    console.error('Failed to load dashboard:', e)
  } finally {
    loading.value = false
  }
}

const formatDuration = (seconds: number) => {
  if (!seconds) return '--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`
}

const getStatusTag = (status: string) => {
  const statusMap: Record<string, { type: string; text: string }> = {
    active: { type: 'success', text: '进行中' },
    completed: { type: 'info', text: '已完成' },
    cancelled: { type: 'info', text: '已取消' }
  }
  return statusMap[status] || { type: 'info', text: status }
}

const getQualityClass = (quality: number) => {
  if (quality >= 80) return 'quality-excellent'
  if (quality >= 60) return 'quality-good'
  if (quality >= 40) return 'quality-medium'
  return 'quality-poor'
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div v-loading="loading" class="dashboard-container">
    <div class="welcome-section">
      <div>
        <h2 class="welcome-title">
          欢迎回来，{{ authStore.userName }}
          <span class="welcome-date">{{ dayjs().format('YYYY年MM月DD日 dddd') }}</span>
        </h2>
        <p class="welcome-desc">让我们开始今天的康复训练吧</p>
      </div>
      <el-button type="primary" size="large" @click="router.push('/training')">
        <el-icon><VideoPlay /></el-icon>
        开始训练
      </el-button>
    </div>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6" v-for="card in statCards" :key="card.label">
        <div class="stat-card" :class="card.bgClass">
          <div class="value">{{ card.value }}<span class="suffix">{{ card.suffix }}</span></div>
          <div class="label">{{ card.label }}</div>
          <el-icon class="icon"><component :is="card.icon" /></el-icon>
        </div>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="16">
        <el-card class="card-shadow recent-sessions">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近训练记录</span>
              <el-button text type="primary" @click="router.push('/history')">查看全部</el-button>
            </div>
          </template>
          
          <el-table :data="recentSessions" style="width: 100%" stripe>
            <el-table-column prop="user_name" label="患者" width="100" />
            <el-table-column prop="type" label="训练类型" width="100" />
            <el-table-column prop="command" label="训练指令" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ row.command }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="start_time" label="开始时间" width="160">
              <template #default="{ row }">
                {{ dayjs(row.start_time).format('MM-DD HH:mm') }}
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="时长" width="100">
              <template #default="{ row }">
                {{ formatDuration(row.duration) }}
              </template>
            </el-table-column>
            <el-table-column prop="avg_accuracy" label="准确率" width="110">
              <template #default="{ row }">
                <span v-if="row.avg_accuracy">
                  <span :class="['quality-indicator', getQualityClass(row.avg_accuracy)]"></span>
                  {{ row.avg_accuracy.toFixed(1) }}%
                </span>
                <span v-else>--</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="getStatusTag(row.status).type" size="small">
                  {{ getStatusTag(row.status).text }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'completed'"
                  link
                  type="primary"
                  size="small"
                  @click="router.push(`/eeg-monitor/${row.id}`)"
                >
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <el-empty v-if="recentSessions.length === 0" description="暂无训练记录" />
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="8">
        <el-card class="card-shadow quick-actions">
          <template #header>
            <span class="card-title">快捷操作</span>
          </template>
          
          <div class="action-grid">
            <div class="action-item" @click="router.push('/training')">
              <div class="action-icon start"><el-icon><VideoPlay /></el-icon></div>
              <span>开始训练</span>
            </div>
            <div class="action-item" @click="router.push('/progress')">
              <div class="action-icon progress"><el-icon><TrendCharts /></el-icon></div>
              <span>查看进度</span>
            </div>
            <div class="action-item" @click="router.push('/analytics')">
              <div class="action-icon analytics"><el-icon><DataAnalysis /></el-icon></div>
              <span>数据分析</span>
            </div>
            <div class="action-item" @click="router.push('/history')">
              <div class="action-icon history"><el-icon><Clock /></el-icon></div>
              <span>历史记录</span>
            </div>
          </div>
        </el-card>
        
        <el-card class="card-shadow tips-card" style="margin-top: 20px">
          <template #header>
            <span class="card-title">训练提示</span>
          </template>
          <div class="tips-content">
            <div class="tip-item">
              <el-icon color="#409eff"><InfoFilled /></el-icon>
              <span>训练前请保持放松状态，环境安静</span>
            </div>
            <div class="tip-item">
              <el-icon color="#67c23a"><WarningFilled /></el-icon>
              <span>每次训练建议15-30分钟，循序渐进</span>
            </div>
            <div class="tip-item">
              <el-icon color="#e6a23c"><StarFilled /></el-icon>
              <span>坚持训练可有效提升康复效果</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 0;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 20px;
}

.welcome-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.welcome-date {
  font-size: 14px;
  font-weight: normal;
  opacity: 0.8;
}

.welcome-desc {
  margin: 0;
  opacity: 0.9;
}

.stats-row {
  margin-bottom: 20px;
}

.suffix {
  font-size: 14px;
  margin-left: 4px;
  opacity: 0.8;
}

.charts-row {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  font-size: 16px;
}

.quick-actions {
  height: auto;
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: #475569;
}

.action-item:hover {
  transform: translateY(-2px);
  background: #f1f5f9;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  margin-bottom: 8px;
}

.action-icon.start { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.action-icon.progress { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.action-icon.analytics { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.action-icon.history { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

.tips-card {
  height: auto;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}

.tip-item .el-icon {
  margin-top: 2px;
  flex-shrink: 0;
}
</style>
