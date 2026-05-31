<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Cpu, Lock, User, Eye, EyeOff } from 'lucide-vue-next'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const showPassword = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度在 6 到 32 个字符', trigger: 'blur' }
  ]
}

async function handleLogin() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(loginForm.username, loginForm.password)
        const redirect = route.query.redirect as string || '/dashboard'
        router.push(redirect)
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

function togglePassword() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-md">
      <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Cpu class="w-10 h-10 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">工业物联网预测性维护系统</h1>
          <p class="text-gray-500">请登录您的账户</p>
        </div>

        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="rules"
          label-position="top"
          @keyup.enter="handleLogin"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
            >
              <template #suffix>
                <button type="button" @click="togglePassword" class="p-1 hover:bg-gray-100 rounded">
                  <Eye v-if="!showPassword" class="w-5 h-5 text-gray-400" />
                  <EyeOff v-else class="w-5 h-5 text-gray-400" />
                </button>
              </template>
            </el-input>
          </el-form-item>

          <div class="flex items-center justify-between mb-6">
            <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
            <a href="#" class="text-primary-500 hover:text-primary-600 text-sm">忘记密码？</a>
          </div>

          <el-button
            type="primary"
            size="large"
            class="w-full h-12 text-base font-medium"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form>

        <div class="mt-6 pt-6 border-t border-gray-100">
          <p class="text-center text-sm text-gray-500">
            测试账号：admin / admin123
          </p>
        </div>
      </div>

      <p class="text-center text-white/60 text-sm mt-6">
        © 2024 工业物联网设备预测性维护系统 v1.0
      </p>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-input__wrapper) {
  padding: 0 16px;
}

:deep(.el-input__prefix-inner) {
  margin-right: 8px;
}
</style>
