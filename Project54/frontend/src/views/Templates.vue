<template>
  <div class="templates-page">
    <div class="page-header">
      <h2 class="page-title">模板中心</h2>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索模板..."
          style="width: 240px; margin-right: 12px;"
          clearable
          :prefix-icon="Search"
        />
        <el-select
          v-model="selectedCategory"
          placeholder="选择分类"
          style="width: 180px; margin-right: 12px;"
          clearable
          @change="loadTemplates"
        >
          <el-option label="全部分类" :value="null" />
          <el-option
            v-for="cat in categories"
            :key="cat.id"
            :label="cat.name"
            :value="cat.id"
          />
        </el-select>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          新增模板
        </el-button>
      </div>
    </div>

    <div class="category-tabs">
      <div
        class="tab-item"
        :class="{ active: selectedCategory === null }"
        @click="selectedCategory = null; loadTemplates()"
      >
        <span class="tab-icon">📁</span>
        <span class="tab-name">全部</span>
        <el-tag size="small" type="info">{{ templates.length }}</el-tag>
      </div>
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="tab-item"
        :class="{ active: selectedCategory === cat.id }"
        @click="selectedCategory = cat.id; loadTemplates()"
      >
        <span class="tab-icon">{{ cat.icon }}</span>
        <span class="tab-name">{{ cat.name }}</span>
        <el-tag size="small" type="info">{{ cat.template_count }}</el-tag>
      </div>
    </div>

    <div class="templates-grid" v-loading="loading">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="template-card"
      >
        <div class="template-preview" @click="openPreview(template)">
          <img :src="templateApi.preview(template.id)" alt="预览图" />
          <div class="preview-overlay">
            <el-button type="primary" circle>
              <el-icon><ZoomIn /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="template-body">
          <div class="template-title">{{ template.name }}</div>
          <div class="template-desc">{{ template.description }}</div>
          <div class="template-meta">
            <el-tag size="small" effect="light" type="success">
              下载 {{ template.download_count }} 次
            </el-tag>
            <el-tag size="small" effect="light" type="info">
              {{ getCategoryName(template.category_id) }}
            </el-tag>
          </div>
          <div class="template-actions">
            <el-button size="small" type="primary" @click="templateApi.download(template.id)">
              <el-icon><Download /></el-icon>
              下载
            </el-button>
            <el-button size="small" @click="openNoteDialog(template)">
              <el-icon><EditPen /></el-icon>
              备注
            </el-button>
            <el-button size="small" type="danger" text @click="deleteTemplate(template)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      <el-empty v-if="filteredTemplates.length === 0 && !loading" description="暂无模板" />
    </div>

    <el-dialog v-model="previewVisible" title="模板预览" width="600px">
      <div class="preview-content" v-if="currentTemplate">
        <img :src="templateApi.preview(currentTemplate.id)" class="preview-image" />
        <div class="preview-info">
          <h3>{{ currentTemplate.name }}</h3>
          <p>{{ currentTemplate.description }}</p>
          <div class="preview-actions">
            <el-button type="primary" @click="templateApi.download(currentTemplate.id)">
              <el-icon><Download /></el-icon>
              下载模板
            </el-button>
            <el-button @click="openNoteDialog(currentTemplate)">
              <el-icon><EditPen /></el-icon>
              添加备注
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="noteDialogVisible" title="模板备注" width="600px">
      <div v-if="currentTemplate">
        <h4>{{ currentTemplate.name }} - 备注列表</h4>
        <div class="notes-list">
          <div v-for="note in templateNotes" :key="note.id" class="note-item">
            <div class="note-header">
              <span class="note-title">{{ note.title }}</span>
              <el-button type="danger" text size="small" @click="deleteNote(note.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <div class="note-content">{{ note.content }}</div>
            <div class="note-time">{{ formatTime(note.created_at) }}</div>
          </div>
          <el-empty v-if="templateNotes.length === 0" description="暂无备注" />
        </div>
        <el-divider />
        <el-form :model="noteForm" label-width="80px">
          <el-form-item label="标题">
            <el-input v-model="noteForm.title" placeholder="输入备注标题" />
          </el-form-item>
          <el-form-item label="内容">
            <el-input
              v-model="noteForm.content"
              type="textarea"
              :rows="4"
              placeholder="输入备注内容，如简历制作要点、注意事项等"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addNote">保存备注</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>

    <el-dialog v-model="addDialogVisible" title="新增模板" width="600px">
      <el-form :model="templateForm" label-width="100px">
        <el-form-item label="模板名称" required>
          <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="所属分类" required>
          <el-select v-model="templateForm.category_id" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="模板描述">
          <el-input
            v-model="templateForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </el-form-item>
        <el-form-item label="文件路径">
          <el-input v-model="templateForm.file_path" placeholder="static/templates/xxx.docx" />
        </el-form-item>
        <el-form-item label="预览图路径">
          <el-input v-model="templateForm.preview_image" placeholder="static/previews/xxx.svg" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addTemplate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { categoryApi, templateApi, noteApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, ZoomIn, Download, EditPen, Delete } from '@element-plus/icons-vue'

