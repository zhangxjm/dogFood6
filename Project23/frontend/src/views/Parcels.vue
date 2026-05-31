<template>
  <div>
    <div class="common-card">
      <div class="page-header">
        <span class="page-title">包裹管理</span>
        <el-button type="primary" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          新建包裹
        </el-button>
      </div>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="运单号">
          <el-input v-model="searchForm.trackingNumber" placeholder="请输入运单号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 150px;">
            <el-option label="待处理" value="pending" />
            <el-option label="已分拣" value="sorted" />
            <el-option label="已规划路线" value="routed" />
            <el-option label="已发货" value="shipped" />
            <el-option label="运输中" value="in_transit" />
            <el-option label="派送中" value="out_for_delivery" />
            <el-option label="已送达" value="delivered" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadParcels">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="filteredParcels" style="width: 100%">
        <el-table-column prop="tracking_number" label="运单号" width="180">
          <template #default="{ row }">
            <span style="color: #409eff; cursor: pointer;" @click="viewDetail(row)">{{ row.tracking_number }}</span>
          </template>
        </el-table-column>
        <el-table-column label="发件人" width="150">
          <template #default="{ row }">
            {{ row.sender_name }}
          </template>
        </el-table-column>
        <el-table-column label="收件人" width="150">
          <template #default="{ row }">
            {{ row.receiver_name }}
          </template>
        </el-table-column>
        <el-table-column label="目的地" width="200">
          <template #default="{ row }">
            {{ row.receiver_city }}, {{ row.receiver_country }}
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(kg)" width="100" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="当前仓库" width="150">
          <template #default="{ row }">
            {{ row.current_warehouse?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="目标仓库" width="150">
          <template #default="{ row }">
            {{ row.target_warehouse?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">详情</el-button>
            <el-button size="small" type="primary" @click="processSort(row)" :disabled="row.status !== 'pending'">分拣</el-button>
            <el-button size="small" type="success" @click="processRoute(row)" :disabled="row.status !== 'sorted'">规划路线</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="showAddDialog" title="新建包裹" width="600px">
      <el-form :model="parcelForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发件人姓名">
              <el-input v-model="parcelForm.sender_name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发件人城市">
              <el-input v-model="parcelForm.sender_city" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="发件人地址">
          <el-input v-model="parcelForm.sender_address" />
        </el-form-item>
        <el-form-item label="发件人国家">
          <el-input v-model="parcelForm.sender_country" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="收件人姓名">
              <el-input v-model="parcelForm.receiver_name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收件人城市">
              <el-input v-model="parcelForm.receiver_city" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="收件人地址">
          <el-input v-model="parcelForm.receiver_address" />
        </el-form-item>
        <el-form-item label="收件人国家">
          <el-input v-model="parcelForm.receiver_country" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="重量(kg)">
              <el-input-number v-model="parcelForm.weight" :min="0" :step="0.1" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="长(cm)">
              <el-input-number v-model="parcelForm.length" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="宽(cm)">
              <el-input-number v-model="parcelForm.width" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="高(cm)">
          <el-input-number v-model="parcelForm.height" :min="0" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="收件人纬度">
              <el-input-number v-model="parcelForm.receiver_lat" :precision="6" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收件人经度">
              <el-input-number v-model="parcelForm.receiver_lng" :precision="6" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="createParcel">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetailDialog" title="包裹详情" width="700px">
      <el-descriptions v-if="selectedParcel" :column="2" border>
        <el-descriptions-item label="运单号">{{ selectedParcel.tracking_number }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(selectedParcel.status)">{{ getStatusText(selectedParcel.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发件人">{{ selectedParcel.sender_name }}</el-descriptions-item>
        <el-descriptions-item label="发件人城市">{{ selectedParcel.sender_city }}</el-descriptions-item>
        <el-descriptions-item label="收件人">{{ selectedParcel.receiver_name }}</el-descriptions-item>
        <el-descriptions-item label="收件人城市">{{ selectedParcel.receiver_city }}</el-descriptions-item>
        <el-descriptions-item label="收件人地址">{{ selectedParcel.receiver_address }}</el-descriptions-item>
        <el-descriptions-item label="收件人国家">{{ selectedParcel.receiver_country }}</el-descriptions-item>
        <el-descriptions-item label="重量">{{ selectedParcel.weight }} kg</el-descriptions-item>
        <el-descriptions-item label="尺寸">{{ selectedParcel.length }}x{{ selectedParcel.width }}x{{ selectedParcel.height }} cm</el-descriptions-item>
        <el-descriptions-item label="当前仓库">{{ selectedParcel.current_warehouse?.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="目标仓库">{{ selectedParcel.target_warehouse?.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(selectedParcel.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="预计送达">{{ selectedParcel.estimated_delivery ? formatTime(selectedParcel.estimated_delivery) : '-' }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="selectedParcel" class="tracking-section">
        <h4>物流轨迹</h4>
        <el-timeline>
          <el-timeline-item
            v-for="log in trackingLogs"
            :key="log.id"
            :timestamp="formatTime(log.created_at)"
            :type="getTimelineType(log.status)"
          >
            <h4>{{ log.location }}</h4>
            <p>{{ getStatusText(log.status) }} - {{ log.remark }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getParcels, createParcel as apiCreateParcel, getParcelTracking, processSorting, processRouting } from '../api'

const parcels = ref([])
const trackingLogs = ref([])
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const selectedParcel = ref(null)

const searchForm = ref({
  trackingNumber: '',
  status: ''
})

const parcelForm = ref({
  sender_name: '',
  sender_address: '',
  sender_city: '',
  sender_country: '',
  receiver_name: '',
  receiver_address: '',
  receiver_city: '',
  receiver_country: '',
  weight: 0,
  length: 0,
  width: 0,
  height: 0,
  receiver_lat: 0,
  receiver_lng: 0
})

const filteredParcels = computed(() => {
  return parcels.value.filter(p => {
    const matchTracking = !searchForm.value.trackingNumber || p.tracking_number.includes(searchForm.value.trackingNumber)
    const matchStatus = !searchForm.value.status || p.status === searchForm.value.status
    return matchTracking && matchStatus
  })
})

const loadParcels = async () => {
  try {
    const res = await getParcels()
    parcels.value = res.data
  } catch (error) {
    ElMessage.error('加载包裹列表失败')
  }
}

const resetSearch = () => {
  searchForm.value = { trackingNumber: '', status: '' }
  loadParcels()
}

const createParcel = async () => {
  try {
    await apiCreateParcel(parcelForm.value)
    ElMessage.success('包裹创建成功，已自动进入分拣队列')
    showAddDialog.value = false
    loadParcels()
    parcelForm.value = {
      sender_name: '',
      sender_address: '',
      sender_city: '',
      sender_country: '',
      receiver_name: '',
      receiver_address: '',
      receiver_city: '',
      receiver_country: '',
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      receiver_lat: 0,
      receiver_lng: 0
    }
  } catch (error) {
    ElMessage.error('创建包裹失败')
  }
}

const viewDetail = async (row) => {
  selectedParcel.value = row
  try {
    const res = await getParcelTracking(row.id)
    trackingLogs.value = res.data
  } catch (error) {
    trackingLogs.value = []
  }
  showDetailDialog.value = true
}

const processSort = async (row) => {
  try {
    await processSorting(row.id)
    ElMessage.success('分拣任务已提交')
    setTimeout(loadParcels, 1000)
  } catch (error) {
    ElMessage.error('分拣失败')
  }
}

const processRoute = async (row) => {
  try {
    await processRouting(row.id)
    ElMessage.success('路线规划任务已提交')
    setTimeout(loadParcels, 1000)
  } catch (error) {
    ElMessage.error('路线规划失败')
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

const getTimelineType = (status) => {
  if (status === 'delivered') return 'success'
  if (status === 'created') return 'primary'
  return ''
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadParcels()
})
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}

.tracking-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

.tracking-section h4 {
  margin-bottom: 16px;
  color: #303133;
}
</style>
