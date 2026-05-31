<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RefreshCw, AlertTriangle, AlertCircle, Package, Plus, ShoppingCart } from 'lucide-vue-next'
import { inventoryApi } from '@/api/inventory'
import type { InventoryAlert } from '@/types'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)
const alertList = ref<InventoryAlert[]>([])

const dangerAlerts = computed(() => alertList.value.filter(a => a.level === 'danger'))
const warningAlerts = computed(() => alertList.value.filter(a => a.level === 'warning'))

async function loadData() {
  loading.value = true
  try {
    alertList.value = await inventoryApi.getAlerts()
  } catch (error) {
    console.error('加载库存预警失败:', error)
  } finally {
    loading.value = false
  }
}

function handleRefresh() {
  loadData()
  ElMessage.success('刷新成功')
}

function goToPurchase() {
  router.push('/inventory/purchase')
}

function goToList() {
  router.push('/inventory/list')
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">紧急缺货</p>
            <p class="text-3xl font-bold text-danger-500 mt-1">{{ dangerAlerts.length }}</p>
          </div>
          <div class="w-14 h-14 bg-danger-50 rounded-full flex items-center justify-center">
            <AlertCircle class="w-7 h-7 text-danger-500" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">库存不足</p>
            <p class="text-3xl font-bold text-warning-500 mt-1">{{ warningAlerts.length }}</p>
          </div>
          <div class="w-14 h-14 bg-warning-50 rounded-full flex items-center justify-center">
            <AlertTriangle class="w-7 h-7 text-warning-500" />
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">预警总数</p>
            <p class="text-3xl font-bold text-primary-500 mt-1">{{ alertList.length }}</p>
          </div>
          <div class="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center">
            <Package class="w-7 h-7 text-primary-500" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <AlertTriangle class="w-5 h-5 text-warning-500" />
          库存预警列表
        </h3>
        <div class="flex items-center gap-2">
          <el-button @click="handleRefresh">
            <RefreshCw class="w-4 h-4 mr-2" />
            刷新
          </el-button>
          <el-button type="primary" @click="goToPurchase">
            <ShoppingCart class="w-4 h-4 mr-2" />
            查看采购建议
          </el-button>
        </div>
      </div>

      <div v-loading="loading" class="p-6">
        <el-empty v-if="alertList.length === 0" description="暂无库存预警" />
        
        <div v-else class="space-y-4">
          <div v-for="alert in alertList" :key="alert.id"
            class="flex items-center justify-between p-4 rounded-lg border"
            :class="alert.level === 'danger' ? 'bg-danger-50 border-danger-200' : 'bg-warning-50 border-warning-200'"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center"
                :class="alert.level === 'danger' ? 'bg-danger-100' : 'bg-warning-100'"
              >
                <AlertCircle
                  class="w-6 h-6"
                  :class="alert.level === 'danger' ? 'text-danger-500' : 'text-warning-500'"
                />
              </div>
              <div>
                <h4 class="font-semibold text-gray-800">{{ alert.partName }}</h4>
                <p class="text-sm text-gray-500 mt-1">
                  当前库存: <span class="font-medium" :class="alert.level === 'danger' ? 'text-danger-500' : 'text-warning-500'">{{ alert.currentQuantity }}</span>
                  / 安全库存: {{ alert.safeStock }}
                  <span class="ml-3">
                    缺货: <span class="font-medium text-danger-500">{{ alert.shortage }}</span>
                  </span>
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <el-tag
                size="large"
                :type="alert.level === 'danger' ? 'danger' : 'warning'"
                effect="light"
              >
                {{ alert.level === 'danger' ? '紧急缺货' : '库存不足' }}
              </el-tag>
              <el-button type="primary" size="small" @click="goToList">
                <Plus class="w-4 h-4 mr-1" />
                补货
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800">预警说明</h3>
      </div>
      <div class="p-6">
        <el-alert
          title="紧急缺货"
          type="error"
          :closable="false"
          show-icon
          class="mb-4"
        >
          <template #default>
            当前库存为0，需要立即采购补充，否则将影响设备维护工作。
          </template>
        </el-alert>
        <el-alert
          title="库存不足"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            当前库存低于安全库存警戒线，建议近期安排采购，避免出现缺货情况。
          </template>
        </el-alert>
      </div>
    </div>
  </div>
</template>
