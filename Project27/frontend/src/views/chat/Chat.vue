<template>
  <div class="chat-page">
    <h2 class="page-title">在线咨询</h2>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="contact-list-card">
          <template #header>
            <span>客服人员</span>
          </template>
          <div class="contact-list">
            <div 
              class="contact-item" 
              v-for="staff in staffList" 
              :key="staff.id"
              :class="{ active: selectedStaff?.id === staff.id }"
              @click="selectStaff(staff)"
            >
              <el-avatar>{{ staff.realName?.charAt(0) || 'U' }}</el-avatar>
              <div class="contact-info">
                <div class="contact-name">{{ staff.realName }}</div>
                <div class="contact-role">{{ staff.role === 'ADMIN' ? '管理员' : '客服' }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="18">
        <el-card class="chat-card" v-if="selectedStaff">
          <template #header>
            <span>与 {{ selectedStaff.realName }} 对话中</span>
          </template>
          <div class="chat-messages" ref="messagesContainer">
            <div 
              class="message-item" 
              v-for="msg in messages" 
              :key="msg.id"
              :class="{ 'message-self': msg.fromUserId === currentUserId }"
            >
              <el-avatar class="message-avatar">
                {{ msg.fromUserId === currentUserId ? '我' : selectedStaff.realName?.charAt(0) }}
              </el-avatar>
              <div class="message-content">
                <div class="message-text">{{ msg.content }}</div>
                <div class="message-time">{{ formatTime(msg.createTime) }}</div>
              </div>
            </div>
            <div v-if="messages.length === 0" class="no-messages">
              <el-empty description="暂无消息，开始对话吧" />
            </div>
          </div>
          <div class="chat-input">
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="输入消息..."
              @keyup.enter.ctrl="sendMessage"
            />
            <div class="input-actions">
              <span class="tip">按 Ctrl+Enter 发送</span>
              <el-button type="primary" @click="sendMessage" :disabled="!inputMessage.trim()">
                发送
              </el-button>
            </div>
          </div>
        </el-card>
        <el-card class="chat-card" v-else>
          <el-empty description="请选择一位客服开始咨询" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { getStaffList, getChatHistory } from '@/api/chat'

const userStore = useUserStore()
const staffList = ref([])
const selectedStaff = ref(null)
const messages = ref([])
const inputMessage = ref('')
const messagesContainer = ref(null)
const ws = ref(null)

const currentUserId = computed(() => userStore.user?.id)

const selectStaff = async (staff) => {
  selectedStaff.value = staff
  messages.value = []
  
  const res = await getChatHistory(staff.id)
  if (res.code === 200) {
    messages.value = res.data
  }
  
  scrollToBottom()
  connectWebSocket()
}

const connectWebSocket = () => {
  if (ws.value) {
    ws.value.close()
  }
  
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/ws/chat/${currentUserId.value}`
  ws.value = new WebSocket(wsUrl)
  
  ws.value.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    messages.value.push(msg)
    scrollToBottom()
  }
  
  ws.value.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
}

const sendMessage = () => {
  if (!inputMessage.value.trim() || !selectedStaff.value || !ws.value) return
  
  const message = {
    toUserId: selectedStaff.value.id,
    content: inputMessage.value.trim(),
    type: 'text'
  }
  
  ws.value.send(JSON.stringify(message))
  inputMessage.value = ''
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

onMounted(async () => {
  const res = await getStaffList()
  if (res.code === 200) {
    staffList.value = res.data
  }
})

watch(() => selectedStaff.value, () => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  min-height: calc(100vh - 100px);
}

.contact-list-card {
  height: calc(100vh - 180px);
}

.contact-list {
  height: 100%;
  overflow-y: auto;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 5px;
}

.contact-item:hover {
  background: #f5f7fa;
}

.contact-item.active {
  background: #ecf5ff;
}

.contact-info {
  margin-left: 12px;
}

.contact-name {
  font-weight: 500;
  color: #303133;
}

.contact-role {
  font-size: 12px;
  color: #909399;
}

.chat-card {
  height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
}

.message-item.message-self {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  margin: 0 12px;
}

.message-self .message-content {
  text-align: right;
}

.message-text {
  display: inline-block;
  padding: 10px 15px;
  background: #fff;
  border-radius: 12px;
  color: #303133;
  word-break: break-all;
}

.message-self .message-text {
  background: #409eff;
  color: #fff;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.chat-input {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.tip {
  color: #909399;
  font-size: 12px;
}

.no-messages {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