const loading = ref(false)
const categories = ref([])
const templates = ref([])
const selectedCategory = ref(null)
const searchKeyword = ref('')

const previewVisible = ref(false)
const noteDialogVisible = ref(false)
const addDialogVisible = ref(false)
const currentTemplate = ref(null)
const templateNotes = ref([])

const noteForm = ref({
  title: '',
  content: ''
})

const templateForm = ref({
  name: '',
  category_id: null,
  description: '',
  file_path: '',
  preview_image: ''
})

const filteredTemplates = computed(() => {
  let result = templates.value
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(t =>
      t.name.toLowerCase().includes(keyword) ||
      (t.description && t.description.toLowerCase().includes(keyword))
    )
  }
  return result
})

const getCategoryName = (categoryId) => {
  const cat = categories.value.find(c => c.id === categoryId)
  return cat ? cat.name : '未分类'
}

const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}

const loadCategories = async () => {
  try {
    const data = await categoryApi.list()
    categories.value = data || []
  } catch (error) {
    ElMessage.error('加载分类失败')
  }
}

const loadTemplates = async () => {
  loading.value = true
  try {
    const data = await templateApi.list(selectedCategory.value)
    templates.value = data || []
  } catch (error) {
    ElMessage.error('加载模板失败')
  } finally {
    loading.value = false
  }
}

const openPreview = (template) => {
  currentTemplate.value = template
  previewVisible.value = true
}

const openNoteDialog = async (template) => {
  currentTemplate.value = template
  noteDialogVisible.value = true
  try {
    const data = await noteApi.list(template.id)
    templateNotes.value = data || []
  } catch (error) {
    ElMessage.error('加载备注失败')
  }
}

const openAddDialog = () => {
  templateForm.value = {
    name: '',
    category_id: null,
    description: '',
    file_path: '',
    preview_image: ''
  }
  addDialogVisible.value = true
}

const addTemplate = async () => {
  if (!templateForm.value.name || !templateForm.value.category_id) {
    ElMessage.warning('请填写必填项')
    return
  }
  try {
    await templateApi.create(templateForm.value)
    ElMessage.success('添加成功')
    addDialogVisible.value = false
    loadTemplates()
    loadCategories()
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

const deleteTemplate = (template) => {
  ElMessageBox.confirm(`确定要删除模板"${template.name}"吗？`, '删除确认', {
    type: 'warning'
  }).then(async () => {
    try {
      await templateApi.delete(template.id)
      ElMessage.success('删除成功')
      loadTemplates()
      loadCategories()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const addNote = async () => {
  if (!noteForm.value.title || !noteForm.value.content) {
    ElMessage.warning('请填写标题和内容')
    return
  }
  try {
    await noteApi.create({
      template_id: currentTemplate.value.id,
      title: noteForm.value.title,
      content: noteForm.value.content
    })
    ElMessage.success('备注添加成功')
    noteForm.value = { title: '', content: '' }
    const data = await noteApi.list(currentTemplate.value.id)
    templateNotes.value = data || []
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

const deleteNote = async (noteId) => {
  try {
    await noteApi.delete(noteId)
    ElMessage.success('删除成功')
    const data = await noteApi.list(currentTemplate.value.id)
    templateNotes.value = data || []
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  loadCategories()
  loadTemplates()
})
</script>

<style scoped>
.templates-page {
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

.header-actions {
  display: flex;
  align-items: center;
}

.category-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px;
  background: white;
  border-radius: 12px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.tab-item:hover {
  background: #eff6ff;
}

.tab-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.tab-item.active .el-tag {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border: none;
}

.tab-icon {
  font-size: 20px;
}

.tab-name {
  font-weight: 500;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.template-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.template-preview {
  position: relative;
  aspect-ratio: 5 / 7;
  overflow: hidden;
  cursor: pointer;
  background: #f8fafc;
}

.template-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.template-preview:hover .preview-overlay {
  opacity: 1;
}

.template-body {
  padding: 16px;
}

.template-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1e293b;
}

.template-desc {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 38px;
}

.template-meta {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.template-actions {
  display: flex;
  gap: 8px;
}

.preview-content {
  display: flex;
  gap: 20px;
}

.preview-image {
  width: 280px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.preview-info {
  flex: 1;
}

.preview-info h3 {
  margin: 0 0 12px 0;
}

.preview-info p {
  color: #64748b;
  margin-bottom: 20px;
}

.preview-actions {
  display: flex;
  gap: 12px;
}

.notes-list {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 12px;
}

.note-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 8px;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.note-title {
  font-weight: 600;
  color: #1e293b;
}

.note-content {
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.note-time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 6px;
}
</style>
