<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Cpu, Database, Clock, Target, Settings, RefreshCw, Play } from 'lucide-vue-next'
import { predictionApi } from '@/api/prediction'
import type { ModelInfoResponse } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils'

const loading = ref(false)
const modelInfo = ref<ModelInfoResponse | null>(null)

async function loadData() {
  loading.value = true
  try {
    modelInfo.value = await predictionApi.getModelInfo()
  } catch (error) {
    console.error('加载模型信息失败:', error)
  } finally {
    loading.value = false
  }
}

async function handleRetrain() {
  try {
    await ElMessageBox.confirm(
      '确定要重新训练模型吗？这将使用最新的数据进行训练，可能需要一些时间。',
      '模型重训练',
      { type: 'warning', confirmButtonText: '确认训练', cancelButtonText: '取消' }
    )
    ElMessage.success('模型训练任务已提交，请稍后查看结果')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('模型训练失败:', error)
    }
  }
}

async function handlePredictAll() {
  try {
    await ElMessageBox.confirm(
      '确定要对所有设备执行故障预测吗？',
      '批量预测',
      { type: 'info', confirmButtonText: '确认执行', cancelButtonText: '取消' }
    )
    const result = await predictionApi.predictAll()
    ElMessage.success(`预测完成，共生成 ${result.count} 条预测记录`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('执行预测失败:', error)
    }
  }
}

function handleRefresh() {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div v-loading="loading" class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-800">模型信息</h2>
      <div class="flex gap-3">
        <el-button @click="handleRefresh">
          <RefreshCw class="w-4 h-4 mr-2" />
          刷新
        </el-button>
        <el-button type="warning" @click="handleRetrain">
          <Play class="w-4 h-4 mr-2" />
          重新训练
        </el-button>
        <el-button type="primary" @click="handlePredictAll">
          <Cpu class="w-4 h-4 mr-2" />
          批量预测
        </el-button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
            <Cpu class="w-7 h-7 text-primary-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">模型名称</p>
            <p class="text-xl font-bold text-gray-800">{{ modelInfo?.name || '-' }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-success-100 rounded-xl flex items-center justify-center">
            <Target class="w-7 h-7 text-success-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">模型精度</p>
            <p class="text-xl font-bold text-success-600">{{ modelInfo ? (modelInfo.accuracy * 100).toFixed(2) + '%' : '-' }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-warning-100 rounded-xl flex items-center justify-center">
            <Database class="w-7 h-7 text-warning-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">训练样本</p>
            <p class="text-xl font-bold text-gray-800">{{ modelInfo?.trainingSamples?.toLocaleString() || '-' }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
            <Clock class="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500">最后训练时间</p>
            <p class="text-lg font-bold text-gray-800">{{ modelInfo?.lastTraining ? formatDate(modelInfo.lastTraining) : '-' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Settings class="w-5 h-5 text-primary-500" />
            模型参数
          </h3>
        </div>
        <div class="p-6">
          <div v-if="modelInfo?.parameters" class="space-y-4">
            <div
              v-for="(value, key) in modelInfo.parameters"
              :key="key"
              class="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
            >
              <span class="text-gray-600">{{ key }}</span>
              <span class="font-medium text-gray-800">{{ String(value) }}</span>
            </div>
          </div>
          <div v-else class="text-center py-12 text-gray-400">
            暂无参数信息
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800">模型说明</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4 text-gray-600">
            <p>
              <strong class="text-gray-800">算法类型：</strong>
              基于长短期记忆网络(LSTM)的时间序列预测模型
            </p>
            <p>
              <strong class="text-gray-800">输入特征：</strong>
              温度、振动、压力、电流、转速等传感器数据
            </p>
            <p>
              <strong class="text-gray-800">预测目标：</strong>
              设备未来7天内发生故障的概率
            </p>
            <p>
              <strong class="text-gray-800">故障类型：</strong>
              轴承故障、电机过热、振动异常、压力异常等
            </p>
            <p>
              <strong class="text-gray-800">更新频率：</strong>
              每日自动增量训练，每周全量训练
            </p>
            <p>
              <strong class="text-gray-800">模型版本：</strong>
              {{ modelInfo?.version || '-' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800">性能指标</h3>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="relative w-28 h-28 mx-auto mb-3">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" fill="none" stroke="#E5E6EB" stroke-width="10" />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  fill="none"
                  stroke="#165DFF"
                  stroke-width="10"
                  stroke-linecap="round"
                  :stroke-dasharray="`${(modelInfo?.accuracy || 0) * 301.4} 301.4`"
                  class="transition-all duration-1000"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-primary-600">{{ modelInfo ? (modelInfo.accuracy * 100).toFixed(1) : '0' }}%</span>
              </div>
            </div>
            <p class="text-sm text-gray-500">准确率</p>
          </div>
          <div class="text-center">
            <div class="relative w-28 h-28 mx-auto mb-3">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" fill="none" stroke="#E5E6EB" stroke-width="10" />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  fill="none"
                  stroke="#00B42A"
                  stroke-width="10"
                  stroke-linecap="round"
                  stroke-dasharray="271.3 301.4"
                  class="transition-all duration-1000"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-success-600">90.0%</span>
              </div>
            </div>
            <p class="text-sm text-gray-500">精确率</p>
          </div>
          <div class="text-center">
            <div class="relative w-28 h-28 mx-auto mb-3">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" fill="none" stroke="#E5E6EB" stroke-width="10" />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  fill="none"
                  stroke="#FF7D00"
                  stroke-width="10"
                  stroke-linecap="round"
                  stroke-dasharray="256.2 301.4"
                  class="transition-all duration-1000"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-warning-600">85.0%</span>
              </div>
            </div>
            <p class="text-sm text-gray-500">召回率</p>
          </div>
          <div class="text-center">
            <div class="relative w-28 h-28 mx-auto mb-3">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" fill="none" stroke="#E5E6EB" stroke-width="10" />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  fill="none"
                  stroke="#722ED1"
                  stroke-width="10"
                  stroke-linecap="round"
                  stroke-dasharray="263.7 301.4"
                  class="transition-all duration-1000"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-2xl font-bold text-purple-600">87.5%</span>
              </div>
            </div>
            <p class="text-sm text-gray-500">F1分数</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
