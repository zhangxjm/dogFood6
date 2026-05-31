<template>
  <div class="training-page">
    <div class="page-header">
      <h2 class="page-title">训练方案推荐</h2>
      <el-button type="primary" @click="openRecommendDialog">
        <el-icon><MagicStick /></el-icon>
        生成推荐方案
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="8" v-for="plan in plans" :key="plan.id">
        <el-card class="plan-card" :body-style="{ padding: '0' }">
          <div class="plan-header" :class="plan.difficulty_level">
            <div class="plan-title">{{ plan.title }}</div>
            <el-tag size="small" :type="getDifficultyType(plan.difficulty_level)">
              {{ getDifficultyText(plan.difficulty_level) }}
            </el-tag>
          </div>
          <div class="plan-content">
            <div class="plan-meta">
              <span class="meta-item">
                <el-icon><User /></el-icon>
                {{ plan.pet_name }}
              </span>
              <span class="meta-item">
                <el-icon><Timer /></el-icon>
                {{ plan.duration_days }}天
              </span>
            </div>
            <p class="plan-desc">{{ plan.description }}</p>
            <div class="plan-steps">
              <div class="step-title">训练步骤 ({{ plan.steps?.length || 0 }}步)</div>
              <el-steps direction="vertical" :active="0" finish-status="wait">
                <el-step
                  v-for="step in plan.steps"
                  :key="step.id"
                  :title="step.title"
                  :description="`${step.expected_duration}分钟`"
                />
              </el-steps>
            </div>
          </div>
          <div class="plan-footer">
            <el-button size="small" type="primary" @click="viewDetail(plan)">查看详情</el-button>
            <el-button size="small">开始训练</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="recommendDialogVisible" title="生成训练方案" width="500px">
      <el-form :model="recommendForm" label-width="100px">
        <el-form-item label="选择宠物">
          <el-select v-model="recommendForm.pet_id" placeholder="请选择宠物" style="width: 100%">
            <el-option
              v-for="pet in pets"
              :key="pet.id"
              :label="pet.name"
              :value="pet.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recommendDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="recommending" @click="generateRecommendation">
          生成推荐
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" :title="currentPlan?.title" width="700px">
      <div v-if="currentPlan" class="plan-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="宠物名称">{{ currentPlan.pet_name }}</el-descriptions-item>
          <el-descriptions-item label="难度等级">
            <el-tag :type="getDifficultyType(currentPlan.difficulty_level)">
              {{ getDifficultyText(currentPlan.difficulty_level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="持续天数">{{ currentPlan.duration_days }}天</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentPlan.created_at) }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-section">
          <h4>方案描述</h4>
          <p>{{ currentPlan.description }}</p>
        </div>

        <div class="detail-section">
          <h4>训练步骤</h4>
          <el-timeline>
            <el-timeline-item
              v-for="step in currentPlan.steps"
              :key="step.id"
              :timestamp="`预计 ${step.expected_duration} 分钟`"
              placement="top"
            >
              <el-card>
                <template #header>
                  <div class="step-card-header">
                    <span>第{{ step.order }}步：{{ step.title }}</span>
                    <el-button size="small" type="success" @click="completeStep(step)">
                      标记完成
                    </el-button>
                  </div>
                </template>
                <p><strong>操作说明：</strong>{{ step.instruction }}</p>
                <p v-if="step.tips" style="margin-top: 10px">
                  <strong>小贴士：</strong>{{ step.tips }}
                </p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { petsApi, trainingApi } from '@/api'
import { ElMessage } from 'element-plus'

const plans = ref([])
const pets = ref([])
const recommendDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const recommending = ref(false)
const currentPlan = ref(null)
const recommendForm = ref({ pet_id: '' })

const loadPlans = async () => {
  try {
    const res = await trainingApi.list()
    plans.value = res.data.results || res.data
  } catch (e) {
    ElMessage.error('加载训练方案失败')
  }
}

const loadPets = async () => {
  try {
    const res = await petsApi.list()
    pets.value = res.data.results || res.data
  } catch (e) {
    ElMessage.error('加载宠物列表失败')
  }
}

const openRecommendDialog = () => {
  recommendForm.value = { pet_id: '' }
  recommendDialogVisible.value = true
}

const generateRecommendation = async () => {
  if (!recommendForm.value.pet_id) {
    ElMessage.warning('请先选择宠物')
    return
  }
  recommending.value = true
  try {
    await trainingApi.recommend(recommendForm.value.pet_id)
    ElMessage.success('训练方案已生成')
    recommendDialogVisible.value = false
    loadPlans()
  } catch (e) {
    ElMessage.error('生成方案失败')
  } finally {
    recommending.value = false
  }
}

const viewDetail = async (plan) => {
  try {
    const res = await trainingApi.get(plan.id)
    currentPlan.value = res.data
    detailDialogVisible.value = true
  } catch (e) {
    ElMessage.error('加载详情失败')
  }
}

const completeStep = async (step) => {
  if (!currentPlan.value) return
  try {
    await trainingApi.completeStep(currentPlan.value.id, step.id, 100, '完成训练')
    ElMessage.success('步骤已标记完成')
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const getDifficultyType = (level) => {
  const map = { easy: 'success', medium: 'warning', hard: 'danger' }
  return map[level] || 'info'
}

const getDifficultyText = (level) => {
  const map = { easy: '简单', medium: '中等', hard: '困难' }
  return map[level] || level
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadPlans()
  loadPets()
})
</script>

<style scoped>
.training-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  color: #303133;
  margin: 0;
}

.plan-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.plan-header {
  padding: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-header.easy {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
}

.plan-header.medium {
  background: linear-gradient(135deg, #fccb90 0%, #d57eeb 100%);
}

.plan-header.hard {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.plan-title {
  font-size: 18px;
  font-weight: bold;
}

.plan-content {
  padding: 20px;
}

.plan-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  color: #909399;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.plan-desc {
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.6;
}

.plan-steps {
  margin-top: 15px;
}

.step-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.plan-footer {
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 10px;
}

.plan-detail {
  padding: 10px 0;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin-bottom: 10px;
  color: #303133;
}

.step-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
