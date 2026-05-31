<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, Plus, RefreshCw, Edit2, Trash2, Play, CheckCircle, XCircle, Clock, Wrench } from 'lucide-vue-next'
import { maintenanceApi } from '@/api/maintenance'
import { deviceApi } from '@/api/device'
import { formatDate, getStatusText, getStatusType, getPriorityColor, getPriorityText } from '@/utils'
import type { MaintenancePlan, PaginatedResponse, Device, MaintenanceRecord } from '@/types'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

const loading = ref(false)
const dialogVisible = ref(false)
const executeDialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const currentPlan = ref<MaintenancePlan | null>(null)
const deviceList = ref<Device[]>([])
const recordList = ref<MaintenanceRecord[]>([])

const formRef = ref<FormInstance>()
const executeFormRef = ref<FormInstance>()

const searchForm = reactive({
  keyword: '',
  status: '',
  priority: '',
  deviceId: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const planList = ref<MaintenancePlan[]>([])

const planForm = reactive({
  deviceId: '',
  title: '',
  type: 'preventive',
  priority: 'medium' as MaintenancePlan['priority'],
  scheduledDate: '',
  estimatedHours: undefined as number | undefined,
  description: ''
})

const executeForm = reactive({
  actualHours: undefined as number | undefined,
  notes: '',
  partsUsed: [] as { partId: number; partName: string; quantity: number }[]
})

const planFormRules: FormRules = {
  deviceId: [{ required: true, message: '请选择设备', trigger: 'change' }],
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择维护类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  scheduledDate: [{ required: true, message: '请选择计划日期', trigger: 'change' }]
}

const executeFormRules: FormRules = {
  actualHours: [{ required: true, message: '请输入实际工时', trigger: 'blur' }],
  notes: [{ required: true, message: '请输入维护备注', trigger: 'blur' }]
}

const maintenanceTypes = [
  { value: 'preventive', label: '预防性维护' },
  { value: 'corrective', label: '纠错性维护' },
  { value: 'predictive', label: '预测性维护' },
  { value: 'inspection', label: '例行检查' }
]

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '已批准' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

const priorityOptions = [
  { value: '', label: '全部优先级' },
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' }
]

async function loadData() {
  loading.value = true
  try {
    const response: PaginatedResponse<MaintenancePlan> = await maintenanceApi.listPlans({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: searchForm.status || undefined,
      priority: searchForm.priority || undefined,
      deviceId: searchForm.deviceId ? Number(searchForm.deviceId) : undefined
    })
    
    planList.value = response.items
    pagination.total = response.total
  } catch (error) {
    console.error('加载维护任务列表失败:', error)
  } finally {
    loading.value = false
  }
}

async function loadDevices() {
  try {
    const response = await deviceApi.list({ pageSize: 100 })
    deviceList.value = response.items
  } catch (error) {
    console.error('加载设备列表失败:', error)
  }
}

async function loadRecords() {
  try {
    const response = await maintenanceApi.getRecords({ pageSize: 10 })
    recordList.value = response.items
  } catch (error) {
    console.error('加载维护记录失败:', error)
  }
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.priority = ''
  searchForm.deviceId = ''
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
  currentPlan.value = null
  Object.assign(planForm, {
    deviceId: '',
    title: '',
    type: 'preventive',
    priority: 'medium',
    scheduledDate: '',
    estimatedHours: undefined,
    description: ''
  })
  dialogVisible.value = true
}

function handleEdit(plan: MaintenancePlan) {
  dialogMode.value = 'edit'
  currentPlan.value = plan
  Object.assign(planForm, {
    deviceId: String(plan.deviceId),
    title: plan.title,
    type: plan.type,
    priority: plan.priority,
    scheduledDate: plan.scheduledDate ? formatDate(plan.scheduledDate, 'YYYY-MM-DD') : '',
    estimatedHours: plan.estimatedHours,
    description: plan.description || ''
  })
  dialogVisible.value = true
}

async function handleDelete(plan: MaintenancePlan) {
  try {
    await ElMessageBox.confirm(
      `确定要删除维护任务 "${plan.title}" 吗？此操作不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    
    await maintenanceApi.deletePlan(plan.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除维护任务失败:', error)
    }
  }
}

async function handleStatusChange(plan: MaintenancePlan, status: string) {
  try {
    await maintenanceApi.updatePlanStatus(plan.id, status)
    ElMessage.success('状态更新成功')
    loadData()
  } catch (error) {
    console.error('更新状态失败:', error)
  }
}

function handleExecute(plan: MaintenancePlan) {
  currentPlan.value = plan
  Object.assign(executeForm, {
    actualHours: undefined,
    notes: '',
    partsUsed: []
  })
  executeDialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          ...planForm,
          deviceId: Number(planForm.deviceId)
        }
        
        if (dialogMode.value === 'create') {
          await maintenanceApi.createPlan(data)
          ElMessage.success('创建维护任务成功')
        } else if (currentPlan.value) {
          await maintenanceApi.updatePlan(currentPlan.value.id, data)
          ElMessage.success('更新维护任务成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('保存维护任务失败:', error)
      }
    }
  })
}

async function handleExecuteSubmit() {
  if (!executeFormRef.value || !currentPlan.value) return
  
  await executeFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await maintenanceApi.executePlan(currentPlan.value.id, {
          actualHours: executeForm.actualHours!,
          notes: executeForm.notes,
          partsUsed: executeForm.partsUsed
        })
        ElMessage.success('任务执行成功')
        executeDialogVisible.value = false
        loadData()
        loadRecords()
      } catch (error) {
        console.error('执行任务失败:', error)
      }
    }
  })
}

onMounted(() => {
  loadData()
  loadDevices()
  loadRecords()
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <el-form :model="searchForm" inline label-width="80px">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="任务标题"
            :prefix-icon="Search"
            clearable
            class="w-56"
          />
        </el-form-item>
        <el-form-item label="设备">
          <el-select v-model="searchForm.deviceId" placeholder="全部设备" clearable class="w-48">
            <el-option
              v-for="device in deviceList"
              :key="device.id"
              :label="device.name"
              :value="String(device.id)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable class="w-36">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="searchForm.priority" placeholder="全部优先级" clearable class="w-32">
            <el-option
              v-for="item in priorityOptions"
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

    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">待审批</p>
            <p class="text-2xl font-bold text-warning-500 mt-1">
              {{ planList.filter(p => p.status === 'pending').length }}
            </p>
          </div>
          <div class="w-12 h-12 bg-warning-50 rounded-full flex items-center justify-center">
            <Clock class="w-6 h-6 text-warning-500" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">已批准</p>
            <p class="text-2xl font-bold text-primary-500 mt-1">
              {{ planList.filter(p => p.status === 'approved').length }}
            </p>
          </div>
          <div class="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
            <CheckCircle class="w-6 h-6 text-primary-500" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">进行中</p>
            <p class="text-2xl font-bold text-blue-500 mt-1">
              {{ planList.filter(p => p.status === 'in_progress').length }}
            </p>
          </div>
          <div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
            <Play class="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">已完成</p>
            <p class="text-2xl font-bold text-success-500 mt-1">
              {{ planList.filter(p => p.status === 'completed').length }}
            </p>
          </div>
          <div class="w-12 h-12 bg-success-50 rounded-full flex items-center justify-center">
            <CheckCircle class="w-6 h-6 text-success-500" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Wrench class="w-5 h-5 text-primary-500" />
          维护任务列表
        </h3>
        <el-button type="primary" @click="handleCreate">
          <Plus class="w-4 h-4 mr-2" />
          新建任务
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="planList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="任务标题" min-width="180" />
        <el-table-column prop="deviceName" label="设备名称" width="140" />
        <el-table-column label="维护类型" width="120">
          <template #default="{ row }">
            {{ maintenanceTypes.find(t => t.value === row.type)?.label || row.type }}
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :color="getPriorityColor(row.priority)" class="text-white" size="small">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="计划日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.scheduledDate, 'YYYY-MM-DD') }}
          </template>
        </el-table-column>
        <el-table-column label="预估工时" width="100">
          <template #default="{ row }">
            {{ row.estimatedHours ? row.estimatedHours + ' 小时' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center gap-1">
              <el-button
                v-if="row.status === 'pending'"
                type="success"
                text
                size="small"
                @click="handleStatusChange(row, 'approved')"
              >
                批准
              </el-button>
              <el-button
                v-if="row.status === 'approved'"
                type="primary"
                text
                size="small"
                @click="handleStatusChange(row, 'in_progress')"
              >
                开始
              </el-button>
              <el-button
                v-if="row.status === 'in_progress'"
                type="success"
                text
                size="small"
                @click="handleExecute(row)"
              >
                完成
              </el-button>
              <el-button
                v-if="row.status === 'pending' || row.status === 'approved'"
                type="primary"
                text
                size="small"
                @click="handleEdit(row)"
              >
                <Edit2 class="w-4 h-4" />
              </el-button>
              <el-button
                v-if="row.status !== 'completed'"
                type="danger"
                text
                size="small"
                @click="handleDelete(row)"
              >
                <Trash2 class="w-4 h-4" />
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

    <div v-if="recordList.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800">最近维护记录</h3>
      </div>
      <div class="p-6">
        <el-timeline>
          <el-timeline-item
            v-for="record in recordList"
            :key="record.id"
            :timestamp="formatDate(record.completedAt, 'YYYY-MM-DD HH:mm')"
            placement="top"
          >
            <el-card shadow="never" class="border-gray-100">
              <h4 class="font-medium text-gray-800">{{ record.result }}</h4>
              <p class="text-sm text-gray-500 mt-1">
                {{ record.notes }}
                <span v-if="record.cost" class="ml-4">费用: ¥{{ record.cost }}</span>
              </p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建维护任务' : '编辑维护任务'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="planForm"
        :rules="planFormRules"
        label-width="100px"
      >
        <el-form-item label="设备" prop="deviceId">
          <el-select v-model="planForm.deviceId" placeholder="请选择设备" class="w-full">
            <el-option
              v-for="device in deviceList"
              :key="device.id"
              :label="device.name"
              :value="String(device.id)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务标题" prop="title">
          <el-input v-model="planForm.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="维护类型" prop="type">
          <el-select v-model="planForm.type" placeholder="请选择维护类型" class="w-full">
            <el-option
              v-for="item in maintenanceTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="planForm.priority">
            <el-radio-button value="low" style="--el-radio-button-checked-bg-color: #00B42A; --el-radio-button-checked-border-color: #00B42A">低</el-radio-button>
            <el-radio-button value="medium" style="--el-radio-button-checked-bg-color: #165DFF; --el-radio-button-checked-border-color: #165DFF">中</el-radio-button>
            <el-radio-button value="high" style="--el-radio-button-checked-bg-color: #FF7D00; --el-radio-button-checked-border-color: #FF7D00">高</el-radio-button>
            <el-radio-button value="urgent" style="--el-radio-button-checked-bg-color: #F53F3F; --el-radio-button-checked-border-color: #F53F3F">紧急</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="计划日期" prop="scheduledDate">
          <el-date-picker
            v-model="planForm.scheduledDate"
            type="date"
            placeholder="选择计划日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="预估工时">
          <el-input-number v-model="planForm.estimatedHours" :min="0" :precision="1" class="w-full" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input
            v-model="planForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="executeDialogVisible"
      title="执行维护任务"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="executeFormRef"
        :model="executeForm"
        :rules="executeFormRules"
        label-width="100px"
      >
        <el-form-item label="任务名称">
          <el-input :value="currentPlan?.title" disabled />
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input :value="currentPlan?.deviceName" disabled />
        </el-form-item>
        <el-form-item label="实际工时" prop="actualHours">
          <el-input-number v-model="executeForm.actualHours" :min="0" :precision="1" class="w-full" />
        </el-form-item>
        <el-form-item label="维护备注" prop="notes">
          <el-input
            v-model="executeForm.notes"
            type="textarea"
            :rows="4"
            placeholder="请输入维护过程和结果说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="executeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleExecuteSubmit">确认完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>
