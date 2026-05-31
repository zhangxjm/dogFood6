<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { progressAPI, userAPI } from '@/api'
import type { ProgressSummary, User } from '@/api'

const authStore = useAuthStore()
const loading = ref(false)
const progress = ref<ProgressSummary | null>(null)
const patients = ref<User[]>([])
const selectedPatient = ref(0)

const canSelectPatient = computed(() => 
  authStore.userRole === 'admin' || authStore.userRole === 'doctor'
)

const progressCards = computed(() => [
  {
    label: '总训练次数',
    value: progress.value?.total_sessions || 0,
    icon: 'VideoPlay',
    bgClass: 'gradient-bg',
    suffix: '次'
  },
  {
    label: '总训练时长',
    value: Math.round((progress.value?.total_duration || 0) / 60),
    icon: 'Timer',
    bgClass: 'success-bg',
    suffix: '分钟'
  },
  {
    label: '平均成功率',
    value: progress.value?.avg_success_rate || 0,
    icon: 'Aim',
    bgClass: 'warning-bg',
    suffix: '%'
  },
  {
    label: '平均准确率',
    value: progress.value?.avg_accuracy || 0,
    icon: 'TrendCharts',
    bgClass: 'info-bg',
    suffix: '%'
  }
])

const loadData = async () => {
  loading.value = true
  try {
    const userId = canSelectPatient.value && selectedPatient.value > 0 
      ? selectedPatient.value 
      : undefined
    progress.value = await progressAPI.getProgress(userId)
  } catch (e) {
    console.error('Failed to load progress:', e)
  } finally {
    loading.value = false
  }
}

const loadPatients = async () => {
  if (canSelectPatient.value) {
    try {
      patients.value = await userAPI.getPatients()
      if (patients.value.length > 0) {
        selectedPatient.value = patients.value[0].id
      }
    } catch (e) {
      console.error('Failed to load patients:', e)
    }
  }
}

const getProgressLevel = (value: number) => {
  if (value >= 80) return { level: '优秀', color: '#67c23a' }
  if (value >= 60) return { level: '良好', color: '#409eff' }
  if (value >= 40) return { level: '一般', color: '#e6a23c' }
  return { level: '需加强', color: '#f56c6c' }
}

onMounted(async () => {
  await loadPatients()
  await loadData()
})
</script>

