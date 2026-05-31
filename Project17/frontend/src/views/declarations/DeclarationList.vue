<template>
  <div class="declaration-list">
    <div class="page-header">
      <h2 class="page-title">申报单管理</h2>
      <el-button type="primary" @click="goToCreate">
        <el-icon><Plus /></el-icon>
        新建申报单
      </el-button>
    </div>

    <div class="card mb-20">
      <el-form :inline="true" :model="searchForm" @submit.prevent>
        <el-form-item label="申报单号">
          <el-input v-model="searchForm.keyword" placeholder="请输入申报单号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已提交" value="SUBMITTED" />
            <el-option label="海关已接收" value="CUSTOMS_RECEIVED" />
            <el-option label="查验中" value="INSPECTING" />
            <el-option label="已放行" value="RELEASED" />
            <el-option label="已结关" value="CLEARED" />
            <el-option label="已退单" value="REJECTED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadDeclarations">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card">
      <el-table :data="declarations" v-loading="loading" style="width: 100%">
        <el-table-column prop="declaration_no" label="申报单号" width="180" />
        <el-table-column prop="declaration_type" label="类型" width="100">
          <template #default="scope">
            {{ scope.row.declaration_type === 'EXPORT' ? '出口' : '进口' }}
          </template>
        </el-table-column>
        <el-table-column prop="trade_mode" label="贸易方式" width="120">
          <template #default="scope">
            {{ getTradeModeText(scope.row.trade_mode) }}
          </template>
        </el-table-column>
        <el-table-column prop="exporter_name" label="出口商" show-overflow-tooltip />
        <el-table-column prop="importer_name" label="进口商" show-overflow-tooltip />
        <el-table-column prop="port_of_entry" label="入境口岸" width="120" />
        <el-table-column prop="total_value" label="总金额(USD)" width="140">
          <template #default="scope">
            ${{ Number(scope.row.total_value).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_tax" label="税费(USD)" width="140">
          <template #default="scope">
            ${{ Number(scope.row.total_tax).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="viewDetail(scope.row.id)">查看</el-button>
            <el-button 
              v-if="scope.row.status === 'DRAFT'" 
              type="success" 
              link 
              @click="submitDeclaration(scope.row.id)"
            >
              提交申报
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { declarationApi } from '@/api';

const router = useRouter();
const declarations = ref([]);
const loading = ref(false);

const searchForm = reactive({
  keyword: '',
  status: ''
});

const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
});

const loadDeclarations = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status || undefined
    };
    const res = await declarationApi.getDeclarations(params);
    if (res.success) {
      declarations.value = res.data;
      pagination.total = res.pagination.total;
    }
  } catch (error) {
    ElMessage.error('加载申报单列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const resetSearch = () => {
  searchForm.keyword = '';
  searchForm.status = '';
  pagination.page = 1;
  loadDeclarations();
};

const goToCreate = () => {
  router.push('/declarations/new');
};

const viewDetail = (id) => {
  router.push(`/declarations/${id}`);
};

const submitDeclaration = async (id) => {
  try {
    await ElMessageBox.confirm('确定要提交该申报单至海关系统吗？', '确认提交', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const res = await declarationApi.submitDeclaration(id, { submit_now: true });
    if (res.success) {
      ElMessage.success('申报单提交成功，海关受理号: ' + res.data.customs_reference_no);
      loadDeclarations();
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

const handleSizeChange = (size) => {
  pagination.page_size = size;
  pagination.page = 1;
  loadDeclarations();
};

const handleCurrentChange = (page) => {
  pagination.page = page;
  loadDeclarations();
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

const getTradeModeText = (mode) => {
  const modeMap = {
    'GENERAL_TRADE': '一般贸易',
    'BONDED_AREA': '保税区',
    'PROCESSING_TRADE': '加工贸易',
    'TEMPORARY_IMPORT': '暂时进出口'
  };
  return modeMap[mode] || mode;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

onMounted(() => {
  loadDeclarations();
});
</script>

<style scoped>
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
