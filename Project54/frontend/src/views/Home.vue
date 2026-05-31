<template>
  <div class="home-page">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card blue">
          <div class="stat-content">
            <el-icon :size="48" class="stat-icon"><Collection /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.templates }}</div>
              <div class="stat-label">模板总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card green">
          <div class="stat-content">
            <el-icon :size="48" class="stat-icon"><Menu /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.categories }}</div>
              <div class="stat-label">分类数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card orange">
          <div class="stat-content">
            <el-icon :size="48" class="stat-icon"><EditPen /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.notes }}</div>
              <div class="stat-label">备注总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card purple">
          <div class="stat-content">
            <el-icon :size="48" class="stat-icon"><Download /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.downloads }}</div>
              <div class="stat-label">总下载次数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :span="12">
        <el-card class="section-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">分类概览</span>
              <el-button type="primary" text @click="$router.push('/categories')">
                查看全部 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="category-list">
            <div v-for="category in categories" :key="category.id" class="category-item">
              <div class="category-icon">{{ category.icon }}</div>
              <div class="category-info">
                <div class="category-name">{{ category.name }}</div>
                <div class="category-desc">{{ category.description }}</div>
              </div>
              <el-tag type="info" effect="light">{{ category.template_count }} 个模板</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="section-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">热门模板</span>
              <el-button type="primary" text @click="$router.push('/templates')">
                查看全部 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="template-list">
            <div v-for="template in hotTemplates" :key="template.id" class="template-item">
              <img :src="templateApi.preview(template.id)" class="template-thumb" alt="预览图" />
              <div class="template-info">
                <div class="template-name">{{ template.name }}</div>
                <div class="template-meta">
                  <el-tag size="small" type="success">下载 {{ template.download_count }} 次</el-tag>
                  <el-tag size="small" type="info" effect="plain">{{ getCategoryName(template.category_id) }}</el-tag>
                </div>
              </div>
              <el-button type="primary" size="small" @click="templateApi.download(template.id)">
                <el-icon><Download /></el-icon>
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row class="tips-row">
      <el-col :span="24">
        <el-alert
          title="简历制作小贴士"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <ul class="tips-list">
              <li>简历内容要简洁明了，突出重点，控制在1-2页最佳</li>
              <li>使用量化数据展示工作成果，如"提升30%效率"、"节省50%成本"</li>
              <li>针对不同岗位调整简历内容，匹配岗位关键词</li>
              <li>导出为PDF格式投递，避免Word版本兼容性问题</li>
            </ul>
          </template>
        </el-alert>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { categoryApi, templateApi, noteApi } from '@/api'
import { ElMessage } from 'element-plus'

const categories = ref([])
const templates = ref([])
const notes = ref([])

const stats = computed(() => ({
  templates: templates.value.length,
  categories: categories.value.length,
  notes: notes.value.length,
  downloads: templates.value.reduce((sum, t) => sum + (t.download_count || 0), 0)
}))

const hotTemplates = computed(() => {
  return [...templates.value]
    .sort((a, b) => b.download_count - a.download_count)
    .slice(0, 5)
})

const getCategoryName = (categoryId) => {
  const cat = categories.value.find(c => c.id === categoryId)
  return cat ? cat.name : '未分类'
}

const loadData = async () => {
  try {
    const [catData, tplData, noteData] = await Promise.all([
      categoryApi.list(),
      templateApi.list(),
      noteApi.list()
    ])
    categories.value = catData || []
    templates.value = tplData || []
    notes.value = noteData || []
  } catch (error) {
    ElMessage.error('数据加载失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-row {
  margin-bottom: 10px;
}

.stat-card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
}

.stat-card.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-card.orange {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.purple {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px;
}

.stat-icon {
  color: white;
  opacity: 0.9;
}

.stat-info {
  color: white;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.content-row {
  margin-top: 10px;
}

.section-card {
  border-radius: 12px;
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: bold;
  font-size: 16px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  transition: all 0.3s;
}

.category-item:hover {
  background: #eff6ff;
}

.category-icon {
  font-size: 32px;
  width: 50px;
  text-align: center;
}

.category-info {
  flex: 1;
}

.category-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.category-desc {
  font-size: 12px;
  color: #64748b;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  transition: all 0.3s;
}

.template-item:hover {
  background: #eff6ff;
}

.template-thumb {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.template-info {
  flex: 1;
}

.template-name {
  font-weight: 600;
  margin-bottom: 6px;
}

.template-meta {
  display: flex;
  gap: 6px;
}

.tips-row {
  margin-top: 10px;
}

.tips-list {
  margin: 8px 0 0 20px;
  color: #64748b;
  font-size: 14px;
}

.tips-list li {
  margin-bottom: 4px;
}
</style>
