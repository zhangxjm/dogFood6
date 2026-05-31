<template>
  <div class="declaration-form">
    <div class="page-header">
      <h2 class="page-title">新建申报单</h2>
    </div>

    <el-steps :active="currentStep" finish-status="success" class="mb-20">
      <el-step title="基本信息" />
      <el-step title="商品明细" />
      <el-step title="确认提交" />
    </el-steps>

    <div v-if="currentStep === 0" class="card mb-20">
      <h3 class="card-title">基本信息</h3>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="申报类型" prop="declaration_type">
              <el-select v-model="form.declaration_type" style="width: 100%">
                <el-option label="进口" value="IMPORT" />
                <el-option label="出口" value="EXPORT" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="贸易方式" prop="trade_mode">
              <el-select v-model="form.trade_mode" style="width: 100%">
                <el-option label="一般贸易" value="GENERAL_TRADE" />
                <el-option label="保税区" value="BONDED_AREA" />
                <el-option label="加工贸易" value="PROCESSING_TRADE" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出口商名称" prop="exporter_name">
              <el-input v-model="form.exporter_name" placeholder="请输入出口商名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="进口商名称" prop="importer_name">
              <el-input v-model="form.importer_name" placeholder="请输入进口商名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出境口岸" prop="port_of_departure">
              <el-input v-model="form.port_of_departure" placeholder="请输入出境口岸" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入境口岸" prop="port_of_entry">
              <el-input v-model="form.port_of_entry" placeholder="请输入入境口岸" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="离境日期" prop="departure_date">
              <el-date-picker v-model="form.departure_date" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到港日期" prop="arrival_date">
              <el-date-picker v-model="form.arrival_date" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运输方式" prop="transport_mode">
              <el-select v-model="form.transport_mode" style="width: 100%">
                <el-option label="海运" value="SEA" />
                <el-option label="空运" value="AIR" />
                <el-option label="陆运" value="LAND" />
                <el-option label="快递" value="EXPRESS" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货币类型">
              <el-select v-model="form.currency" style="width: 100%">
                <el-option label="美元 (USD)" value="USD" />
                <el-option label="人民币 (CNY)" value="CNY" />
                <el-option label="欧元 (EUR)" value="EUR" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发票号">
              <el-input v-model="form.invoice_no" placeholder="请输入发票号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发票日期">
              <el-date-picker v-model="form.invoice_date" type="date" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="出口商地址">
              <el-input v-model="form.exporter_address" type="textarea" :rows="2" placeholder="请输入出口商地址" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="进口商地址">
              <el-input v-model="form.importer_address" type="textarea" :rows="2" placeholder="请输入进口商地址" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="flex-center mt-20">
        <el-button type="primary" @click="nextStep">下一步</el-button>
      </div>
    </div>

    <div v-if="currentStep === 1" class="card mb-20">
      <div class="flex-between mb-20">
        <h3 class="card-title">商品明细</h3>
        <el-button type="primary" @click="addItem">
          <el-icon><Plus /></el-icon>
          添加商品
        </el-button>
      </div>

      <el-table :data="form.items" style="width: 100%" border>
        <el-table-column label="序号" type="index" width="60" />
        <el-table-column label="商品名称" min-width="180">
          <template #default="scope">
            <el-input v-model="scope.row.product_name" placeholder="商品名称" />
          </template>
        </el-table-column>
        <el-table-column label="HS编码" width="160">
          <template #default="scope">
            <el-input v-model="scope.row.hs_code" placeholder="HS编码" @blur="verifyHsCode(scope.row)" />
            <div v-if="scope.row.verification_message" class="verification-msg">
              {{ scope.row.verification_message }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="原产国" width="120">
          <template #default="scope">
            <el-input v-model="scope.row.origin_country" placeholder="如: CN" />
          </template>
        </el-table-column>
        <el-table-column label="数量" width="100">
          <template #default="scope">
            <el-input-number v-model="scope.row.quantity" :min="1" @change="calculateItemTotal(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="单位" width="80">
          <template #default="scope">
            <el-input v-model="scope.row.unit" placeholder="PCS" />
          </template>
        </el-table-column>
        <el-table-column label="单价" width="120">
          <template #default="scope">
            <el-input-number v-model="scope.row.unit_price" :min="0" :precision="2" @change="calculateItemTotal(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="总值" width="120">
          <template #default="scope">
            {{ Number(scope.row.total_amount || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button type="danger" link @click="removeItem(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="form.items.length > 0" class="tax-summary mt-20">
        <el-divider />
        <h4>税费预估</h4>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="summary-item">
              <span class="label">商品总值:</span>
              <span class="value">${{ taxSummary.total_value.toFixed(2) }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="summary-item">
              <span class="label">关税:</span>
              <span class="value">${{ taxSummary.customs_duty.toFixed(2) }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="summary-item">
              <span class="label">消费税:</span>
              <span class="value">${{ taxSummary.consumption_tax.toFixed(2) }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="summary-item total">
              <span class="label">税费总计:</span>
              <span class="value">${{ taxSummary.total_tax.toFixed(2) }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="flex-center mt-20">
        <el-button @click="prevStep">上一步</el-button>
        <el-button type="primary" @click="calculateTaxes">计算税费并下一步</el-button>
      </div>
    </div>

    <div v-if="currentStep === 2" class="card mb-20">
      <h3 class="card-title">确认申报信息</h3>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申报类型">
          {{ form.declaration_type === 'EXPORT' ? '出口' : '进口' }}
        </el-descriptions-item>
        <el-descriptions-item label="贸易方式">
          {{ getTradeModeText(form.trade_mode) }}
        </el-descriptions-item>
        <el-descriptions-item label="出口商">
          {{ form.exporter_name }}
        </el-descriptions-item>
        <el-descriptions-item label="进口商">
          {{ form.importer_name }}
        </el-descriptions-item>
        <el-descriptions-item label="出境口岸">
          {{ form.port_of_departure }}
        </el-descriptions-item>
        <el-descriptions-item label="入境口岸">
          {{ form.port_of_entry }}
        </el-descriptions-item>
        <el-descriptions-item label="商品总值">
          ${{ taxSummary.total_value.toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="总税费">
          ${{ taxSummary.total_tax.toFixed(2) }}
        </el-descriptions-item>
      </el-descriptions>

      <h4 class="mt-20 mb-10">商品明细</h4>
      <el-table :data="form.items" style="width: 100%" size="small" border>
        <el-table-column label="序号" type="index" width="50" />
        <el-table-column prop="product_name" label="商品名称" />
        <el-table-column prop="hs_code" label="HS编码" width="140" />
        <el-table-column prop="origin_country" label="原产国" width="80" />
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
        <el-table-column label="税费" width="120">
          <template #default="scope">
            ${{ Number(scope.row.total_tax_amount || 0).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="flex-center mt-20">
        <el-button @click="prevStep">上一步</el-button>
        <el-button type="primary" @click="submitDeclaration" :loading="submitting">
          提交申报
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { declarationApi, productApi } from '@/api';

const router = useRouter();
const currentStep = ref(0);
const formRef = ref(null);
const submitting = ref(false);

const form = reactive({
  declaration_type: 'IMPORT',
  trade_mode: 'GENERAL_TRADE',
  exporter_name: '',
  exporter_address: '',
  importer_name: '',
  importer_address: '',
  port_of_entry: '',
  port_of_departure: '',
  departure_date: '',
  arrival_date: '',
  transport_mode: 'SEA',
  voyage_no: '',
  bl_no: '',
  invoice_no: '',
  invoice_date: '',
  currency: 'USD',
  items: []
});

const rules = {
  declaration_type: [{ required: true, message: '请选择申报类型', trigger: 'change' }],
  trade_mode: [{ required: true, message: '请选择贸易方式', trigger: 'change' }],
  exporter_name: [{ required: true, message: '请输入出口商名称', trigger: 'blur' }],
  importer_name: [{ required: true, message: '请输入进口商名称', trigger: 'blur' }],
  port_of_entry: [{ required: true, message: '请输入入境口岸', trigger: 'blur' }],
  port_of_departure: [{ required: true, message: '请输入出境口岸', trigger: 'blur' }],
  transport_mode: [{ required: true, message: '请选择运输方式', trigger: 'change' }]
};

const taxSummary = reactive({
  total_value: 0,
  customs_duty: 0,
  consumption_tax: 0,
  vat_amount: 0,
  total_tax: 0
});

const addItem = () => {
  form.items.push({
    product_name: '',
    hs_code: '',
    origin_country: 'CN',
    quantity: 1,
    unit: 'PCS',
    unit_price: 0,
    total_amount: 0,
    weight_per_unit: 0,
    total_weight: 0,
    verification_status: 'PENDING',
    verification_message: ''
  });
};

const removeItem = (index) => {
  form.items.splice(index, 1);
  updateTaxSummary();
};

const calculateItemTotal = (row) => {
  row.total_amount = row.quantity * row.unit_price;
  row.total_weight = row.quantity * (row.weight_per_unit || 0);
  updateTaxSummary();
};

const updateTaxSummary = () => {
  taxSummary.total_value = form.items.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);
  taxSummary.customs_duty = form.items.reduce((sum, item) => sum + (Number(item.customs_duty_amount) || 0), 0);
  taxSummary.consumption_tax = form.items.reduce((sum, item) => sum + (Number(item.consumption_tax_amount) || 0), 0);
  taxSummary.vat_amount = form.items.reduce((sum, item) => sum + (Number(item.vat_amount) || 0), 0);
  taxSummary.total_tax = form.items.reduce((sum, item) => sum + (Number(item.total_tax_amount) || 0), 0);
};

const verifyHsCode = async (row) => {
  if (!row.hs_code || !row.product_name) return;
  
  try {
    const res = await declarationApi.verifyHsCode(row.hs_code, row.product_name);
    if (res.success && res.data) {
      row.verification_status = res.data.valid ? 'VERIFIED' : 'FAILED';
      row.verification_message = res.data.description;
    }
  } catch (error) {
    console.error('HS code verification failed:', error);
  }
};

const calculateTaxes = async () => {
  if (form.items.length === 0) {
    ElMessage.warning('请至少添加一个商品');
    return;
  }

  try {
    const itemsToCalculate = form.items.map(item => ({
      ...item,
      total_amount: item.quantity * item.unit_price
    }));

    const res = await declarationApi.calculateTaxes(itemsToCalculate);
    if (res.success) {
      res.data.items.forEach((item, index) => {
        Object.assign(form.items[index], item);
      });
      Object.assign(taxSummary, res.data.totals);
      currentStep.value = 2;
    }
  } catch (error) {
    ElMessage.error('税费计算失败');
    console.error(error);
  }
};

const nextStep = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      currentStep.value++;
    }
  });
};

const prevStep = () => {
  currentStep.value--;
};

const submitDeclaration = async () => {
  submitting.value = true;
  try {
    const dataToSubmit = {
      ...form,
      items: form.items
    };

    const res = await declarationApi.createDeclaration(dataToSubmit);
    if (res.success) {
      ElMessage.success('申报单创建成功');
      router.push(`/declarations/${res.data.id}`);
    } else {
      ElMessage.error(res.error?.message || '创建失败');
    }
  } catch (error) {
    ElMessage.error('创建申报单失败');
    console.error(error);
  } finally {
    submitting.value = false;
  }
};

const getTradeModeText = (mode) => {
  const modeMap = {
    'GENERAL_TRADE': '一般贸易',
    'BONDED_AREA': '保税区',
    'PROCESSING_TRADE': '加工贸易'
  };
  return modeMap[mode] || mode;
};
</script>

<style scoped>
.verification-msg {
  font-size: 12px;
  color: #67c23a;
  margin-top: 4px;
}

.tax-summary {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.summary-item .label {
  color: #606266;
}

.summary-item .value {
  font-weight: 600;
  color: #303133;
}

.summary-item.total .value {
  color: #409eff;
  font-size: 18px;
}

.mb-10 {
  margin-bottom: 10px;
}
</style>
