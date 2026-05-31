<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Calendar, Plus, RefreshCw, Clock, User, MapPin } from 'lucide-vue-next'
import { maintenanceApi } from '@/api/maintenance'
import { deviceApi } from '@/api/device'
import type { MaintenancePlan, CalendarEvent, Device } from '@/types'
import { formatDate, getStatusText, getStatusType, getPriorityColor } from '@/utils'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

const loading = ref(false)
const calendarEvents = ref<CalendarEvent[]>([])
const planList = ref<MaintenancePlan[]>([])
const deviceList = ref<Device[]>([])
const dialogVisible = ref(false)
const selectedDate = ref(new Date())
const selectedEvent = ref<CalendarEvent | null>(null)

const formRef = ref<FormInstance>()

const planForm = reactive({
  deviceId: '',
  title: '',
  type: 'preventive',
  priority: 'medium' as MaintenancePlan['priority'],
  scheduledDate: '',
  estimatedHours: undefined as number | undefined,
  description: ''
})

const planFormRules: FormRules = {
  deviceId: [{ required: true, message: '请选择设备', trigger: 'change' }],
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择维护类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  scheduledDate: [{ required: true, message: '请选择计划日期', trigger: 'change' }]
}

const maintenanceTypes = [
  { value: 'preventive', label: '预防性维护' },
  { value: 'corrective', label: '纠正性维护' },
  { value: 'predictive', label: '预测性维护' },
  { value: 'inspection', label: '例行检查' }
]

const priorityOptions = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' }
]

async function loadDevices() {
  try {
    const response = await deviceApi.list({ pageSize: 1000 })
    deviceList.value = response.items
  } catch (error) {
    console.error('加载设备列表失败:', error)
  }
}

async function loadCalendarData() {
  loading.value = true
  try {
    const events = await maintenanceApi.getCalendarData()
    calendarEvents.value = events
    
    const plans = await maintenanceApi.listPlans({ pageSize: 100 })
    planList.value = plans.items
  } catch (error) {
    console.error('加载日历数据失败:', error)
  } finally {
    loading.value = false
  }
}

function handleDateClick(date: Date) {
  selectedDate.value = date
  selectedEvent.value = null
  Object.assign(planForm, {
    deviceId: '',
    title: '',
    type: 'preventive',
    priority: 'medium',
    scheduledDate: formatDate(date, 'YYYY-MM-DD'),
    estimatedHours: undefined,
    description: ''
  })
  dialogVisible.value = true
}

function handleEventClick(event: CalendarEvent) {
  selectedEvent.value = event
  selectedDate.value = new Date(event.start)
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const planData = {
          ...planForm,
          deviceId: Number(planForm.deviceId)
        }
        await maintenanceApi.createPlan(planData)
        ElMessage.success('创建维护计划成功')
        dialogVisible.value = false
        loadCalendarData()
      } catch (error) {
        console.error('创建维护计划失败:', error)
      }
    }
  })
}

async function handleGeneratePlans() {
  try {
    await ElMessageBox.confirm(
      '确定要根据预测结果自动生成维护计划吗？',
      '生成计划',
      { type: 'info', confirmButtonText: '确认生成', cancelButtonText: '取消' }
    )
    
    const result = await maintenanceApi.generatePlans()
    ElMessage.success(result.message || `成功生成 ${result.count} 条维护计划`)
    loadCalendarData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('生成维护计划失败:', error)
    }
  }
}

function getDeviceName(deviceId: number): string {
  const device = deviceList.value.find(d => d.id === deviceId)
  return device?.name || `设备#${deviceId}`
}

function getMaintenanceTypeLabel(type: string): string {
  const found = maintenanceTypes.find(t => t.value === type)
  return found?.label || type
}

const todayPlans = computed(() => {
  const today = formatDate(new Date(), 'YYYY-MM-DD')
  return planList.value.filter(p => formatDate(p.scheduledDate, 'YYYY-MM-DD') === today)
})

const upcomingPlans = computed(() => {
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  return planList.value.filter(p => {
    const planDate = new Date(p.scheduledDate)
    return planDate > today && planDate <= nextWeek
  }).slice(0, 5)
})

