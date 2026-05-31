<template>
  <div class="home">
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>让非遗文化<br /><span class="gradient-text">活在数字时代</span></h1>
          <p>
            非遗数字藏品平台，致力于将中国非物质文化遗产与区块链技术结合，
            实现传统文化的数字化保护、传承与创新发展。
          </p>
          <div class="hero-buttons">
            <el-button type="primary" size="large" @click="$router.push('/marketplace')">
              探索藏品市场
            </el-button>
            <el-button size="large" @click="$router.push('/collections')">
              了解非遗系列
            </el-button>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalNFTs }}</div>
            <div class="stat-label">数字藏品</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalListed }}</div>
            <div class="stat-label">在售藏品</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalVolume.toLocaleString() }}</div>
            <div class="stat-label">总交易额(元)</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.chainLength }}</div>
            <div class="stat-label">区块链高度</div>
          </div>
        </div>
      </div>
    </section>

    <section class="featured">
      <div class="container">
        <div class="section-header">
          <h2>精选非遗藏品</h2>
          <el-button type="text" @click="$router.push('/marketplace')">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="nft-grid">
          <div
            v-for="nft in featuredNFTs"
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
              <p class="collection">{{ nft.collection?.name }}</p>
              <div class="nft-footer">
                <div class="price">
                  <span class="price-label">价格</span>
                  <span class="price-value">¥{{ nft.price }}</span>
                </div>
                <div class="owner">
                  <el-icon size="14"><User /></el-icon>
                  {{ nft.owner?.username }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="collections-preview">
      <div class="container">
        <div class="section-header">
          <h2>非遗系列</h2>
          <el-button type="text" @click="$router.push('/collections')">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="collection-grid">
          <div
            v-for="collection in collections"
            :key="collection.id"
            class="collection-card card-hover"
            @click="$router.push(`/collection/${collection.id}`)"
          >
            <img :src="collection.image" :alt="collection.name" />
            <div class="collection-info">
              <h3>{{ collection.name }}</h3>
              <p class="region">
                <el-icon size="14"><Location /></el-icon>
                {{ collection.region }}
              </p>
              <p class="heritage-type">{{ collection.heritageType }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <h2>平台特色</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="40"><Link /></el-icon>
            </div>
            <h3>区块链存证</h3>
            <p>所有藏品信息上链存证，确保数字资产的唯一性和不可篡改性。</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="40"><Lock /></el-icon>
            </div>
            <h3>版权确权</h3>
            <p>提供专业的版权登记服务，保护非遗创作者的合法权益。</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="40"><ShoppingCart /></el-icon>
            </div>
            <h3>合规交易</h3>
            <p>严格的监管机制，确保二级市场交易的合规性和安全性。</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="40"><Search /></el-icon>
            </div>
            <h3>智能检索</h3>
            <p>基于 Elasticsearch 的全文检索，快速找到心仪的非遗藏品。</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '../utils/request';

const stats = ref({
  totalNFTs: 0,
  totalListed: 0,
  totalVolume: 0,
  chainLength: 0,
});

const featuredNFTs = ref([]);
const collections = ref([]);

const getStatusText = (status) => {
  const statusMap = {
    available: '在售',
    sold: '已售出',
    not_for_sale: '非卖品',
  };
  return statusMap[status] || status;
};

const loadData = async () => {
  try {
    const statsResult = await request.get('/nfts/stats');
    stats.value = statsResult?.data || statsResult;
    const nftResult = await request.get('/nfts?limit=8');
    featuredNFTs.value = Array.isArray(nftResult) ? nftResult : (nftResult?.data || []);
    const collectionResult = await request.get('/collections?limit=4');
    collections.value = Array.isArray(collectionResult) ? collectionResult : (collectionResult?.data || []);
  } catch (error) {
    console.error('Failed to load home data:', error);
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 0 80px;
  margin: -20px -20px 40px;
}

.hero-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 60px;
}

.hero h1 {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  line-height: 1.3;
}

.hero p {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 30px;
  line-height: 1.8;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  font-size: 28px;
  font-weight: bold;
  color: #1f2937;
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
}

.nft-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.nft-image {
  position: relative;
  height: 220px;
}

.nft-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nft-image .status-tag {
  position: absolute;
  top: 12px;
  right: 12px;
}

.nft-info {
  padding: 20px;
}

.nft-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
}

.nft-info .collection {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 16px;
}

.nft-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.price-label {
  font-size: 12px;
  color: #6b7280;
  display: block;
}

.price-value {
  font-size: 18px;
  font-weight: bold;
  color: #667eea;
}

.owner {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
}

.collection-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.collection-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.collection-info {
  padding: 20px;
}

.collection-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
}

.collection-info .region {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 4px;
}

.collection-info .heritage-type {
  color: #667eea;
  font-size: 13px;
}

.features {
  margin-top: 60px;
}

.features h2 {
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
}

.feature-card h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1f2937;
}

.feature-card p {
  color: #6b7280;
  line-height: 1.8;
}
</style>
