<template>
  <div class="health-data-page">
    <div class="flex-between mb-20">
      <h2 class="page-title" style="margin: 0;">健康数据</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon> 录入数据
      </el-button>
    </div>

    <el-row :gutter="20" v-if="latestData">
      <el-col :span="6">
        <el-card class="health-card blood-pressure">
          <div class="health-icon">
            <el-icon :size="40"><Heart /></el-icon>
          </div>
          <div class="health-value">
            <span class="value">{{ latestData.systolicPressure || '-' }}/{{ latestData.diastolicPressure || '-' }}</span>
            <span class="unit">mmHg</span>
          </div>
          <div class="health-label">血压</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="health-card heart-rate">
          <div class="health-icon">
            <el-icon :size="40"><Timer /></el-icon>
          </div>
          <div class="health-value">
            <span class="value">{{ latestData.heartRate || '-' }}</span>
            <span class="unit">次/分</span>
          </div>
          <div class="health-label">心率</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="health-card blood-sugar">
          <div class="health-icon">
            <el-icon :size="40"><Watermelon /></el-icon>
          </div>
          <div class="health-value">
            <span class="value">{{ latestData.bloodSugar || '-' }}</span>
            <span class="unit">mg/dL</span>
          </div>
          <div class="health-label">血糖</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="health-card temperature">
          <div class="health-icon">
            <el-icon :size="40"><Sunny /></el-icon>
          </div>
          <div class="health-value">
            <span class="value">{{ latestData.temperature ? (latestData.temperature / 10).toFixed(1) : '-' }}</span>
            <span class="unit">°C</span>
          </div>
          <div class="health-label">体温</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mt-20">
      <template #header>
        <span>历史记录</span>
      </template>
      <el-table :data="healthData" style="width: 100%">
        <el-table-column prop="createTime" label="记录时间" width="180" />
        <el-table-column label="血压(mmHg)" width="120">
          <template #default="{ row }">
            {{ row.systolicPressure || '-' }}/{{ row.diastolicPressure || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="heartRate" label="心率" width="100">
          <template #default="{ row }">
            {{ row.heartRate || '-' }} 次/分
          </template>
        </el-table-column>
        <el-table-column prop="bloodSugar" label="血糖" width="120">
          <template #default="{ row }">
            {{ row.bloodSugar || '-' }} mg/dL
          </template>
        </el-table-column>
        <el-table-column prop="temperature" label="体温" width="120">
          <template #default="{ row }">
            {{ row.temperature ? (row.temperature / 10).toFixed(1) + '°C' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="体重" width="100">
          <template #default="{ row }">
            {{ row.weight ? row.weight + ' kg' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </el-card>

    <el-dialog v-model="showAddDialog" title="录入健康数据" width="500px">
      <el-form :model="healthForm" label-width="100px">
        <el-form-item label="收缩压">
          <el-input-number v-model="healthForm.systolicPressure" :min="0" :max="200" />
          <span class="ml-10">mmHg</span>
        </el-form-item>
        <el-form-item label="舒张压">
          <el-input-number v-model="healthForm.diastolicPressure" :min="0" :max="150" />
          <span class="ml-10">mmHg</span>
        </el-form-item>
        <el-form-item label="心率">
          <el-input-number v-model="healthForm.heartRate" :min="0" :max="200" />
          <span class="ml-10">次/分</span>
        </el-form-item>
        <el-form-item label="血糖">
          <el-input-number v-model="healthForm.bloodSugar" :min="0" :max="500" />
          <span class="ml-10">mg/dL</span>
        </el-form-item>
        <el-form-item label="体温">
          <el-input-number v-model="healthForm.temperature" :min="350" :max="420" :step="1" />
          <span class="ml-10">°C (×10)</span>
        </el-form-item>
        <el-form-item label="体重">
          <el-input-number v-model="healthForm.weight" :min="0" :max="200" />
          <span class="ml-10">kg</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="healthForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitHealthData">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getMyHealthData, getLatestHealthData, saveHealthData } from '@/api/health'
import { ElMessage } from 'element-plus'

const healthData = ref([])
const latestData = ref(null)
const showAddDialog = ref(false)

const healthForm = reactive({
  systolicPressure: 120,
  diastolicPressure: 80,
  heartRate: 75,
  bloodSugar: 90,
  temperature: 365,
  weight: 65,
  remark: ''
})

const submitHealthData = async () => {
  const res = await saveHealthData(healthForm)
  if (res.code === 200) {
    ElMessage.success('录入成功')
    showAddDialog.value = false
    loadData()
  }
}

const loadData = async () => {
  const latestRes = await getLatestHealthData()
  if (latestRes.code === 200) {
    latestData.value = latestRes.data
  }

  const historyRes = await getMyHealthData()
  if (historyRes.code === 200) {
    healthData.value = historyRes.data
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.health-data-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  min-height: calc(100vh - 100px);
}

.health-card {
  text-align: center;
  border: none;
  transition: all 0.3s;
}

.health-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.health-icon {
  margin-bottom: 10px;
}

.blood-pressure .health-icon {
  color: #f56c6c;
}

.heart-rate .health-icon {
  color: #e6a23c;
}

.blood-sugar .health-icon {
  color: #67c23a;
}

.temperature .health-icon {
  color: #409eff;
}

.health-value {
  margin-bottom: 5px;
}

.health-value .value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.health-value .unit {
  color: #909399;
  font-size: 14px;
  margin-left: 5px;
}

.health-label {
  color: #606266;
  font-size: 14px;
}
</style>
