<template>
  <div>
    <div class="page-header">
      <h2>订单详情</h2>
      <p>查看开锁服务订单详细信息</p>
    </div>

    <div v-if="order" class="detail-container">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>基本信息</span>
                <el-tag :type="getStatusType(order.status)" size="large">
                  {{ getStatusText(order.status) }}
                </el-tag>
              </div>
            </template>

            <el-descriptions :column="2" border>
              <el-descriptions-item label="订单号">#{{ order.id }}</el-descriptions-item>
              <el-descriptions-item label="客户姓名">{{ order.customer_name }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ order.phone }}</el-descriptions-item>
              <el-descriptions-item label="服务类型">{{ order.service_type }}</el-descriptions-item>
              <el-descriptions-item label="服务地址" :span="2">{{ order.address }}</el-descriptions-item>
              <el-descriptions-item label="问题描述" :span="2">
                {{ order.description || '无' }}
              </el-descriptions-item>
              <el-descriptions-item label="预约时间">{{ order.appointment_time || '未设置' }}</el-descriptions-item>
              <el-descriptions-item label="服务费用">¥{{ order.price?.toFixed(2) || '0.00' }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ order.created_at }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ order.updated_at }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card v-if="order.status === 'completed'" class="review-card">
            <template #header>
              <div class="card-header">
                <span>客户评价</span>
              </div>
            </template>

            <div v-if="order.rating && order.rating > 0" class="review-content">
              <el-rate :model-value="order.rating" disabled />
              <p class="review-text">{{ order.review || '用户未填写评价内容' }}</p>
            </div>

            <div v-else>
              <p class="no-review">暂无评价</p>
              <el-button type="primary" @click="openReviewForm">添加评价</el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card>
            <template #header>
              <span>操作</span>
            </template>
            <div class="action-buttons">
              <el-button type="primary" style="width: 100%" @click="$router.push(`/orders/${order.id}/edit`)">
                编辑订单
              </el-button>
              <el-button
                v-if="order.status !== 'completed'"
                type="success"
                style="width: 100%"
                @click="completeOrder"
              >
                标记完成
              </el-button>
              <el-button type="warning" style="width: 100%" @click="openReviewForm">
                添加评价
              </el-button>
              <el-button type="danger" style="width: 100%" @click="handleDelete">
                删除订单
              </el-button>
              <el-button style="width: 100%" @click="$router.back()">
                返回列表
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog v-model="showReviewForm" title="添加服务评价" width="500px">
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="评分">
          <el-rate v-model="reviewForm.rating" />
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input
            v-model="reviewForm.review"
            type="textarea"
            :rows="4"
            placeholder="请输入您的评价"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReviewForm = false">取消</el-button>
        <el-button type="primary" @click="submitReview">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrder, updateOrderStatus, deleteOrder as apiDeleteOrder, addReview as apiAddReview } from '../api'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const showReviewForm = ref(false)
const reviewForm = ref({ rating: 5, review: '' })

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成'
  }
  return texts[status] || status
}

const loadOrder = async () => {
  try {
    order.value = await getOrder(route.params.id)
  } catch (e) {
    ElMessage.error('加载订单信息失败')
    router.push('/orders')
  }
}

const completeOrder = async () => {
  try {
    await updateOrderStatus(order.value.id, 'completed')
    ElMessage.success('订单已标记为完成')
    loadOrder()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除订单 #${order.value.id} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await apiDeleteOrder(order.value.id)
    ElMessage.success('删除成功')
    router.push('/orders')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const openReviewForm = () => {
  if (order.value.status !== 'completed') {
    ElMessage.warning('请先将订单标记为完成后再评价')
    return
  }
  showReviewForm.value = true
}

const submitReview = async () => {
  if (!reviewForm.value.rating) {
    ElMessage.warning('请选择评分')
    return
  }
  try {
    await apiAddReview(order.value.id, reviewForm.value)
    ElMessage.success('评价提交成功')
    showReviewForm.value = false
    loadOrder()
  } catch (e) {
    ElMessage.error('评价提交失败')
  }
}

onMounted(loadOrder)
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

.detail-container .el-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.review-card .review-content {
  text-align: center;
  padding: 20px 0;
}

.review-card .review-text {
  margin-top: 15px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.review-card .no-review {
  color: #909399;
  text-align: center;
  padding: 20px 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
