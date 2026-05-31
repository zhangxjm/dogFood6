<template>
  <div class="products">
    <div class="page-header">
      <h2 class="page-title">侵权商品监测</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加监测商品
      </el-button>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="平台">
          <el-select v-model="filterForm.platform" placeholder="全部平台" clearable style="width: 150px">
            <el-option label="Amazon" value="Amazon" />
            <el-option label="eBay" value="eBay" />
            <el-option label="AliExpress" value="AliExpress" />
            <el-option label="Shopee" value="Shopee" />
            <el-option label="Wish" value="Wish" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="待检测" value="PENDING" />
            <el-option label="疑似侵权" value="SUSPECTED" />
            <el-option label="确认侵权" value="CONFIRMED" />
            <el-option label="无侵权" value="CLEARED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchProducts">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="products" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" min-width="180" />
        <el-table-column prop="platform" label="平台" width="120">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.platform }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sellerName" label="卖家" width="140" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            ${{ row.price?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="infringementScore" label="侵权分数" width="100">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.infringementScore || 0" 
              :color="getScoreColor(row.infringementScore)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column label="侵权状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.infringementStatus)" size="small">
              {{ getStatusText(row.infringementStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="detectedAt" label="检测时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.detectedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="analyzeProduct(row.id)">
              <el-icon><View /></el-icon>
              分析
            </el-button>
            <el-button type="success" link size="small" @click="collectEvidence(row)">
              <el-icon><Document /></el-icon>
              取证
            </el-button>
            <el-button type="danger" link size="small" @click="deleteProduct(row.id)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showAddDialog" title="添加监测商品" width="600px">
      <el-form :model="productForm" :rules="productRules" ref="productFormRef" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="平台" prop="platform">
          <el-select v-model="productForm.platform" placeholder="请选择平台" style="width: 100%">
            <el-option label="Amazon" value="Amazon" />
            <el-option label="eBay" value="eBay" />
            <el-option label="AliExpress" value="AliExpress" />
            <el-option label="Shopee" value="Shopee" />
            <el-option label="Wish" value="Wish" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品链接" prop="productUrl">
          <el-input v-model="productForm.productUrl" placeholder="请输入商品链接" />
        </el-form-item>
        <el-form-item label="卖家名称">
          <el-input v-model="productForm.sellerName" placeholder="请输入卖家名称" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="productForm.price" :min="0" :precision="2" />
          <span style="margin-left: 10px">USD</span>
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input v-model="productForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addProduct">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const products = ref([])
const loading = ref(false)
const showAddDialog = ref(false)
const productFormRef = ref(null)

const filterForm = ref({
  platform: '',
  status: ''
})

const productForm = ref({
  name: '',
  platform: '',
  productUrl: '',
  sellerName: '',
  price: 0,
  description: ''
})

const productRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
  productUrl: [{ required: true, message: '请输入商品链接', trigger: 'blur' }]
}

const fetchProducts = async () => {
  loading.value = true
  try {
    let url = '/api/products'
    if (filterForm.value.status) {
      url = `/api/products/status/${filterForm.value.status}`
    }
    const res = await axios.get(url)
    let data = res.data
    if (filterForm.value.platform) {
      data = data.filter(p => p.platform === filterForm.value.platform)
    }
    products.value = data
  } catch (error) {
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filterForm.value = { platform: '', status: '' }
  fetchProducts()
}

const addProduct = async () => {
  await productFormRef.value?.validate()
  try {
    await axios.post('/api/products', productForm.value)
    ElMessage.success('商品添加成功')
    showAddDialog.value = false
    productForm.value = { name: '', platform: '', productUrl: '', sellerName: '', price: 0, description: '' }
    fetchProducts()
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

const analyzeProduct = async (id) => {
  try {
    await axios.post(`/api/products/${id}/analyze`)
    ElMessage.success('已开始分析，请稍后刷新查看结果')
    setTimeout(fetchProducts, 2000)
  } catch (error) {
    ElMessage.error('分析失败')
  }
}

const collectEvidence = async (row) => {
  try {
    await axios.post(`/api/evidence/collect/${row.id}?productName=${row.name}&platform=${row.platform}`)
    ElMessage.success('证据收集任务已发送')
  } catch (error) {
    ElMessage.error('证据收集失败')
  }
}

const deleteProduct = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', { type: 'warning' })
    await axios.delete(`/api/products/${id}`)
    ElMessage.success('删除成功')
    fetchProducts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const getStatusType = (status) => {
  const types = { PENDING: 'info', SUSPECTED: 'warning', CONFIRMED: 'danger', CLEARED: 'success' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { PENDING: '待检测', SUSPECTED: '疑似侵权', CONFIRMED: '确认侵权', CLEARED: '无侵权' }
  return texts[status] || status
}

const getScoreColor = (score) => {
  if (score >= 70) return '#f56c6c'
  if (score >= 40) return '#e6a23c'
  return '#67c23a'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(fetchProducts)
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.filter-card,
.table-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}
</style>
