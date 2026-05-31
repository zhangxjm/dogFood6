<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="logo">
        <el-icon size="48" color="#667eea"><Brush /></el-icon>
        <h1>非遗数字藏品平台</h1>
      </div>
      <h2>欢迎回来</h2>
      <p class="subtitle">登录您的账户，探索非遗数字藏品</p>

      <el-form :model="form" @submit.prevent="handleLogin">
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
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" :loading="loading" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="tips">
        <p>测试账号：admin / 123456</p>
        <p>测试账号：收藏家 / 123456</p>
      </div>

      <div class="footer">
        还没有账户？
        <router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/user';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
});

const handleLogin = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码');
    return;
  }

  try {
    loading.value = true;
    await userStore.login(form.username, form.password);
    ElMessage.success('登录成功！');
    const redirect = route.query.redirect || '/';
    router.push(redirect);
  } catch (error) {
    ElMessage.error('登录失败，请检查用户名和密码');
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

.tips {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #6b7280;
  text-align: center;
}

.tips p {
  margin: 2px 0;
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
