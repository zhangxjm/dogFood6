<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: bold;">洗护项目管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增项目
          </el-button>
        </div>
      </template>

      <el-table :data="items" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="项目名称" />
        <el-table-column prop="durationMinutes" label="时长(分钟)" />
        <el-table-column prop="price" label="价格(元)">
          <template #default="{ row }">
            ¥ {{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="isActive" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑项目' : '新增项目'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="项目名称">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="时长(分钟)">
          <el-input-number v-model="form.durationMinutes" :min="1" :max="600" />
        </el-form-item>
        <el-form-item label="价格(元)">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="1" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入项目描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.isActive" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { groomingItemAPI } from '../api'

const items = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  id: null,
  name: '',
  durationMinutes: null,
  price: null,
  description: '',
  isActive: true
})

const loadItems = async () => {
  try {
    items.value = await groomingItemAPI.getAll()
  } catch (error) {
    ElMessage.error('加载洗护项目数据失败')
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { id: null, name: '', durationMinutes: null, price: null, description: '', isActive: true }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSave = async () => {
  try {
    if (isEdit.value) {
      await groomingItemAPI.update(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await groomingItemAPI.create(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadItems()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该项目吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await groomingItemAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadItems()
  }).catch(() => {})
}

onMounted(() => {
  loadItems()
})
</script>
