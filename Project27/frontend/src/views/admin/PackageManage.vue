<template>
  <div class="admin-page">
    <div class="flex-between mb-20">
      <h2 class="page-title" style="margin: 0;">套餐管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 添加套餐
      </el-button>
    </div>

    <el-card>
      <el-table :data="packages" style="width: 100%">
        <el-table-column prop="name" label="套餐名称" width="150" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="天数" width="100" />
        <el-table-column prop="suitableFor" label="适用人群" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showDialog" :title="isEdit ? '编辑套餐' : '添加套餐'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="套餐名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
          <span class="ml-10">元</span>
        </el-form-item>
        <el-form-item label="天数">
          <el-input-number v-model="form.duration" :min="1" />
          <span class="ml-10">天</span>
        </el-form-item>
        <el-form-item label="包含服务">
          <el-input v-model="form.services" type="textarea" :rows="2" placeholder="用逗号分隔" />
        </el-form-item>
        <el-form-item label="适用人群">
          <el-input v-model="form.suitableFor" />
        </el-form-item>
        <el-form-item label="状态" v-if="isEdit">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getPackageList, savePackage, updatePackage, deletePackage } from '@/api/package'
import { ElMessage, ElMessageBox } from 'element-plus'

const packages = ref([])
const showDialog = ref(false)
const isEdit = ref(false)

const form = reactive({
  id: null,
  name: '',
  description: '',
  price: 0,
  duration: 30,
  services: '',
  suitableFor: '',
  status: 1
})

const handleAdd = () => {
  isEdit.value = false
  Object.keys(form).forEach(key => {
    form[key] = key === 'duration' ? 30 : key === 'price' ? 0 : key === 'status' ? 1 : ''
  })
  showDialog.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.id = row.id
  form.name = row.name
  form.description = row.description
  form.price = row.price
  form.duration = row.duration
  form.services = row.services
  form.suitableFor = row.suitableFor
  form.status = row.status
  showDialog.value = true
}

const handleSave = async () => {
  let res
  if (isEdit.value) {
    res = await updatePackage(form)
  } else {
    res = await savePackage(form)
  }
  
  if (res.code === 200) {
    ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
    showDialog.value = false
    loadPackages()
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该套餐吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deletePackage(id)
    ElMessage.success('删除成功')
    loadPackages()
  } catch (e) {
  }
}

const loadPackages = async () => {
  const res = await getPackageList()
  if (res.code === 200) {
    packages.value = res.data
  }
}

onMounted(() => {
  loadPackages()
})
</script>

<style scoped>
.admin-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  min-height: calc(100vh - 100px);
}
</style>
