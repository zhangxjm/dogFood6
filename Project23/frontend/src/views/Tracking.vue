<template>
  <div>
    <div class="common-card">
      <div class="page-header">
        <span class="page-title">物流追踪</span>
      </div>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="运单号">
          <el-input v-model="searchForm.trackingNumber" placeholder="请输入运单号" style="width: 300px;" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchTracking">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="selectedParcel" class="common-card">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="运单号">
          <span style="color: #409eff; font-weight: 600;">{{ selectedParcel.tracking_number }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(selectedParcel.status)" size="large">{{ getStatusText(selectedParcel.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="当前位置">
          {{ selectedParcel.current_warehouse?.name || '运输途中' }}
        </el-descriptions-item>
        <el-descriptions-item label="发件人">{{ selectedParcel.sender_name }}</el-descriptions-item>
        <el-descriptions-item label="收件人">{{ selectedParcel.receiver_name }}</el-descriptions-item>
        <el-descriptions-item label="目的地">
          {{ selectedParcel.receiver_city }}, {{ selectedParcel.receiver_country }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(selectedParcel.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="预计送达">
          {{ selectedParcel.estimated_delivery ? formatTime(selectedParcel.estimated_delivery) : '待计算' }}
        </el-descriptions-item>
        <el-descriptions-item label="实际送达">
          {{ selectedParcel.actual_delivery ? formatTime(selectedParcel.actual_delivery) : '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div v-if="trackingLogs.length > 0" class="common-card">
      <div class="page-header">
        <span class="page-title">物流轨迹</span>
      </div>
      <el-steps :active="trackingLogs.length" direction="vertical">
        <el-step
          v-for="(log, index) in trackingLogs"
          :key="log.id"
          :title="log.location"
          :description="log.remark"
          :status="index === trackingLogs.length - 1 ? 'success' : 'finish'"
        >
          <template #icon>
            <div class="step-icon" :class="getStepClass(log.status)">
              <el-icon><Location /></el-icon>
            </div>
          </template>
          <div class="step-time">{{ formatTime(log.created_at) }}</div>
          <div class="step-status">{{ getStatusText(log.status) }}</div>
        </el-step>
      </el-steps>
    </div>

    <el-empty v-if="!selectedParcel && !searching" description="请输入运单号查询物流信息" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getParcels, getParcelTracking } from '../api'

const searchForm = ref({
  trackingNumber: ''
})

const selectedParcel = ref(null)
const trackingLogs = ref([])
const searching = ref(false)

const searchTracking = async () => {
  if (!searchForm.value.trackingNumber) {
    ElMessage.warning('请输入运单号')
    return
  }
  
  searching.value = true
  try {
    const res = await getParcels()
    const parcel = res.data.find(p => p.tracking_number === searchForm.value.trackingNumber)
    
    if (!parcel) {
      ElMessage.error('未找到该运单号的包裹')
      selectedParcel.value = null
      trackingLogs.value = []
      return
    }
    
    selectedParcel.value = parcel
    
    const logRes = await getParcelTracking(parcel.id)
    trackingLogs.value = logRes.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  } catch (error) {
    ElMessage.error('查询失败')
  } finally {
    searching.value = false
  }
}

const getStatusType = (status) => {
  const types = {
    'created': 'info',
    'pending': 'warning',
    'sorted': 'primary',
    'routed': 'success',
    'shipped': 'warning',
    'in_transit': 'primary',
    'out_for_delivery': 'info',
    'delivered': 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'created': '已创建',
    'pending': '待处理',
    'sorted': '已分拣',
    'routed': '已规划路线',
    'shipped': '已发货',
    'in_transit': '运输中',
    'out_for_delivery': '派送中',
    'delivered': '已送达'
  }
  return texts[status] || status
}

const getStepClass = (status) => {
  if (status === 'delivered') return 'step-success'
  if (status === 'in_transit') return 'step-primary'
  return 'step-default'
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.step-default {
  background: #409eff;
}

.step-primary {
  background: #e6a23c;
}

.step-success {
  background: #67c23a;
}

.step-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.step-status {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

:deep(.el-step__title) {
  font-weight: 600;
  color: #303133;
}

:deep(.el-step__description) {
  color: #606266;
}
</style>
