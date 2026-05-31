<template>
  <div class="documents-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" @submit.prevent>
        <el-form-item label="分类">
          <el-cascader
            v-model="searchForm.categoryIds"
            :options="categoryTree"
            :props="{ checkStrictly: true, label: 'name', value: 'id', children: 'children' }"
            placeholder="选择分类"
            clearable
            style="width: 200px"
            @change="handleCategoryChange"
          />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索文档名称或描述"
            clearable
            style="width: 280px"
            @keyup.enter="searchDocuments"
          >
            <template #append>
              <el-button icon="Search" @click="searchDocuments" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchDocuments">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
          <el-button type="success" @click="$router.push('/upload')">
            <el-icon><Upload /></el-icon>上传文档
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="documents" v-loading="loading" stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="title" label="文档名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="doc-info">
              <el-icon :color="getFileIconColor(row.fileType)" class="doc-icon">
                <component :is="getFileIcon(row.fileType)" />
              </el-icon>
              <span class="doc-title" @click="viewDocument(row)">{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="originalFileName" label="文件名" min-width="180" show-overflow-tooltip />
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ getCategoryName(row.categoryId) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="权限" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getPermissionType(row.permissionLevel)" size="small">
              {{ getPermissionText(row.permissionLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fileSize" label="大小" width="100" align="center">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="上传人" width="100" />
        <el-table-column prop="downloadCount" label="下载" width="70" align="center" />
        <el-table-column prop="createTime" label="上传时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="downloadDocument(row)" v-if="canAccess(row)">
              <el-icon><Download /></el-icon>下载
            </el-button>
            <el-button type="primary" link size="small" @click="editDocument(row)" v-if="canEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="danger" link size="small" @click="deleteDocument(row)" v-if="canEdit(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        class="pagination"
        @size-change="loadDocuments"
        @current-change="loadDocuments"
      />
    </el-card>

    <el-dialog v-model="editDialogVisible" title="编辑文档" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="文档名称">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="分类">
          <el-cascader
            v-model="editForm.categoryIds"
            :options="categoryTree"
            :props="{ checkStrictly: true, label: 'name', value: 'id', children: 'children' }"
            placeholder="选择分类"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="权限级别">
          <el-select v-model="editForm.permissionLevel" style="width: 100%">
            <el-option label="公开（所有人可见）" value="PUBLIC" />
            <el-option label="内部（登录用户可见）" value="INTERNAL" />
            <el-option label="私有（仅自己和管理员可见）" value="PRIVATE" />
            <el-option label="管理员可见" value="ADMIN_ONLY" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="文档详情" width="600px">
      <el-descriptions :column="2" border v-if="currentDocument">
        <el-descriptions-item label="文档名称">{{ currentDocument.title }}</el-descriptions-item>
        <el-descriptions-item label="原文件名">{{ currentDocument.originalFileName }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ getCategoryName(currentDocument.categoryId) }}</el-descriptions-item>
        <el-descriptions-item label="权限">{{ getPermissionText(currentDocument.permissionLevel) }}</el-descriptions-item>
        <el-descriptions-item label="文件大小">{{ formatFileSize(currentDocument.fileSize) }}</el-descriptions-item>
        <el-descriptions-item label="文件类型">{{ currentDocument.fileType }}</el-descriptions-item>
        <el-descriptions-item label="上传人">{{ currentDocument.createBy }}</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ formatDate(currentDocument.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="下载次数">{{ currentDocument.downloadCount }}</el-descriptions-item>
        <el-descriptions-item label="浏览次数">{{ currentDocument.viewCount }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentDocument.description || '无' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadDocument(currentDocument)" v-if="canAccess(currentDocument)">
          <el-icon><Download /></el-icon>下载
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, Upload, Download, Edit, Delete,
  Document, Files, Picture, VideoPlay, Headset, Grid
} from '@element-plus/icons-vue'
import { getDocuments, getCategories, updateDocument, deleteDocument as deleteDocumentApi } from '@/api'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const documents = ref([])
const categories = ref([])
const categoryTree = ref([])
const editDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentDocument = ref(null)

const searchForm = reactive({
  categoryIds: [],
  keyword: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const editForm = reactive({
  id: null,
  title: '',
  description: '',
  categoryIds: [],
  permissionLevel: 'PUBLIC'
})

const buildCategoryTree = (cats, parentId = 0) => {
  return cats
    .filter(c => c.parentId === parentId)
    .map(c => ({
      ...c,
      children: buildCategoryTree(cats, c.id)
    }))
}

const getCategoryName = (id) => {
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.name : '未分类'
}

const getFileIcon = (fileType) => {
  if (!fileType) return Document
  if (fileType.startsWith('image/')) return Picture
  if (fileType.startsWith('video/')) return VideoPlay
  if (fileType.startsWith('audio/')) return Headset
  if (fileType.includes('pdf') || fileType.includes('word') || fileType.includes('excel') || fileType.includes('powerpoint'))
    return Files
  return Document
}

const getFileIconColor = (fileType) => {
  if (!fileType) return '#909399'
  if (fileType.startsWith('image/')) return '#67C23A'
  if (fileType.startsWith('video/')) return '#F56C6C'
  if (fileType.startsWith('audio/')) return '#E6A23C'
  if (fileType.includes('pdf')) return '#F56C6C'
  if (fileType.includes('word')) return '#409EFF'
  if (fileType.includes('excel')) return '#67C23A'
  if (fileType.includes('powerpoint')) return '#E6A23C'
  return '#909399'
}

const getPermissionText = (level) => {
  const map = {
    'PUBLIC': '公开',
    'INTERNAL': '内部',
    'PRIVATE': '私有',
    'ADMIN_ONLY': '管理员'
  }
  return map[level] || '未知'
}

const getPermissionType = (level) => {
  const map = {
    'PUBLIC': 'success',
    'INTERNAL': 'primary',
    'PRIVATE': 'warning',
    'ADMIN_ONLY': 'danger'
  }
  return map[level] || 'info'
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').substring(0, 16)
}

const canAccess = (doc) => {
  const level = doc.permissionLevel
  const username = userStore.userInfo.username
  const role = userStore.userInfo.role
  if (level === 'PUBLIC') return true
  if (level === 'INTERNAL') return !!role
  if (level === 'PRIVATE') return username === doc.createBy || role === 'ADMIN'
  if (level === 'ADMIN_ONLY') return role === 'ADMIN'
  return false
}

const canEdit = (doc) => {
  const username = userStore.userInfo.username
  const role = userStore.userInfo.role
  return username === doc.createBy || role === 'ADMIN'
}

const loadDocuments = () => {
  loading.value = true
  const categoryId = searchForm.categoryIds.length > 0 ? searchForm.categoryIds[searchForm.categoryIds.length - 1] : null
  const params = {
    page: pagination.page - 1,
    size: pagination.size,
    keyword: searchForm.keyword || undefined,
    categoryId
  }
  getDocuments(params).then(res => {
    documents.value = res.data?.content || []
    pagination.total = res.data?.totalElements || 0
  }).finally(() => {
    loading.value = false
  })
}

const loadCategories = () => {
  getCategories().then(res => {
    categories.value = res.data || []
    categoryTree.value = buildCategoryTree(categories.value)
  })
}

const handleCategoryChange = () => {
  pagination.page = 1
  loadDocuments()
}

const searchDocuments = () => {
  pagination.page = 1
  loadDocuments()
}

const resetSearch = () => {
  searchForm.categoryIds = []
  searchForm.keyword = ''
  pagination.page = 1
  loadDocuments()
}

const viewDocument = (doc) => {
  currentDocument.value = doc
  detailDialogVisible.value = true
}

const downloadDocument = (doc) => {
  if (!canAccess(doc)) {
    ElMessage.warning('您没有权限下载该文档')
    return
  }
  const token = userStore.token
  window.open(`/api/documents/download/${doc.id}?token=${token}`, '_blank')
}

const editDocument = (doc) => {
  const cat = categories.value.find(c => c.id === doc.categoryId)
  const categoryIds = []
  if (cat) {
    let current = cat
    while (current) {
      categoryIds.unshift(current.id)
      current = categories.value.find(c => c.id === current.parentId)
    }
  }
  editForm.id = doc.id
  editForm.title = doc.title
  editForm.description = doc.description || ''
  editForm.categoryIds = categoryIds
  editForm.permissionLevel = doc.permissionLevel
  editDialogVisible.value = true
}

const saveEdit = () => {
  const categoryId = editForm.categoryIds.length > 0 ? editForm.categoryIds[editForm.categoryIds.length - 1] : null
  updateDocument(editForm.id, {
    title: editForm.title,
    description: editForm.description,
    categoryId,
    permissionLevel: editForm.permissionLevel
  }).then(() => {
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    loadDocuments()
  })
}

const deleteDocument = (doc) => {
  ElMessageBox.confirm('确定要删除该文档吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteDocumentApi(doc.id).then(() => {
      ElMessage.success('删除成功')
      loadDocuments()
    })
  }).catch(() => {})
}

onMounted(() => {
  loadCategories()
  
  if (route.query.categoryId) {
    const catId = parseInt(route.query.categoryId)
    const cat = categories.value.find(c => c.id === catId)
    if (cat) {
      const categoryIds = []
      let current = cat
      while (current) {
        categoryIds.unshift(current.id)
        current = categories.value.find(c => c.id === current.parentId)
      }
      searchForm.categoryIds = categoryIds
    }
  }
  
  loadDocuments()
})
</script>

<style scoped>
.documents-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-card {
  border: none;
  border-radius: 8px;
}

.table-card {
  border: none;
  border-radius: 8px;
}

.doc-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-icon {
  font-size: 18px;
}

.doc-title {
  color: #409EFF;
  cursor: pointer;
}

.doc-title:hover {
  text-decoration: underline;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
  display: flex;
}
</style>
