<template>
  <div class="profile container" v-if="userStore.user">
    <div class="profile-header">
      <div class="user-info">
        <el-avatar :size="80">{{ userStore.username?.[0] }}</el-avatar>
        <div class="info">
          <h1>{{ userStore.username }}</h1>
          <p class="email">{{ userStore.user.email }}</p>
          <p class="wallet">
            <el-icon><Wallet /></el-icon>
            {{ userStore.user.walletAddress }}
          </p>
        </div>
      </div>
      <div class="balance-card">
        <span class="label">账户余额</span>
        <span class="value">¥{{ userStore.user.balance?.toLocaleString() }}</span>
      </div>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="我的藏品" name="nfts">
        <div class="nft-grid">
          <div
            v-for="nft in myNFTs"
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
              <div class="price">¥{{ nft.price }}</div>
            </div>
          </div>
        </div>
        <el-empty v-if="myNFTs.length === 0" description="暂无藏品" />
      </el-tab-pane>

      <el-tab-pane label="交易记录" name="transactions">
        <el-table :data="transactions" style="width: 100%" v-loading="loading">
          <el-table-column prop="txHash" label="交易哈希" min-width="200">
            <template #default="{ row }">
              <span class="mono">{{ row.txHash.slice(0, 16) }}...</span>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.type === 'purchase' ? 'primary' : 'success'">
                {{ row.type === 'purchase' ? '购买' : '出售' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="nft.name" label="藏品" min-width="150" />
          <el-table-column label="对方" min-width="120">
            <template #default="{ row }">
              {{ row.type === 'purchase' ? row.seller?.username : row.buyer?.username }}
            </template>
          </el-table-column>
          <el-table-column prop="price" label="价格(元)" width="120">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="createdAt" label="时间" min-width="180">
            <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'completed' ? 'success' : 'warning'">
                {{ row.status === 'completed' ? '完成' : row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="transactions.length === 0" description="暂无交易记录" />
      </el-tab-pane>

      <el-tab-pane label="账户信息" name="info">
        <div class="info-card">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户名">{{ userStore.username }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userStore.user.email }}</el-descriptions-item>
            <el-descriptions-item label="钱包地址">{{ userStore.user.walletAddress }}</el-descriptions-item>
            <el-descriptions-item label="账户余额">¥{{ userStore.user.balance?.toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="用户角色">{{ userStore.user.role === 'admin' ? '管理员' : '普通用户' }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ formatDate(userStore.user.createdAt) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import request from '../utils/request';

const userStore = useUserStore();
const activeTab = ref('nfts');
const myNFTs = ref([]);
const transactions = ref([]);
const loading = ref(false);

const getStatusText = (status) => {
  const statusMap = {
    available: '在售',
    sold: '已售出',
    not_for_sale: '非卖品',
  };
  return statusMap[status] || status;
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

const loadMyNFTs = async () => {
  try {
    const result = await request.get('/nfts/my');
    myNFTs.value = Array.isArray(result) ? result : (result?.data || []);
  } catch (error) {
    console.error('Failed to load NFTs:', error);
  }
};

const loadTransactions = async () => {
  try {
    loading.value = true;
    const result = await request.get('/transactions/my');
    transactions.value = Array.isArray(result) ? result : (result?.data || []);
  } catch (error) {
    console.error('Failed to load transactions:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  userStore.getProfile();
  loadMyNFTs();
  loadTransactions();
});
</script>

<style scoped>
.profile-header {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info .info h1 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #1f2937;
}

.user-info .info .email {
  color: #6b7280;
  margin-bottom: 5px;
}

.user-info .info .wallet {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #667eea;
  font-family: monospace;
}

.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  border-radius: 12px;
  text-align: center;
}

.balance-card .label {
  display: block;
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 5px;
}

.balance-card .value {
  font-size: 28px;
  font-weight: bold;
}

:deep(.el-tabs) {
  background: white;
  border-radius: 16px;
  padding: 20px;
}

.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.nft-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
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
  margin-bottom: 6px;
  color: #1f2937;
}

.nft-info .collection {
  color: #6b7280;
  font-size: 12px;
  margin-bottom: 8px;
}

.nft-info .price {
  font-size: 18px;
  font-weight: bold;
  color: #667eea;
}

.info-card {
  padding: 20px 0;
}

.mono {
  font-family: monospace;
}
</style>
