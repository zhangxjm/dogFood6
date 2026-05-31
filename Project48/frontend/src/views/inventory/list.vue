<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, Plus, RefreshCw, Edit2, Trash2, Package, PlusCircle, MinusCircle } from 'lucide-vue-next'
import { inventoryApi } from '@/api/inventory'
import { formatDate, getStockStatus } from '@/utils'
import type { InventoryPart, PaginatedResponse, InventoryStats } from '@/types'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

const loading = ref(false)
const dialogVisible = ref(false)
const stockDialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const stockMode = ref<'in' | 'out'>('in')
const currentPart = ref<InventoryPart | null>(null)

const formRef = ref<FormInstance>()
const stockFormRef = ref<FormInstance>()

const searchForm = reactive({
  keyword: '',
  category: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const partList = ref<InventoryPart[]>([])
const stats = ref<InventoryStats>({ totalItems: 0, lowStockItems: 0, outStockItems: 0, totalValue: 0 })

const partForm = reactive({
  name: '',
  sku: '',
  category: '',
  quantity: 0,
  safeStock: 10,
  unit: '',
  location: '',
  supplier: ''
})

const stockForm = reactive({
  quantity: 0,
  notes: ''
})

const partFormRules: FormRules = {
  name: [{ required: true, message: '请输入备件名称', trigger: 'blur' }],
  sku: [{ required: true, message: '请输入SKU编码', trigger: 'blur' }],
  safeStock: [{ required: true, message: '请输入安全库存', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }]
}

const stockFormRules: FormRules = {
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
}

const categoryOptions = [
  { value: '', label: '全部类别' },
  { value: 'electrical', label: '电气元件' },
  { value: 'mechanical', label: '机械零件' },
  { value: 'lubricant', label: '润滑油' },
  { value: 'filter', label: '过滤器' },
  { value: 'seal', label: '密封件' },
  { value: 'bearing', label: '轴承' },
  { value: 'sensor', label: '传感器' },
  { value: 'other', label: '其他' }
]

async function loadData() {
  loading.value = true
  try {
    const response: PaginatedResponse<InventoryPart> = await inventoryApi.listParts({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      category: searchForm.category || undefined
    })
    
    partList.value = response.items
    pagination.total = response.total
  } catch (error) {
    console.error('加载备件列表失败:', error)
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    stats.value = await inventoryApi.getPartStats()
  } catch (error) {
    console.error('加载库存统计失败:', error)
  }
}

function handleSearch() {
  pagination.page = 1
  loadData()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.category = ''
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
  currentPart.value = null
  Object.assign(partForm, {
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    safeStock: 10,
    unit: '',
    location: '',
    supplier: ''
  })
  dialogVisible.value = true
}

function handleEdit(part: InventoryPart) {
  dialogMode.value = 'edit'
  currentPart.value = part
  Object.assign(partForm, {
    name: part.name,
    sku: part.sku,
    category: part.category || '',
    quantity: part.quantity,
    safeStock: part.safeStock,
    unit: part.unit,
    location: part.location || '',
    supplier: part.supplier || ''
  })
  dialogVisible.value = true
}

async function handleDelete(part: InventoryPart) {
  try {
    await ElMessageBox.confirm(
      `确定要删除备件 "${part.name}" 吗？此操作不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    
    await inventoryApi.deletePart(part.id)
    ElMessage.success('删除成功')
    loadData()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除备件失败:', error)
    }
  }
}

function handleAddStock(part: InventoryPart) {
  stockMode.value = 'in'
  currentPart.value = part
  stockForm.quantity = 0
  stockForm.notes = ''
  stockDialogVisible.value = true
}

function handleConsumeStock(part: InventoryPart) {
  stockMode.value = 'out'
  currentPart.value = part
  stockForm.quantity = 0
  stockForm.notes = ''
  stockDialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogMode.value === 'create') {
          await inventoryApi.createPart(partForm)
          ElMessage.success('创建备件成功')
        } else if (currentPart.value) {
          await inventoryApi.updatePart(currentPart.value.id, partForm)
          ElMessage.success('更新备件成功')
        }
        dialogVisible.value = false
        loadData()
        loadStats()
      } catch (error) {
        console.error('保存备件失败:', error)
      }
    }
  })
}

async function handleStockSubmit() {
  if (!stockFormRef.value || !currentPart.value) return
  
  await stockFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (stockMode.value === 'in') {
          await inventoryApi.addStock(currentPart.value.id, stockForm.quantity, stockForm.notes)
          ElMessage.success('入库成功')
        } else {
          if (stockForm.quantity > currentPart.value.quantity) {
            ElMessage.error('出库数量不能大于当前库存')
            return
          }
          await inventoryApi.consumePart(currentPart.value.id, stockForm.quantity, stockForm.notes)
          ElMessage.success('出库成功')
        }
        stockDialogVisible.value = false
        loadData()
        loadStats()
      } catch (error) {
        console.error('库存操作失败:', error)
      }
    }
  })
}

onMounted(() => {
  loadData()
  loadStats()
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">总备件数</p>
            <p class="text-2xl font-bold text-primary-500 mt-1">{{ stats.totalItems }}</p>
          </div>
          <div class="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
            <Package class="w-6 h-6 text-primary-500" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">库存不足</p>
            <p class="text-2xl font-bold text-warning-500 mt-1">{{ stats.lowStockItems }}</p>
          </div>
          <div class="w-12 h-12 bg-warning-50 rounded-full flex items-center justify-center">
            <Package class="w-6 h-6 text-warning-500" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">缺货</p>
            <p class="text-2xl font-bold text-danger-500 mt-1">{{ stats.outStockItems }}</p>
          </div>
          <div class="w-12 h-12 bg-danger-50 rounded-full flex items-center justify-center">
            <Package class="w-6 h-6 text-danger-500" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">总库存价值</p>
            <p class="text-2xl font-bold text-success-500 mt-1">¥{{ stats.totalValue.toLocaleString() }}</p>
          </div>
          <div class="w-12 h-12 bg-success-50 rounded-full flex items-center justify-center">
            <Package class="w-6 h-6 text-success-500" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <el-form :model="searchForm" inline label-width="80px">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="备件名称/SKU"
            :prefix-icon="Search"
            clearable
            class="w-56"
          />
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="searchForm.category" placeholder="全部类别" clearable class="w-40">
            <el-option
              v-for="item in categoryOptions"
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
          <Package class="w-5 h-5 text-primary-500" />
          备件库存列表
        </h3>
        <el-button type="primary" @click="handleCreate">
          <Plus class="w-4 h-4 mr-2" />
          添加备件
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="partList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="sku" label="SKU编码" width="140" />
        <el-table-column prop="name" label="备件名称" min-width="180" />
        <el-table-column label="类别" width="120">
          <template #default="{ row }">
            {{ categoryOptions.find(c => c.value === row.category)?.label || row.category || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="库存状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStockStatus(row.quantity, row.safeStock).type" size="small">
              {{ getStockStatus(row.quantity, row.safeStock).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="当前库存" width="120">
          <template #default="{ row }">
            <span :class="{ 'text-danger-500 font-bold': row.quantity <= 0, 'text-warning-500 font-bold': row.quantity > 0 && row.quantity < row.safeStock }">
              {{ row.quantity }} {{ row.unit }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="安全库存" width="100">
          <template #default="{ row }">
            {{ row.safeStock }} {{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="存放位置" width="120" />
        <el-table-column prop="supplier" label="供应商" width="140" />
        <el-table-column label="最后更新" width="160">
          <template #default="{ row }">
            {{ formatDate(row.lastUpdated, 'YYYY-MM-DD HH:mm') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center gap-1">
              <el-button type="success" text size="small" @click="handleAddStock(row)">
                <PlusCircle class="w-4 h-4" />
                入库
              </el-button>
              <el-button type="warning" text size="small" @click="handleConsumeStock(row)">
                <MinusCircle class="w-4 h-4" />
                出库
              </el-button>
              <el-button type="primary" text size="small" @click="handleEdit(row)">
                <Edit2 class="w-4 h-4" />
              </el-button>
              <el-button type="danger" text size="small" @click="handleDelete(row)">
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '添加备件' : '编辑备件'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="partForm"
        :rules="partFormRules"
        label-width="100px"
      >
        <el-form-item label="备件名称" prop="name">
          <el-input v-model="partForm.name" placeholder="请输入备件名称" />
        </el-form-item>
        <el-form-item label="SKU编码" prop="sku">
          <el-input v-model="partForm.sku" placeholder="请输入SKU编码" />
        </el-form-item>
        <el-form-item label="备件类别">
          <el-select v-model="partForm.category" placeholder="请选择备件类别" clearable class="w-full">
            <el-option
              v-for="item in categoryOptions.filter(c => c.value)"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input-number v-model="partForm.quantity" :min="0" class="w-full" />
        </el-form-item>
        <el-form-item label="安全库存" prop="safeStock">
          <el-input-number v-model="partForm.safeStock" :min="0" class="w-full" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="partForm.unit" placeholder="如：个、件、升等" />
        </el-form-item>
        <el-form-item label="存放位置">
          <el-input v-model="partForm.location" placeholder="请输入存放位置" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="partForm.supplier" placeholder="请输入供应商" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="stockDialogVisible"
      :title="stockMode === 'in' ? '备件入库' : '备件出库'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="stockFormRef"
        :model="stockForm"
        :rules="stockFormRules"
        label-width="100px"
      >
        <el-form-item label="备件名称">
          <el-input :value="currentPart?.name" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input :value="currentPart ? currentPart.quantity + ' ' + currentPart.unit : '-'" disabled />
        </el-form-item>
        <el-form-item label="操作数量" prop="quantity">
          <el-input-number v-model="stockForm.quantity" :min="1" class="w-full" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="stockForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入操作备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockDialogVisible = false">取消</el-button>
        <el-button :type="stockMode === 'in' ? 'success' : 'warning'" @click="handleStockSubmit">
          {{ stockMode === 'in' ? '确认入库' : '确认出库' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
