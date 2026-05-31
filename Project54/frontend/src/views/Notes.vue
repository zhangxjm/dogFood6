<template>
  <div class="notes-page">
    <div class="page-header">
      <h2 class="page-title">简历备注</h2>
      <div class="header-actions">
        <el-select
          v-model="selectedTemplate"
          placeholder="筛选模板"
          style="width: 240px; margin-right: 12px;"
          clearable
          @change="loadNotes"
        >
          <el-option label="全部备注" :value="null" />
          <el-option
            v-for="tpl in templates"
            :key="tpl.id"
            :label="tpl.name"
            :value="tpl.id"
          />
        </el-select>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          新增备注
        </el-button>
      </div>
    </div>

    <div class="notes-container" v-loading="loading">
      <div v-for="note in notes" :key="note.id" class="note-card">
        <div class="note-header">
          <h4 class="note-title">{{ note.title }}</h4>
          <div class="note-actions">
            <el-button type="primary" text size="small" @click="openEditDialog(note)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button type="danger" text size="small" @click="deleteNote(note)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="note-content">{{ note.content }}</div>
        <div class="note-footer">
          <el-tag size="small" type="info">
            {{ getTemplateName(note.template_id) }}
          </el-tag>
          <span class="note-time">{{ formatTime(note.created_at) }}</span>
        </div>
      </div>
      <el-empty v-if="notes.length === 0 && !loading" description="暂无备注" />
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑备注' : '新增备注'" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="关联模板" required>
          <el-select v-model="form.template_id" placeholder="请选择关联的模板" style="width: 100%">
            <el-option
              v-for="tpl in templates"
              :key="tpl.id"
              :label="tpl.name"
              :value="tpl.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注标题" required>
          <el-input v-model="form.title" placeholder="请输入备注标题" />
        </el-form-item>
        <el-form-item label="备注内容" required>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            placeholder="请输入备注内容，可以记录简历制作要点、注意事项、投递记录等"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveNote">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { noteApi, templateApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

const loading = ref(false)
const notes = ref([])
const templates = ref([])
const selectedTemplate = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const form = ref({
  template_id: null,
  title: '',
  content: ''
})

const loadTemplates = async () => {
  try {
    const data = await templateApi.list()
    templates.value = data || []
  } catch (error) {
    ElMessage.error('加载模板失败')
  }
}

const loadNotes = async () => {
  loading.value = true
  try {
    const data = await noteApi.list(selectedTemplate.value)
    notes.value = data || []
  } catch (error) {
    ElMessage.error('加载备注失败')
  } finally {
    loading.value = false
  }
}

const getTemplateName = (templateId) => {
  const tpl = templates.value.find(t => t.id === templateId)
  return tpl ? tpl.name : '未知模板'
}

const formatTime = (time) => {
  return new Date(time).toLocaleString('zh-CN')
}

const openAddDialog = () => {
  isEdit.value = false
  editId.value = null
  form.value = {
    template_id: selectedTemplate.value || (templates.value[0]?.id || null),
    title: '',
    content: ''
  }
  dialogVisible.value = true
}

const openEditDialog = (note) => {
  isEdit.value = true
  editId.value = note.id
  form.value = {
    template_id: note.template_id,
    title: note.title,
    content: note.content
  }
  dialogVisible.value = true
}

const saveNote = async () => {
  if (!form.value.template_id || !form.value.title || !form.value.content) {
    ElMessage.warning('请填写完整信息')
    return
  }
  try {
    if (isEdit.value) {
      await noteApi.update(editId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await noteApi.create(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadNotes()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
  }
}

const deleteNote = (note) => {
  ElMessageBox.confirm(`确定要删除备注"${note.title}"吗？`, '删除确认', {
    type: 'warning'
  }).then(async () => {
    try {
      await noteApi.delete(note.id)
      ElMessage.success('删除成功')
      loadNotes()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadTemplates()
  loadNotes()
})
</script>

<style scoped>
.notes-page {
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

.notes-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.note-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  border-left: 4px solid #409EFF;
}

.note-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.note-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #1e293b;
}

.note-actions {
  display: flex;
  gap: 4px;
}

.note-content {
  color: #475569;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  margin-bottom: 16px;
  min-height: 80px;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.note-time {
  font-size: 12px;
  color: #94a3b8;
}
</style>
