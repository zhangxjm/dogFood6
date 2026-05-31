<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, RefreshCw, Play, TrendingDown, Eye } from 'lucide-vue-next'
import { predictionApi } from '@/api/prediction'
import { deviceApi } from '@/api/device'
import { formatDate, getStatusText, getRiskColor, getPriorityColor } from '@/utils'
import type { Prediction, PaginatedResponse, Device } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)
const predictionList = ref<Prediction[]>([])
const deviceList = ref<Device[]>([])

const searchForm = reactive({
  deviceId: '',
  riskLevel: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const riskLevelOptions = [
  { value: '', label: '全部等级' },
  { value: 'low', label: '低风险' },
  { value: 'medium', label: '中风险' },
  { value: 'high', label: '高风险' },
  { value: 'critical', label: '严重风险' }
]

const faultTypes = [
  { value: 'bearing_failure', label: '轴承故障' },
  { value: 'motor_overheat', label: '电机过热' },
  { value: 'vibration_anomaly', label: '振动异常' },
  { value: 'pressure_anomaly', label: '压力异常' },
  { value: 'temperature_anomaly', label: '温度异常' },
  { value: 'flow_anomaly', label: '流量异常' }
]

async function loadDevices() {
  try {
    const response = await deviceApi.list({ pageSize: 1000 })
    deviceList.value = response.items
  } catch (error) {
    console.error('加载设备列表失败:', error)
  }
}

async function loadData() {
  loading.value = true
  try {
    const response: PaginatedResponse<Prediction> = await predictionApi.list({
      page: pagination.page,
      pageSize: pagination.pageSize,
      deviceId: searchForm.deviceId ? Number(searchForm.deviceId) : undefined,
      riskLevel: searchForm.riskLevel || undefined
    })
    
    predictionList.value = response.items
    pagination.total = response.total
  } catch (error) {
    console.error('加载预测列表失败:', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleReset() {
  searchForm.deviceId = ''
  searchForm.riskLevel = ''
  pagination.page = 1
  loadData()
}

function handleSizeChange(size: number) {
  pagination.pageSize = size
  pagination.page = 1
  loadData()
}

function handleCurrentChange(page: number) {
  pagination.page = page
  loadData()
}

async function handlePredict() {
  try {
    await ElMessageBox.confirm(
      '确定要对所有设备执行故障预测吗？这可能需要一些时间。',
      '执行预测',
      { type: 'info', confirmButtonText: '确认执行', cancelButtonText: '取消' }
    )
    
    const result = await predictionApi.predictAll()
    ElMessage.success(`预测完成，共生成 ${result.count} 条预测记录`)
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('执行预测失败:', error)
    }
  }
}

function getFaultTypeLabel(type: string): string {
  const found = faultTypes.find(f => f.value === type)
  return found?.label || type
}

function viewDeviceDetail(deviceId: number) {
  router.push(`/devices/${deviceId}`)
}

onMounted(() => {
  loadDevices()
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <el-form :model="searchForm" inline label-width="80px">
        <el-form-item label="设备">
          <el-select
            v-model="searchForm.deviceId"
            placeholder="全部设备"
            clearable
            filterable
            class="w-48"
          >
            <el-option
              v-for="device in deviceList"
              :key="device.id"
              :label="device.name"
              :value="String(device.id)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="风险等级">
          <el-select v-model="searchForm.riskLevel" placeholder="全部等级" clearable class="w-40">
            <el-option
              v-for="item in riskLevelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <Search class="w-4 h-4 mr-2" />
            查询
          </el-button>
          <el-button @click="handleReset">
            <RefreshCw class="w-4 h-4 mr-2" />
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <TrendingDown class="w-5 h-5 text-warning-500" />
          故障预测列表
        </h3>
        <el-button type="primary" @click="handlePredict">
          <Play class="w-4 h-4 mr-2" />
          执行预测
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="predictionList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="deviceName" label="设备名称" min-width="160" />
        <el-table-column label="故障类型" width="140">
          <template #default="{ row }">
            {{ getFaultTypeLabel(row.faultType) }}
          </template>
        </el-table-column>
        <el-table-column label="故障概率" width="120">
          <template #default="{ row }">
            <span
              class="font-semibold"
              :style="{ color: row.probability > 0.7 ? '#F53F3F' : row.probability > 0.5 ? '#FF7D00' : '#165DFF' }"
            >
              {{ (row.probability * 100).toFixed(1) }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="风险等级" width="120">
          <template #default="{ row }">
            <el-tag
              :type="row.riskLevel === 'critical' || row.riskLevel === 'high' ? 'danger' : row.riskLevel === 'medium' ? 'warning' : 'success'"
              size="small"
              effect="light"
            >
              {{ getStatusText(row.riskLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预测发生时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.predictedDate, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column prop="modelVersion" label="模型版本" width="120" />
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="viewDeviceDetail(row.deviceId)">
              <Eye class="w-4 h-4" />
              查看设备
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <div class="text-sm text-gray-500">
          共 {{ pagination.total }} 条记录
        </div>
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
