<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: bold;">洗护记录管理</span>
          <div style="display: flex; gap: 10px;">
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 150px;" @change="filterByStatus">
              <el-option label="进行中" value="进行中" />
              <el-option label="已完成" value="已完成" />
            </el-select>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新建洗护服务
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="records" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="itemName" label="洗护项目" />
        <el-table-column prop="petId" label="宠物ID" width="100" />
        <el-table-column prop="memberId" label="会员ID" width="100" />
        <el-table-column prop="price" label="价格(元)" />
        <el-table-column prop="durationMinutes" label="时长(分钟)" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === '已完成' ? 'success' : 'warning'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" />
        <el-table-column prop="endTime" label="结束时间" />
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button v-if="row.status === '待开始'" size="small" type="primary" @click="handleStart(row)">
              开始服务
            </el-button>
            <el-button v-if="row.status === '进行中'" size="small" type="success" @click="handleComplete(row)">
              完成服务
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑记录' : '新建洗护服务'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="选择宠物">
          <el-select v-model="form.petId" placeholder="请选择宠物" style="width: 100%;" @change="onPetChange">
            <el-option
              v-for="pet in pets"
              :key="pet.id"
              :label="pet.name + ' (' + pet.species + ')'"
              :value="pet.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属会员">
          <el-select v-model="form.memberId" placeholder="请选择会员" style="width: 100%;">
            <el-option
              v-for="member in members"
              :key="member.id"
              :label="member.name + ' (' + member.phone + ')'"
              :value="member.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="洗护项目">
          <el-select v-model="form.itemId" placeholder="请选择项目" style="width: 100%;" @change="onItemChange">
            <el-option
              v-for="item in groomingItems"
              :key="item.id"
              :label="item.name + ' (¥' + item.price + ')'"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input v-model="form.itemName" placeholder="项目名称" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="completeDialogVisible" title="完成服务" width="400px">
      <el-form label-width="80px">
        <el-form-item label="服务备注">
          <el-input v-model="completeNotes" type="textarea" :rows="3" placeholder="请输入服务完成备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button type="success" @click="confirmComplete">确认完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { groomingRecordAPI, petAPI, memberAPI, groomingItemAPI } from '../api'

const records = ref([])
const pets = ref([])
const members = ref([])
const groomingItems = ref([])
const dialogVisible = ref(false)
const completeDialogVisible = ref(false)
const isEdit = ref(false)
const statusFilter = ref('')
const completeNotes = ref('')
const currentRecordId = ref(null)
const form = ref({
  id: null,
  petId: null,
  memberId: null,
  itemId: null,
  itemName: '',
  price: null,
  notes: '',
  status: '待开始'
})

const loadRecords = async () => {
  try {
    if (statusFilter.value) {
      records.value = await groomingRecordAPI.getByStatus(statusFilter.value)
    } else {
      records.value = await groomingRecordAPI.getAll()
    }
  } catch (error) {
    ElMessage.error('加载洗护记录失败')
  }
}

const loadPets = async () => {
  pets.value = await petAPI.getAll()
}

const loadMembers = async () => {
  members.value = await memberAPI.getAll()
}

const loadGroomingItems = async () => {
  groomingItems.value = await groomingItemAPI.getActive()
}

const filterByStatus = () => {
  loadRecords()
}

const onPetChange = (petId) => {
  const pet = pets.value.find(p => p.id === petId)
  if (pet && pet.memberId) {
    form.value.memberId = pet.memberId
  }
}

const onItemChange = (itemId) => {
  const item = groomingItems.value.find(i => i.id === itemId)
  if (item) {
    form.value.itemName = item.name
    form.value.price = item.price
  }
}

const handleAdd = () => {
  isEdit.value = false
  form.value = {
    id: null,
    petId: null,
    memberId: null,
    itemId: null,
    itemName: '',
    price: null,
    notes: '',
    status: '待开始'
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  try {
    await groomingRecordAPI.create(form.value)
    ElMessage.success('创建成功')
    dialogVisible.value = false
    loadRecords()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const handleStart = async (row) => {
  try {
    await groomingRecordAPI.start(row.id, row)
    ElMessage.success('服务已开始')
    loadRecords()
  } catch (error) {
    ElMessage.error('开始服务失败')
  }
}

const handleComplete = (row) => {
  currentRecordId.value = row.id
  completeNotes.value = ''
  completeDialogVisible.value = true
}

const confirmComplete = async () => {
  try {
    await groomingRecordAPI.complete(currentRecordId.value, { notes: completeNotes.value })
    ElMessage.success('服务已完成')
    completeDialogVisible.value = false
    loadRecords()
  } catch (error) {
    ElMessage.error('完成服务失败')
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await groomingRecordAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadRecords()
  }).catch(() => {})
}

onMounted(() => {
  loadRecords()
  loadPets()
  loadMembers()
  loadGroomingItems()
})
</script>
