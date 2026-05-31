<template>
  <div class="collection-detail container" v-if="collection">
    <el-button type="text" @click="$router.back()" style="color: white; margin-bottom: 20px">
      <el-icon><ArrowLeft /></el-icon>
      返回列表
    </el-button>

    <div class="detail-card">
      <div class="image-section">
        <img :src="collection.image" :alt="collection.name" />
      </div>
      <div class="info-section">
        <h1>{{ collection.name }}</h1>
        <div class="meta">
          <span class="tag">{{ collection.category }}</span>
          <span class="tag">{{ collection.heritageType }}</span>
          <span class="tag">
            <el-icon size="14"><Location /></el-icon>
            {{ collection.region }}
          </span>
        </div>
        <p class="artist">传承人：{{ collection.artist }}</p>
        <p class="description">{{ collection.description }}</p>
        <div class="history">
          <h3>历史渊源</h3>
          <p>{{ collection.history }}</p>
        </div>
        <div class="stats">
          <div class="stat">
            <span class="num">{{ collection.nfts?.length || 0 }}</span>
            <span class="label">藏品数量</span>
          </div>
        </div>
        <el-button type="primary" size="large" @click="scrollToNFTs">
          查看系列藏品
        </el-button>
      </div>
    </div>

    <div class="nfts-section" id="nfts">
      <h2>系列藏品</h2>
      <div class="nft-grid">
        <div
          v-for="nft in collection.nfts"
          :key="nft.id"
          class="nft-card card-hover"
          @click="$router.push(`/nft/${nft.id}`)"
        >
          <div class="nft-image">
            <img :src="nft.image" :alt="nft.name" />
            <span :class="['status-tag', `status-${nft.status}`]">
              {{ getStatusText(nft.status) }}
            </span>
          </div>
          <div class="nft-info">
            <h3>{{ nft.name }}</h3>
            <div class="price">¥{{ nft.price }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import request from '../utils/request';

const route = useRoute();
const collection = ref(null);

const getStatusText = (status) => {
  const statusMap = {
    available: '在售',
    sold: '已售出',
    not_for_sale: '非卖品',
  };
  return statusMap[status] || status;
};

const loadCollection = async () => {
  try {
    const result = await request.get(`/collections/${route.params.id}`);
    collection.value = result?.data || result;
  } catch (error) {
    console.error('Failed to load collection:', error);
  }
};

const scrollToNFTs = () => {
  document.getElementById('nfts')?.scrollIntoView({ behavior: 'smooth' });
};

onMounted(() => {
  loadCollection();
});
</script>

<style scoped>
.detail-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.image-section img {
  width: 100%;
  height: 100%;
  min-height: 400px;
  object-fit: cover;
}

.info-section {
  padding: 40px;
}

.info-section h1 {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #1f2937;
}

.meta {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tag {
  background: #f3f4f6;
  color: #6b7280;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.artist {
  color: #667eea;
  font-weight: 500;
  margin-bottom: 16px;
}

.description {
  color: #4b5563;
  line-height: 1.8;
  margin-bottom: 24px;
}

.history {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.history h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1f2937;
}

.history p {
  color: #6b7280;
  line-height: 1.8;
}

.stats {
  display: flex;
  gap: 40px;
  margin-bottom: 24px;
}

.stat {
  text-align: center;
}

.stat .num {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #667eea;
}

.stat .label {
  font-size: 13px;
  color: #6b7280;
}

.nfts-section h2 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  color: white;
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.nft-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.nft-image {
  position: relative;
  height: 180px;
}

.nft-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nft-image .status-tag {
  position: absolute;
  top: 10px;
  right: 10px;
}

.nft-info {
  padding: 16px;
}

.nft-info h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
}

.nft-info .price {
  font-size: 18px;
  font-weight: bold;
  color: #667eea;
}

@media (max-width: 768px) {
  .detail-card {
    grid-template-columns: 1fr;
  }
}
</style>
