<template>
  <div class="profile-page">
    <h2 class="page-title">个人中心</h2>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="user-info-card">
          <div class="avatar-section">
            <el-avatar :size="100">{{ user?.realName?.charAt(0) || 'U' }}</el-avatar>
            <h3>{{ user?.realName }}</h3>
            <el-tag>{{ getRoleText(user?.role) }}</el-tag>
          </div>
          <div class="info-list">
            <div class="info-item">
              <span class="label">用户名</span>
              <span class="value">{{ user?.username }}</span>
            </div>
            <div class="info-item">
              <span class="label">手机号</span>
              <span class="value">{{ user?.phone || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">年龄</span>
              <span class="value">{{ user?.age || '-' }} 岁</span>
            </div>
            <div class="info-item">
              <span class="label">性别</span>
              <span class="value">{{ user?.gender || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">紧急联系人</span>
              <span class="value">{{ user?.emergencyContact || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">紧急联系电话</span>
              <span class="value">{{ user?.emergencyPhone || '-' }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card>
          <template #header>
            <span>编辑个人信息</span>
          </template>
          <el-form :model="form" label-width="120px" style="max-width: 500px;">
            <el-form-item label="真实姓名">
              <el-input v-model="form.realName" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="form.phone" />
            </el-form-item>
            <el-form-item label="身份证号">
              <el-input v-model="form.idCard" />
            </el-form-item>
            <el-form-item label="年龄">
              <el-input-number v-model="form.age" :min="0" :max="150" />
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="form.gender">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="紧急联系人">
              <el-input v-model="form.emergencyContact" />
            </el-form-item>
            <el-form-item label="紧急联系电话">
              <el-input v-model="form.emergencyPhone" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdate">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { updateUser } from '@/api/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const user = ref(null)

const form = reactive({
  id: null,
  realName: '',
  phone: '',
  idCard: '',
  age: null,
  gender: '',
  emergencyContact: '',
  emergencyPhone: ''
})

const getRoleText = (role) => {
  const map = {
    ADMIN: '管理员',
    STAFF: '工作人员',
    USER: '普通用户'
  }
  return map[role] || role
}

const handleUpdate = async () => {
  const res = await updateUser(form)
  if (res.code === 200) {
    ElMessage.success('修改成功')
    userStore.fetchUserInfo()
    user.value = { ...user.value, ...form }
  }
}

onMounted(() => {
  user.value = userStore.user
  if (user.value) {
    form.id = user.value.id
    form.realName = user.value.realName
    form.phone = user.value.phone
    form.idCard = user.value.idCard
    form.age = user.value.age
    form.gender = user.value.gender
    form.emergencyContact = user.value.emergencyContact
    form.emergencyPhone = user.value.emergencyPhone
  }
})
</script>

<style scoped>
.profile-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  min-height: calc(100vh - 100px);
}

.user-info-card {
  text-align: center;
}

.avatar-section {
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.avatar-section h3 {
  margin: 15px 0 10px 0;
}

.info-list {
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f7fa;
}

.info-item .label {
  color: #909399;
}

.info-item .value {
  color: #303133;
  font-weight: 500;
}
</style>
