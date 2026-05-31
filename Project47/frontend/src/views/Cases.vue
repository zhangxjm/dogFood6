<template>
  <div class="cases">
    <div class="page-header">
      <h2 class="page-title">维权案件追踪</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        新建案件
      </el-button>
    </div>

    <el-row :gutter="20" class="stat-cards">
      <el-col :span="4">
        <el-card class="stat-card">
          <div class="stat-label">案件总数</div>
          <div class="stat-value">{{ totalCases }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card preparing">
          <div class="stat-label">准备中</div>
          <div class="stat-value">{{ statistics.preparing || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card filed">
          <div class="stat-label">已立案</div>
          <div class="stat-value">{{ statistics.filed || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card hearing">
          <div class="stat-label">审理中</div>
          <div class="stat-value">{{ statistics.hearing || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card won">
          <div class="stat-label">已胜诉</div>
          <div class="stat-value">{{ statistics.closed_won || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card settled">
          <div class="stat-label">已和解</div>
          <div class="stat-value">{{ statistics.settled || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card">
      <el-table :data="cases" v-loading="loading" stripe>
        <el-table-column prop="caseNumber" label="案件编号" width="180" />
        <el-table-column prop="caseTitle" label="案件名称" min-width="200" />
        <el-table-column label="案件类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getCaseTypeText(row.caseType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="plaintiff" label="原告" width="140" />
        <el-table-column prop="defendant" label="被告" width="140" />
        <el-table-column prop="attorney" label="律师" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getCaseStatusType(row.status)" size="small">
              {{ getCaseStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="filedAt" label="立案时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.filedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewCase(row)">详情</el-button>
            <el-dropdown @command="(status) => updateStatus(row.id, status)">
              <el-button type="success" link size="small">更新状态<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="PREPARING">准备中</el-dropdown-item>
                  <el-dropdown-item command="FILED">已立案</el-dropdown-item>
                  <el-dropdown-item command="HEARING">审理中</el-dropdown-item>
                  <el-dropdown-item command="JUDGEMENT">判决中</el-dropdown-item>
                  <el-dropdown-item command="CLOSED_WON">已胜诉</el-dropdown-item>
                  <el-dropdown-item command="CLOSED_LOST">已败诉</el-dropdown-item>
                  <el-dropdown-item command="SETTLED">已和解</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="danger" link size="small" @click="deleteCase(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showAddDialog" title="新建维权案件" width="700px">
      <el-form :model="caseForm" :rules="caseRules" ref="caseFormRef" label-width="100px">
        <el-form-item label="案件名称" prop="caseTitle">
          <el-input v-model="caseForm.caseTitle" placeholder="请输入案件名称" />
        </el-form-item>
        <el-form-item label="商品ID" prop="productId">
          <el-input-number v-model="caseForm.productId" :min="1" />
        </el-form-item>
        <el-form-item label="案件类型" prop="caseType">
          <el-select v-model="caseForm.caseType" placeholder="请选择案件类型" style="width: 100%">
            <el-option label="商标侵权" value="TRADEMARK" />
            <el-option label="版权侵权" value="COPYRIGHT" />
            <el-option label="专利侵权" value="PATENT" />
            <el-option label="假冒商品" value="COUNTERFEIT" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="原告">
          <el-input v-model="caseForm.plaintiff" placeholder="请输入原告信息" />
        </el-form-item>
        <el-form-item label="被告">
          <el-input v-model="caseForm.defendant" placeholder="请输入被告信息" />
        </el-form-item>
        <el-form-item label="代理律师">
          <el-input v-model="caseForm.attorney" placeholder="请输入律师姓名" />
        </el-form-item>
        <el-form-item label="案件描述">
          <el-input v-model="caseForm.caseDescription" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="createCase">创建案件</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetailDialog" title="案件详情" width="700px">
      <el-descriptions :column="2" border v-if="currentCase">
        <el-descriptions-item label="案件编号">{{ currentCase.caseNumber }}</el-descriptions-item>
        <el-descriptions-item label="案件状态">
          <el-tag :type="getCaseStatusType(currentCase.status)">{{ getCaseStatusText(currentCase.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="案件类型">{{ getCaseTypeText(currentCase.caseType) }}</el-descriptions-item>
        <el-descriptions-item label="关联商品ID">{{ currentCase.productId }}</el-descriptions-item>
        <el-descriptions-item label="原告">{{ currentCase.plaintiff }}</el-descriptions-item>
        <el-descriptions-item label="被告">{{ currentCase.defendant }}</el-descriptions-item>
        <el-descriptions-item label="代理律师">{{ currentCase.attorney }}</el-descriptions-item>
        <el-descriptions-item label="立案时间">{{ formatDate(currentCase.filedAt) }}</el-descriptions-item>
        <el-descriptions-item label="案件描述" :span="2">{{ currentCase.caseDescription }}</el-descriptions-item>
        <el-descriptions-item label="处理结果" :span="2" v-if="currentCase.result">{{ currentCase.result }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const cases = ref([])
const loading = ref(false)
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const currentCase = ref(null)
const caseFormRef = ref(null)
const statistics = ref({})

const caseForm = ref({
  caseTitle: '',
  productId: 1,
  caseType: 'TRADEMARK',
  plaintiff: '',
  defendant: '',
  attorney: '',
  caseDescription: ''
})

const caseRules = {
  caseTitle: [{ required: true, message: '请输入案件名称', trigger: 'blur' }],
  productId: [{ required: true, message: '请输入关联商品ID', trigger: 'blur' }],
  caseType: [{ required: true, message: '请选择案件类型', trigger: 'change' }]
}

const totalCases = computed(() => cases.value.length)

const fetchCases = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/cases')
    cases.value = res.data
  } catch (error) {
    ElMessage.error('获取案件列表失败')
  } finally {
    loading.value = false
  }
}

const fetchStatistics = async () => {
  try {
    const res = await axios.get('/api/cases/statistics')
    statistics.value = res.data
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  }
}

const createCase = async () => {
  await caseFormRef.value?.validate()
  try {
    await axios.post('/api/cases', caseForm.value)
    ElMessage.success('案件创建成功')
    showAddDialog.value = false
    caseForm.value = { caseTitle: '', productId: 1, caseType: 'TRADEMARK', plaintiff: '', defendant: '', attorney: '', caseDescription: '' }
    fetchCases()
    fetchStatistics()
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

const viewCase = (row) => {
  currentCase.value = row
  showDetailDialog.value = true
}

const updateStatus = async (id, status) => {
  try {
    await axios.put(`/api/cases/${id}/status?status=${status}`)
    ElMessage.success('状态更新成功')
    fetchCases()
    fetchStatistics()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

const deleteCase = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该案件吗？', '提示', { type: 'warning' })
    await axios.delete(`/api/cases/${id}`)
    ElMessage.success('删除成功')
    fetchCases()
    fetchStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const getCaseTypeText = (type) => {
  const texts = { TRADEMARK: '商标侵权', COPYRIGHT: '版权侵权', PATENT: '专利侵权', COUNTERFEIT: '假冒商品', OTHER: '其他' }
  return texts[type] || type
}

const getCaseStatusType = (status) => {
  if (status === 'CLOSED_WON' || status === 'SETTLED') return 'success'
  if (status === 'CLOSED_LOST') return 'danger'
  if (status === 'HEARING' || status === 'JUDGEMENT') return 'warning'
  return 'primary'
}

const getCaseStatusText = (status) => {
  const texts = {
    DRAFT: '草稿',
    PREPARING: '准备中',
    FILED: '已立案',
    HEARING: '审理中',
    JUDGEMENT: '判决中',
    APPEAL: '上诉中',
    CLOSED_WON: '已胜诉',
    CLOSED_LOST: '已败诉',
    SETTLED: '已和解'
  }
  return texts[status] || status
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchCases()
  fetchStatistics()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.stat-card.preparing {
  border-left-color: #909399;
}

.stat-card.filed {
  border-left-color: #e6a23c;
}

.stat-card.hearing {
  border-left-color: #67c23a;
}

.stat-card.won {
  border-left-color: #f56c6c;
}

.stat-card.settled {
  border-left-color: #67c23a;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.table-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
