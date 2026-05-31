<template>
  <div class="declaration-detail">
    <div class="page-header">
      <div class="flex">
        <el-button @click="goBack" class="mr-10">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2 class="page-title">申报单详情</h2>
      </div>
      <div>
        <el-button 
          v-if="declaration?.status === 'DRAFT'" 
          type="primary" 
          @click="submitDeclaration"
        >
          提交申报
        </el-button>
      </div>
    </div>

    <el-descriptions :column="3" border class="mb-20">
      <el-descriptions-item label="申报单号">
        {{ declaration?.declaration_no }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusType(declaration?.status)">
          {{ getStatusText(declaration?.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="申报类型">
        {{ declaration?.declaration_type === 'EXPORT' ? '出口' : '进口' }}
      </el-descriptions-item>
      <el-descriptions-item label="贸易方式">
        {{ getTradeModeText(declaration?.trade_mode) }}
      </el-descriptions-item>
      <el-descriptions-item label="运输方式">
        {{ getTransportModeText(declaration?.transport_mode) }}
      </el-descriptions-item>
      <el-descriptions-item label="货币">
        {{ declaration?.currency }}
      </el-descriptions-item>
      <el-descriptions-item label="出口商" :span="3">
        {{ declaration?.exporter_name }}
      </el-descriptions-item>
      <el-descriptions-item label="进口商" :span="3">
        {{ declaration?.importer_name }}
      </el-descriptions-item>
      <el-descriptions-item label="出境口岸">
        {{ declaration?.port_of_departure }}
      </el-descriptions-item>
      <el-descriptions-item label="入境口岸">
        {{ declaration?.port_of_entry }}
      </el-descriptions-item>
      <el-descriptions-item label="离境日期">
        {{ formatDate(declaration?.departure_date) }}
      </el-descriptions-item>
      <el-descriptions-item label="商品总值">
        ${{ Number(declaration?.total_value || 0).toFixed(2) }}
      </el-descriptions-item>
      <el-descriptions-item label="关税">
        ${{ Number(declaration?.customs_duty || 0).toFixed(2) }}
      </el-descriptions-item>
      <el-descriptions-item label="消费税">
        ${{ Number(declaration?.consumption_tax || 0).toFixed(2) }}
      </el-descriptions-item>
      <el-descriptions-item label="增值税">
        ${{ Number(declaration?.vat_amount || 0).toFixed(2) }}
      </el-descriptions-item>
      <el-descriptions-item label="总税费" class="text-danger">
        <strong>${{ Number(declaration?.total_tax || 0).toFixed(2) }}</strong>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ formatDate(declaration?.created_at) }}
      </el-descriptions-item>
      <el-descriptions-item label="提交时间">
        {{ formatDate(declaration?.submitted_at) }}
      </el-descriptions-item>
      <el-descriptions-item label="放行时间">
        {{ formatDate(declaration?.released_at) }}
      </el-descriptions-item>
    </el-descriptions>

    <div class="card mb-20">
      <h3 class="card-title">商品明细</h3>
      <el-table :data="items" border>
        <el-table-column label="序号" type="index" width="60" />
        <el-table-column prop="product_name" label="商品名称" min-width="180" />
        <el-table-column prop="hs_code" label="HS编码" width="140" />
        <el-table-column prop="origin_country" label="原产国" width="100" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="unit_price" label="单价" width="120">
          <template #default="scope">
            ${{ Number(scope.row.unit_price).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="总值" width="120">
          <template #default="scope">
            ${{ Number(scope.row.total_amount).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="税率" width="150">
          <template #default="scope">
            关税: {{ (scope.row.customs_duty_rate * 100).toFixed(2) }}%<br>
            消费: {{ (scope.row.consumption_tax_rate * 100).toFixed(2) }}%<br>
            增值税: {{ (scope.row.vat_rate * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column label="税费" width="120">
          <template #default="scope">
            ${{ Number(scope.row.total_tax_amount).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="verification_status" label="核验状态" width="120">
          <template #default="scope">
            <el-tag :type="getVerificationType(scope.row.verification_status)">
              {{ getVerificationText(scope.row.verification_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="verification_message" label="核验信息" show-overflow-tooltip />
      </el-table>
    </div>

    <div class="card">
      <h3 class="card-title">清关流程追踪</h3>
      <el-steps :active="getCurrentStep()" direction="vertical" finish-status="success">
        <el-step title="创建申报单" :description="formatDate(statusLogs[0]?.created_at)" />
        <el-step title="提交至海关" :description="formatDate(getStatusLog('SUBMITTED')?.created_at)" />
        <el-step title="海关接收" :description="formatDate(getStatusLog('CUSTOMS_RECEIVED')?.created_at)" />
        <el-step title="海关查验" :description="formatDate(getStatusLog('INSPECTING')?.created_at)" />
        <el-step title="货物放行" :description="formatDate(getStatusLog('RELEASED')?.created_at)" />
        <el-step title="结关完成" :description="formatDate(getStatusLog('CLEARED')?.created_at)" />
      </el-steps>

      <el-timeline class="mt-20">
        <el-timeline-item
          v-for="(log, index) in statusLogs"
          :key="index"
          :timestamp="formatDate(log.created_at)"
          :type="getStatusTimelineType(log.status)"
        >
          <h4>{{ getStatusText(log.status) }}</h4>
          <p>{{ log.message }}</p>
          <p v-if="log.operator" class="text-info">操作人: {{ log.operator }}</p>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { declarationApi } from '@/api';

const route = useRoute();
const router = useRouter();
const declaration = ref(null);
const items = ref([]);
const statusLogs = ref([]);

const loadDetail = async () => {
  try {
    const res = await declarationApi.getDeclaration(route.params.id);
    if (res.success) {
      declaration.value = res.data;
      items.value = res.data.items;
      statusLogs.value = res.data.status_logs || [];
    }
  } catch (error) {
    ElMessage.error('加载申报单详情失败');
    console.error(error);
  }
};

const submitDeclaration = async () => {
  try {
    await ElMessageBox.confirm('确定要提交该申报单至海关系统吗？', '确认提交', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const res = await declarationApi.submitDeclaration(route.params.id, { submit_now: true });
    if (res.success) {
      ElMessage.success('申报单提交成功');
      loadDetail();
    } else {
      ElMessage.error(res.error?.message || '提交失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('提交失败');
      console.error(error);
    }
  }
};

const goBack = () => {
  router.push('/declarations');
};

const getStatusText = (status) => {
  const statusMap = {
    'DRAFT': '草稿',
    'SUBMITTED': '已提交',
    'CUSTOMS_RECEIVED': '海关已接收',
    'INSPECTING': '查验中',
    'RELEASED': '已放行',
    'CLEARED': '已结关',
    'REJECTED': '已退单'
  };
  return statusMap[status] || status;
};

const getStatusType = (status) => {
  const typeMap = {
    'DRAFT': 'info',
    'SUBMITTED': 'primary',
    'CUSTOMS_RECEIVED': 'success',
    'INSPECTING': 'warning',
    'RELEASED': 'success',
    'CLEARED': 'success',
    'REJECTED': 'danger'
  };
  return typeMap[status] || 'info';
};

const getCurrentStep = () => {
  const statusOrder = ['DRAFT', 'SUBMITTED', 'CUSTOMS_RECEIVED', 'INSPECTING', 'RELEASED', 'CLEARED'];
  const currentStatus = declaration.value?.status;
  const index = statusOrder.indexOf(currentStatus);
  return index >= 0 ? index + 1 : 0;
};

const getStatusLog = (status) => {
  return statusLogs.value.find(log => log.status === status);
};

const getStatusTimelineType = (status) => {
  const typeMap = {
    'DRAFT': 'primary',
    'SUBMITTED': 'primary',
    'CUSTOMS_RECEIVED': 'success',
    'INSPECTING': 'warning',
    'RELEASED': 'success',
    'CLEARED': 'success',
    'REJECTED': 'danger'
  };
  return typeMap[status] || '';
};

const getVerificationText = (status) => {
  const map = {
    'PENDING': '待核验',
    'VERIFIED': '已核验',
    'NEEDS_REVIEW': '需人工复核',
    'FAILED': '核验失败'
  };
  return map[status] || status;
};

const getVerificationType = (status) => {
  const map = {
    'PENDING': 'info',
    'VERIFIED': 'success',
    'NEEDS_REVIEW': 'warning',
    'FAILED': 'danger'
  };
  return map[status] || 'info';
};

const getTradeModeText = (mode) => {
  const modeMap = {
    'GENERAL_TRADE': '一般贸易',
    'BONDED_AREA': '保税区',
    'PROCESSING_TRADE': '加工贸易'
  };
  return modeMap[mode] || mode;
};

const getTransportModeText = (mode) => {
  const modeMap = {
    'SEA': '海运',
    'AIR': '空运',
    'LAND': '陆运',
    'EXPRESS': '快递'
  };
  return modeMap[mode] || mode;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

onMounted(() => {
  loadDetail();
});
</script>

<style scoped>
.mr-10 {
  margin-right: 10px;
}

.text-danger {
  color: #f56c6c;
}

.text-info {
  color: #909399;
}

.mt-20 {
  margin-top: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}
</style>
