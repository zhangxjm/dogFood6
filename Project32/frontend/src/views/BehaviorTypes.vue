<template>
  <div class="behavior-types-page">
    <div class="page-header">
      <h2 class="page-title">行为类型管理</h2>
      <el-button type="primary" @click="openDialog">
        <el-icon><Plus /></el-icon>
        添加行为类型
      </el-button>
    </div>

    <el-card class="content-card">
      <el-table :data="behaviorTypes" stripe style="width: 100%">
        <el-table-column prop="code" label="行为代码" width="150" />
        <el-table-column prop="name" label="行为名称" width="180" />
        <el-table-column prop="description" label="行为描述" />
        <el-table-column label="是否不良" width="120">
          <template #default="{ row }">
            <el-tag :type="row.is_negative ? 'danger' : 'success'">
              {{ row.is_negative ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="severity_level" label="严重程度" width="120">
          <template #default="{ row }">
            <el-rate v-model="row.severity_level" disabled show-score text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editType(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteType(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑行为类型' : '添加行为类型'"
      width="500px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="行为代码">
          <el-input v-model="form.code" placeholder="例如：SIT" />
        </el-form-item>
        <el-form-item label="行为名称">
          <el-input v-model="form.name" placeholder="请输入行为名称" />
        </el-form-item>
        <el-form-item label="行为描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="是否不良行为">
          <el-switch v-model="form.is_negative" />
        </el-form-item>
        <el-form-item label="严重程度">
          <el-rate v-model="form.severity_level" show-score text-color="#ff9900" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveType">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { behaviorTypesApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const behaviorTypes = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const form = ref({
  code: '',
  name: '',
  description: '',
  is_negative: false,
  severity_level: 1
})

const loadTypes = async () => {
  try {
    const res = await behaviorTypesApi.list()
    behaviorTypes.value = res.data.results || res.data
  } catch (e) {
    ElMessage.error('加载行为类型失败')
  }
}

const openDialog = () => {
  isEdit.value = false
  editId.value = null
  form.value = { code: '', name: '', description: '', is_negative: false, severity_level: 1 }
  dialogVisible.value = true
}

const editType = (row) => {
  isEdit.value = true
  editId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

const saveType = async () => {
  if (!form.value.code || !form.value.name) {
    ElMessage.warning('请填写行为代码和名称')
    return
  }
  try {
    if (isEdit.value) {
      await behaviorTypesApi.update(editId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await behaviorTypesApi.create(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadTypes()
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const deleteType = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个行为类型吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await behaviorTypesApi.delete(row.id)
    ElMessage.success('删除成功')
    loadTypes()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadTypes()
})
</script>

<style scoped>
.behavior-types-page {
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

.content-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
