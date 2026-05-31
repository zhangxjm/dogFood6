<template>
  <div class="tax-calculator">
    <div class="page-header">
      <h2 class="page-title">税费计算器</h2>
    </div>

    <el-row :gutter="20">
      <el-col :span="12">
        <div class="card mb-20">
          <h3 class="card-title">添加商品</h3>
          <el-form :model="itemForm" label-width="100px">
            <el-form-item label="商品名称">
              <el-input v-model="itemForm.product_name" placeholder="请输入商品名称" />
            </el-form-item>
            <el-form-item label="HS编码">
              <el-input v-model="itemForm.hs_code" placeholder="请输入HS编码" @blur="verifyHsCode" />
              <div v-if="hsVerification" class="verification-info">
                <el-tag :type="hsVerification.valid ? 'success' : 'danger'">
                  {{ hsVerification.description }}
                </el-tag>
              </div>
            </el-form-item>
            <el-form-item label="原产国">
              <el-input v-model="itemForm.origin_country" placeholder="如: CN" />
            </el-form-item>
            <el-form-item label="数量">
              <el-input-number v-model="itemForm.quantity" :min="1" />
            </el-form-item>
            <el-form-item label="单位">
              <el-input v-model="itemForm.unit" placeholder="PCS" />
            </el-form-item>
            <el-form-item label="单价(USD)">
              <el-input-number v-model="itemForm.unit_price" :min="0" :precision="2" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addItem">添加商品</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="card">
          <h3 class="card-title">商品列表</h3>
          <el-table :data="items" border style="width: 100%">
            <el-table-column label="序号" type="index" width="60" />
            <el-table-column prop="product_name" label="商品名称" show-overflow-tooltip />
            <el-table-column prop="hs_code" label="HS编码" width="120" />
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="unit_price" label="单价" width="100">
              <template #default="scope">
                ${{ Number(scope.row.unit_price).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="total_amount" label="总值" width="120">
              <template #default="scope">
                ${{ Number(scope.row.total_amount).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button type="danger" link @click="removeItem(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="flex-center mt-20">
            <el-button type="primary" @click="calculateTaxes" :disabled="items.length === 0">
              计算税费
            </el-button>
          </div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="card">
          <h3 class="card-title">计算结果</h3>
          
          <div v-if="!calculationResult" class="empty-result">
            <el-empty description="请添加商品并点击计算税费" />
          </div>

          <div v-else>
            <h4 class="mb-10">明细结果</h4>
            <el-table :data="calculationResult.items" border style="width: 100%" size="small">
              <el-table-column label="序号" type="index" width="50" />
              <el-table-column prop="product_name" label="商品" show-overflow-tooltip />
              <el-table-column label="税率" width="130">
                <template #default="scope">
                  <div class="tax-rates">
                    <span>关税: {{ (scope.row.customs_duty_rate * 100).toFixed(1) }}%</span>
                    <span>消费: {{ (scope.row.consumption_tax_rate * 100).toFixed(1) }}%</span>
                    <span>增值税: {{ (scope.row.vat_rate * 100).toFixed(1) }}%</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="total_amount" label="货值" width="100">
                <template #default="scope">
                  ${{ Number(scope.row.total_amount).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column label="税费明细" width="180">
                <template #default="scope">
                  <div class="tax-breakdown">
                    <div>关税: ${{ Number(scope.row.customs_duty_amount).toFixed(2) }}</div>
                    <div>消费: ${{ Number(scope.row.consumption_tax_amount).toFixed(2) }}</div>
                    <div>增值税: ${{ Number(scope.row.vat_amount).toFixed(2) }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="total_tax_amount" label="税费合计" width="100">
                <template #default="scope">
                  <span class="text-danger font-bold">
                    ${{ Number(scope.row.total_tax_amount).toFixed(2) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="verification_status" label="核验" width="100">
                <template #default="scope">
                  <el-tag :type="getVerificationType(scope.row.verification_status)" size="small">
                    {{ getVerificationText(scope.row.verification_status) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>

            <el-divider />

            <h4 class="mb-10">汇总</h4>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="商品总值">
                ${{ calculationResult.totals.total_value.toFixed(2) }}
              </el-descriptions-item>
              <el-descriptions-item label="总重量">
                {{ calculationResult.totals.total_weight.toFixed(3) }} kg
              </el-descriptions-item>
              <el-descriptions-item label="关税合计">
                ${{ calculationResult.totals.customs_duty.toFixed(2) }}
              </el-descriptions-item>
              <el-descriptions-item label="消费税合计">
                ${{ calculationResult.totals.consumption_tax.toFixed(2) }}
              </el-descriptions-item>
              <el-descriptions-item label="增值税合计">
                ${{ calculationResult.totals.vat_amount.toFixed(2) }}
              </el-descriptions-item>
              <el-descriptions-item label="税费总计" class="text-danger">
                <strong style="color: #f56c6c; font-size: 18px;">
                  ${{ calculationResult.totals.total_tax.toFixed(2) }}
                </strong>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { declarationApi } from '@/api';

const items = ref([]);
const calculationResult = ref(null);
const hsVerification = ref(null);

const itemForm = reactive({
  product_name: '',
  hs_code: '',
  origin_country: 'CN',
  quantity: 1,
  unit: 'PCS',
  unit_price: 0
});

const verifyHsCode = async () => {
  if (!itemForm.hs_code || !itemForm.product_name) return;
  
  try {
    const res = await declarationApi.verifyHsCode(itemForm.hs_code, itemForm.product_name);
    if (res.success) {
      hsVerification.value = res.data;
    }
  } catch (error) {
    console.error('HS code verification failed:', error);
  }
};

const addItem = () => {
  if (!itemForm.product_name || !itemForm.hs_code) {
    ElMessage.warning('请填写商品名称和HS编码');
    return;
  }

  const newItem = {
    ...itemForm,
    total_amount: itemForm.quantity * itemForm.unit_price
  };

  items.value.push(newItem);
  resetForm();
};

const removeItem = (index) => {
  items.value.splice(index, 1);
};

const resetForm = () => {
  Object.assign(itemForm, {
    product_name: '',
    hs_code: '',
    origin_country: 'CN',
    quantity: 1,
    unit: 'PCS',
    unit_price: 0
  });
  hsVerification.value = null;
};

const calculateTaxes = async () => {
  if (items.value.length === 0) {
    ElMessage.warning('请先添加商品');
    return;
  }

  try {
    const res = await declarationApi.calculateTaxes(items.value);
    if (res.success) {
      calculationResult.value = res.data;
      ElMessage.success('税费计算完成');
    }
  } catch (error) {
    ElMessage.error('税费计算失败');
    console.error(error);
  }
};

const getVerificationText = (status) => {
  const map = {
    'PENDING': '待核验',
    'VERIFIED': '已核验',
    'NEEDS_REVIEW': '需复核',
    'FAILED': '核验失败'
  };
  return map[status] || status;
};

const getVerificationType = (status) => {
  const map = {
    'PENDING': 'info',
    'VERIFIED': 'success',
    'NEEDS_REVIEW': 'warning',
    'FAILED': 'danger'
  };
  return map[status] || 'info';
};
</script>

<style scoped>
.verification-info {
  margin-top: 8px;
}

.empty-result {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mb-10 {
  margin-bottom: 10px;
}

.text-danger {
  color: #f56c6c;
}

.font-bold {
  font-weight: 600;
}

.tax-rates {
  font-size: 12px;
  line-height: 1.6;
}

.tax-breakdown {
  font-size: 12px;
  line-height: 1.6;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}
</style>
