<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">创建预定订单</h1>
    </div>

    <el-row :gutter="20">
      <el-col :span="14">
        <el-card>
          <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
            <el-form-item label="客户姓名" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
            </el-form-item>
            <el-form-item label="联系电话" prop="customerPhone">
              <el-input v-model="form.customerPhone" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="选择甜品" prop="dessertId">
              <el-select v-model="form.dessertId" placeholder="请选择甜品" style="width: 100%;" @change="onDessertChange">
                <el-option
                  v-for="dessert in desserts"
                  :key="dessert.id"
                  :label="dessert.name"
                  :value="dessert.id"
                >
                  <span>{{ dessert.name }}</span>
                  <span style="float: right; color: #e74c3c;">¥{{ dessert.price }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="单价">
              <el-input v-model="form.unitPrice" readonly style="background: #f5f5f5;">
                <template #prepend>¥</template>
              </el-input>
            </el-form-item>
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="form.quantity" :min="1" @change="calculateTotal" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="总价">
              <el-input v-model="form.totalPrice" readonly style="background: #f5f5f5;">
                <template #prepend>¥</template>
              </el-input>
            </el-form-item>
            <el-form-item label="自提时间" prop="pickupTime">
              <el-date-picker
                v-model="form.pickupTime"
                type="datetime"
                placeholder="选择自提时间"
                style="width: 100%;"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
            <el-form-item label="定制要求">
              <el-input
                v-model="form.customization"
                type="textarea"
                :rows="3"
                placeholder="请输入定制要求，如：口味、尺寸、装饰等"
              />
            </el-form-item>
            <el-form-item label="特殊要求">
              <el-input
                v-model="form.specialRequests"
                type="textarea"
                :rows="2"
                placeholder="其他特殊要求"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSubmit" :loading="submitting">
                <el-icon><Check /></el-icon>
                提交订单
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card v-if="selectedDessert" class="dessert-preview">
          <div class="preview-header">
            <h3>订单预览</h3>
          </div>
          <img :src="selectedDessert.image" :alt="selectedDessert.name" class="preview-image" />
          <div class="preview-info">
            <h4 class="preview-name">{{ selectedDessert.name }}</h4>
            <p class="preview-desc">{{ selectedDessert.description }}</p>
            <div class="preview-details">
              <div class="detail-row">
                <span class="label">分类:</span>
                <el-tag size="small">{{ selectedDessert.category }}</el-tag>
              </div>
              <div class="detail-row">
                <span class="label">制作时间:</span>
                <span>{{ selectedDessert.prepTime }} 分钟</span>
              </div>
              <div class="detail-row">
                <span class="label">单价:</span>
                <span class="price">¥{{ selectedDessert.price }}</span>
              </div>
              <div class="detail-row" v-if="form.quantity">
                <span class="label">数量:</span>
                <span>{{ form.quantity }} 份</span>
              </div>
              <div class="detail-row total">
                <span class="label">总价:</span>
                <span class="price total-price">¥{{ form.totalPrice }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <el-card v-else class="empty-preview">
          <el-empty description="请选择甜品查看预览" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { dessertApi, orderApi } from '@/api'

const route = useRoute()
const router = useRouter()

const desserts = ref([])
const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  customerName: '',
  customerPhone: '',
  dessertId: null,
  unitPrice: 0,
  quantity: 1,
  totalPrice: 0,
  pickupTime: null,
  customization: '',
  specialRequests: ''
})

const rules = {
  customerName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  customerPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  dessertId: [{ required: true, message: '请选择甜品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  pickupTime: [{ required: true, message: '请选择自提时间', trigger: 'change' }]
}

const selectedDessert = computed(() => {
  if (form.dessertId) {
    return desserts.value.find(d => d.id === form.dessertId)
  }
  return null
})

const loadDesserts = async () => {
  try {
    const res = await dessertApi.getAvailable()
    if (res.success) {
      desserts.value = res.data
      
      if (route.query.dessertId) {
        form.dessertId = Number(route.query.dessertId)
        onDessertChange()
      }
    }
  } catch (error) {
    ElMessage.error('加载甜品数据失败')
  }
}

const onDessertChange = () => {
  const dessert = desserts.value.find(d => d.id === form.dessertId)
  if (dessert) {
    form.unitPrice = dessert.price
    calculateTotal()
  }
}

const calculateTotal = () => {
  form.totalPrice = Number((form.unitPrice * form.quantity).toFixed(2))
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const orderData = {
          ...form,
          status: 'PENDING',
          progressStatus: 'WAITING'
        }
        const res = await orderApi.create(orderData)
        if (res.success) {
          ElMessage.success('订单创建成功！订单号: ' + res.data.orderNo)
          router.push('/orders')
        }
      } catch (error) {
        ElMessage.error('订单创建失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.dessertId = null
  form.unitPrice = 0
  form.quantity = 1
  form.totalPrice = 0
}

onMounted(() => {
  loadDesserts()
})
</script>

<style scoped>
.dessert-preview {
  position: sticky;
  top: 20px;
}

.preview-header {
  margin-bottom: 16px;
}

.preview-header h3 {
  margin: 0;
  color: #8b4513;
}

.preview-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 16px;
}

.preview-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #333;
}

.preview-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 16px 0;
}

.preview-details {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.detail-row .label {
  color: #888;
  font-size: 14px;
}

.detail-row .price {
  color: #e74c3c;
  font-weight: bold;
}

.detail-row.total {
  border-top: 1px solid #eee;
  padding-top: 10px;
  margin-top: 10px;
}

.detail-row .total-price {
  font-size: 20px;
}

.empty-preview {
  text-align: center;
}
</style>
