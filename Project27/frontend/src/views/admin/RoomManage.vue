<template>
  <div class="admin-page">
    <div class="flex-between mb-20">
      <h2 class="page-title" style="margin: 0;">房间管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 添加房间
      </el-button>
    </div>

    <el-card>
      <el-table :data="rooms" style="width: 100%">
        <el-table-column prop="roomNo" label="房间号" width="100" />
        <el-table-column prop="name" label="房间名称" width="150" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="price" label="价格(元/天)" width="120">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="floor" label="楼层" width="80" />
        <el-table-column prop="area" label="面积" width="100" />
        <el-table-column prop="bedCount" label="床数" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '可预订' : '已停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showDialog" :title="isEdit ? '编辑房间' : '添加房间'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="房间号">
          <el-input v-model="form.roomNo" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="房间名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="房间类型">
          <el-select v-model="form.type" style="width: 100%;">
            <el-option label="标准单人间" value="标准单人间" />
            <el-option label="标准双人间" value="标准双人间" />
            <el-option label="豪华套房" value="豪华套房" />
            <el-option label="康养套房" value="康养套房" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
          <span class="ml-10">元/天</span>
        </el-form-item>
        <el-form-item label="楼层">
          <el-input-number v-model="form.floor" :min="1" />
        </el-form-item>
        <el-form-item label="床位数">
          <el-input-number v-model="form.bedCount" :min="1" />
        </el-form-item>
        <el-form-item label="面积">
          <el-input v-model="form.area" placeholder="如: 30㎡" />
        </el-form-item>
        <el-form-item label="房间设施">
          <el-input v-model="form.facilities" type="textarea" :rows="2" placeholder="用逗号分隔" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="状态" v-if="isEdit">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">可预订</el-radio>
            <el-radio :label="0">已停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getRoomList, saveRoom, updateRoom, deleteRoom } from '@/api/room'
import { ElMessage, ElMessageBox } from 'element-plus'

const rooms = ref([])
const showDialog = ref(false)
const isEdit = ref(false)

const form = reactive({
  id: null,
  roomNo: '',
  name: '',
  type: '',
  price: 0,
  floor: 1,
  bedCount: 1,
  area: '',
  facilities: '',
  description: '',
  status: 1
})

const handleAdd = () => {
  isEdit.value = false
  Object.keys(form).forEach(key => {
    form[key] = key === 'floor' || key === 'bedCount' ? 1 : key === 'price' ? 0 : key === 'status' ? 1 : ''
  })
  showDialog.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  form.id = row.id
  form.roomNo = row.roomNo
  form.name = row.name
  form.type = row.type
  form.price = row.price
  form.floor = row.floor
  form.bedCount = row.bedCount
  form.area = row.area
  form.facilities = row.facilities
  form.description = row.description
  form.status = row.status
  showDialog.value = true
}

const handleSave = async () => {
  let res
  if (isEdit.value) {
    res = await updateRoom(form)
  } else {
    res = await saveRoom(form)
  }
  
  if (res.code === 200) {
    ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
    showDialog.value = false
    loadRooms()
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该房间吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteRoom(id)
    ElMessage.success('删除成功')
    loadRooms()
  } catch (e) {
  }
}

const loadRooms = async () => {
  const res = await getRoomList()
  if (res.code === 200) {
    rooms.value = res.data
  }
}

onMounted(() => {
  loadRooms()
})
</script>

<style scoped>
.admin-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  min-height: calc(100vh - 100px);
}
</style>
