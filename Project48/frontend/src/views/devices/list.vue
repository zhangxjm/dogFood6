<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus, RefreshCw, Eye, Edit2, Trash2, Cpu } from 'lucide-vue-next'
import { deviceApi } from '@/api/device'
import { formatDate, getStatusText, getStatusType, getHealthColor } from '@/utils'
import type { Device, PaginatedResponse } from '@/types'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const currentDevice = ref<Device | null>(null)

const formRef = ref<FormInstance>()

const searchForm = reactive({
  keyword: '',
  status: '',
  type: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const deviceList = ref<Device[]>([])

const deviceForm = reactive({
  name: '',
  code: '',
  type: '',
  location: '',
  status: 'online' as Device['status'],
  installDate: '',
  description: ''
})

const deviceFormRules: FormRules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  location: [{ required: true, message: '请输入安装位置', trigger: 'blur' }],
  installDate: [{ required: true, message: '请选择安装日期', trigger: 'change' }]
}

const deviceTypes = [
  { value: 'motor', label: '电机' },
  { value: 'pump', label: '泵' },
  { value: 'compressor', label: '压缩机' },
  { value: 'fan', label: '风机' },
  { value: 'conveyor', label: '传送带' },
  { value: 'other', label: '其他' }
]

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'online', label: '在线' },
  { value: 'offline', label: '离线' },
  { value: 'warning', label: '预警' },
  { value: 'error', label: '故障' }
]

async function loadData() {
  loading.value = true
  try {
    const response: PaginatedResponse<Device> = await deviceApi.list({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status || undefined,
      type: searchForm.type || undefined
    })
    
    deviceList.value = response.items
    pagination.total = response.total
  } catch (error) {
    console.error('加载设备列表失败:', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.type = ''
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

function handleCreate() {
  dialogMode.value = 'create'
  currentDevice.value = null
  Object.assign(deviceForm, {
    name: '',
    code: '',
    type: '',
    location: '',
    status: 'online',
    installDate: '',
    description: ''
  })
  dialogVisible.value = true
}

function handleEdit(device: Device) {
  dialogMode.value = 'edit'
  currentDevice.value = device
  Object.assign(deviceForm, {
    name: device.name,
    code: device.code,
    type: device.type,
    location: device.location,
    status: device.status,
    installDate: device.installDate ? formatDate(device.installDate, 'YYYY-MM-DD') : '',
    description: device.description || ''
  })
  dialogVisible.value = true
}

async function handleDelete(device: Device) {
  try {
    await ElMessageBox.confirm(
      `确定要删除设备 "${device.name}" 吗？此操作不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    
    await deviceApi.delete(device.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除设备失败:', error)
    }
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogMode.value === 'create') {
          await deviceApi.create(deviceForm)
          ElMessage.success('创建设备成功')
        } else if (currentDevice.value) {
          await deviceApi.update(currentDevice.value.id, deviceForm)
          ElMessage.success('更新设备成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('保存设备失败:', error)
      }
    }
  })
}

function viewDetail(device: Device) {
  router.push(`/devices/${device.id}`)
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <el-form :model="searchForm" inline label-width="80px">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="设备名称/编号"
            :prefix-icon="Search"
            clearable
            class="w-56"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable class="w-40">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="全部类型" clearable class="w-40">
            <el-option
              v-for="item in deviceTypes"
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
          <Cpu class="w-5 h-5 text-primary-500" />
          设备列表
        </h3>
        <el-button type="primary" @click="handleCreate">
          <Plus class="w-4 h-4 mr-2" />
          添加设备
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="deviceList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="code" label="设备编号" width="140" />
        <el-table-column prop="name" label="设备名称" min-width="160" />
        <el-table-column label="设备类型" width="120">
          <template #default="{ row }">
            {{ deviceTypes.find(t => t.value === row.type)?.label || row.type }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="安装位置" width="140" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="健康度" width="140">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-progress
                :percentage="row.healthScore"
                :color="getHealthColor(row.healthScore)"
                :width="60"
                :show-text="false"
              />
              <span class="text-sm font-medium" :style="{ color: getHealthColor(row.healthScore) }">
                {{ row.healthScore }}%
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="安装日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.installDate, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column label="最近维护" width="140">
          <template #default="{ row }">
            {{ row.lastMaintenance ? formatDate(row.lastMaintenance, 'YYYY-MM-DD') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-button type="primary" text size="small" @click="viewDetail(row)">
                <Eye class="w-4 h-4" />
                详情
              </el-button>
              <el-button type="primary" text size="small" @click="handleEdit(row)">
                <Edit2 class="w-4 h-4" />
                编辑
              </el-button>
              <el-button type="danger" text size="small" @click="handleDelete(row)">
                <Trash2 class="w-4 h-4" />
                删除
              </el-button>
            </div>
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '添加设备' : '编辑设备'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="deviceForm"
        :rules="deviceFormRules"
        label-width="100px"
      >
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="deviceForm.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备编号" prop="code">
          <el-input v-model="deviceForm.code" placeholder="请输入设备编号" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="deviceForm.type" placeholder="请选择设备类型" class="w-full">
            <el-option
              v-for="item in deviceTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="安装位置" prop="location">
          <el-input v-model="deviceForm.location" placeholder="请输入安装位置" />
        </el-form-item>
        <el-form-item label="设备状态" prop="status">
          <el-select v-model="deviceForm.status" class="w-full">
            <el-option value="online" label="在线" />
            <el-option value="offline" label="离线" />
            <el-option value="warning" label="预警" />
            <el-option value="error" label="故障" />
          </el-select>
        </el-form-item>
        <el-form-item label="安装日期" prop="installDate">
          <el-date-picker
            v-model="deviceForm.installDate"
            type="date"
            placeholder="选择安装日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="设备描述">
          <el-input
            v-model="deviceForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入设备描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
