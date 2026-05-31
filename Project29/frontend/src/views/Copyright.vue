<template>
  <div class="copyright container">
    <div class="page-header">
      <h1>版权确权</h1>
      <p>为您的数字藏品申请版权保护，区块链存证确保权益</p>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="版权登记" name="register">
        <div class="register-card">
          <el-form :model="form" label-width="120px" @submit.prevent="handleRegister">
            <el-form-item label="选择藏品" required>
              <el-select v-model="form.nftId" placeholder="请选择要登记版权的藏品" style="width: 100%">
                <el-option
                  v-for="nft in myNFTs"
                  :key="nft.id"
                  :label="nft.name"
                  :value="nft.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="作品名称">
              <el-input v-model="form.workName" placeholder="可选，默认使用藏品名称" />
            </el-form-item>

            <el-form-item label="作者">
              <el-input v-model="form.author" placeholder="可选，默认使用当前用户名" />
            </el-form-item>

            <el-form-item label="版权持有人">
              <el-input v-model="form.copyrightHolder" placeholder="可选，默认使用当前用户名" />
            </el-form-item>

            <el-form-item label="作品类型">
              <el-input v-model="form.workType" placeholder="如：数字艺术、美术作品等" />
            </el-form-item>

            <el-form-item label="创作日期">
              <el-date-picker
                v-model="form.creationDate"
                type="date"
                placeholder="选择创作日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" size="large" :loading="registering" @click="handleRegister">
                <el-icon><Lock /></el-icon>
                申请版权登记
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="版权查询" name="verify">
        <div class="verify-card">
          <el-input
            v-model="verifyNumber"
            placeholder="输入版权登记号进行查询"
            style="max-width: 400px"
            @keyup.enter="handleVerify"
          >
            <template #append>
              <el-button :loading="verifying" @click="handleVerify">查询</el-button>
            </template>
          </el-input>

          <div v-if="verifyResult" class="verify-result" :class="{ verified: verifyResult.verified }">
            <div v-if="verifyResult.verified">
              <el-icon size="48" color="#52c41a"><CircleCheckFilled /></el-icon>
              <h3>版权验证通过</h3>
              <div class="info">
                <p><strong>登记号：</strong>{{ verifyResult.data.registrationNumber }}</p>
                <p><strong>作品名称：</strong>{{ verifyResult.data.workName }}</p>
                <p><strong>作者：</strong>{{ verifyResult.data.author }}</p>
                <p><strong>版权持有人：</strong>{{ verifyResult.data.copyrightHolder }}</p>
                <p><strong>登记日期：</strong>{{ verifyResult.data.registrationDate }}</p>
                <p><strong>区块链存证：</strong>{{ verifyResult.blockchainValid ? '已验证' : '验证失败' }}</p>
              </div>
            </div>
            <div v-else>
              <el-icon size="48" color="#ff4d4f"><CircleCloseFilled /></el-icon>
              <h3>{{ verifyResult.message }}</h3>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="我的版权" name="my">
        <div class="my-copyrights">
          <el-table :data="myCopyrights" style="width: 100%" v-loading="loading">
            <el-table-column prop="registrationNumber" label="登记号" min-width="200" />
            <el-table-column prop="workName" label="作品名称" min-width="180" />
            <el-table-column prop="author" label="作者" min-width="120" />
            <el-table-column prop="copyrightHolder" label="版权持有人" min-width="120" />
            <el-table-column prop="registrationDate" label="登记日期" min-width="120" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'verified' ? 'success' : 'warning'">
                  {{ row.status === 'verified' ? '已认证' : row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import request from '../utils/request';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();
const activeTab = ref('register');
const myNFTs = ref([]);
const myCopyrights = ref([]);
const registering = ref(false);
const verifying = ref(false);
const loading = ref(false);
const verifyNumber = ref('');
const verifyResult = ref(null);

const form = reactive({
  nftId: null,
  workName: '',
  author: '',
  copyrightHolder: '',
  workType: '',
  creationDate: '',
});

const loadMyNFTs = async () => {
  try {
    const result = await request.get('/nfts/my');
    myNFTs.value = Array.isArray(result) ? result : (result?.data || []);
  } catch (error) {
    console.error('Failed to load NFTs:', error);
  }
};

const loadMyCopyrights = async () => {
  try {
    loading.value = true;
    const result = await request.get('/copyrights');
    myCopyrights.value = Array.isArray(result) ? result : (result?.data || []);
  } catch (error) {
    console.error('Failed to load copyrights:', error);
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  if (!form.nftId) {
    ElMessage.warning('请选择藏品');
    return;
  }

  try {
    registering.value = true;
    await request.post('/copyrights/register', form);
    ElMessage.success('版权登记成功！');
    form.nftId = null;
    form.workName = '';
    form.author = '';
    form.copyrightHolder = '';
    form.workType = '';
    form.creationDate = '';
    loadMyCopyrights();
  } catch (error) {
    ElMessage.error('登记失败');
  } finally {
    registering.value = false;
  }
};

const handleVerify = async () => {
  if (!verifyNumber.value) {
    ElMessage.warning('请输入登记号');
    return;
  }

  try {
    verifying.value = true;
    const result = await request.get(`/copyrights/verify/${verifyNumber.value}`);
    verifyResult.value = result?.data || result;
  } catch (error) {
    verifyResult.value = { verified: false, message: '查询失败' };
  } finally {
    verifying.value = false;
  }
};

onMounted(() => {
  loadMyNFTs();
  loadMyCopyrights();
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

:deep(.el-tabs) {
  background: white;
  border-radius: 16px;
  padding: 20px;
}

.register-card {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 0;
}

.verify-card {
  padding: 40px;
  text-align: center;
}

.verify-result {
  margin-top: 40px;
  padding: 40px;
  border-radius: 12px;
  background: #f9fafb;
}

.verify-result.verified {
  background: #f6ffed;
}

.verify-result h3 {
  margin: 20px 0;
  font-size: 20px;
}

.verify-result .info {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.verify-result .info p {
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.my-copyrights {
  padding: 20px 0;
}
</style>
