<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-desc">抱歉，您访问的页面不存在或已被移除。</p>
      <div class="error-actions">
        <el-button type="primary" size="large" @click="goHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button size="large" @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回上一页
        </el-button>
      </div>
      <div class="brain-icon">
        <svg viewBox="0 0 100 100" width="120" height="120">
          <path 
            d="M50 10 C20 10 10 30 10 50 C10 75 30 90 50 90 C70 90 90 75 90 50 C90 30 80 10 50 10 Z" 
            fill="none" 
            stroke="#409eff" 
            stroke-width="2"
            stroke-dasharray="5,5"
          />
          <circle cx="35" cy="40" r="8" fill="#67c23a" opacity="0.6" />
          <circle cx="65" cy="40" r="8" fill="#e6a23c" opacity="0.6" />
          <circle cx="50" cy="60" r="10" fill="#f56c6c" opacity="0.6" />
          <path 
            d="M25 50 Q35 45, 45 50 T65 50 T85 50" 
            fill="none" 
            stroke="#909399" 
            stroke-width="2"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.not-found-container::before {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: -200px;
  left: -200px;
}

.not-found-container::after {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  bottom: -150px;
  right: -150px;
}

.not-found-content {
  text-align: center;
  color: white;
  z-index: 1;
  position: relative;
}

.error-code {
  font-size: 180px;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #fff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.error-title {
  font-size: 36px;
  margin: 20px 0 10px;
  font-weight: 700;
}

.error-desc {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 30px;
}

.error-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 40px;
}

.brain-icon {
  opacity: 0.5;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}
</style>
