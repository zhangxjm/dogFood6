<template>
  <div class="copyright">
    <div class="page-header">
      <h2 class="page-title">版权作品管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加版权作品
      </el-button>
    </div>

    <el-card class="table-card">
      <el-table :data="works" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="workName" label="作品名称" min-width="200" />
        <el-table-column prop="workType" label="作品类型" width="140" />
        <el-table-column prop="owner" label="权利人" width="160" />
        <el-table-column prop="registrationNumber" label="登记号" width="180" />
        <el-table-column prop="registrationDate" label="登记日期" width="160">
          <template #default="{ row }">
            {{ formatDate(row.registrationDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="keywords" label="关键词" min-width="150" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'" size="small">
              {{ row.status === 'ACTIVE' ? '有效' : '已失效' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editWork(row)">编辑</el-button>
            <el-button :type="row.status === 'ACTIVE' ? 'warning' : 'success'" link size="small" @click="toggleStatus(row)">
              {{ row.status === 'ACTIVE' ? '停用' : '启用' }}
            </el-button>
            <el-button type="danger" link size="small" @click="deleteWork(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showAddDialog" :title="isEdit ? '编辑版权作品' : '添加版权作品'" width="650px">
      <el-form :model="workForm" :rules="workRules" ref="workFormRef" label-width="100px">
        <el-form-item label="作品名称" prop="workName">
          <el-input v-model="workForm.workName" placeholder="请输入作品名称" />
        </el-form-item>
        <el-form-item label="作品类型" prop="workType">
          <el-input v-model="workForm.workType" placeholder="请输入作品类型，如：商标、专利、美术作品等" />
        </el-form-item>
        <el-form-item label="权利人" prop="owner">
          <el-input v-model="workForm.owner" placeholder="请输入权利人名称" />
        </el-form-item>
        <el-form-item label="登记号" prop="registrationNumber">
          <el-input v-model="workForm.registrationNumber" placeholder="请输入登记号" />
        </el-form-item>
        <el-form-item label="登记日期">
          <el-date-picker v-model="workForm.registrationDate" type="date" placeholder="选择登记日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="workForm.keywords" placeholder="请输入关键词，用逗号分隔" />
        </el-form-item>
        <el-form-item label="作品描述">
          <el-input v-model="workForm.description" type="textarea" :rows="3" placeholder="请输入作品描述" />
        </el-form-item>
        <el-form-item label="图片链接">
          <el-input v-model="workForm.imageUrls" type="textarea" :rows="2" placeholder="请输入图片链接，多个链接用逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveWork">{{ isEdit ? '保存' : '添加' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const works = ref([])
const loading = ref(false)
const showAddDialog = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const workFormRef = ref(null)

const workForm = ref({
  workName: '',
  workType: '',
  owner: '',
  registrationNumber: '',
  registrationDate: null,
  keywords: '',
  description: '',
  imageUrls: '',
  status: 'ACTIVE'
})

const workRules = {
  workName: [{ required: true, message: '请输入作品名称', trigger: 'blur' }],
  workType: [{ required: true, message: '请输入作品类型', trigger: 'blur' }],
  owner: [{ required: true, message: '请输入权利人', trigger: 'blur' }],
  registrationNumber: [{ required: true, message: '请输入登记号', trigger: 'blur' }]
}

const fetchWorks = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/copyright')
    works.value = res.data
  } catch (error) {
    ElMessage.error('获取版权作品列表失败')
  } finally {
    loading.value = false
  }
}

const editWork = (row) => {
  isEdit.value = true
  editId.value = row.id
  workForm.value = {
    workName: row.workName,
    workType: row.workType,
    owner: row.owner,
    registrationNumber: row.registrationNumber,
    registrationDate: row.registrationDate ? new Date(row.registrationDate) : null,
    keywords: row.keywords || '',
    description: row.description || '',
    imageUrls: row.imageUrls || '',
    status: row.status
  }
  showAddDialog.value = true
}

const saveWork = async () => {
  await workFormRef.value?.validate()
  try {
    if (isEdit.value) {
      await axios.put(`/api/copyright/${editId.value}`, workForm.value)
      ElMessage.success('编辑成功')
    } else {
      await axios.post('/api/copyright', workForm.value)
      ElMessage.success('添加成功')
    }
    showAddDialog.value = false
    resetForm()
    fetchWorks()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const toggleStatus = async (row) => {
  const newStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  try {
    await axios.put(`/api/copyright/${row.id}/status?status=${newStatus}`)
    ElMessage.success('状态更新成功')
    fetchWorks()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

const deleteWork = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该版权作品吗？', '提示', { type: 'warning' })
    await axios.delete(`/api/copyright/${id}`)
    ElMessage.success('删除成功')
    fetchWorks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const resetForm = () => {
  isEdit.value = false
  editId.value = null
  workForm.value = {
    workName: '',
    workType: '',
    owner: '',
    registrationNumber: '',
    registrationDate: null,
    keywords: '',
    description: '',
    imageUrls: '',
    status: 'ACTIVE'
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

onMounted(fetchWorks)
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

.table-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
