<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { commandAPI, sessionAPI, userAPI } from '@/api'
import type { TrainingCommand, User } from '@/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const commands = ref<TrainingCommand[]>([])
const patients = ref<User[]>([])

const trainingForm = reactive({
  user_id: 0,
  type: '上肢训练',
  command: '',
  patient_id: 0
})

const trainingTypes = [
  { value: '上肢训练', label: '上肢训练' },
  { value: '下肢训练', label: '下肢训练' },
  { value: '面部训练', label: '面部训练' },
  { value: '认知训练', label: '认知训练' },
  { value: '基础训练', label: '基础训练' }
]

const commandCategories = computed(() => {
  const categoryMap = new Map<string, TrainingCommand[]>()
  commands.value.forEach(cmd => {
    if (!categoryMap.has(cmd.category)) {
      categoryMap.set(cmd.category, [])
    }
    categoryMap.get(cmd.category)!.push(cmd)
  })
  return Array.from(categoryMap.entries()).map(([name, commands]) => ({
    name,
    commands
  }))
})

const selectedCommand = ref<TrainingCommand | null>(null)

const canSelectPatient = computed(() => 
  authStore.userRole === 'admin' || authStore.userRole === 'doctor'
)

const loadData = async () => {
  loading.value = true
  try {
    commands.value = await commandAPI.getCommands()
    if (canSelectPatient.value) {
      patients.value = await userAPI.getPatients()
      if (patients.value.length > 0) {
        trainingForm.patient_id = patients.value[0].id
      }
    }
  } catch (e) {
    console.error('Failed to load data:', e)
  } finally {
    loading.value = false
  }
}

const selectCommand = (cmd: TrainingCommand) => {
  selectedCommand.value = cmd
  trainingForm.command = cmd.code
  trainingForm.type = cmd.category
}

const startTraining = async () => {
  if (!trainingForm.command) {
    ElMessage.warning('请选择训练指令')
    return
  }

  try {
    await ElMessageBox.confirm(
      `即将开始「${selectedCommand.value?.name}」训练，是否继续？`,
      '开始训练',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    const params: any = {
      type: trainingForm.type,
      command: trainingForm.command
    }

    if (canSelectPatient.value && trainingForm.patient_id) {
      params.user_id = trainingForm.patient_id
    }

    const session = await sessionAPI.create(params)
    ElMessage.success('训练会话已创建')
    router.push(`/training/session/${session.id}`)
  } catch (e) {
    if (e !== 'cancel') {
      console.error('Failed to start training:', e)
    }
  }
}

const getDifficultyColor = (difficulty: number) => {
  if (difficulty <= 1) return '#67c23a'
  if (difficulty <= 2) return '#e6a23c'
  return '#f56c6c'
}

const getDifficultyText = (difficulty: number) => {
  if (difficulty <= 1) return '简单'
  if (difficulty <= 2) return '中等'
  return '困难'
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div v-loading="loading" class="training-container">
    <el-card class="card-shadow settings-card">
      <template #header>
        <span class="card-title">训练设置</span>
      </template>
      
      <el-form :model="trainingForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :xs="24" :md="8" v-if="canSelectPatient">
            <el-form-item label="选择患者">
              <el-select v-model="trainingForm.patient_id" style="width: 100%">
                <el-option
                  v-for="p in patients"
                  :key="p.id"
                  :value="p.id"
                  :label="`${p.name} (${p.age}岁)`"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :md="canSelectPatient ? 8 : 12">
            <el-form-item label="训练类型">
              <el-select v-model="trainingForm.type" style="width: 100%">
                <el-option
                  v-for="t in trainingTypes"
                  :key="t.value"
                  :value="t.value"
                  :label="t.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :xs="24" :md="canSelectPatient ? 8 : 12">
            <el-form-item label="当前选择">
              <div class="selected-display">
                <el-tag v-if="selectedCommand" size="large" type="success">
                  {{ selectedCommand.name }}
                </el-tag>
                <span v-else class="placeholder">请从下方选择训练指令</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <div class="start-section">
        <el-button
          type="primary"
          size="large"
          :disabled="!trainingForm.command || !selectedCommand"
          @click="startTraining"
        >
          <el-icon><VideoPlay /></el-icon>
          开始训练
        </el-button>
      </div>
    </el-card>
    
    <div class="command-categories">
      <div v-for="cat in commandCategories" :key="cat.name" class="category-section">
        <h3 class="category-title">{{ cat.name }}</h3>
        <el-row :gutter="16">
          <el-col :xs="12" :sm="8" :md="6" :lg="4" v-for="cmd in cat.commands" :key="cmd.id">
            <div
              class="command-card"
              :class="{ active: selectedCommand?.id === cmd.id }"
              @click="selectCommand(cmd)"
            >
              <div class="command-header">
                <span class="command-name">{{ cmd.name }}</span>
                <el-tag
                  size="small"
                  :color="getDifficultyColor(cmd.difficulty)"
                  effect="dark"
                  style="color: white"
                >
                  {{ getDifficultyText(cmd.difficulty) }}
                </el-tag>
              </div>
              <p class="command-desc">{{ cmd.description }}</p>
              <div class="command-code">
                <el-icon><Cpu /></el-icon>
                {{ cmd.code }}
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<style scoped>
.training-container {
  padding: 0;
}

.settings-card {
  margin-bottom: 24px;
}

.card-title {
  font-weight: 600;
  font-size: 16px;
}

.selected-display {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 15px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.placeholder {
  color: #94a3b8;
  font-size: 14px;
}

.start-section {
  text-align: center;
  padding: 20px 0 0 0;
  border-top: 1px solid #f1f5f9;
  margin-top: 10px;
}

.command-categories {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.category-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.category-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;
}

.command-card {
  background: #fafafa;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.command-card:hover {
  background: #f0f7ff;
  border-color: #93c5fd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.command-card.active {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.command-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.command-name {
  font-weight: 600;
  font-size: 15px;
  color: #1e293b;
}

.command-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 12px 0;
  line-height: 1.4;
  min-height: 36px;
}

.command-code {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
  padding-top: 8px;
  border-top: 1px dashed #e2e8f0;
}
</style>
