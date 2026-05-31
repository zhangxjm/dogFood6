<template>
  <div class="task-list">
    <div class="page-header">
      <h2 class="page-title">任务中心</h2>
      <el-button @click="loadTasks">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <div class="card">
      <el-table :data="tasks" v-loading="loading" style="width: 100%">
        <el-table-column prop="task_id" label="任务ID" width="280" show-overflow-tooltip />
        <el-table-column label="任务类型" width="150">
          <template #default="scope">
            <el-tag>{{ getTaskTypeText(scope.row.task_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getTaskStatusType(scope.row.status)">
              {{ getTaskStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="进度" width="200">
          <template #default="scope">
            <el-progress 
              :percentage="scope.row.progress" 
              :status="getProgressStatus(scope.row.status)" 
              :stroke-width="10"
            />
          </template>
        </el-table-column>
        <el-table-column label="结果" min-width="300" show-overflow-tooltip>
          <template #default="scope">
            <span v-if="scope.row.status === 'FAILED'" class="text-danger">
              {{ scope.row.error_message }}
            </span>
            <span v-else-if="scope.row.result">
              {{ formatResult(scope.row.result) }}
            </span>
            <span v-else class="text-info">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="completed_at" label="完成时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.completed_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 'PENDING' || scope.row.status === 'PROCESSING'" 
              type="primary" 
              link
              @click="refreshTask(scope.row.task_id)"
            >
              刷新
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="tasks.length === 0" description="暂无任务记录" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

const tasks = ref([]);
const loading = ref(false);

const loadTasks = async () => {
  loading.value = true;
  try {
    const res = await fetch('/api/tasks?page=1&page_size=50');
    const data = await res.json();
    if (data.success) {
      tasks.value = data.data || [];
    }
  } catch (error) {
      ElMessage.error('加载任务列表失败');
    } finally {
      loading.value = false;
    }
  };

const refreshTask = async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      const data = await res.json();
      if (data.success) {
        const index = tasks.value.findIndex(t => t.task_id === taskId);
        if (index !== -1) {
          tasks.value[index] = data.data;
        }
        ElMessage.success('任务状态已更新');
      }
    } catch (error) {
        console.error('Failed to refresh task:', error);
      }
    };

const getTaskTypeText = (type) => {
  const typeMap = {
    'BATCH_DECLARATION': '批量申报',
    'BATCH_STATUS_QUERY': '批量状态查询',
    'HS_CODE_BATCH_VERIFY': 'HS编码批量核验',
    'DECLARATION_AUTO_PROCESS': '申报自动处理'
  };
  return typeMap[type] || type;
};

const getTaskStatusText = (status) => {
  const statusMap = {
    'PENDING': '等待中',
    'PROCESSING': '处理中',
    'COMPLETED': '已完成',
    'FAILED': '失败'
  };
  return statusMap[status] || status;
};

const getTaskStatusType = (status) => {
  const typeMap = {
    'PENDING': 'info',
    'PROCESSING': 'warning',
    'COMPLETED': 'success',
    'FAILED': 'danger'
  };
  return typeMap[status] || 'info';
};

const getProgressStatus = (status) => {
  if (status === 'COMPLETED') return 'success';
  if (status === 'FAILED') return 'exception';
  return '';
};

const formatResult = (result) => {
  try {
    const parsed = typeof result === 'string' ? JSON.parse(result) : result;
    if (parsed?.results) {
      const success = parsed.results.filter(r => r.success).length;
      const total = parsed.results.length;
      return `成功 ${success}/${total} 项`;
    }
    return JSON.stringify(parsed);
  } catch {
    return '处理完成';
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

onMounted(() => {
  loadTasks();
});
</script>

<style scoped>
.text-danger {
  color: #f56c6c;
}

.text-info {
  color: #909399;
}
</style>
