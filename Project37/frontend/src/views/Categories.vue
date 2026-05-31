<template>
  <div class="categories-page">
    <el-card class="action-card">
      <div class="action-bar">
        <el-button type="primary" @click="addRootCategory">
          <el-icon><Plus /></el-icon>新增根分类
        </el-button>
        <el-button @click="loadCategories">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </el-card>

    <el-card class="tree-card">
      <el-tree
        ref="treeRef"
        :data="categoryTree"
        node-key="id"
        default-expand-all
        :props="{ label: 'name', children: 'children' }"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <span class="node-label">
              <el-icon><Folder /></el-icon>
              {{ data.name }}
            </span>
            <span class="node-actions">
              <el-button type="primary" link size="small" @click.stop="addSubCategory(data)">
                <el-icon><Plus /></el-icon>添加子分类
              </el-button>
              <el-button type="primary" link size="small" @click.stop="editCategory(data)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button type="danger" link size="small" @click.stop="deleteCategory(data)">
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </span>
          </div>
        </template>
      </el-tree>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入分类描述" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="父分类" v-if="isEdit === false && parentCategory">
          <el-input :value="parentCategory.name" disabled />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Folder, Edit, Delete } from '@element-plus/icons-vue'
import { getCategories, createCategory, updateCategory, deleteCategory as deleteCategoryApi } from '@/api'

const treeRef = ref(null)
const categoryTree = ref([])
const categories = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const parentCategory = ref(null)

const dialogTitle = ref('新增分类')

const form = reactive({
  id: null,
  name: '',
  description: '',
  parentId: 0,
  sortOrder: 0
})

const buildCategoryTree = (cats, parentId = 0) => {
  return cats
    .filter(c => c.parentId === parentId)
    .map(c => ({
      ...c,
      children: buildCategoryTree(cats, c.id)
    }))
}

const loadCategories = () => {
  getCategories().then(res => {
    categories.value = res.data || []
    categoryTree.value = buildCategoryTree(categories.value)
  })
}

const addRootCategory = () => {
  isEdit.value = false
  parentCategory.value = null
  dialogTitle.value = '新增根分类'
  form.id = null
  form.name = ''
  form.description = ''
  form.parentId = 0
  form.sortOrder = 0
  dialogVisible.value = true
}

const addSubCategory = (data) => {
  isEdit.value = false
  parentCategory.value = data
  dialogTitle.value = '新增子分类 - ' + data.name
  form.id = null
  form.name = ''
  form.description = ''
  form.parentId = data.id
  form.sortOrder = 0
  dialogVisible.value = true
}

const editCategory = (data) => {
  isEdit.value = true
  parentCategory.value = categories.value.find(c => c.id === data.parentId)
  dialogTitle.value = '编辑分类'
  form.id = data.id
  form.name = data.name
  form.description = data.description || ''
  form.parentId = data.parentId
  form.sortOrder = data.sortOrder || 0
  dialogVisible.value = true
}

const saveCategory = () => {
  if (!form.name.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  if (isEdit.value) {
    updateCategory(form.id, form).then(() => {
      ElMessage.success('更新成功')
      dialogVisible.value = false
      loadCategories()
    })
  } else {
    createCategory(form).then(() => {
      ElMessage.success('创建成功')
      dialogVisible.value = false
      loadCategories()
    })
  }
}

const deleteCategory = (data) => {
  const hasChildren = categories.value.some(c => c.parentId === data.id)
  if (hasChildren) {
    ElMessage.warning('该分类下存在子分类，无法删除')
    return
  }

  ElMessageBox.confirm(`确定要删除分类"${data.name}"吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteCategoryApi(data.id).then(() => {
      ElMessage.success('删除成功')
      loadCategories()
    })
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
  gap: 16px;
}

.action-card {
  border: none;
  border-radius: 8px;
}

.action-bar {
  display: flex;
  gap: 12px;
}

.tree-card {
  border: none;
  border-radius: 8px;
  min-height: 500px;
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 0;
}

.node-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.node-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.tree-node:hover .node-actions {
  opacity: 1;
}
</style>
