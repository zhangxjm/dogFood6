<template>
  <div class="experiment-list">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
      <h2 class="page-title" style="margin:0">试验管理</h2>
      <router-link to="/experiments/create"><button class="btn btn-success">+ 新建试验</button></router-link>
    </div>

    <div class="filter-bar">
      <select class="form-select" v-model="filters.status">
        <option value="">全部状态</option>
        <option value="待启动">待启动</option>
        <option value="进行中">进行中</option>
        <option value="已完成">已完成</option>
        <option value="异常">异常</option>
      </select>
      <select class="form-select" v-model="filters.type">
        <option value="">全部类型</option>
        <option value="热真空试验">热真空试验</option>
        <option value="力学试验">力学试验</option>
        <option value="电磁兼容试验">电磁兼容试验</option>
        <option value="空间环境试验">空间环境试验</option>
      </select>
      <input class="form-input" placeholder="搜索试验名称或编号..." v-model="filters.keyword" />
      <button class="btn btn-primary" @click="loadData">查询</button>
    </div>

    <div class="card">
      <div v-if="store.loading" style="text-align:center;padding:40px"><span class="loading-spinner"></span></div>
      <template v-else>
        <table v-if="store.experiments.length">
          <thead>
            <tr>
              <th>试验编号</th>
              <th>试验名称</th>
              <th>试验类型</th>
              <th>关联设备</th>
              <th>状态</th>
              <th>开始时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in store.experiments" :key="item.id">
              <td style="font-family:Orbitron,monospace;font-size:13px">{{ item.experiment_code }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.type }}</td>
              <td>{{ item.device_name || '-' }}</td>
              <td><span class="badge" :class="statusClass(item.status)">{{ item.status }}</span></td>
              <td>{{ item.start_time || '-' }}</td>
              <td>
                <router-link :to="`/experiments/${item.id}`"><button class="btn btn-primary btn-sm">查看详情</button></router-link>
                <button class="btn btn-danger btn-sm" style="margin-left:6px" @click="handleDelete(item.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
          <p>暂无试验数据</p>
        </div>
      </template>

      <div class="pagination" v-if="totalPages > 1">
        <button :disabled="page <= 1" @click="page--; loadData()">上一页</button>
        <button v-for="p in displayPages" :key="p" :class="{ active: p === page }" @click="page = p; loadData()">{{ p }}</button>
        <button :disabled="page >= totalPages" @click="page++; loadData()">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useExperimentStore } from '../stores/experiment'

const store = useExperimentStore()
const page = ref(1)
const pageSize = 10
const filters = ref({ status: '', type: '', keyword: '' })

const totalPages = computed(() => Math.ceil(store.total / pageSize) || 1)
const displayPages = computed(() => {
  const pages = []
  for (let i = Math.max(1, page.value - 2); i <= Math.min(totalPages.value, page.value + 2); i++) pages.push(i)
  return pages
})

function statusClass(status) {
  const map = { '进行中': 'badge-success', '已完成': 'badge-info', '异常': 'badge-warning', '待启动': 'badge-warning', '故障': 'badge-danger' }
  return map[status] || 'badge-info'
}

async function loadData() {
  await store.fetchList({ page: page.value, pageSize, ...filters.value })
}

async function handleDelete(id) {
  if (!confirm('确认删除该试验？')) return
  await store.remove(id)
  loadData()
}

onMounted(loadData)
</script>
