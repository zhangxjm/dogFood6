<template>
  <div class="upload-page">
    <el-card class="upload-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Upload /></el-icon>
            上传文档
          </span>
        </div>
      </template>

      <el-form :model="uploadForm" label-width="100px" style="max-width: 600px; margin: 0 auto;">
        <el-form-item label="选择文件" required>
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            drag
            :on-change="handleFileChange"
            :on-exceed="handleExceed"
            :file-list="fileList"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif"
          >
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 pdf、doc、docx、xls、xlsx、ppt、pptx、txt、zip、图片等格式，单个文件最大 100MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="文档标题" required>
          <el-input v-model="uploadForm.title" placeholder="请输入文档标题" />
        </el-form-item>

        <el-form-item label="所属分类" required>
          <el-cascader
            v-model="uploadForm.categoryIds"
            :options="categoryTree"
            :props="{ checkStrictly: true, label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择分类"
            clearable
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="权限级别" required>
          <el-select v-model="uploadForm.permissionLevel" style="width: 100%">
            <el-option label="公开（所有人可见）" value="PUBLIC" />
            <el-option label="内部（登录用户可见）" value="INTERNAL" />
            <el-option label="私有（仅自己和管理员可见）" value="PRIVATE" />
            <el-option label="管理员可见" value="ADMIN_ONLY" />
          </el-select>
        </el-form-item>

        <el-form-item label="文档描述">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入文档描述（可选）"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" :loading="uploading" @click="submitUpload" style="width: 100%">
            <el-icon><Upload /></el-icon>上传文档
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Upload, UploadFilled } from '@element-plus/icons-vue'
import { getCategories, uploadDocument } from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const uploadRef = ref(null)
const fileList = ref([])
const uploading = ref(false)
const categories = ref([])
const categoryTree = ref([])

const uploadForm = reactive({
  title: '',
  description: '',
  categoryIds: [],
  permissionLevel: 'PUBLIC',
  file: null
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

const handleFileChange = (file, files) => {
  fileList.value = [file]
  uploadForm.file = file.raw
  if (file.name && !uploadForm.title) {
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
    uploadForm.title = nameWithoutExt
  }
}

const handleExceed = () => {
  ElMessage.warning('只能上传一个文件')
}

const submitUpload = () => {
  if (!uploadForm.file) {
    ElMessage.warning('请选择要上传的文件')
    return
  }
  if (!uploadForm.title.trim()) {
    ElMessage.warning('请输入文档标题')
    return
  }
  if (uploadForm.categoryIds.length === 0) {
    ElMessage.warning('请选择所属分类')
    return
  }

  uploading.value = true
  const formData = new FormData()
  formData.append('file', uploadForm.file)
  formData.append('title', uploadForm.title)
  formData.append('description', uploadForm.description)
  formData.append('categoryId', uploadForm.categoryIds[uploadForm.categoryIds.length - 1])
  formData.append('permissionLevel', uploadForm.permissionLevel)

  uploadDocument(formData).then(() => {
    ElMessage.success('上传成功')
    router.push('/documents')
  }).finally(() => {
    uploading.value = false
  })
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.upload-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.upload-card {
  width: 100%;
  max-width: 800px;
  border: none;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 64px;
  color: #c0c4cc;
}

.el-upload__text {
  font-size: 14px;
  color: #606266;
  margin-top: 10px;
}

.el-upload__text em {
  color: #409EFF;
  font-style: normal;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
}
</style>
