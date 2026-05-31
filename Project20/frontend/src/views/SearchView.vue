<template>
  <div>
    <h2 class="page-title">数据检索</h2>
    
    <el-card class="page-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索影像名称、位置、描述..."
            style="width: 400px;"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="卫星来源">
          <el-select v-model="searchForm.satellite_source" placeholder="全部" clearable style="width: 150px;">
            <el-option label="高分七号" value="高分七号" />
            <el-option label="高分六号" value="高分六号" />
            <el-option label="资源三号" value="资源三号" />
            <el-option label="高分五号" value="高分五号" />
            <el-option label="海洋一号" value="海洋一号" />
          </el-select>
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="searchForm.location" placeholder="位置关键词" clearable style="width: 150px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="searching">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="page-card mt-20">
      <template #header>
        <div class="flex-between">
          <span>搜索结果 ({{ searchResults.length }})</span>
          <el-tag v-if="usingElasticsearch" type="success">Elasticsearch 检索</el-tag>
          <el-tag v-else type="info" v-if="searchForm.keyword">数据库检索</el-tag>
        </div>
      </template>
      
      <div v-if="searchResults.length > 0" class="image-grid">
        <div
          v-for="image in searchResults"
          :key="image.id"
          class="image-card"
          @click="viewDetail(image)"
        >
          <img :src="imageApi.getThumbnail(image.id)" :alt="image.original_name" />
          <div class="image-info">
            <div class="image-info-title">{{ image.original_name }}</div>
            <div class="image-info-meta">
              <el-tag size="small" type="info">{{ image.satellite_source }}</el-tag>
            </div>
            <div class="image-info-meta">{{ image.location }}</div>
            <div class="image-info-tags">
              <el-tag
                v-for="tag in getTags(image.tags)"
                :key="tag"
                size="small"
                style="margin-top: 4px;"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
      
      <el-empty v-else description="暂无搜索结果" />
    </el-card>
    
    <el-card class="page-card mt-20">
      <template #header>
        <span>热门搜索</span>
      </template>
      <div class="hot-search">
        <el-tag
          v-for="tag in hotTags"
          :key="tag"
          size="large"
          effect="plain"
          type="primary"
          style="margin: 8px; cursor: pointer;"
          @click="quickSearch(tag)"
        >
          {{ tag }}
        </el-tag>
      </div>
    </el-card>
    
    <el-dialog v-model="showDetail" title="影像详情" width="700px">
      <div v-if="currentImage">
        <img :src="imageApi.getImageFile(currentImage.id)" style="width: 100%; border-radius: 8px; margin-bottom: 16px;" />
        <el-descriptions :column="2" border>
          <el-descriptions-item label="文件名">{{ currentImage.original_name }}</el-descriptions-item>
          <el-descriptions-item label="卫星来源">{{ currentImage.satellite_source || '-' }}</el-descriptions-item>
          <el-descriptions-item label="位置">{{ currentImage.location || '-' }}</el-descriptions-item>
          <el-descriptions-item label="坐标">
            {{ currentImage.latitude?.toFixed(4) }}, {{ currentImage.longitude?.toFixed(4) }}
          </el-descriptions-item>
          <el-descriptions-item label="尺寸">{{ currentImage.width }} x {{ currentImage.height }}</el-descriptions-item>
          <el-descriptions-item label="大小">{{ formatFileSize(currentImage.file_size) }}</el-descriptions-item>
          <el-descriptions-item label="标签" :span="2">{{ currentImage.tags || '-' }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentImage.description || '暂无描述' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { imageApi } from '@/api'

const searchForm = ref({
  keyword: '',
  satellite_source: '',
  location: ''
})

const searchResults = ref([])
const searching = ref(false)
const usingElasticsearch = ref(false)
const showDetail = ref(false)
const currentImage = ref(null)

const hotTags = ['北京', '上海', '植被', '建筑物', '海洋', '高分七号', '资源三号', '城市', '地貌', '生态']

const loadAllImages = async () => {
  try {
    const res = await imageApi.getImages({ limit: 100 })
    searchResults.value = res.data
  } catch (e) {
    console.error('Failed to load images:', e)
  }
}

const handleSearch = async () => {
  if (!searchForm.value.keyword && !searchForm.value.satellite_source && !searchForm.value.location) {
    loadAllImages()
    return
  }
  
  searching.value = true
  try {
    if (searchForm.value.keyword) {
      const res = await imageApi.searchImages(
        searchForm.value.keyword,
        {
          satellite_source: searchForm.value.satellite_source,
          location: searchForm.value.location
        }
      )
      searchResults.value = res.data
      usingElasticsearch.value = true
    } else {
      const res = await imageApi.getImages({
        satellite_source: searchForm.value.satellite_source,
        location: searchForm.value.location
      })
      searchResults.value = res.data
      usingElasticsearch.value = false
    }
  } catch (e) {
    console.error('Search failed:', e)
    ElMessage.error('搜索失败')
  } finally {
    searching.value = false
  }
}

const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    satellite_source: '',
    location: ''
  }
  loadAllImages()
}

const quickSearch = (keyword) => {
  searchForm.value.keyword = keyword
  handleSearch()
}

const getTags = (tagsStr) => {
  if (!tagsStr) return []
  return tagsStr.split(',').filter(t => t.trim())
}

const viewDetail = (image) => {
  currentImage.value = image
  showDetail.value = true
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

onMounted(() => {
  loadAllImages()
})
</script>

<style scoped>
.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.image-info-tags {
  margin-top: 8px;
}

.hot-search {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
