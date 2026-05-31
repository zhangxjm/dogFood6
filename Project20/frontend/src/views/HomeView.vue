<template>
  <div>
    <h2 class="page-title">首页概览</h2>
    
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <el-card class="stat-card">
        <el-statistic title="影像总数" :value="stats.totalImages">
          <template #suffix>
            <el-icon><Picture /></el-icon>
          </template>
        </el-statistic>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card class="stat-card">
        <el-statistic title="标注数量" :value="stats.totalAnnotations">
          <template #suffix>
            <el-icon><Edit /></el-icon>
          </template>
        </el-statistic>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card class="stat-card">
        <el-statistic title="检测任务" :value="stats.totalDetections">
          <template #suffix>
            <el-icon><Search /></el-icon>
          </template>
        </el-statistic>
      </el-card>
    </el-col>
    <el-col :span="6">
      <el-card class="stat-card">
        <el-statistic title="变化检测" :value="stats.totalChanges">
          <template #suffix>
            <el-icon><TrendCharts /></el-icon>
          </template>
        </el-statistic>
      </el-card>
    </el-col>
  </el-row>

  <el-row :gutter="20">
    <el-col :span="16">
      <el-card class="page-card">
        <template #header>
          <div class="flex-between">
            <span>最新影像</span>
            <el-button type="primary" link @click="$router.push('/images')">查看全部</el-button>
          </div>
        </template>
        <div class="image-grid">
          <div
            v-for="image in recentImages" :key="image.id"
            class="image-card"
            @click="viewImage(image)"
          >
            <img :src="imageApi.getThumbnail(image.id)" :alt="image.original_name" />
            <div class="image-info">
              <div class="image-info-title">{{ image.original_name }}</div>
              <div class="image-info-meta">{{ image.location || '未知位置' }}</div>
            </div>
          </div>
        </div>
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card class="page-card">
        <template #header>
          <span>系统功能</span>
        </template>
        <div ref="chartRef" style="width: 100%; height: 300px;"></div>
      </el-card>
      
      <el-card class="page-card mt-20">
        <template #header>
          <span>快捷操作</span>
        </template>
        <el-space direction="vertical" fill>
          <el-button type="primary" @click="$router.push('/images')" style="width: 100%;">
            <el-icon><Upload /></el-icon>
            上传影像
          </el-button>
          <el-button type="success" @click="$router.push('/annotation')" style="width: 100%;">
            <el-icon><Edit /></el-icon>
            开始标注
          </el-button>
          <el-button type="warning" @click="$router.push('/detection')" style="width: 100%;">
            <el-icon><Search /></el-icon>
            地物识别
          </el-button>
        </el-space>
      </el-card>
    </el-col>
  </el-row>
</div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { imageApi, annotationApi, detectionApi } from '@/api'

const router = useRouter()
const chartRef = ref(null)

const stats = ref({
  totalImages: 0,
  totalAnnotations: 0,
  totalDetections: 0,
  totalChanges: 0
})

const recentImages = ref([])

const loadStats = async () => {
  try {
    const [imgRes, annRes, cdRes] = await Promise.all([
      imageApi.getImages({ limit: 100 }),
      annotationApi.getAnnotations({ limit: 100 }),
      detectionApi.getChangeDetections({ limit: 100 })
    ])
    
    stats.value.totalImages = imgRes.data.length
    stats.value.totalAnnotations = annRes.data.length
    stats.value.totalChanges = cdRes.data.length
    stats.value.totalDetections = Math.floor(annRes.data.length * 0.8)
  } catch (e) {
    console.error('Failed to load stats:', e)
  }
}

const loadRecentImages = async () => {
  try {
    const res = await imageApi.getImages({ limit: 6 })
    recentImages.value = res.data
  } catch (e) {
    console.error('Failed to load images:', e)
  }
}

const viewImage = (image) => {
  router.push('/images')
}

const initChart = () => {
  if (!chartRef.value) return
  
  const chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '功能使用',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 35, name: '影像上传', itemStyle: { color: '#409eff' } },
          { value: 25, name: '数据标注', itemStyle: { color: '#67c23a' } },
          { value: 20, name: '地物识别', itemStyle: { color: '#e6a23c' } },
          { value: 15, name: '变化检测', itemStyle: { color: '#f56c6c' } },
          { value: 5, name: '数据检索', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  })
}

onMounted(async () => {
  await Promise.all([loadStats(), loadRecentImages()])
  await nextTick()
  initChart()
})
</script>

<style scoped>
.stat-card {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.stat-card :deep(.el-statistic__head),
.stat-card :deep(.el-statistic__content) {
  color: #fff;
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}
</style>
