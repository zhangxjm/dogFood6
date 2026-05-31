<template>
  <div class="admin-page">
    <div class="flex-between mb-20">
      <h2 class="page-title" style="margin: 0;">用户管理</h2>
    </div>

    <el-card>
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'ADMIN' ? 'danger' : row.role === 'STAFF' ? 'warning' : 'info'">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showEditDialog" title="编辑用户" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="真实姓名">
          <el-input v-model="editForm.realName" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="editForm.role" style="width: 100%;">
            <el-option label="管理员" value="ADMIN" />
            <el-option label="工作人员" value="STAFF" />
            <el-option label="普通用户" value="USER" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getUserList, deleteUser, updateUser } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const users = ref([])
const showEditDialog = ref(false)
const editForm = reactive({
  id: null,
  realName: '',
  phone: '',
  role: '',
  status: 1
})

const getRoleText = (role) => {
  const map = {
    ADMIN: '管理员',
    STAFF: '工作人员',
    USER: '普通用户'
  }
  return map[role] || role
}

const handleEdit = (row) => {
  editForm.id = row.id
  editForm.realName = row.realName
  editForm.phone = row.phone
  editForm.role = row.role
  editForm.status = row.status
  showEditDialog.value = true
}

const handleSave = async () => {
  const res = await updateUser(editForm)
  if (res.code === 200) {
    ElMessage.success('修改成功')
    showEditDialog.value = false
    loadUsers()
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteUser(id)
    ElMessage.success('删除成功')
    loadUsers()
  } catch (e) {
  }
}

const loadUsers = async () => {
  const res = await getUserList()
  if (res.code === 200) {
    users.value = res.data
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  min-height: calc(100vh - 100px);
}
</style>
