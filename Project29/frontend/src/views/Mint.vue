<template>
  <div class="mint container">
    <div class="page-header">
      <h1>铸造藏品</h1>
      <p>选择非遗系列，铸造独一无二的数字藏品</p>
    </div>

    <div class="mint-card">
      <el-form :model="form" label-width="120px" @submit.prevent="handleMint">
        <el-form-item label="选择系列" required>
          <el-select v-model="form.collectionId" placeholder="请选择非遗系列" style="width: 100%">
            <el-option
              v-for="collection in collections"
              :key="collection.id"
              :label="collection.name"
              :value="collection.id"
            >
              <span>{{ collection.name }}</span>
              <span style="color: #999; margin-left: 10px">{{ collection.region }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="藏品名称">
          <el-input v-model="form.name" placeholder="可选，默认使用系列名称" />
        </el-form-item>

        <el-form-item label="藏品描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="可选，默认使用系列描述"
          />
        </el-form-item>

        <el-form-item label="铸造价格" required>
          <el-input-number v-model="form.price" :min="100" :step="100" style="width: 100%" />
          <span style="color: #999; margin-left: 10px">元</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" :loading="minting" @click="handleMint">
            <el-icon><Coin /></el-icon>
            开始铸造
          </el-button>
        </el-form-item>
      </el-form>

      <div class="mint-info">
        <h3>铸造说明</h3>
        <ul>
          <li>铸造的藏品将基于您选择的非遗系列生成</li>
          <li>铸造过程会将藏品信息上链存证，确保唯一性</li>
          <li>您可以在个人中心查看和管理您的藏品</li>
          <li>铸造的藏品可以在二级市场进行交易</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '../utils/request';
import { ElMessage } from 'element-plus';

const router = useRouter();
const collections = ref([]);
const minting = ref(false);

const form = reactive({
  collectionId: null,
  name: '',
  description: '',
  price: 1000,
});

const loadCollections = async () => {
  try {
    const result = await request.get('/collections?limit=50');
    collections.value = Array.isArray(result) ? result : (result?.data || []);
  } catch (error) {
    console.error('Failed to load collections:', error);
  }
};

const handleMint = async () => {
  if (!form.collectionId) {
    ElMessage.warning('请选择非遗系列');
    return;
  }

  try {
    minting.value = true;
    const result = await request.post('/nfts/mint', form);
    ElMessage.success('铸造成功！');
    const nftData = result?.data || result;
    router.push(`/nft/${nftData.id}`);
  } catch (error) {
    ElMessage.error('铸造失败');
  } finally {
    minting.value = false;
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

.mint-card {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.mint-info {
  margin-top: 30px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.mint-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1f2937;
}

.mint-info ul {
  list-style: none;
  padding: 0;
}

.mint-info li {
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
  color: #6b7280;
}

.mint-info li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #52c41a;
  font-weight: bold;
}
</style>