<template>
  <div v-loading="loading" class="progress-container">
    <el-card class="card-shadow filter-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="12" v-if="canSelectPatient">
          <el-select 
            v-model="selectedPatient" 
            style="width: 100%" 
            @change="loadData"
            placeholder="选择患者"
          >
            <el-option
              v-for="p in patients"
              :key="p.id"
              :value="p.id"
              :label="`${p.name} (${p.age}岁)`"
            />
          </el-select>
        </el-col>
        <el-col :span="canSelectPatient ? 12 : 24">
          <h2 class="page-title">
            <el-icon color="#409eff"><TrendCharts /></el-icon>
            训练进度总览
          </h2>
        </el-col>
      </el-row>
    </el-card>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6" v-for="card in progressCards" :key="card.label">
        <div class="stat-card" :class="card.bgClass">
          <div class="value">{{ card.value }}<span class="suffix">{{ card.suffix }}</span></div>
          <div class="label">{{ card.label }}</div>
          <el-icon class="icon"><component :is="card.icon" /></el-icon>
        </div>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">
              <el-icon color="#409eff"><Calendar /></el-icon>
              训练频率
            </span>
          </template>
          <div class="frequency-section">
            <div class="frequency-item">
              <div class="frequency-icon weekly">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="frequency-info">
                <div class="frequency-value">{{ progress?.weekly_sessions || 0 }} 次</div>
                <div class="frequency-label">本周训练</div>
              </div>
            </div>
            <div class="frequency-item">
              <div class="frequency-icon streak">
                <el-icon><Trophy /></el-icon>
              </div>
              <div class="frequency-info">
                <div class="frequency-value">{{ progress?.streak_days || 0 }} 天</div>
                <div class="frequency-label">连续训练</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="12">
        <el-card class="card-shadow">
          <template #header>
            <span class="card-title">
              <el-icon color="#67c23a"><Aim /></el-icon>
              康复效果
            </span>
          </template>
          <div class="progress-section">
            <div class="progress-item">
              <div class="progress-header">
                <span>平均准确率</span>
                <span :style="{ color: getProgressLevel(progress?.avg_accuracy || 0).color }">
                  {{ progress?.avg_accuracy?.toFixed(1) || 0 }}%
                </span>
              </div>
              <el-progress 
                :percentage="progress?.avg_accuracy || 0" 
                :color="getProgressLevel(progress?.avg_accuracy || 0).color"
                :stroke-width="12"
              />
            </div>
            <div class="progress-item">
              <div class="progress-header">
                <span>平均成功率</span>
                <span :style="{ color: getProgressLevel(progress?.avg_success_rate || 0).color }">
                  {{ progress?.avg_success_rate?.toFixed(1) || 0 }}%
                </span>
              </div>
              <el-progress 
                :percentage="progress?.avg_success_rate || 0" 
                :color="getProgressLevel(progress?.avg_success_rate || 0).color"
                :stroke-width="12"
              />
            </div>
            <div class="progress-item">
              <div class="progress-header">
                <span>提升率</span>
                <span :class="(progress?.improvement_rate || 0) >= 0 ? 'positive' : 'negative'">
                  {{ (progress?.improvement_rate || 0) >= 0 ? '+' : '' }}{{ progress?.improvement_rate?.toFixed(1) || 0 }}%
                </span>
              </div>
              <el-progress 
                :percentage="Math.min(Math.max(progress?.improvement_rate || 0, 0), 100)" 
                color="#13ce66"
                :stroke-width="12"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="card-shadow tips-card" style="margin-top: 20px;">
      <template #header>
        <span class="card-title">
          <el-icon color="#e6a23c"><Lightbulb /></el-icon>
          训练建议
        </span>
      </template>
      <div class="tips-grid">
        <div class="tip-card" v-if="(progress?.weekly_sessions || 0) < 5">
          <el-icon color="#f56c6c"><WarningFilled /></el-icon>
          <div>
            <h4>训练频率不足</h4>
            <p>建议每周训练5次以上，效果更佳</p>
          </div>
        </div>
        <div class="tip-card" v-else>
          <el-icon color="#67c23a"><CircleCheckFilled /></el-icon>
          <div>
            <h4>训练频率达标</h4>
            <p>继续保持良好的训练习惯</p>
          </div>
        </div>
        <div class="tip-card" v-if="(progress?.avg_accuracy || 0) < 60">
          <el-icon color="#e6a23c"><InfoFilled /></el-icon>
          <div>
            <h4>需要更多练习</h4>
            <p>建议从简单的指令开始，逐步提升难度</p>
          </div>
        </div>
        <div class="tip-card" v-else>
          <el-icon color="#409eff"><StarFilled /></el-icon>
          <div>
            <h4>表现良好</h4>
            <p>可以尝试更高难度的训练指令</p>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.progress-container {
  padding: 0;
}

.filter-card {
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

.stats-row {
  margin-bottom: 20px;
}

.suffix {
  font-size: 14px;
  margin-left: 4px;
  opacity: 0.8;
}

.card-title {
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.frequency-section {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
}

.frequency-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.frequency-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.frequency-icon.weekly {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.frequency-icon.streak {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.frequency-value {
  font-size: 28px;
  font-weight: bold;
  color: #1e293b;
}

.frequency-label {
  font-size: 14px;
  color: #64748b;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 10px 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #475569;
}

.positive {
  color: #67c23a;
  font-weight: 600;
}

.negative {
  color: #f56c6c;
  font-weight: 600;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.tip-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.tip-card h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #1e293b;
}

.tip-card p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.tip-card .el-icon {
  font-size: 24px;
  flex-shrink: 0;
}
</style>
