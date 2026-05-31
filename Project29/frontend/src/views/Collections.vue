<template>
  <div class="collections container">
    <div class="page-header">
      <h1>非遗系列</h1>
      <p>探索中华传统文化瑰宝，了解各类非物质文化遗产</p>
    </div>

    <div class="collection-grid">
      <div
        v-for="collection in collections"
        :key="collection.id"
        class="collection-card card-hover"
        @click="$router.push(`/collection/${collection.id}`)"
      >
        <div class="collection-image">
          <img :src="collection.image" :alt="collection.name" />
        </div>
        <div class="collection-info">
          <h3>{{ collection.name }}</h3>
          <div class="meta">
            <span class="tag">{{ collection.category }}</span>
            <span class="tag">{{ collection.heritageType }}</span>
          </div>
          <p class="description">{{ collection.description.slice(0, 80) }}...</p>
          <div class="footer">
            <span class="region">
              <el-icon size="14"><Location /></el-icon>
              {{ collection.region }}
            </span>
            <span class="count">{{ collection.nfts?.length || 0 }} 件藏品</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="collections.length === 0" class="empty">
      <el-empty description="暂无系列" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '../utils/request';

const collections = ref([]);

const loadCollections = async () => {
  try {
    const result = await request.get('/collections?limit=20');
    collections.value = Array.isArray(result) ? result : (result?.data || []);
  } catch (error) {
    console.error('Failed to load collections:', error);
  }
};

onMounted(() => {
  loadCollections();
});
</script>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.page-header h1 {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 10px;
}

.page-header p {
  font-size: 16px;
  opacity: 0.9;
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.collection-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.collection-image {
  height: 200px;
  overflow: hidden;
}

.collection-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.collection-card:hover .collection-image img {
  transform: scale(1.05);
}

.collection-info {
  padding: 20px;
}

.collection-info h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1f2937;
}

.meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tag {
  background: #f3f4f6;
  color: #6b7280;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.description {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.region {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.count {
  color: #667eea;
  font-weight: 500;
  font-size: 13px;
}

.empty {
  background: white;
  padding: 60px;
  border-radius: 12px;
  text-align: center;
}
</style>
