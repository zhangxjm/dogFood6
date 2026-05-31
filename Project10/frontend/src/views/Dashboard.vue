<template>
  <div>
    <el-card style="margin-bottom: 20px;">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: bold;">数据概览</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; color: white;">
            <div style="font-size: 14px; opacity: 0.9;">会员总数</div>
            <div style="font-size: 32px; font-weight: bold; margin: 10px 0;">{{ memberCount }}</div>
            <el-icon size="24"><User /></el-icon>
          </div>
        </el-col>
        <el-col :span="6">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 8px; color: white;">
            <div style="font-size: 14px; opacity: 0.9;">宠物总数</div>
            <div style="font-size: 32px; font-weight: bold; margin: 10px 0;">{{ petCount }}</div>
            <el-icon size="24"><PawPrint /></el-icon>
          </div>
        </el-col>
        <el-col :span="6">
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 8px; color: white;">
            <div style="font-size: 14px; opacity: 0.9;">洗护项目</div>
            <div style="font-size: 32px; font-weight: bold; margin: 10px 0;">{{ itemCount }}</div>
            <el-icon size="24"><Collection /></el-icon>
          </div>
        </el-col>
        <el-col :span="6">
          <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 20px; border-radius: 8px; color: white;">
            <div style="font-size: 14px; opacity: 0.9;">进行中服务</div>
            <div style="font-size: 32px; font-weight: bold; margin: 10px 0;">{{ inProgressCount }}</div>
            <el-icon size="24"><Loading /></el-icon>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span style="font-weight: bold;">最近洗护记录</span>
          </template>
          <el-table :data="recentRecords" style="width: 100%">
            <el-table-column prop="itemName" label="项目名称" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === '已完成' ? 'success' : 'warning'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="价格" />
            <el-table-column prop="createTime" label="创建时间" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span style="font-weight: bold;">会员洗护次数排行</span>
          </template>
          <el-table :data="topMembers" style="width: 100%">
            <el-table-column prop="name" label="会员姓名" />
            <el-table-column prop="phone" label="手机号" />
            <el-table-column prop="totalGroomingCount" label="洗护次数">
              <template #default="{ row }">
                <el-tag type="primary">{{ row.totalGroomingCount }} 次</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { memberAPI, petAPI, groomingItemAPI, groomingRecordAPI } from '../api'

const memberCount = ref(0)
const petCount = ref(0)
const itemCount = ref(0)
const inProgressCount = ref(0)
const recentRecords = ref([])
const topMembers = ref([])

const loadData = async () => {
  try {
    const [members, pets, items, records] = await Promise.all([
      memberAPI.getAll(),
      petAPI.getAll(),
      groomingItemAPI.getAll(),
      groomingRecordAPI.getAll()
    ])
    
    memberCount.value = members.length
    petCount.value = pets.length
    itemCount.value = items.length
    inProgressCount.value = records.filter(r => r.status === '进行中').length
    recentRecords.value = records.slice(-5).reverse()
    topMembers.value = [...members]
      .sort((a, b) => b.totalGroomingCount - a.totalGroomingCount)
      .slice(0, 5)
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>
