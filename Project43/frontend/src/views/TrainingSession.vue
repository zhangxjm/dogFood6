<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { sessionAPI, commandAPI } from '@/api';
import type { TrainingCommand } from '@/api';
import dayjs from 'dayjs';
const route = useRoute();
const router = useRouter();
const sessionId = Number(route.params.sessionId);
const loading = ref(false);
const ending = ref(false);
const command = ref<TrainingCommand | null>(null);
const sessionData = reactive({
 startTime: '',
 duration: 0,
 commandCode: '',
 commandName: '',
 type: '',
 status: 'active'
});
let ws: WebSocket | null = null;
let timer: number | null = null;
let wsReconnectTimer: number | null = null;
const eegData = ref<any[]>([]);
const latestEEG = reactive({
 channels: [0, 0, 0, 0, 0, 0, 0, 0],
 quality: 0,
 timestamp: ''
});
const feedbackList = ref<any[]>([]);
const stats = reactive({
 totalSamples: 0,
 successCount: 0,
 avgConfidence: 0,
 confidenceHistory: [] as number[]
});
const eegChartData = reactive({
 times: [] as string[],
 channels: [[], [], [], [], [], [], [], []] as number[][]
});
const chartColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#8e44ad', '#16a085', '#d35400'];
const maxDataPoints = 100;
const eegChartOption = computed(() => ({
 grid: { top: 30, right: 20, bottom: 30, left: 50 },
 tooltip: {
 trigger: 'axis',
 formatter: (params: any) => {
 let html = `<div>${params[0].axisValue}</div>`;
 params.forEach((p: any) => {
 html += `<div style="color:${p.color}">${p.seriesName}: ${p.value.toFixed(2)}uV</div>`;
 });
 return html;
 }
 },
 legend: {
 data: ['CH1', 'CH2', 'CH3', 'CH4', 'CH5', 'CH6', 'CH7', 'CH8'],
 top: 0
 },
 xAxis: {
 type: 'category',
 data: eegChartData.times,
 axisLabel: { fontSize: 10 }
 },
 yAxis: {
 type: 'value',
 name: '幅值(uV)',
 nameTextStyle: { fontSize: 12 }
 },
 series: [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({
 name: `CH${i + 1}`,
 type: 'line',
 showSymbol: false,
 smooth: true,
 sampling: 'lttb',
 lineStyle: {
 width: 1.5,
 color: chartColors[i]
 },
 data: eegChartData.channels[i]
 }))
}));
const gaugeOption = computed(() => ({
 series: [{
 type: 'gauge',
 startAngle: 180,
 endAngle: 0,
 min: 0,
 max: 100,
 splitNumber: 5,
 radius: '100%',
 center: ['50%', '70%'],
 progress: {
 show: true,
 width: 20,
 itemStyle: {
 color: latestEEG.quality >= 80 ? '#67c23a' :
 latestEEG.quality >= 60 ? '#409eff' :
 latestEEG.quality >= 40 ? '#e6a23c' : '#f56c6c'
 }
 },
 axisLine: {
 lineStyle: {
 width: 20,
 color: [
 [0.4, '#f56c6c'],
 [0.6, '#e6a23c'],
 [0.8, '#409eff'],
 [1, '#67c23a']
 ]
 }
 },
 axisTick: { show: false },
 splitLine: {
 length: 10,
 lineStyle: { width: 2, color: '#999' }
 },
 axisLabel: {
 distance: -25,
 color: '#999',
 fontSize: 12
 },
 pointer: {
 show: true,
 length: '60%',
 width: 6
 },
 anchor: {
 show: true,
 size: 20,
 itemStyle: { borderWidth: 2, borderColor: '#fff' }
 },
 title: {
 offsetCenter: [0, '-10%'],
 fontSize: 14,
 color: '#666'
 },
 detail: {
 fontSize: 28,
 fontWeight: 'bold',
 offsetCenter: [0, '5%'],
 valueAnimation: true,
 formatter: '{value}%',
 color: latestEEG.quality >= 80 ? '#67c23a' :
 latestEEG.quality >= 60 ? '#409eff' :
 latestEEG.quality >= 40 ? '#e6a23c' : '#f56c6c'
 },
 data: [{ value: Math.round(latestEEG.quality), name: '信号质量' }]
 }]
}));
const accuracyGaugeOption = computed(() => ({
 series: [{
 type: 'gauge',
 startAngle: 180,
 endAngle: 0,
 min: 0,
 max: 100,
 radius: '80%',
 center: ['50%', '75%'],
 progress: {
 show: true,
 width: 12,
 itemStyle: {
 color: '#409eff'
 }
 },
 axisLine: {
 lineStyle: {
 width: 12,
 color: [[1, '#e2e8f0']]
 }
 },
 axisTick: { show: false },
 splitLine: { show: false },
 axisLabel: { show: false },
 pointer: { show: false },
 title: {
 show: false
 },
 detail: {
 fontSize: 24,
 fontWeight: 'bold',
 offsetCenter: [0, '10%'],
 valueAnimation: true,
 formatter: '{value}%',
 color: '#409eff'
 },
 data: [{ value: stats.avgConfidence, name: '平均置信度' }]
 }]
}));
const initWebSocket = () => {
 const token = localStorage.getItem('token');
 const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
 const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}&session_id=${sessionId}&command=${sessionData.commandCode}`;
 try {
 ws = new WebSocket(wsUrl);
 ws.onopen = () => {
 console.log('WebSocket connected');
 ElMessage.success('脑电信号连接已建立');
 };
 ws.onmessage = (event) => {
 try {
 const msg = JSON.parse(event.data);
 if (msg.type === 'eeg_data') {
 handleEEGData(msg.data);
 }
 else if (msg.type === 'command_feedback') {
 handleFeedback(msg.data);
 }
 }
 catch (e) {
 console.error('Parse message error:', e);
 }
 };
 ws.onerror = (error) => {
 console.error('WebSocket error:', error);
 };
 ws.onclose = () => {
 console.log('WebSocket closed');
 if (sessionData.status === 'active') {
 wsReconnectTimer = window.setTimeout(() => {
 if (sessionData.status === 'active') {
 initWebSocket();
 }
 }, 3000);
 }
 };
 }
 catch (e) {
 console.error('Failed to connect WebSocket:', e);
 }
};
const handleEEGData = (data: any) => {
 latestEEG.channels = [...data.channels];
 latestEEG.quality = data.quality;
 latestEEG.timestamp = dayjs(data.timestamp).format('HH:mm:ss');
 eegData.value.push(data);
 if (eegData.value.length > 200) {
 eegData.value.shift();
 }
 stats.totalSamples++;
 const timeStr = dayjs(data.timestamp).format('mm:ss.SSS');
 eegChartData.times.push(timeStr);
 for (let i = 0; i < 8; i++) {
 eegChartData.channels[i].push(data.channels[i]);
 }
 if (eegChartData.times.length > maxDataPoints) {
 eegChartData.times.shift();
 for (let i = 0; i < 8; i++) {
 eegChartData.channels[i].shift();
 }
 }
};
const handleFeedback = (data: any) => {
 feedbackList.value.unshift({
 ...data,
 timestamp: dayjs().format('HH:mm:ss')
 });
 if (feedbackList.value.length > 10) {
 feedbackList.value.pop();
 }
 stats.confidenceHistory.push(data.confidence);
 if (stats.confidenceHistory.length > 50) {
 stats.confidenceHistory.shift();
 }
 stats.avgConfidence = stats.confidenceHistory.reduce((a, b) => a + b, 0) / stats.confidenceHistory.length;
 stats.avgConfidence = Math.round(stats.avgConfidence * 10) / 10;
 if (data.success) {
 stats.successCount++;
 }
};
const loadSessionData = async () => {
 loading.value = true;
 try {
 const commands = await commandAPI.getCommands();
 const sessions = await sessionAPI.list();
 const session = sessions.find(s => s.id === sessionId);
 if (session) {
 sessionData.startTime = session.start_time;
 sessionData.commandCode = session.command;
 sessionData.type = session.type;
 sessionData.status = session.status;
 command.value = commands.find(c => c.code === session.command) || null;
 sessionData.commandName = command.value?.name || session.command;
 if (session.status !== 'active') {
 ElMessage.warning('该训练会话已结束');
 router.push('/training');
 return;
 }
 initWebSocket();
 startTimer();
 }
 else {
 ElMessage.error('训练会话不存在');
 router.push('/training');
 }
 }
 catch (e) {
 console.error('Failed to load session:', e);
 }
 finally {
 loading.value = false;
 }
};
const startTimer = () => {
 timer = window.setInterval(() => {
 sessionData.duration++;
 }, 1000);
};
const formatDuration = (seconds: number) => {
 const hrs = Math.floor(seconds / 3600);
 const mins = Math.floor((seconds % 3600) / 60);
 const secs = seconds % 60;
 if (hrs > 0) {
 return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
 }
 return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
const endTraining = async () => {
 try {
 await ElMessageBox.confirm('确定要结束本次训练吗？', '结束训练', {
 confirmButtonText: '确定',
 cancelButtonText: '取消',
 type: 'warning'
 });
 ending.value = true;
 const result = await sessionAPI.end(sessionId);
 sessionData.status = 'completed';
 if (ws) {
 ws.close();
 ws = null;
 }
 if (timer) {
 clearInterval(timer);
 timer = null;
 }
 ElMessageBox.alert(`
 <div style="text-align: center; padding: 20px 0;">
 <h3 style="margin-bottom: 20px;">训练完成！</h3>
 <el-row :gutter="20">
 <el-col :span="8">
 <div style="font-size: 14px; color: #909399;">训练时长</div>
 <div style="font-size: 24px; font-weight: bold; color: #409eff;">${formatDuration(result.duration)}</div>
 </el-col>
 <el-col :span="8">
 <div style="font-size: 14px; color: #909399;">平均准确率</div>
 <div style="font-size: 24px; font-weight: bold; color: #67c23a;">${result.avg_accuracy}%</div>
 </el-col>
 <el-col :span="8">
 <div style="font-size: 14px; color: #909399;">成功率</div>
 <div style="font-size: 24px; font-weight: bold; color: #e6a23c;">${result.success_rate}%</div>
 </el-col>
 </el-row>
 </div>
 `, '训练报告', {
 confirmButtonText: '查看详情',
 dangerouslyUseHTMLString: true
 }).then(() => {
 router.push(`/eeg-monitor/${sessionId}`);
 });
 }
 catch (e) {
 ending.value = false;
 if (e !== 'cancel') {
 console.error('Failed to end training:', e);
 }
 }
};
const getQualityClass = (quality: number) => {
 if (quality >= 80)
 return 'quality-excellent';
 if (quality >= 60)
 return 'quality-good';
 if (quality >= 40)
 return 'quality-medium';
 return 'quality-poor';
};
const getQualityText = (quality: number) => {
 if (quality >= 80)
 return '优秀';
 if (quality >= 60)
 return '良好';
 if (quality >= 40)
 return '一般';
 return '较差';
};
onMounted(() => {
 loadSessionData();
});
onBeforeUnmount(() => {
 if (ws) {
 ws.close();
 ws = null;
 }
 if (timer) {
 clearInterval(timer);
 timer = null;
 }
 if (wsReconnectTimer) {
 clearTimeout(wsReconnectTimer);
 wsReconnectTimer = null;
 }
});
</script>

<template>
  <div v-loading="loading" class="training-session-container">
    <div class="session-header">
      <div class="session-info">
        <div class="back-btn" @click="router.push('/training')">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </div>
        <div class="session-details">
          <h2 class="session-title">
            <el-icon class="training-icon training-active" color="#409eff"><Cpu /></el-icon>
            {{ sessionData.commandName }}
          </h2>
          <div class="session-meta">
            <el-tag size="small" type="info">{{ sessionData.type }}</el-tag>
            <span class="meta-item">
              <el-icon><Timer /></el-icon>
              {{ formatDuration(sessionData.duration) }}
            </span>
            <span class="meta-item">
              <span :class="['quality-indicator', getQualityClass(latestEEG.quality)]"></span>
              {{ getQualityText(latestEEG.quality) }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="session-actions">
        <el-button
          type="danger"
          size="large"
          :loading="ending"
          @click="endTraining"
        >
          <el-icon><SwitchButton /></el-icon>
          结束训练
        </el-button>
      </div>
    </div>
    
    <el-row :gutter="20" class="main-content">
      <el-col :xs="24" :lg="16">
        <el-card class="card-shadow eeg-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon color="#409eff"><Monitor /></el-icon>
                实时脑电信号
              </span>
              <span class="timestamp">{{ latestEEG.timestamp }}</span>
            </div>
          </template>
          
          <div class="eeg-chart-container">
            <v-chart :option="eegChartOption" autoresize style="height: 350px; width: 100%;" />
          </div>
          
          <div class="channel-grid">
            <div
              v-for="(value, idx) in latestEEG.channels"
              :key="idx"
              class="channel-item"
            >
              <div class="channel-label" :style="{ color: chartColors[idx] }">
                CH{{ idx + 1 }}
              </div>
              <div class="channel-value" :style="{ color: chartColors[idx] }">
                {{ value.toFixed(2) }}
              </div>
              <div class="channel-unit">uV</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="8" class="right-column">
        <el-card class="card-shadow quality-card">
          <template #header>
            <span class="card-title">
              <el-icon color="#67c23a"><Aim /></el-icon>
              信号质量
            </span>
          </template>
          <div class="gauge-container">
            <v-chart :option="gaugeOption" autoresize style="height: 180px; width: 100%;" />
          </div>
          <div class="quality-stats">
            <div class="stat-item">
              <span class="stat-label">采样数</span>
              <span class="stat-value">{{ stats.totalSamples }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">成功次数</span>
              <span class="stat-value success">{{ stats.successCount }}</span>
            </div>
          </div>
        </el-card>
        
        <el-card class="card-shadow accuracy-card" style="margin-top: 20px;">
          <template #header>
            <span class="card-title">
              <el-icon color="#e6a23c"><TrendCharts /></el-icon>
              置信度
            </span>
          </template>
          <div class="gauge-container">
            <v-chart :option="accuracyGaugeOption" autoresize style="height: 140px; width: 100%;" />
          </div>
        </el-card>
        
        <el-card class="card-shadow feedback-card" style="margin-top: 20px;">
          <template #header>
            <span class="card-title">
              <el-icon color="#409eff"><Comment /></el-icon>
              实时反馈
            </span>
          </template>
          <div class="feedback-list">
            <div
              v-for="(fb, idx) in feedbackList"
              :key="idx"
              class="feedback-item"
              :class="fb.success ? 'feedback-success' : 'feedback-warning'"
            >
              <div class="feedback-header">
                <span class="feedback-confidence" :class="{ 'text-success': fb.success }">
                  {{ fb.confidence }}%
                </span>
                <span class="feedback-time">{{ fb.timestamp }}</span>
              </div>
              <div class="feedback-text">{{ fb.feedback }}</div>
            </div>
            <el-empty v-if="feedbackList.length === 0" description="等待训练反馈..." :image-size="60" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.training-session-container {
  padding: 0;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: white;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  margin-right: 16px;
}

.back-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.session-info {
  display: flex;
  align-items: center;
}

.session-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: bold;
  color: #1e293b;
  margin: 0;
}

.training-icon {
  font-size: 24px;
}

.session-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #64748b;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.timestamp {
  font-size: 13px;
  color: #94a3b8;
}

.eeg-chart-container {
  padding: 10px 0;
}

.channel-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.channel-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.channel-label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
}

.channel-value {
  font-size: 20px;
  font-weight: bold;
}

.channel-unit {
  font-size: 11px;
  color: #94a3b8;
}

.quality-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #1e293b;
}

.stat-value.success {
  color: #67c23a;
}

.feedback-list {
  max-height: 200px;
  overflow-y: auto;
}

.feedback-item {
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.feedback-confidence {
  font-weight: bold;
  font-size: 16px;
}

.feedback-confidence.text-success {
  color: #28a745;
}

.feedback-time {
  font-size: 11px;
  color: #6c757d;
}

.feedback-text {
  font-size: 13px;
  color: #495057;
}

.right-column {
  display: flex;
  flex-direction: column;
}

.quality-card,
.accuracy-card,
.feedback-card {
  flex-shrink: 0;
}

:deep(.el-card__body) {
  padding: 16px;
}
</style>
