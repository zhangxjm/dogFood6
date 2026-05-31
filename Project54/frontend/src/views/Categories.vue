<template>
  <div class="categories-page">
    <div class="page-header">
      <h2 class="page-title">分类管理</h2>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="8" v-for="category in categories" :key="category.id">
        <el-card class="category-card" :body-style="{ padding: '20px' }">
          <div class="category-header">
            <div class="category-icon">{{ category.icon }}</div>
            <div class="category-actions">
              <el-button type="primary" text size="small" @click="openEditDialog(category)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" text size="small" @click="deleteCategory(category)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="category-name">{{ category.name }}</div>
          <div class="category-desc">{{ category.description }}</div>
          <div class="category-footer">
            <el-tag type="info" effect="light">
              {{ category.template_count }} 个模板
            </el-tag>
            <span class="sort-order">排序: {{ category.sort_order }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-empty v-if="categories.length === 0 && !loading" description="暂无分类" />

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '新增分类'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="分类名称" required>
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类图标">
          <el-input v-model="form.icon" placeholder="输入emoji图标，如：💻 📚 🎨" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { categoryApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

const loading = ref(false)
const categories = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const form = ref({
  name: '',
  description: '',
  icon: '',
  sort_order: 0
})

const loadCategories = async () => {
  loading.value = true
  try {
    const data = await categoryApi.list()
    categories.value = data || []
  } catch (error) {
    ElMessage.error('加载分类失败')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  isEdit.value = false
  editId.value = null
  form.value = {
    name: '',
    description: '',
    icon: '',
    sort_order: 0
  }
  dialogVisible.value = true
}

const openEditDialog = (category) => {
  isEdit.value = true
  editId.value = category.id
  form.value = {
    name: category.name,
    description: category.description || '',
    icon: category.icon || '',
    sort_order: category.sort_order || 0
  }
  dialogVisible.value = true
}

const saveCategory = async () => {
  if (!form.value.name) {
    ElMessage.warning('请输入分类名称')
    return
  }
  try {
    if (isEdit.value) {
      await categoryApi.update(editId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await categoryApi.create(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadCategories()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
  }
}

const deleteCategory = (category) => {
  if (category.template_count > 0) {
    ElMessage.warning('该分类下存在模板，无法删除')
    return
  }
  ElMessageBox.confirm(`确定要删除分类"${category.name}"吗？`, '删除确认', {
    type: 'warning'
  }).then(async () => {
    try {
      await categoryApi.delete(category.id)
      ElMessage.success('删除成功')
      loadCategories()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.categories-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.category-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.category-icon {
  font-size: 40px;
}

.category-actions {
  display: flex;
  gap: 4px;
}

.category-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #1e293b;
}

.category-desc {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
  min-height: 42px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.sort-order {
  font-size: 12px;
  color: #94a3b8;
}
</style>
