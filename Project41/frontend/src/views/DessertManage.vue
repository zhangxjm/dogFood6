<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">甜品管理</h1>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加甜品
      </el-button>
    </div>

    <el-card>
      <el-table :data="desserts" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图片" width="120">
          <template #default="{ row }">
            <img :src="row.image" :alt="row.name" class="table-image" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="甜品名称" width="150" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <span class="price-text">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="prepTime" label="制作时间(分钟)" width="120" />
        <el-table-column label="可定制" width="80">
          <template #default="{ row }">
            <el-tag :type="row.customizable ? 'success' : 'info'">
              {{ row.customizable ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.available ? 'success' : 'danger'">
              {{ row.available ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑甜品' : '添加甜品'"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="甜品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入甜品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%;">
            <el-option label="蛋糕" value="蛋糕" />
            <el-option label="慕斯" value="慕斯" />
            <el-option label="西点" value="西点" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="制作时间" prop="prepTime">
          <el-input-number v-model="form.prepTime" :min="0" suffix="分钟" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="图片URL" prop="image">
          <el-input v-model="form.image" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="可定制">
          <el-switch v-model="form.customizable" />
        </el-form-item>
        <el-form-item label="上架">
          <el-switch v-model="form.available" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { dessertApi } from '@/api'

const desserts = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formRef = ref(null)

const form = reactive({
  name: '',
  category: '',
  price: 0,
  prepTime: 0,
  image: '',
  description: '',
  customizable: true,
  available: true
})

const rules = {
  name: [{ required: true, message: '请输入甜品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  prepTime: [{ required: true, message: '请输入制作时间', trigger: 'blur' }],
  image: [{ required: true, message: '请输入图片URL', trigger: 'blur' }]
}

const getCategoryType = (category) => {
  const types = {
    '蛋糕': 'danger',
    '慕斯': 'warning',
    '西点': 'success'
  }
  return types[category] || 'info'
}

const loadDesserts = async () => {
  try {
    const res = await dessertApi.getAll()
    if (res.success) {
      desserts.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

const openAddDialog = () => {
  isEdit.value = false
  editId.value = null
  Object.assign(form, {
    name: '',
    category: '',
    price: 0,
    prepTime: 0,
    image: '',
    description: '',
    customizable: true,
    available: true
  })
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    name: row.name,
    category: row.category,
    price: row.price,
    prepTime: row.prepTime,
    image: row.image,
    description: row.description,
    customizable: row.customizable,
    available: row.available
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          const res = await dessertApi.update(editId.value, form)
          if (res.success) {
            ElMessage.success('更新成功')
          }
        } else {
          const res = await dessertApi.create(form)
          if (res.success) {
            ElMessage.success('添加成功')
          }
        }
        dialogVisible.value = false
        loadDesserts()
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该甜品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await dessertApi.delete(row.id)
      if (res.success) {
        ElMessage.success('删除成功')
        loadDesserts()
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadDesserts()
})
</script>

<style scoped>
.table-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.price-text {
  color: #e74c3c;
  font-weight: bold;
}
</style>
