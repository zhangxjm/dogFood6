<template>
  <div>
    <h2 style="margin-bottom: 20px">📋 海关核验记录</h2>
    
    <el-card>
      <el-table :data="records" style="width: 100%" v-loading="loading">
        <el-table-column prop="tracking_number" label="运单号" width="160" />
        <el-table-column prop="customs_code" label="海关编号" width="180" />
        <el-table-column prop="inspector" label="核验人员" width="120" />
        <el-table-column prop="status" label="核验状态" width="100">
          <template #default="{ row }">
            <el-tag type="success" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="核验备注" />
        <el-table-column prop="verified_at" label="核验时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.verified_at) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const records = ref([])
const loading = ref(false)

const fetchRecords = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/customs')
    records.value = res.data
  } catch (e) {
    ElMessage.error('获取核验记录失败')
  } finally {
    loading.value = false
  }
}

const formatTime = (time) => {
  return new Date(time).toLocaleString()
}

onMounted(fetchRecords)
</script>
