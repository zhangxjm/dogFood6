<template>
  <div>
    <h2 style="margin-bottom: 20px">⚠️ 告警中心</h2>
    
    <el-card>
      <el-table :data="alerts" style="width: 100%" v-loading="loading">
        <el-table-column prop="alert_type" label="告警类型" width="120" />
        <el-table-column prop="device_id" label="设备ID" width="120" />
        <el-table-column prop="tracking_number" label="关联运单" width="160" />
        <el-table-column prop="message" label="告警消息" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="row.level === 'critical' ? 'danger' : 'warning'" size="small">
              {{ row.level === 'critical' ? '严重' : '警告' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="告警时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="resolved" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.resolved ? 'success' : 'danger'" size="small">
              {{ row.resolved ? '已处理' : '未处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button 
              v-if="!row.resolved" 
              type="success" 
              size="small" 
              @click="resolveAlert(row)"
            >
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const alerts = ref([])
const loading = ref(false)

const fetchAlerts = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/alerts')
    alerts.value = res.data
  } catch (e) {
    ElMessage.error('获取告警列表失败')
  } finally {
    loading.value = false
  }
}

const resolveAlert = async (row) => {
  try {
    await ElMessageBox.confirm('确认标记该告警为已处理？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await axios.put(`/api/alerts/${row.id}/resolve`)
    ElMessage.success('告警已处理')
    fetchAlerts()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const formatTime = (time) => {
  return new Date(time).toLocaleString()
}

onMounted(fetchAlerts)
</script>
