<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">自提核销</h1>
    </div>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="verify-card">
          <div class="verify-header">
            <el-icon class="verify-icon"><CollectionTag /></el-icon>
            <h2>输入取货码核销</h2>
          </div>
          
          <div class="verify-input-section">
            <el-input
              v-model="pickupCode"
              placeholder="请输入6位取货码"
              size="large"
              maxlength="6"
              style="width: 300px; margin-right: 10px;"
              @keyup.enter="handleVerify"
            >
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" size="large" @click="handleVerify" :loading="verifying">
              核销取货
            </el-button>
          </div>

          <div class="quick-actions">
            <h3>待取货订单</h3>
            <el-table :data="readyOrders" stripe size="small">
              <el-table-column prop="orderNo" label="订单号" width="180" />
              <el-table-column prop="customerName" label="客户" width="80" />
              <el-table-column prop="dessertName" label="甜品" width="120" />
              <el-table-column prop="quantity" label="数量" width="60" />
              <el-table-column label="取货码" width="100">
                <template #default="{ row }">
                  <el-tag type="success" effect="plain">{{ getPickupCode(row.id) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="quickVerify(row.id)">
                    快速核销
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="readyOrders.length === 0" description="暂无待取货订单" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card v-if="verifiedRecord" class="result-card success">
          <div class="result-icon success">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <h2 class="result-title">核销成功</h2>
          <div class="result-details">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="订单号">{{ verifiedRecord.orderNo }}</el-descriptions-item>
              <el-descriptions-item label="客户姓名">{{ verifiedRecord.customerName }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ verifiedRecord.customerPhone }}</el-descriptions-item>
              <el-descriptions-item label="取货码">
                <el-tag type="success" size="large">{{ verifiedRecord.pickupCode }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="核销时间">{{ formatDateTime(verifiedRecord.pickupTime) }}</el-descriptions-item>
              <el-descriptions-item label="备注">{{ verifiedRecord.remark }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="result-actions">
            <el-button type="primary" @click="resetVerify">继续核销</el-button>
          </div>
        </el-card>

        <el-card v-else class="result-card">
          <div class="result-icon">
            <el-icon><Search /></el-icon>
          </div>
          <h2 class="result-title">请输入取货码</h2>
          <p class="result-desc">输入客户提供的6位取货码完成核销</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { pickupApi, orderApi } from '@/api'
import dayjs from 'dayjs'

const pickupCode = ref('')
const verifying = ref(false)
const verifiedRecord = ref(null)
const readyOrders = ref([])
const pickupRecords = ref([])

const formatDateTime = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}

const loadReadyOrders = async () => {
  try {
    const res = await orderApi.getByProgress('READY')
    if (res.success) {
      readyOrders.value = res.data
    }
    
    const recordsRes = await pickupApi.getAll()
    if (recordsRes.success) {
      pickupRecords.value = recordsRes.data
    }
  } catch (error) {
    console.error('加载数据失败', error)
  }
}

const getPickupCode = (orderId) => {
  const record = pickupRecords.value.find(r => r.orderId === orderId)
  return record?.pickupCode || '-'
}

const handleVerify = async () => {
  if (!pickupCode.value || pickupCode.value.length !== 6) {
    ElMessage.warning('请输入6位取货码')
    return
  }
  
  verifying.value = true
  try {
    const res = await pickupApi.verify(pickupCode.value)
    if (res.success) {
      verifiedRecord.value = res.data
      ElMessage.success('核销成功')
      loadReadyOrders()
    } else {
      ElMessage.error(res.message || '取货码无效')
    }
  } catch (error) {
    ElMessage.error('核销失败')
  } finally {
    verifying.value = false
  }
}

const quickVerify = async (orderId) => {
  const record = pickupRecords.value.find(r => r.orderId === orderId)
  if (record) {
    pickupCode.value = record.pickupCode
    handleVerify()
  }
}

const resetVerify = () => {
  pickupCode.value = ''
  verifiedRecord.value = null
}

onMounted(() => {
  loadReadyOrders()
})
</script>

<style scoped>
.verify-card {
  min-height: 500px;
}

.verify-header {
  text-align: center;
  margin-bottom: 30px;
}

.verify-icon {
  font-size: 48px;
  color: #d2691e;
  margin-bottom: 10px;
}

.verify-header h2 {
  margin: 0;
  color: #8b4513;
}

.verify-input-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
}

.quick-actions {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.quick-actions h3 {
  margin: 0 0 16px 0;
  color: #8b4513;
  font-size: 16px;
}

.result-card {
  min-height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.result-icon {
  font-size: 64px;
  color: #d2691e;
  margin-bottom: 16px;
}

.result-icon.success {
  color: #67c23a;
}

.result-title {
  font-size: 24px;
  color: #333;
  margin: 0 0 8px 0;
}

.result-desc {
  color: #999;
  margin: 0;
}

.result-details {
  width: 100%;
  margin: 20px 0;
}

.result-actions {
  margin-top: 20px;
}
</style>
