<template>
  <div>
    <div class="common-card">
      <div class="page-header">
        <span class="page-title">仓库管理</span>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          新增仓库
        </el-button>
      </div>

      <el-table :data="warehouses" style="width: 100%">
        <el-table-column prop="name" label="仓库名称" width="180" />
        <el-table-column prop="address" label="地址" width="200" />
        <el-table-column prop="city" label="城市" width="120" />
        <el-table-column prop="country" label="国家" width="120" />
        <el-table-column label="坐标" width="200">
          <template #default="{ row }">
            {{ row.latitude.toFixed(4) }}, {{ row.longitude.toFixed(4) }}
          </template>
        </el-table-column>
        <el-table-column prop="capacity" label="容量" width="100" />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editWarehouse(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteWarehouseItem(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="common-card">
      <div class="page-header">
        <span class="page-title">仓库分布地图</span>
      </div>
      <div class="map-visualization">
        <div class="map-bg">
          <div
            v-for="wh in warehouses"
            :key="wh.id"
            class="warehouse-marker"
            :style="getMarkerPosition(wh)"
            @click="showWarehouseInfo(wh)"
          >
            <el-tooltip :content="wh.name" placement="top">
              <div class="marker-dot"></div>
            </el-tooltip>
          </div>
        </div>
        <div class="map-legend">
          <div class="legend-item">
            <span class="legend-dot"></span>
            <span>仓库位置</span>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showAddDialog" :title="isEdit ? '编辑仓库' : '新增仓库'" width="500px">
      <el-form :model="warehouseForm" label-width="80px">
        <el-form-item label="仓库名称">
          <el-input v-model="warehouseForm.name" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="warehouseForm.address" />
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="warehouseForm.city" />
        </el-form-item>
        <el-form-item label="国家">
          <el-input v-model="warehouseForm.country" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="纬度">
              <el-input-number v-model="warehouseForm.latitude" :precision="6" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经度">
              <el-input-number v-model="warehouseForm.longitude" :precision="6" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="容量">
          <el-input-number v-model="warehouseForm.capacity" :min="0" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveWarehouse">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWarehouses, createWarehouse as apiCreateWarehouse, updateWarehouse as apiUpdateWarehouse, deleteWarehouse as apiDeleteWarehouse } from '../api'

const warehouses = ref([])
const showAddDialog = ref(false)
const isEdit = ref(false)
const editingId = ref(null)

const warehouseForm = ref({
  name: '',
  address: '',
  city: '',
  country: '',
  latitude: 0,
  longitude: 0,
  capacity: 0
})

const loadWarehouses = async () => {
  try {
    const res = await getWarehouses()
    warehouses.value = res.data
  } catch (error) {
    ElMessage.error('加载仓库列表失败')
  }
}

const openAddDialog = () => {
  resetForm()
  showAddDialog.value = true
}

const editWarehouse = (row) => {
  isEdit.value = true
  editingId.value = row.id
  warehouseForm.value = {
    name: row.name,
    address: row.address,
    city: row.city,
    country: row.country,
    latitude: row.latitude,
    longitude: row.longitude,
    capacity: row.capacity
  }
  showAddDialog.value = true
}

const saveWarehouse = async () => {
  try {
    if (isEdit.value) {
      await apiUpdateWarehouse(editingId.value, warehouseForm.value)
      ElMessage.success('更新成功')
    } else {
      await apiCreateWarehouse(warehouseForm.value)
      ElMessage.success('创建成功')
    }
    showAddDialog.value = false
    loadWarehouses()
    resetForm()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}



const deleteWarehouseItem = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个仓库吗？', '提示', {
      type: 'warning'
    })
    await apiDeleteWarehouse(row.id)
    ElMessage.success('删除成功')
    loadWarehouses()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const resetForm = () => {
  warehouseForm.value = {
    name: '',
    address: '',
    city: '',
    country: '',
    latitude: 0,
    longitude: 0,
    capacity: 0
  }
  isEdit.value = false
  editingId.value = null
}

const getMarkerPosition = (wh) => {
  const minLat = Math.min(...warehouses.value.map(w => w.latitude))
  const maxLat = Math.max(...warehouses.value.map(w => w.latitude))
  const minLng = Math.min(...warehouses.value.map(w => w.longitude))
  const maxLng = Math.max(...warehouses.value.map(w => w.longitude))
  
  const latRange = maxLat - minLat || 1
  const lngRange = maxLng - minLng || 1
  
  const top = ((maxLat - wh.latitude) / latRange) * 80 + 10
  const left = ((wh.longitude - minLng) / lngRange) * 80 + 10
  
  return {
    top: `${top}%`,
    left: `${left}%`
  }
}

const showWarehouseInfo = (wh) => {
  ElMessage.info(`${wh.name} - ${wh.city}, ${wh.country}`)
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadWarehouses()
})
</script>

<style scoped>
.map-visualization {
  position: relative;
}

.map-bg {
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.map-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 50px 50px;
}

.warehouse-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 10;
}

.marker-dot {
  width: 16px;
  height: 16px;
  background: #ff6b6b;
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 107, 107, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
  }
}

.map-legend {
  display: flex;
  gap: 20px;
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.legend-dot {
  width: 12px;
  height: 12px;
  background: #ff6b6b;
  border-radius: 50%;
}
</style>
