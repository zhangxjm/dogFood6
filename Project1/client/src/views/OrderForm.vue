<template>
  <div>
    <div class="page-header">
      <h2>{{ isEdit ? '编辑订单' : '新增订单' }}</h2>
      <p>{{ isEdit ? '修改开锁服务订单信息' : '创建新的开锁服务订单' }}</p>
    </div>

    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 700px; margin: 0 auto;"
      >
        <el-form-item label="客户姓名" prop="customer_name">
          <el-input v-model="form.customer_name" placeholder="请输入客户姓名" />
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>

        <el-form-item label="服务地址" prop="address">
          <el-input
            v-model="form.address"
            type="textarea"
            :rows="2"
            placeholder="请输入详细服务地址"
          />
        </el-form-item>

        <el-form-item label="服务类型" prop="service_type">
          <el-select v-model="form.service_type" placeholder="请选择服务类型" style="width: 100%">
            <el-option label="防盗门开锁" value="防盗门开锁" />
            <el-option label="汽车开锁" value="汽车开锁" />
            <el-option label="保险柜开锁" value="保险柜开锁" />
            <el-option label="防盗门换锁" value="防盗门换锁" />
            <el-option label="门锁维修" value="门锁维修" />
            <el-option label="密码锁设置" value="密码锁设置" />
            <el-option label="配钥匙" value="配钥匙" />
            <el-option label="玻璃门锁" value="玻璃门锁" />
            <el-option label="换锁芯" value="换锁芯" />
            <el-option label="其他服务" value="其他服务" />
          </el-select>
        </el-form-item>

        <el-form-item label="问题描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请描述具体情况（可选）"
          />
        </el-form-item>

        <el-form-item label="预约时间" prop="appointment_time">
          <el-date-picker
            v-model="form.appointment_time"
            type="datetime"
            placeholder="请选择预约时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>

        <el-form-item label="服务费用" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :precision="2"
            placeholder="请输入服务费用"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item v-if="isEdit" label="订单状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="pending">待处理</el-radio>
            <el-radio value="in_progress">进行中</el-radio>
            <el-radio value="completed">已完成</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            {{ isEdit ? '保存修改' : '创建订单' }}
          </el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createOrder, updateOrder, getOrder } from '../api'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)

const isEdit = computed(() => !!route.params.id)

const form = ref({
  customer_name: '',
  phone: '',
  address: '',
  service_type: '',
  description: '',
  appointment_time: '',
  price: 0,
  status: 'pending'
})

const rules = {
  customer_name: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  address: [{ required: true, message: '请输入服务地址', trigger: 'blur' }],
  service_type: [{ required: true, message: '请选择服务类型', trigger: 'change' }]
}

const loadOrder = async () => {
  if (!isEdit.value) return
  try {
    const data = await getOrder(route.params.id)
    form.value = { ...data }
  } catch (e) {
    ElMessage.error('加载订单信息失败')
    router.push('/orders')
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEdit.value) {
        await updateOrder(route.params.id, form.value)
        ElMessage.success('订单更新成功')
      } else {
        await createOrder(form.value)
        ElMessage.success('订单创建成功')
      }
      router.push('/orders')
    } catch (e) {
      ElMessage.error(isEdit.value ? '订单更新失败' : '订单创建失败')
    } finally {
      submitting.value = false
    }
  })
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

.el-card {
  border-radius: 8px;
}
</style>
