<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { sessionAPI, userAPI } from '@/api'
import type { TrainingSession, User } from '@/api'
import dayjs from 'dayjs'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const sessions = ref<TrainingSession[]>([])
const patients = ref<User[]>([])
const selectedPatient = ref(0)
const statusFilter = ref('')

const canSelectPatient = computed(() => 
  authStore.userRole === 'admin' || authStore.userRole === 'doctor'
)

const filteredSessions = computed(() => {
  let result = sessions.value
  if (statusFilter.value) {
    result = result.filter(s => s.status === statusFilter.value)
  }
  return result
})

const loadData = async () => {
  loading.value = true
  try {
    const userId = canSelectPatient.value && selectedPatient.value > 0 
      ? selectedPatient.value 
      : undefined
    sessions.value = await sessionAPI.list(userId, 100)
  } catch (e) {
    console.error('Failed to load sessions:', e)
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

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    '上肢训练': '#409eff',
    '下肢训练': '#67c23a',
    '面部训练': '#e6a23c',
    '认知训练': '#f56c6c',
    '基础训练': '#909399'
  }
  return colorMap[type] || '#909399'
}

const viewEEG = (sessionId: number) => {
  router.push(`/eeg-monitor/${sessionId}`)
}

const viewSession = (sessionId: number, status: string) => {
  if (status === 'active') {
    router.push(`/training/session/${sessionId}`)
  } else {
    viewEEG(sessionId)
  }
}

onMounted(async () => {
  await loadPatients()
  await loadData()
})
</script>

<template>
  <div v-loading="loading" class="history-container">
    <el-card class="card-shadow filter-card">
      <el-row :gutter="20" align="middle">
        <el-col :xs="24" :sm="8" v-if="canSelectPatient">
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
        <el-col :xs="24" :sm="8">
          <el-select v-model="statusFilter" style="width: 100%" placeholder="状态筛选" clearable>
            <el-option value="active" label="进行中" />
            <el-option value="completed" label="已完成" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="canSelectPatient ? 8 : 16">
          <h2 class="page-title">
            <el-icon color="#409eff"><Clock /></el-icon>
            历史训练记录
          </h2>
        </el-col>
      </el-row>
    </el-card>
    
    <el-card class="card-shadow">
      <el-table :data="filteredSessions" style="width: 100%" stripe>
        <el-table-column label="序号" width="70" align="center">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="user_name" label="患者" width="100" v-if="canSelectPatient" />
        <el-table-column label="训练类型" width="110">
          <template #default="{ row }">
            <el-tag 
              size="small" 
              :color="getTypeColor(row.type)"
              effect="dark"
              style="color: white"
            >
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="command" label="训练指令" width="130">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.command }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="start_time" label="开始时间" width="170">
          <template #default="{ row }">
            {{ dayjs(row.start_time).format('YYYY-MM-DD HH:mm') }}
          </template>
        </el-table-column>
        <el-table-column prop="end_time" label="结束时间" width="170">
          <template #default="{ row }">
            {{ row.end_time ? dayjs(row.end_time).format('YYYY-MM-DD HH:mm') : '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" width="100" align="center">
          <template #default="{ row }">
            {{ formatDuration(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column prop="avg_accuracy" label="准确率" width="120">
          <template #default="{ row }">
            <span v-if="row.avg_accuracy">
              <span :class="['quality-indicator', getQualityClass(row.avg_accuracy)]"></span>
              {{ row.avg_accuracy.toFixed(1) }}%
            </span>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="success_rate" label="成功率" width="110" align="center">
          <template #default="{ row }">
            <el-progress 
              v-if="row.success_rate"
              :percentage="row.success_rate" 
              :stroke-width="10"
              style="width: 80px;"
            />
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status).type" size="small">
              {{ getStatusTag(row.status).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="viewSession(row.id, row.status)"
            >
              {{ row.status === 'active' ? '继续' : '查看' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="filteredSessions.length === 0" description="暂无训练记录" />
    </el-card>
  </div>
</template>

<style scoped>
.history-container {
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
</style>