onMounted(() => {
  loadDevices()
  loadCalendarData()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-800">维护计划日历</h2>
      <div class="flex gap-3">
        <el-button @click="loadCalendarData">
          <RefreshCw class="w-4 h-4 mr-2" />
          刷新
        </el-button>
        <el-button type="primary" @click="handleGeneratePlans">
          <Plus class="w-4 h-4 mr-2" />
          智能生成计划
        </el-button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar class="w-5 h-5 text-primary-500" />
            维护日历
          </h3>
        </div>
        <div class="p-6">
          <el-calendar v-model="selectedDate">
            <template #date-cell="{ data }">
              <div class="p-1 h-full min-h-[80px]">
                <div class="text-sm font-medium" :class="data.isSelected ? 'text-primary-600' : 'text-gray-700'">
                  {{ data.day.split('-').slice(2).join('') }}
                </div>
                <div class="mt-1 space-y-1">
                  <div
                    v-for="event in calendarEvents.filter(e => e.start.startsWith(data.day))"
                    :key="event.id"
                    class="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                    :style="{ backgroundColor: event.backgroundColor + '20', color: event.borderColor }"
                    @click.stop="handleEventClick(event)"
                  >
                    {{ event.title }}
                  </div>
                </div>
                <div
                  class="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center text-xs text-primary-600 cursor-pointer hover:bg-primary-100 transition-colors"
                  @click.stop="handleDateClick(new Date(data.day))"
                >
                  +
                </div>
              </div>
            </template>
          </el-calendar>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="px-4 py-3 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800">今日任务</h3>
          </div>
          <div class="p-4">
            <div
              v-for="plan in todayPlans"
              :key="plan.id"
              class="p-3 bg-gray-50 rounded-lg mb-2 last:mb-0"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-gray-800 truncate">{{ plan.title }}</span>
                <el-tag :type="getStatusType(plan.priority)" size="small" effect="dark">
                  {{ getStatusText(plan.priority) }}
                </el-tag>
              </div>
              <div class="text-xs text-gray-500 flex items-center gap-1">
                <MapPin class="w-3 h-3" />
                {{ getDeviceName(plan.deviceId) }}
              </div>
            </div>
            <div v-if="todayPlans.length === 0" class="text-center py-8 text-gray-400">
              今日暂无任务
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="px-4 py-3 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800">即将到来</h3>
          </div>
          <div class="p-4">
            <div
              v-for="plan in upcomingPlans"
              :key="plan.id"
              class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <div>
                <div class="text-sm font-medium text-gray-800">{{ plan.title }}</div>
                <div class="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Clock class="w-3 h-3" />
                  {{ formatDate(plan.scheduledDate, 'MM-DD HH:mm') }}
                </div>
              </div>
              <el-tag
                :type="getStatusType(plan.status)"
                size="small"
              >
                {{ getStatusText(plan.status) }}
              </el-tag>
            </div>
            <div v-if="upcomingPlans.length === 0" class="text-center py-8 text-gray-400">
              暂无即将到来的任务
            </div>
          </div>
        </div>

        <div v-if="selectedEvent" class="bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="px-4 py-3 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800">任务详情</h3>
          </div>
          <div class="p-4">
            <h4 class="font-medium text-gray-800 mb-2">{{ selectedEvent.title }}</h4>
            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2 text-gray-600">
                <Calendar class="w-4 h-4" />
                {{ formatDate(selectedEvent.start, 'YYYY-MM-DD HH:mm') }}
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <User class="w-4 h-4" />
                状态: {{ getStatusText(selectedEvent.extendedProps.status) }}
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <Clock class="w-4 h-4" />
                优先级: {{ getStatusText(selectedEvent.extendedProps.priority) }}
              </div>
            </div>
            <el-button
              type="primary"
              size="small"
              class="w-full mt-4"
              @click="$router.push('/maintenance/tasks')"
            >
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="创建维护计划"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="planForm"
        :rules="planFormRules"
        label-width="100px"
      >
        <el-form-item label="设备" prop="deviceId">
          <el-select
            v-model="planForm.deviceId"
            placeholder="请选择设备"
            filterable
            class="w-full"
          >
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
            <el-radio-button
              v-for="item in priorityOptions"
              :key="item.value"
              :value="item.value"
              :style="{ borderColor: getPriorityColor(item.value), color: planForm.priority === item.value ? 'white' : getPriorityColor(item.value) }"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="计划日期" prop="scheduledDate">
          <el-date-picker
            v-model="planForm.scheduledDate"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="预估工时">
          <el-input-number
            v-model="planForm.estimatedHours"
            :min="0"
            :step="0.5"
            placeholder="小时"
            class="w-full"
          />
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
  </div>
</template>

<script lang="ts">
import { reactive } from 'vue'
export default {
  setup() {
    return {}
  }
}
</script>

<style scoped>
:deep(.el-calendar__body) {
  padding: 12px;
}

:deep(.el-calendar-table thead th) {
  background: #f8f9fa;
  color: #4E5969;
  font-weight: 500;
}

:deep(.el-calendar-table td.is-selected) {
  background-color: rgba(22, 93, 255, 0.08);
}

:deep(.el-calendar-table .el-calendar-day:hover) {
  background-color: rgba(22, 93, 255, 0.04);
}
</style>
