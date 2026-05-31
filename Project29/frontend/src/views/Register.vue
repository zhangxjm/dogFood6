<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="logo">
        <el-icon size="48" color="#667eea"><Brush /></el-icon>
        <h1>非遗数字藏品平台</h1>
      </div>
      <h2>创建账户</h2>
      <p class="subtitle">注册成为平台会员，开启非遗数字收藏之旅</p>

      <el-form :model="form" @submit.prevent="handleRegister">
        <el-form-item>
          <el-input
            v-model="form.username"
            placeholder="用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.email"
            placeholder="邮箱"
            size="large"
            :prefix-icon="Message"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="确认密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleRegister"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="handleRegister">
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <div class="footer">
        已有账户？
        <router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { ElMessage } from 'element-plus';
import { User, Lock, Message } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const handleRegister = async () => {
  if (!form.username || !form.email || !form.password) {
    ElMessage.warning('请填写完整信息');
    return;
  }

  if (form.password !== form.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致');
    return;
  }

  if (form.password.length < 6) {
    ElMessage.warning('密码长度至少6位');
    return;
  }

  try {
    loading.value = true;
    await userStore.register(form.username, form.email, form.password);
    ElMessage.success('注册成功！请登录');
    router.push('/login');
  } catch (error) {
    ElMessage.error('注册失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}

.logo h1 {
  font-size: 24px;
  font-weight: bold;
  margin-top: 10px;
  color: #1f2937;
}

.auth-card h2 {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
  color: #1f2937;
}

.subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 30px;
}

.footer {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}
</style>
