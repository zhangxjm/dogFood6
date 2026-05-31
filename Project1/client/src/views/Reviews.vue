<template>
  <div>
    <div class="page-header">
      <h2>服务评价</h2>
      <p>查看客户对开锁服务的评价信息</p>
    </div>

    <el-card>
      <el-table :data="reviews" style="width: 100%" v-loading="loading" empty-text="暂无评价数据">
        <el-table-column prop="id" label="订单号" width="80" />
        <el-table-column prop="customer_name" label="客户姓名" width="120" />
        <el-table-column prop="service_type" label="服务类型" width="120" />
        <el-table-column prop="address" label="服务地址" show-overflow-tooltip />
        <el-table-column label="评分" width="150">
          <template #default="{ row }">
            <el-rate :model-value="row.rating" disabled />
          </template>
        </el-table-column>
        <el-table-column prop="review" label="评价内容" show-overflow-tooltip />
        <el-table-column prop="created_at" label="评价时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getReviews } from '../api'

const reviews = ref([])
const loading = ref(false)

const loadReviews = async () => {
  loading.value = true
  try {
    reviews.value = await getReviews()
  } catch (e) {
    ElMessage.error('加载评价数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadReviews)
</script>

<style scoped>
.page-header {
  background: white;
  padding: 20px 30px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 8px;
}

.page-header p {
  color: #909399;
  font-size: 14px;
}

.el-card {
  border-radius: 8px;
}
</style>
