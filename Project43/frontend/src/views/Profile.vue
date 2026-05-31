<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/api'
import type { User } from '@/api'
import dayjs from 'dayjs'

const authStore = useAuthStore()
const loading = ref(false)
const activeTab = ref('profile')
const user = ref<User | null>(null)

const profileForm = reactive({
  name: '',
  age: 0,
  gender: '',
  diagnosis: ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loadUser = async () => {
  try {
    user.value = await authAPI.getCurrentUser()
    if (user.value) {
      profileForm.name = user.value.name
      profileForm.age = user.value.age
      profileForm.gender = user.value.gender
      profileForm.diagnosis = user.value.diagnosis
    }
  } catch (e) {
    console.error('Failed to load user:', e)
  }
}

const updateProfile = async () => {
  if (!profileForm.name.trim()) {
    ElMessage.warning('请输入姓名')
    return
  }
  if (profileForm.age < 1 || profileForm.age > 120) {
    ElMessage.warning('请输入有效的年龄')
    return
  }
  
  loading.value = true
  try {
    await authAPI.updateProfile({
      name: profileForm.name,
      age: profileForm.age,
      gender: profileForm.gender,
      diagnosis: profileForm.diagnosis
    })
    ElMessage.success('资料更新成功')
    authStore.userInfo.name = profileForm.name
    localStorage.setItem('user', JSON.stringify(authStore.userInfo))
    await loadUser()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.error || '更新失败')
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  if (!passwordForm.oldPassword) {
    ElMessage.warning('请输入原密码')
    return
  }
  if (!passwordForm.newPassword) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (passwordForm.newPassword.length < 6) {
    ElMessage.warning('新密码长度不能少于6位')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }
  
  loading.value = true
  try {
    await authAPI.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    ElMessage.success('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (e: any) {
    ElMessage.error(e.response?.data?.error || '密码修改失败')
  } finally {
    loading.value = false
  }
}

const getRoleText = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: '系统管理员',
    doctor: '医生',
    patient: '患者'
  }
  return roleMap[role] || role
}

const getGenderText = (gender: string) => {
  return gender === 'male' ? '男' : gender === 'female' ? '女' : '未知'
}

onMounted(() => {
  loadUser()
})
</script>

<template>
  <div class="profile-container">
    <el-card class="card-shadow header-card">
      <el-row align="middle">
        <el-col :span="12">
          <h2 class="page-title">
            <el-icon color="#409eff"><Setting /></el-icon>
            个人中心
          </h2>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="8">
        <el-card class="card-shadow profile-card">
          <div class="profile-avatar">
            {{ user?.name?.charAt(0) || 'U' }}
          </div>
          <h3 class="profile-name">{{ user?.name }}</h3>
          <p class="profile-role">
            <el-tag :type="user?.role === 'admin' ? 'danger' : user?.role === 'doctor' ? 'primary' : 'success'" size="small">
              {{ getRoleText(user?.role || '') }}
            </el-tag>
          </p>
          
          <el-descriptions :column="1" border size="small" class="profile-desc">
            <el-descriptions-item label="用户名">
              {{ user?.username }}
            </el-descriptions-item>
            <el-descriptions-item label="性别">
              {{ getGenderText(user?.gender || '') }}
            </el-descriptions-item>
            <el-descriptions-item label="年龄">
              {{ user?.age }} 岁
            </el-descriptions-item>
            <el-descriptions-item label="注册时间">
              {{ user?.created_at ? dayjs(user.created_at).format('YYYY-MM-DD') : '--' }}
            </el-descriptions-item>
          </el-descriptions>
          
          <div class="profile-diagnosis" v-if="user?.diagnosis">
            <div class="diagnosis-label">诊断信息</div>
            <div class="diagnosis-content">{{ user.diagnosis }}</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="16">
        <el-card class="card-shadow">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="profile">
              <el-form :model="profileForm" label-width="100px" class="profile-form">
                <el-form-item label="姓名">
                  <el-input v-model="profileForm.name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="年龄">
                  <el-input-number v-model="profileForm.age" :min="1" :max="120" placeholder="请输入年龄" />
                </el-form-item>
                <el-form-item label="性别">
                  <el-radio-group v-model="profileForm.gender">
                    <el-radio value="male">男</el-radio>
                    <el-radio value="female">女</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="诊断" v-if="user?.role === 'patient'">
                  <el-input 
                    v-model="profileForm.diagnosis" 
                    type="textarea" 
                    :rows="3"
                    placeholder="请输入诊断信息"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="loading" @click="updateProfile">
                    保存修改
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            
            <el-tab-pane label="修改密码" name="password">
              <el-form :model="passwordForm" label-width="100px" class="profile-form">
                <el-form-item label="原密码">
                  <el-input 
                    v-model="passwordForm.oldPassword" 
                    type="password" 
                    placeholder="请输入原密码"
                    show-password
                  />
                </el-form-item>
                <el-form-item label="新密码">
                  <el-input 
                    v-model="passwordForm.newPassword" 
                    type="password" 
                    placeholder="请输入新密码（至少6位）"
                    show-password
                  />
                </el-form-item>
                <el-form-item label="确认新密码">
                  <el-input 
                    v-model="passwordForm.confirmPassword" 
                    type="password" 
                    placeholder="请再次输入新密码"
                    show-password
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="loading" @click="changePassword">
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.profile-container {
  padding: 0;
}

.header-card {
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-card {
  text-align: center;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 600;
  margin: 0 auto 16px;
}

.profile-name {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
}

.profile-role {
  margin: 0 0 20px;
}

.profile-desc {
  margin-bottom: 20px;
}

.profile-diagnosis {
  padding: 12px;
  background: #fef0f0;
  border-radius: 8px;
  text-align: left;
}

.diagnosis-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.diagnosis-content {
  font-size: 14px;
  color: #f56c6c;
  line-height: 1.5;
}

.profile-form {
  max-width: 500px;
  padding: 20px 0;
}
</style>
