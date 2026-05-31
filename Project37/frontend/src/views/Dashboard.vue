<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon icon-blue">
              <el-icon size="32"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalDocuments }}</div>
              <div class="stat-label">文档总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon icon-green">
              <el-icon size="32"><Folder /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCategories }}</div>
              <div class="stat-label">分类数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon icon-orange">
              <el-icon size="32"><Download /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalDownloads }}</div>
              <div class="stat-label">下载次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon icon-purple">
              <el-icon size="32"><View /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalViews }}</div>
              <div class="stat-label">浏览次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="dashboard-content">
      <el-col :span="12">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Clock /></el-icon>
                最近上传
              </span>
              <el-button type="text" @click="$router.push('/documents')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="latestDocuments" v-loading="loading" size="small">
            <el-table-column prop="title" label="文档名称" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="doc-title" @click="viewDocument(row)">{{ row.title }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createBy" label="上传人" width="100" />
            <el-table-column prop="createTime" label="上传时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createTime) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><TrendCharts /></el-icon>
                热门下载
              </span>
              <el-button type="text" @click="$router.push('/documents')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="popularDocuments" v-loading="loading" size="small">
            <el-table-column prop="title" label="文档名称" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="doc-title" @click="viewDocument(row)">{{ row.title }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="downloadCount" label="下载次数" width="100" align="center">
              <template #default="{ row }">
                <el-tag type="success" size="small">{{ row.downloadCount }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createBy" label="上传人" width="100" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Menu /></el-icon>
                文档分类
              </span>
            </div>
          </template>
          <div class="category-grid">
            <div
              v-for="cat in topCategories"
              :key="cat.id"
              class="category-item"
              @click="goToCategory(cat.id)"
            >
              <el-icon size="28" :color="getCategoryColor(cat.id)">
                <Folder />
              </el-icon>
              <span class="category-name">{{ cat.name }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Document, Folder, Download, View, Clock, TrendCharts, Menu
} from '@element-plus/icons-vue'
import { getLatestDocuments, getPopularDocuments, getCategories, getDocuments } from '@/api'

const router = useRouter()
const loading = ref(false)
const latestDocuments = ref([])
const popularDocuments = ref([])
const categories = ref([])

const stats = reactive({
  totalDocuments: 0,
  totalCategories: 0,
  totalDownloads: 0,
  totalViews: 0
})

const topCategories = ref([])

const categoryColors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#8e44ad']

const getCategoryColor = (id) => {
  return categoryColors[id % categoryColors.length]
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').substring(0, 16)
}

const loadData = () => {
  loading.value = true
  Promise.all([
    getLatestDocuments(),
    getPopularDocuments(),
    getCategories(),
    getDocuments({ page: 0, size: 1000 })
  ]).then(([latestRes, popularRes, catRes, docsRes]) => {
    latestDocuments.value = latestRes.data || []
    popularDocuments.value = popularRes.data || []
    categories.value = catRes.data || []
    topCategories.value = categories.value.filter(c => c.parentId === 0).slice(0, 6)
    stats.totalCategories = categories.value.length
    
    const allDocs = docsRes.data?.content || []
    stats.totalDocuments = docsRes.data?.totalElements || 0
    stats.totalDownloads = allDocs.reduce((sum, d) => sum + (d.downloadCount || 0), 0)
    stats.totalViews = allDocs.reduce((sum, d) => sum + (d.viewCount || 0), 0)
  }).finally(() => {
    loading.value = false
  })
}

const viewDocument = (doc) => {
  router.push(`/documents?docId=${doc.id}`)
}

const goToCategory = (categoryId) => {
  router.push(`/documents?categoryId=${categoryId}`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.icon-blue {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.icon-green {
  background: linear-gradient(135deg, #11998e, #38ef7d);
}

.icon-orange {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.icon-purple {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.dashboard-content {
  margin-bottom: 20px;
}

.content-card {
  border: none;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-title {
  color: #409EFF;
  cursor: pointer;
}

.doc-title:hover {
  text-decoration: underline;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-item:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.category-name {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}
</style>
