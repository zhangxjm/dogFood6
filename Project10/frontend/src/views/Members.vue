<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: bold;">会员管理</span>
          <div style="display: flex; gap: 10px;">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索会员姓名或手机号"
              style="width: 250px;"
              clearable
              @keyup.enter="searchMembers"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增会员
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="members" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="totalGroomingCount" label="累计洗护次数">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.totalGroomingCount }} 次</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑会员' : '新增会员'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="form.name" placeholder="请输入会员姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" placeholder="请输入地址" />
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
import { memberAPI } from '../api'

const members = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const searchKeyword = ref('')
const form = ref({
  id: null,
  name: '',
  phone: '',
  address: ''
})

const loadMembers = async () => {
  try {
    members.value = await memberAPI.getAll()
  } catch (error) {
    ElMessage.error('加载会员数据失败')
  }
}

const searchMembers = async () => {
  if (searchKeyword.value.trim()) {
    members.value = await memberAPI.search(searchKeyword.value)
  } else {
    loadMembers()
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = { id: null, name: '', phone: '', address: '' }
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
      await memberAPI.update(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await memberAPI.create(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadMembers()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该会员吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await memberAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadMembers()
  }).catch(() => {})
}

onMounted(() => {
  loadMembers()
})
</script>
