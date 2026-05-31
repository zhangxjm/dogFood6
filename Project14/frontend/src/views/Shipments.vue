<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <h2>📦 货物追踪</h2>
      <el-button type="primary" @click="addVisible = true">新建运输单</el-button>
    </div>
    
    <el-card>
      <el-table :data="shipments" style="width: 100%" v-loading="loading">
        <el-table-column prop="tracking_number" label="运单号" width="160" />
        <el-table-column prop="product_name" label="货物名称" width="140" />
        <el-table-column prop="product_type" label="类型" width="100" />
        <el-table-column prop="origin" label="启运地" width="100" />
        <el-table-column prop="destination" label="目的地" width="100" />
        <el-table-column prop="device_id" label="设备ID" width="120" />
        <el-table-column label="温度范围" width="120">
          <template #default="{ row }">
            {{ row.min_temp }} ~ {{ row.max_temp }}°C
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="海关核验" width="100">
          <template #default="{ row }">
            <el-tag :type="row.customs_verified ? 'success' : 'info'" size="small">
              {{ row.customs_verified ? '已核验' : '待核验' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewTrace(row)">
              溯源
            </el-button>
            <el-button 
              v-if="!row.customs_verified" 
              type="success" 
              size="small" 
              @click="verifyCustoms(row)"
            >
              核验
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="addVisible" title="新建运输单" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="运单号">
          <el-input v-model="form.tracking_number" placeholder="例如：CC202405010004" />
        </el-form-item>
        <el-form-item label="货物名称">
          <el-input v-model="form.product_name" placeholder="例如：进口龙虾" />
        </el-form-item>
        <el-form-item label="货物类型">
          <el-select v-model="form.product_type" style="width: 100%">
            <el-option label="海鲜" value="海鲜" />
            <el-option label="肉类" value="肉类" />
            <el-option label="水果" value="水果" />
            <el-option label="蔬菜" value="蔬菜" />
            <el-option label="药品" value="药品" />
          </el-select>
        </el-form-item>
        <el-form-item label="启运地">
          <el-input v-model="form.origin" placeholder="例如：泰国" />
        </el-form-item>
        <el-form-item label="目的地">
          <el-input v-model="form.destination" placeholder="例如：中国北京" />
        </el-form-item>
        <el-form-item label="关联设备">
          <el-select v-model="form.device_id" style="width: 100%">
            <el-option 
              v-for="d in devices" 
              :key="d.device_id" 
              :label="d.device_name" 
              :value="d.device_id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="温度下限">
          <el-input-number v-model="form.min_temp" :precision="1" :step="0.5" />
          <span style="margin-left: 10px">°C</span>
        </el-form-item>
        <el-form-item label="温度上限">
          <el-input-number v-model="form.max_temp" :precision="1" :step="0.5" />
          <span style="margin-left: 10px">°C</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" @click="createShipment">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="verifyVisible" title="海关核验" width="500px">
      <el-form :model="verifyForm" label-width="100px">
        <el-form-item label="运单号">
          <span>{{ verifyForm.tracking_number }}</span>
        </el-form-item>
        <el-form-item label="海关编号">
          <el-input v-model="verifyForm.customs_code" placeholder="例如：CUS-BJ-20240501" />
        </el-form-item>
        <el-form-item label="核验人员">
          <el-input v-model="verifyForm.inspector" placeholder="例如：王海关" />
        </el-form-item>
        <el-form-item label="核验备注">
          <el-input type="textarea" v-model="verifyForm.remark" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="verifyVisible = false">取消</el-button>
        <el-button type="primary" @click="submitVerify">通过核验</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()
const shipments = ref([])
const devices = ref([])
const loading = ref(false)
const addVisible = ref(false)
const verifyVisible = ref(false)

const form = ref({
  tracking_number: '',
  product_name: '',
  product_type: '',
  origin: '',
  destination: '',
  device_id: '',
  min_temp: -2,
  max_temp: 5,
  status: '运输中'
})

const verifyForm = ref({
  tracking_number: '',
  customs_code: '',
  inspector: '',
  remark: ''
})

const fetchShipments = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/shipments')
    shipments.value = res.data
  } catch (e) {
    ElMessage.error('获取运输单列表失败')
  } finally {
    loading.value = false
  }
}

const fetchDevices = async () => {
  try {
    const res = await axios.get('/api/devices')
    devices.value = res.data.filter(d => d.status === 'online')
  } catch (e) {
    console.error(e)
  }
}

const getStatusType = (status) => {
  const map = {
    '运输中': 'primary',
    '清关中': 'warning',
    '已送达': 'success',
    '已取消': 'info'
  }
  return map[status] || 'info'
}

const viewTrace = (row) => {
  router.push(`/shipments/${row.tracking_number}`)
}

const verifyCustoms = (row) => {
  verifyForm.value.tracking_number = row.tracking_number
  verifyForm.value.customs_code = ''
  verifyForm.value.inspector = ''
  verifyForm.value.remark = ''
  verifyVisible.value = true
}

const submitVerify = async () => {
  try {
    await axios.put(`/api/shipments/${verifyForm.value.tracking_number}/verify`, verifyForm.value)
    ElMessage.success('海关核验通过')
    verifyVisible.value = false
    fetchShipments()
  } catch (e) {
    ElMessage.error('核验失败')
  }
}

const createShipment = async () => {
  try {
    await axios.post('/api/shipments', form.value)
    ElMessage.success('创建成功')
    addVisible.value = false
    fetchShipments()
  } catch (e) {
    ElMessage.error('创建失败')
  }
}

onMounted(() => {
  fetchShipments()
  fetchDevices()
})
</script>
