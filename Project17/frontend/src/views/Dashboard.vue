<template>
  <div class="dashboard">
    <div class="page-header">
      <h2 class="page-title">数据概览</h2>
    </div>

    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon blue">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.totalDeclarations || 0 }}</div>
            <div class="stat-label">申报单总数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon green">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.completedDeclarations || 0 }}</div>
            <div class="stat-label">已完成申报</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon orange">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">${{ statistics.totalValue?.toFixed(2) || '0.00' }}</div>
            <div class="stat-label">总申报金额</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon red">
            <el-icon><CreditCard /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">${{ statistics.totalTax?.toFixed(2) || '0.00' }}</div>
            <div class="stat-label">总税费金额</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <div class="card mb-20">
          <h3 class="card-title">申报状态分布</h3>
          <v-chart class="chart" :option="statusChartOption" autoresize />
        </div>
      </el-col>
      <el-col :span="12">
        <div class="card mb-20">
          <h3 class="card-title">近6个月申报趋势</h3>
          <v-chart class="chart" :option="trendChartOption" autoresize />
        </div>
      </el-col>
    </el-row>

    <div class="card">
      <div class="flex-between mb-20">
        <h3 class="card-title">最近申报单</h3>
        <el-button type="primary" link @click="goToDeclarations">查看全部</el-button>
      </div>
      <el-table :data="recentDeclarations" style="width: 100%">
        <el-table-column prop="declaration_no" label="申报单号" width="180" />
        <el-table-column prop="exporter_name" label="出口商" />
        <el-table-column prop="importer_name" label="进口商" />
        <el-table-column prop="total_value" label="总金额">
          <template #default="scope">
            ${{ Number(scope.row.total_value).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="total_tax" label="税费">
          <template #default="scope">
            ${{ Number(scope.row.total_tax).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="primary" link @click="viewDetail(scope.row.id)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import VChart from 'vue-echarts';
import { declarationApi } from '@/api';

const router = useRouter();
const statistics = ref({});
const recentDeclarations = ref([]);
const statusData = ref([]);
const monthData = ref([]);

const statusChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: statusData.value
    }
  ]
}));

const trendChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['申报单数', '申报金额']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: monthData.value.map(m => m.month)
  },
  yAxis: [
    {
      type: 'value',
      name: '申报单数'
    },
    {
      type: 'value',
      name: '金额(USD)',
      position: 'right'
    }
  ],
  series: [
    {
      name: '申报单数',
      type: 'line',
      data: monthData.value.map(m => m.count)
    },
    {
      name: '申报金额',
      type: 'line',
      yAxisIndex: 1,
      data: monthData.value.map(m => m.total_value)
    }
  ]
}));

const loadStatistics = async () => {
  try {
    const res = await declarationApi.getStatistics();
    if (res.success) {
      const byStatus = res.data.by_status || [];
      const last6Months = res.data.last_6_months || [];
      
      let totalDeclarations = 0;
      let completedDeclarations = 0;
      let totalValue = 0;
      let totalTax = 0;
      
      statusData.value = byStatus.map(item => {
        totalDeclarations += item.count;
        totalValue += parseFloat(item.total_value || 0);
        totalTax += parseFloat(item.total_tax || 0);
        if (item.status === 'CLEARED' || item.status === 'RELEASED') {
          completedDeclarations += item.count;
        }
        return {
          name: getStatusText(item.status),
          value: item.count
        };
      });
      
      monthData.value = last6Months;
      
      statistics.value = {
        totalDeclarations,
        completedDeclarations,
        totalValue,
        totalTax
      };
    }
  } catch (error) {
    console.error('Failed to load statistics:', error);
  }
};

const loadRecentDeclarations = async () => {
  try {
    const res = await declarationApi.getDeclarations({ page: 1, page_size: 5 });
    if (res.success) {
      recentDeclarations.value = res.data;
    }
  } catch (error) {
    console.error('Failed to load recent declarations:', error);
  }
};

const getStatusText = (status) => {
  const statusMap = {
    'DRAFT': '草稿',
    'SUBMITTED': '已提交',
    'CUSTOMS_RECEIVED': '海关已接收',
    'INSPECTING': '查验中',
    'RELEASED': '已放行',
    'CLEARED': '已结关',
    'REJECTED': '已退单'
  };
  return statusMap[status] || status;
};

const getStatusType = (status) => {
  const typeMap = {
    'DRAFT': 'info',
    'SUBMITTED': 'primary',
    'CUSTOMS_RECEIVED': 'success',
    'INSPECTING': 'warning',
    'RELEASED': 'success',
    'CLEARED': 'success',
    'REJECTED': 'danger'
  };
  return typeMap[status] || 'info';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('zh-CN');
};

const goToDeclarations = () => {
  router.push('/declarations');
};

const viewDetail = (id) => {
  router.push(`/declarations/${id}`);
};

onMounted(() => {
  loadStatistics();
  loadRecentDeclarations();
});
</script>

<style scoped>
.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.red {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-icon .el-icon {
  font-size: 28px;
  color: #fff;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.chart {
  height: 300px;
}
</style>
