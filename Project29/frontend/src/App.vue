<template>
  <div class="app">
    <el-header class="header">
      <div class="container header-content">
        <div class="logo" @click="$router.push('/')">
          <el-icon size="32" color="#fff"><Brush /></el-icon>
          <span>非遗数字藏品平台</span>
        </div>
        <nav class="nav">
          <router-link to="/">首页</router-link>
          <router-link to="/marketplace">藏品市场</router-link>
          <router-link to="/collections">非遗系列</router-link>
          <router-link v-if="userStore.isLoggedIn" to="/mint">铸造</router-link>
          <router-link v-if="userStore.isLoggedIn" to="/copyright">版权确权</router-link>
        </nav>
        <div class="user-area">
          <div v-if="userStore.isLoggedIn" class="user-info">
            <span class="balance">
              <el-icon><Wallet /></el-icon>
              {{ userStore.balance }} 元
            </span>
            <el-dropdown @command="handleCommand">
              <span class="username">
                <el-icon><User /></el-icon>
                {{ userStore.username }}
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div v-else class="auth-buttons">
            <el-button type="primary" plain @click="$router.push('/login')">登录</el-button>
            <el-button type="primary" @click="$router.push('/register')">注册</el-button>
          </div>
        </div>
      </div>
    </el-header>

    <main class="main">
      <router-view />
    </main>

    <el-footer class="footer">
      <div class="container">
        <p>非遗数字藏品平台 © 2024 - 保护非遗，传承文化</p>
        <p class="links">
          <a href="#">关于我们</a>
          <a href="#">用户协议</a>
          <a href="#">隐私政策</a>
          <a href="#">帮助中心</a>
        </p>
      </div>
    </el-footer>
  </div>
</template>

<script setup>
import { useUserStore } from './stores/user';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();
const router = useRouter();

const handleCommand = (command) => {
  if (command === 'profile') {
    router.push('/profile');
  } else if (command === 'logout') {
    userStore.logout();
    ElMessage.success('已退出登录');
    router.push('/');
  }
};
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  height: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
}

.nav {
  display: flex;
  gap: 30px;
}

.nav a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 15px;
  transition: color 0.3s;
}

.nav a:hover,
.nav a.router-link-active {
  color: white;
  font-weight: 500;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.balance {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.username {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.main {
  flex: 1;
  padding: 20px 0;
}

.footer {
  background: #1f2937;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 30px 0;
}

.footer p {
  margin: 5px 0;
}

.footer .links {
  margin-top: 10px;
}

.footer .links a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  margin: 0 15px;
}

.footer .links a:hover {
  color: white;
}
</style>
