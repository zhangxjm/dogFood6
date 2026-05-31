<template>
  <div class="pets-page">
    <div class="page-header">
      <h2 class="page-title">宠物管理</h2>
      <el-button type="primary" @click="openDialog">
        <el-icon><Plus /></el-icon>
        添加宠物
      </el-button>
    </div>

    <el-card class="content-card">
      <el-table :data="pets" stripe style="width: 100%">
        <el-table-column prop="name" label="宠物名称" width="150" />
        <el-table-column prop="species" label="物种" width="120" />
        <el-table-column prop="breed" label="品种" />
        <el-table-column prop="age" label="年龄" width="100">
          <template #default="{ row }">{{ row.age }}岁</template>
        </el-table-column>
        <el-table-column prop="weight" label="体重" width="120">
          <template #default="{ row }">{{ row.weight }}kg</template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editPet(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deletePet(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑宠物' : '添加宠物'"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="宠物名称">
          <el-input v-model="form.name" placeholder="请输入宠物名称" />
        </el-form-item>
        <el-form-item label="物种">
          <el-select v-model="form.species" placeholder="请选择物种" style="width: 100%">
            <el-option label="狗" value="狗" />
            <el-option label="猫" value="猫" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="品种">
          <el-input v-model="form.breed" placeholder="请输入品种" />
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="form.age" :min="0" :max="30" />
          <span style="margin-left: 10px">岁</span>
        </el-form-item>
        <el-form-item label="体重">
          <el-input-number v-model="form.weight" :min="0" :max="100" :step="0.1" />
          <span style="margin-left: 10px">kg</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePet">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { petsApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const pets = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const form = ref({
  name: '',
  species: '狗',
  breed: '',
  age: 1,
  weight: 5.0
})

const loadPets = async () => {
  try {
    const res = await petsApi.list()
    pets.value = res.data.results || res.data
  } catch (e) {
    ElMessage.error('加载宠物列表失败')
  }
}

const openDialog = () => {
  isEdit.value = false
  editId.value = null
  form.value = { name: '', species: '狗', breed: '', age: 1, weight: 5.0 }
  dialogVisible.value = true
}

const editPet = (row) => {
  isEdit.value = true
  editId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

const savePet = async () => {
  if (!form.value.name) {
    ElMessage.warning('请输入宠物名称')
    return
  }
  try {
    if (isEdit.value) {
      await petsApi.update(editId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await petsApi.create(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadPets()
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const deletePet = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个宠物吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await petsApi.delete(row.id)
    ElMessage.success('删除成功')
    loadPets()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadPets()
})
</script>

<style scoped>
.pets-page {
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
