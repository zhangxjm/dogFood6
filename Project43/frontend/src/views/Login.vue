<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const loginForm = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const formRef = ref<FormInstance>()

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await authStore.login(loginForm.username, loginForm.password)
        ElMessage.success('登录成功')
        router.push('/dashboard')
      } catch (e) {
        // Error already handled by request interceptor
      } finally {
        loading.value = false
      }
    }
  })
}

const quickLogin = (username: string) => {
  loginForm.username = username
  loginForm.password = 'password123'
}
</script>

<template>
  <div class="login-container">
    <div class="login-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>
    
    <div class="login-card">
      <div class="login-header">
        <img src="/brain.svg" alt="logo" class="logo" />
        <h1 class="title">脑机接口辅助康复训练系统</h1>
        <p class="subtitle">BCI Rehabilitation Training System</p>
      </div>
      
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            autocomplete="username"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>
        
        <el-button
          type="primary"
          size="large"
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
        >
          登 录
        </el-button>
      </el-form>
      
      <div class="quick-login">
        <div class="quick-title">快速登录</div>
        <div class="quick-buttons">
          <el-tag
            v-for="account in [
              { username: 'admin', label: '管理员' },
              { username: 'doctor', label: '医生' },
              { username: 'patient1', label: '患者' }
            ]"
            :key="account.username"
            class="quick-tag"
            effect="plain"
            @click="quickLogin(account.username)"
          >
            {{ account.label }}
          </el-tag>
        </div>
      </div>
      
      <div class="login-footer">
        <p>默认密码: password123</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  background: white;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
}

.shape-2 {
  width: 400px;
  height: 400px;
  bottom: -150px;
  right: -150px;
}

.shape-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 10%;
}

.login-card {
  width: 420px;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 10;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
}

.quick-login {
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.quick-title {
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.quick-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.quick-tag {
  cursor: pointer;
  padding: 6px 16px;
  transition: all 0.2s;
}

.quick-tag:hover {
  transform: translateY(-1px);
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.login-footer p {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}
</style>
