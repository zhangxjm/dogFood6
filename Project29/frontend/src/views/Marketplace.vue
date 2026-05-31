<template>
  <div class="marketplace container">
    <div class="page-header">
      <h1>藏品市场</h1>
      <p>探索精选非遗数字藏品，发现文化之美</p>
    </div>

    <div class="filters">
      <el-input
        v-model="searchQuery"
        placeholder="搜索藏品名称或描述..."
        style="width: 300px"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="selectedCategory" placeholder="选择分类" clearable style="width: 150px">
        <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
      </el-select>
      <el-select v-model="selectedStatus" placeholder="选择状态" clearable style="width: 150px">
        <el-option label="在售" value="available" />
        <el-option label="已售出" value="sold" />
        <el-option label="非卖品" value="not_for_sale" />
      </el-select>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
    </div>

    <div class="nft-grid">
      <div
        v-for="nft in nfts"
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

    <div v-if="nfts.length === 0" class="empty">
      <el-empty description="暂无藏品" />
    </div>

    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadNFTs"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '../utils/request';

const nfts = ref([]);
const categories = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = 12;
const searchQuery = ref('');
const selectedCategory = ref('');
const selectedStatus = ref('');

const getStatusText = (status) => {
  const statusMap = {
    available: '在售',
    sold: '已售出',
    not_for_sale: '非卖品',
  };
  return statusMap[status] || status;
};

const loadCategories = async () => {
  try {
    const result = await request.get('/collections/categories');
    categories.value = Array.isArray(result) ? result : (result?.data || []);
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
};

const loadNFTs = async () => {
  try {
    const params = {
      page: page.value,
      limit: pageSize,
    };
    if (selectedStatus.value) {
      params.status = selectedStatus.value;
    }
    if (searchQuery.value) {
      const result = await request.get(`/nfts/search?q=${searchQuery.value}`);
      const searchData = Array.isArray(result) ? result : (result?.data || []);
      nfts.value = searchData;
      total.value = searchData.length;
    } else {
      const result = await request.get('/nfts', { params });
      nfts.value = Array.isArray(result) ? result : (result?.data || []);
      total.value = result?.total ?? nfts.value.length;
    }
  } catch (error) {
    console.error('Failed to load NFTs:', error);
  }
};

const handleSearch = () => {
  page.value = 1;
  loadNFTs();
};

onMounted(() => {
  loadCategories();
  loadNFTs();
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

.filters {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 30px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
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
  height: 200px;
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
  padding: 16px;
}

.nft-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #1f2937;
}

.nft-info .collection {
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 12px;
}

.nft-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.price-label {
  font-size: 11px;
  color: #6b7280;
  display: block;
}

.price-value {
  font-size: 16px;
  font-weight: bold;
  color: #667eea;
}

.owner {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.empty {
  background: white;
  padding: 60px;
  border-radius: 12px;
  text-align: center;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
</style>
