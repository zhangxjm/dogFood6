<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: bold;">宠物管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增宠物
          </el-button>
        </div>
      </template>

      <el-table :data="pets" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="宠物名称" />
        <el-table-column prop="species" label="种类" />
        <el-table-column prop="breed" label="品种" />
        <el-table-column prop="age" label="年龄" />
        <el-table-column prop="gender" label="性别" />
        <el-table-column prop="memberId" label="所属会员ID" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑宠物' : '新增宠物'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="宠物名称">
          <el-input v-model="form.name" placeholder="请输入宠物名称" />
        </el-form-item>
        <el-form-item label="种类">
          <el-select v-model="form.species" placeholder="请选择种类" style="width: 100%;">
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
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%;">
            <el-option label="公" value="公" />
            <el-option label="母" value="母" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属会员">
          <el-select v-model="form.memberId" placeholder="请选择会员" style="width: 100%;">
            <el-option
              v-for="member in members"
              :key="member.id"
              :label="member.name"
              :value="member.id"
            />
          </el-select>
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
import { petAPI, memberAPI } from '../api'

const pets = ref([])
const members = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  id: null,
  name: '',
  species: '',
  breed: '',
  age: null,
  gender: '',
  memberId: null
})

const loadPets = async () => {
  try {
    pets.value = await petAPI.getAll()
  } catch (error) {
    ElMessage.error('加载宠物数据失败')
  }
}

const loadMembers = async () => {
  try {
    members.value = await memberAPI.getAll()
  } catch (error) {
    console.error('Failed to load members:', error)
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { id: null, name: '', species: '', breed: '', age: null, gender: '', memberId: null }
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
      await petAPI.update(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await petAPI.create(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadPets()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该宠物吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await petAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadPets()
  }).catch(() => {})
}

onMounted(() => {
  loadPets()
  loadMembers()
})
</script>
