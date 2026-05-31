<template>
  <div class="category-list">
    <div class="page-header">
      <h2 class="page-title">商品分类管理</h2>
    </div>

    <div class="card">
      <el-table :data="categories" v-loading="loading" style="width: 100%">
        <el-table-column prop="hs_code" label="HS编码" width="140" />
        <el-table-column prop="category_name" label="分类名称" min-width="200" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="关税税率" width="120">
          <template #default="scope">
            {{ (scope.row.tax_rate * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column label="消费税税率" width="120">
          <template #default="scope">
            {{ (scope.row.consumption_tax_rate * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column label="增值税税率" width="120">
          <template #default="scope">
            {{ (scope.row.vat_rate * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column prop="is_restricted" label="管制状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_restricted ? 'danger' : 'success'">
              {{ scope.row.is_restricted ? '管制' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="required_documents" label="所需文件" min-width="200" show-overflow-tooltip />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { productApi } from '@/api';

const categories = ref([]);
const loading = ref(false);

const loadCategories = async () => {
  loading.value = true;
  try {
    const res = await productApi.getCategories();
    if (res.success) {
      categories.value = res.data;
    }
  } catch (error) {
    ElMessage.error('加载分类列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCategories();
});
</script>
