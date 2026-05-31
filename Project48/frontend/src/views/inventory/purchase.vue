<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RefreshCw, ShoppingCart, Download, CheckCircle, Package, TrendingUp } from 'lucide-vue-next'
import { inventoryApi } from '@/api/inventory'
import { getPriorityColor, getPriorityText } from '@/utils'
import type { PurchaseSuggestion } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const suggestionList = ref<PurchaseSuggestion[]>([])
const selectedItems = ref<number[]>([])

const highPriority = computed(() => suggestionList.value.filter(s => s.priority === 'high'))
const mediumPriority = computed(() => suggestionList.value.filter(s => s.priority === 'medium'))
const lowPriority = computed(() => suggestionList.value.filter(s => s.priority === 'low'))

const totalSuggestedQuantity = computed(() => 
  suggestionList.value.reduce((sum, item) => sum + item.suggestedQuantity, 0)
)

const selectedQuantity = computed(() => 
  suggestionList.value
    .filter(s => selectedItems.value.includes(s.partId))
    .reduce((sum, item) => sum + item.suggestedQuantity, 0)
)

async function loadData() {
  loading.value = true
  try {
    suggestionList.value = await inventoryApi.getPurchaseSuggestions()
    selectedItems.value = []
  } catch (error) {
    console.error('加载采购建议失败:', error)
  } finally {
    loading.value = false
  }
}

function handleRefresh() {
  loadData()
  ElMessage.success('刷新成功')
}

function handleSelectAll() {
  if (selectedItems.value.length === suggestionList.value.length) {
    selectedItems.value = []
  } else {
    selectedItems.value = suggestionList.value.map(s => s.partId)
  }
}

function handleGenerateOrder() {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请至少选择一项采购建议')
    return
  }
  
  ElMessageBox.confirm(
    `确定要为选中的 ${selectedItems.value.length} 项备件生成采购订单吗？\n建议采购总数：${selectedQuantity} 件`,
    '生成采购订单',
    { type: 'info', confirmButtonText: '确定生成', cancelButtonText: '取消' }
  ).then(() => {
    ElMessage.success('采购订单已生成')
    selectedItems.value = []
  }).catch(() => {})
}

function handleExport() {
  if (suggestionList.value.length === 0) {
    ElMessage.warning('暂无采购建议可导出')
    return
  }
  
  ElMessage.success('采购建议已导出')
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">高优先级</p>
            <p class="text-2xl font-bold text-danger-500 mt-1">{{ highPriority.length }}</p>
          </div>
          <div class="w-12 h-12 bg-danger-50 rounded-full flex items-center justify-center">
            <TrendingUp class="w-6 h-6 text-danger-500" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">中优先级</p>
            <p class="text-2xl font-bold text-warning-500 mt-1">{{ mediumPriority.length }}</p>
          </div>
          <div class="w-12 h-12 bg-warning-50 rounded-full flex items-center justify-center">
            <TrendingUp class="w-6 h-6 text-warning-500" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">低优先级</p>
            <p class="text-2xl font-bold text-success-500 mt-1">{{ lowPriority.length }}</p>
          </div>
          <div class="w-12 h-12 bg-success-50 rounded-full flex items-center justify-center">
            <TrendingUp class="w-6 h-6 text-success-500" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">建议采购总数</p>
            <p class="text-2xl font-bold text-primary-500 mt-1">{{ totalSuggestedQuantity }}</p>
          </div>
          <div class="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
            <Package class="w-6 h-6 text-primary-500" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <ShoppingCart class="w-5 h-5 text-primary-500" />
          采购建议列表
        </h3>
        <div class="flex items-center gap-2">
          <el-button @click="handleRefresh">
            <RefreshCw class="w-4 h-4 mr-2" />
            刷新
          </el-button>
          <el-button @click="handleExport">
            <Download class="w-4 h-4 mr-2" />
            导出
          </el-button>
          <el-button type="primary" @click="handleGenerateOrder" :disabled="selectedItems.length === 0">
            <ShoppingCart class="w-4 h-4 mr-2" />
            生成采购订单 ({{ selectedItems.length }})
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="suggestionList"
        stripe
        style="width: 100%"
      >
        <el-table-column width="50" align="center">
          <template #header>
            <el-checkbox 
              :model-value="selectedItems.length === suggestionList.length && suggestionList.length > 0"
              :indeterminate="selectedItems.length > 0 && selectedItems.length < suggestionList.length"
              @change="handleSelectAll"
            />
          </template>
          <template #default="{ row }">
            <el-checkbox 
              :model-value="selectedItems.includes(row.partId)"
              @change="(val: boolean) => {
                if (val) {
                  selectedItems.push(row.partId)
                } else {
                  const idx = selectedItems.indexOf(row.partId)
                  if (idx > -1) selectedItems.splice(idx, 1)
                }
              }"
            />
          </template>
        </el-table-column>
        <el-table-column prop="sku" label="SKU编码" width="140" />
        <el-table-column prop="partName" label="备件名称" min-width="180" />
        <el-table-column label="当前库存" width="120" align="center">
          <template #default="{ row }">
            <span :class="{ 'text-danger-500 font-bold': row.currentQuantity <= 0 }">
              {{ row.currentQuantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="安全库存" width="100" align="center">
          <template #default="{ row }">
            {{ row.safeStock }}
          </template>
        </el-table-column>
        <el-table-column label="建议采购量" width="120" align="center">
          <template #default="{ row }">
            <span class="font-bold text-primary-500">{{ row.suggestedQuantity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :color="getPriorityColor(row.priority)" class="text-white" size="small">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="缺货量" width="100" align="center">
          <template #default="{ row }">
            <span class="text-danger-500 font-medium">{{ row.safeStock - row.currentQuantity }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="selectedItems.length > 0" class="px-6 py-4 bg-primary-50 border-t border-primary-100 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          已选择 <span class="font-bold text-primary-600">{{ selectedItems.length }}</span> 项，
          建议采购 <span class="font-bold text-primary-600">{{ selectedQuantity }}</span> 件
        </div>
        <el-button type="primary" @click="handleGenerateOrder">
          <CheckCircle class="w-4 h-4 mr-2" />
          确认生成采购订单
        </el-button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800">采购建议说明</h3>
      </div>
      <div class="p-6 space-y-4">
        <el-alert
          title="高优先级"
          type="error"
          :closable="false"
          show-icon
        >
          <template #default>
            当前库存为0或严重不足，需要立即采购，否则将直接影响设备维护和生产运营。
          </template>
        </el-alert>
        <el-alert
          title="中优先级"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            当前库存低于安全库存，建议在1-2周内安排采购，避免出现缺货情况。
          </template>
        </el-alert>
        <el-alert
          title="低优先级"
          type="success"
          :closable="false"
          show-icon
        >
          <template #default>
            当前库存接近或略低于安全库存，可在下次常规采购时一并处理。
          </template>
        </el-alert>
      </div>
    </div>
  </div>
</template>
