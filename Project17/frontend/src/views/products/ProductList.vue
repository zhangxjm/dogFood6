<template>
  <div class="product-list">
    <div class="page-header">
      <h2 class="page-title">商品管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        新增商品
      </el-button>
    </div>

    <div class="card mb-20">
      <el-form :inline="true" :model="searchForm" @submit.prevent>
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入商品名称/SKU" clearable />
        </el-form-item>
        <el-form-item label="HS编码">
          <el-input v-model="searchForm.hs_code" placeholder="请输入HS编码" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadProducts">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card">
      <el-table :data="products" v-loading="loading" style="width: 100%">
        <el-table-column prop="sku" label="SKU" width="140" />
        <el-table-column prop="name" label="商品名称" min-width="200" />
        <el-table-column prop="hs_code" label="HS编码" width="140" />
        <el-table-column prop="category_name" label="分类" width="180" />
        <el-table-column prop="origin_country" label="原产国" width="100" />
        <el-table-column prop="unit_price" label="单价(USD)" width="120">
          <template #default="scope">
            ${{ Number(scope.row.unit_price).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="税率" width="150">
          <template #default="scope">
            关税: {{ ((scope.row.tax_rate || 0) * 100).toFixed(2) }}%<br>
            增值税: {{ ((scope.row.vat_rate || 0.13) * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.is_active ? 'success' : 'info'">
              {{ scope.row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="deleteProduct(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '新增商品'" width="600px">
      <el-form :model="productForm" :rules="productRules" ref="productFormRef" label-width="100px">
        <el-form-item label="SKU" prop="sku">
          <el-input v-model="productForm.sku" placeholder="请输入SKU" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input v-model="productForm.description" type="textarea" :rows="2" placeholder="请输入商品描述" />
        </el-form-item>
        <el-form-item label="HS编码" prop="hs_code">
          <el-input v-model="productForm.hs_code" placeholder="请输入HS编码" />
        </el-form-item>
        <el-form-item label="原产国" prop="origin_country">
          <el-input v-model="productForm.origin_country" placeholder="如: CN" />
        </el-form-item>
        <el-form-item label="单价(USD)" prop="unit_price">
          <el-input-number v-model="productForm.unit_price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="重量(kg)">
          <el-input-number v-model="productForm.weight" :min="0" :precision="3" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="productForm.is_active" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProduct">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { productApi } from '@/api';

const products = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const productFormRef = ref(null);

const searchForm = reactive({
  keyword: '',
  hs_code: ''
});

const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
});

const productForm = reactive({
  id: null,
  sku: '',
  name: '',
  description: '',
  hs_code: '',
  origin_country: 'CN',
  unit_price: 0,
  weight: 0,
  is_active: true
});

const productRules = {
  sku: [{ required: true, message: '请输入SKU', trigger: 'blur' }],
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  hs_code: [{ required: true, message: '请输入HS编码', trigger: 'blur' }],
  origin_country: [{ required: true, message: '请输入原产国', trigger: 'blur' }],
  unit_price: [{ required: true, message: '请输入单价', trigger: 'blur' }]
};

const loadProducts = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size,
      keyword: searchForm.keyword || undefined,
      hs_code: searchForm.hs_code || undefined
    };
    const res = await productApi.getProducts(params);
    if (res.success) {
      products.value = res.data;
      pagination.total = res.pagination.total;
    }
  } catch (error) {
    ElMessage.error('加载商品列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const resetSearch = () => {
  searchForm.keyword = '';
  searchForm.hs_code = '';
  pagination.page = 1;
  loadProducts();
};

const openCreateDialog = () => {
  isEdit.value = false;
  Object.assign(productForm, {
    id: null,
    sku: '',
    name: '',
    description: '',
    hs_code: '',
    origin_country: 'CN',
    unit_price: 0,
    weight: 0,
    is_active: true
  });
  dialogVisible.value = true;
};

const openEditDialog = (row) => {
  isEdit.value = true;
  Object.assign(productForm, {
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description,
    hs_code: row.hs_code,
    origin_country: row.origin_country,
    unit_price: row.unit_price,
    weight: row.weight,
    is_active: row.is_active
  });
  dialogVisible.value = true;
};

const saveProduct = async () => {
  try {
    await productFormRef.value.validate();
    
    if (isEdit.value) {
      const res = await productApi.updateProduct(productForm.id, productForm);
      if (res.success) {
        ElMessage.success('更新成功');
        dialogVisible.value = false;
        loadProducts();
      }
    } else {
      const res = await productApi.createProduct(productForm);
      if (res.success) {
        ElMessage.success('创建成功');
        dialogVisible.value = false;
        loadProducts();
      }
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存失败');
      console.error(error);
    }
  }
};

const deleteProduct = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除商品 "${row.name}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const res = await productApi.deleteProduct(row.id);
    if (res.success) {
      ElMessage.success('删除成功');
      loadProducts();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
      console.error(error);
    }
  }
};

const handleSizeChange = (size) => {
  pagination.page_size = size;
  pagination.page = 1;
  loadProducts();
};

const handleCurrentChange = (page) => {
  pagination.page = page;
  loadProducts();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
