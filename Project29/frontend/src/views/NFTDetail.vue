<template>
  <div class="nft-detail container" v-if="nft">
    <el-button type="text" @click="$router.back()" style="color: white; margin-bottom: 20px">
      <el-icon><ArrowLeft /></el-icon>
      返回
    </el-button>

    <div class="detail-card">
      <div class="image-section">
        <img :src="nft.image" :alt="nft.name" />
        <div class="image-info">
          <span :class="['status-tag', `status-${nft.status}`]">
            {{ getStatusText(nft.status) }}
          </span>
          <span class="edition">第 {{ nft.edition }} / {{ nft.totalEditions }} 版</span>
        </div>
      </div>
      <div class="info-section">
        <div class="collection-tag" @click="$router.push(`/collection/${nft.collection?.id}`)">
          {{ nft.collection?.name }}
        </div>
        <h1>{{ nft.name }}</h1>
        <p class="description">{{ nft.description }}</p>

        <div class="owner-info">
          <el-avatar :size="40">{{ nft.owner?.username?.[0] }}</el-avatar>
          <div class="owner-detail">
            <span class="label">拥有者</span>
            <span class="name">{{ nft.owner?.username }}</span>
          </div>
        </div>

        <div class="price-section">
          <span class="price-label">当前价格</span>
          <span class="price-value">¥{{ nft.price }}</span>
        </div>

        <div class="action-buttons" v-if="userStore.isLoggedIn">
          <el-button
            v-if="nft.status === 'available' && nft.owner?.id !== userStore.user?.id"
            type="primary"
            size="large"
            style="flex: 1"
            @click="handleBuy"
          >
            <el-icon><ShoppingCart /></el-icon>
            立即购买
          </el-button>
          <el-button
            v-if="nft.owner?.id === userStore.user?.id"
            type="primary"
            size="large"
            style="flex: 1"
            @click="showPriceDialog = true"
          >
            <el-icon><Edit /></el-icon>
            设置价格
          </el-button>
          <el-button
            v-if="nft.owner?.id === userStore.user?.id"
            size="large"
            style="flex: 1"
            @click="$router.push('/copyright')"
          >
            <el-icon><Lock /></el-icon>
            版权登记
          </el-button>
        </div>

        <div class="login-hint" v-else>
          <el-button type="primary" @click="$router.push('/login')">登录后购买</el-button>
        </div>

        <div class="blockchain-info">
          <h3>区块链信息</h3>
          <div class="info-row">
            <span class="label">Token ID</span>
            <span class="value">{{ nft.tokenId }}</span>
          </div>
          <div class="info-row">
            <span class="label">交易哈希</span>
            <span class="value mono">{{ nft.transactionHash }}</span>
          </div>
          <div class="info-row">
            <span class="label">区块高度</span>
            <span class="value">{{ nft.blockNumber }}</span>
          </div>
          <div class="info-row">
            <span class="label">区块链</span>
            <span class="value">{{ nft.blockchain }}</span>
          </div>
        </div>

        <div class="copyright-info" v-if="nft.copyrights?.length > 0">
          <h3>版权信息</h3>
          <div v-for="cr in nft.copyrights" :key="cr.id" class="copyright-item">
            <div class="info-row">
              <span class="label">登记号</span>
              <span class="value">{{ cr.registrationNumber }}</span>
            </div>
            <div class="info-row">
              <span class="label">作者</span>
              <span class="value">{{ cr.author }}</span>
            </div>
            <div class="info-row">
              <span class="label">版权持有人</span>
              <span class="value">{{ cr.copyrightHolder }}</span>
            </div>
            <div class="info-row">
              <span class="label">状态</span>
              <span class="value verified">{{ cr.status === 'verified' ? '已认证' : cr.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showPriceDialog" title="设置价格" width="400px">
      <el-form>
        <el-form-item label="价格">
          <el-input-number v-model="newPrice" :min="0" :step="100" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPriceDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSetPrice">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '../stores/user';
import request from '../utils/request';
import { ElMessage, ElMessageBox } from 'element-plus';

const route = useRoute();
const userStore = useUserStore();
const nft = ref(null);
const showPriceDialog = ref(false);
const newPrice = ref(0);

const getStatusText = (status) => {
  const statusMap = {
    available: '在售',
    sold: '已售出',
    not_for_sale: '非卖品',
  };
  return statusMap[status] || status;
};

const loadNFT = async () => {
  try {
    const result = await request.get(`/nfts/${route.params.id}`);
    nft.value = result?.data || result;
  } catch (error) {
    console.error('Failed to load NFT:', error);
  }
};

const handleBuy = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要以 ¥${nft.value.price} 的价格购买 "${nft.value.name}" 吗？`,
      '确认购买',
      {
        confirmButtonText: '确认购买',
        cancelButtonText: '取消',
        type: 'info',
      }
    );

    await request.post('/transactions/buy', { nftId: nft.value.id });
    ElMessage.success('购买成功！');
    loadNFT();
    userStore.getProfile();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '购买失败');
    }
  }
};

const handleSetPrice = async () => {
  try {
    await request.put(`/nfts/${nft.value.id}/price`, { price: newPrice.value });
    ElMessage.success('价格设置成功！');
    showPriceDialog.value = false;
    loadNFT();
  } catch (error) {
    ElMessage.error('设置失败');
  }
};

onMounted(() => {
  loadNFT();
});
</script>

<style scoped>
.detail-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.image-section {
  position: relative;
}

.image-section img {
  width: 100%;
  height: 100%;
  min-height: 500px;
  object-fit: cover;
}

.image-info {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
}

.edition {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
}

.info-section {
  padding: 40px;
}

.collection-tag {
  display: inline-block;
  background: #f3f4f6;
  color: #667eea;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 16px;
  cursor: pointer;
}

.info-section h1 {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #1f2937;
}

.description {
  color: #6b7280;
  line-height: 1.8;
  margin-bottom: 24px;
}

.owner-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 24px;
}

.owner-detail .label {
  display: block;
  font-size: 12px;
  color: #6b7280;
}

.owner-detail .name {
  font-weight: 600;
  color: #1f2937;
}

.price-section {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 24px;
}

.price-label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 8px;
}

.price-value {
  font-size: 36px;
  font-weight: bold;
  color: white;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.login-hint {
  text-align: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 24px;
}

.blockchain-info,
.copyright-info {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.blockchain-info h3,
.copyright-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.info-row .label {
  color: #6b7280;
}

.info-row .value {
  color: #1f2937;
  font-weight: 500;
}

.info-row .value.mono {
  font-family: monospace;
  font-size: 12px;
}

.info-row .value.verified {
  color: #52c41a;
}

.copyright-item {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .detail-card {
    grid-template-columns: 1fr;
  }
}
</style>
