<template>
  <div class="booking-create-page">
    <h2 class="page-title">预订房间</h2>
    <el-card>
      <el-form :model="form" label-width="120px" style="max-width: 600px;">
        <el-form-item label="选择房间">
          <el-select v-model="form.roomId" placeholder="请选择房间" style="width: 100%;">
            <el-option 
              v-for="room in rooms" 
              :key="room.id" 
              :label="room.name + ' - ¥' + room.price + '/天'" 
              :value="room.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="入住日期">
          <el-date-picker
            v-model="form.checkInDate"
            type="date"
            placeholder="选择入住日期"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="退房日期">
          <el-date-picker
            v-model="form.checkOutDate"
            type="date"
            placeholder="选择退房日期"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="服务套餐">
          <el-select v-model="form.packageId" placeholder="可选服务套餐" style="width: 100%;" clearable>
            <el-option 
              v-for="pkg in packages" 
              :key="pkg.id" 
              :label="pkg.name + ' - ¥' + pkg.price" 
              :value="pkg.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="入住人姓名">
          <el-input v-model="form.elderName" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.elderPhone" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交预订</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRoomList } from '@/api/room'
import { getPackageList } from '@/api/package'
import { createBooking } from '@/api/booking'
import { ElMessage } from 'element-plus'

const router = useRouter()
const rooms = ref([])
const packages = ref([])

const form = reactive({
  roomId: null,
  packageId: null,
  checkInDate: null,
  checkOutDate: null,
  elderName: '',
  elderPhone: '',
  remark: ''
})

const handleSubmit = async () => {
  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const res = await createBooking({
    ...form,
    checkInDate: formatDate(form.checkInDate),
    checkOutDate: formatDate(form.checkOutDate)
  })
  
  if (res.code === 200) {
    ElMessage.success('预订成功')
    router.push('/my-bookings')
  }
}

onMounted(async () => {
  const roomRes = await getRoomList(1)
  if (roomRes.code === 200) {
    rooms.value = roomRes.data
  }

  const pkgRes = await getPackageList(1)
  if (pkgRes.code === 200) {
    packages.value = pkgRes.data
  }
})
</script>

<style scoped>
.booking-create-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  min-height: calc(100vh - 100px);
}
</style>
