<template>
  <div>
    <div class="common-card">
      <div class="page-header">
        <span class="page-title">分拣调度中心</span>
        <div>
          <el-button type="primary" @click="processAllPending">
            <el-icon><Operation /></el-icon>
            批量分拣待处理包裹
          </el-button>
          <el-button type="success" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <div class="mini-stat pending">
            <div class="mini-count">{{ pendingCount }}</div>
            <div class="mini-label">待分拣</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="mini-stat sorted">
            <div class="mini-count">{{ sortedCount }}</div>
            <div class="mini-label">已分拣</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="mini-stat routed">
            <div class="mini-count">{{ routedCount }}</div>
            <div class="mini-label">已规划路线</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="mini-stat shipped">
            <div class="mini-count">{{ shippedCount }}</div>
            <div class="mini-label">已发货</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="common-card">
      <div class="page-header">
        <span class="page-title">待分拣包裹</span>
        <el-tag type="warning" size="large">{{ pendingParcels.length }} 个包裹等待分拣</el-tag>
      </div>

      <el-table :data="pendingParcels" style="width: 100%">
        <el-table-column prop="tracking_number" label="运单号" width="180" />
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
        <el-table-column label="收件人坐标" width="200">
          <template #default="{ row }">
            {{ row.receiver_lat.toFixed(4) }}, {{ row.receiver_lng.toFixed(4) }}
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(kg)" width="100" />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="sortSingle(row)">智能分拣</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="common-card">
      <div class="page-header">
        <span class="page-title">分拣结果预览</span>
      </div>

      <div v-if="sortingResults.length > 0" class="sorting-results">
        <div v-for="result in sortingResults" :key="result.id" class="result-card">
          <div class="result-header">
            <el-icon size="24" color="#67c23a"><CircleCheck /></el-icon>
            <span class="result-tracking">{{ result.tracking_number }}</span>
          </div>
          <div class="result-body">
            <div class="route-line">
              <div class="route-point start">
                <div class="point-label">起点</div>
                <div class="point-name">{{ result.source_warehouse }}</div>
              </div>
              <div class="route-arrow">
                <el-icon size="20"><Right /></el-icon>
                <span class="distance">{{ result.distance }} km</span>
              </div>
              <div class="route-point end">
                <div class="point-label">分配仓库</div>
                <div class="point-name">{{ result.target_warehouse }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无分拣结果" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getParcels, processSorting, getWarehouses } from '../api'

const parcels = ref([])
const warehouses = ref([])
const sortingResults = ref([])

const pendingParcels = computed(() => parcels.value.filter(p => p.status === 'pending'))
const pendingCount = computed(() => pendingParcels.value.length)
const sortedCount = computed(() => parcels.value.filter(p => p.status === 'sorted').length)
const routedCount = computed(() => parcels.value.filter(p => p.status === 'routed').length)
const shippedCount = computed(() => parcels.value.filter(p => ['shipped', 'in_transit', 'out_for_delivery', 'delivered'].includes(p.status)).length)

const loadData = async () => {
  try {
    const [parcelsRes, warehousesRes] = await Promise.all([
      getParcels(),
      getWarehouses()
    ])
    parcels.value = parcelsRes.data
    warehouses.value = warehousesRes.data
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

const refreshData = () => {
  loadData()
  ElMessage.success('已刷新')
}

const sortSingle = async (row) => {
  try {
    await processSorting(row.id)
    ElMessage.success('分拣任务已提交')
    
    setTimeout(async () => {
      await loadData()
      
      const sortedParcel = parcels.value.find(p => p.id === row.id)
      if (sortedParcel && sortedParcel.target_warehouse) {
        sortingResults.value.unshift({
          id: row.id,
          tracking_number: row.tracking_number,
          source_warehouse: '收件',
          target_warehouse: sortedParcel.target_warehouse.name,
          distance: calculateDistance(row.receiver_lat, row.receiver_lng, sortedParcel.target_warehouse.latitude, sortedParcel.target_warehouse.longitude).toFixed(2)
        })
      }
    }, 1500)
  } catch (error) {
    ElMessage.error('分拣失败')
  }
}

const processAllPending = async () => {
  if (pendingParcels.value.length === 0) {
    ElMessage.warning('没有待分拣的包裹')
    return
  }

  ElMessage.info(`开始批量分拣 ${pendingParcels.value.length} 个包裹...`)
  
  for (const parcel of pendingParcels.value) {
    await processSorting(parcel.id)
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  setTimeout(async () => {
    await loadData()
    ElMessage.success(`已完成 ${pendingParcels.value.length} 个包裹的分拣`)
  }, 2000)
}

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371.0
  const dLat = (lat2 - lat1) * Math.PI / 180.0
  const dLng = (lng2 - lng1) * Math.PI / 180.0
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180.0)*Math.cos(lat2*Math.PI/180.0)*
    Math.sin(dLng/2)*Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.stats-row {
  margin-bottom: 20px;
}

.mini-stat {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: #fff;
}

.mini-stat.pending {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.mini-stat.sorted {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.mini-stat.routed {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.mini-stat.shipped {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.mini-count {
  font-size: 32px;
  font-weight: bold;
}

.mini-label {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.sorting-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #67c23a;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.result-tracking {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.result-body {
  background: #fff;
  border-radius: 6px;
  padding: 16px;
}

.route-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.route-point {
  flex: 1;
  text-align: center;
}

.point-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.point-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.route-point.start .point-name {
  color: #409eff;
}

.route-point.end .point-name {
  color: #67c23a;
}

.route-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #909399;
  padding: 0 20px;
}

.distance {
  font-size: 12px;
}
</style>
