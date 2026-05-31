<template>
  <div class="room-detail-page" v-if="room">
    <el-button type="primary" link @click="$router.back()" class="back-btn">
      <el-icon><ArrowLeft /></el-icon> 返回列表
    </el-button>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <div class="room-image-large">
            <el-icon :size="120" color="#fff"><OfficeBuilding /></el-icon>
          </div>
          <div class="room-info">
            <h2>{{ room.name }}</h2>
            <div class="room-tags">
              <el-tag>{{ room.type }}</el-tag>
              <el-tag type="success">{{ room.status === 1 ? '可预订' : '已占用' }}</el-tag>
              <el-tag>{{ room.area }}</el-tag>
              <el-tag>{{ room.bedCount }}床</el-tag>
              <el-tag>{{ room.floor }}楼</el-tag>
            </div>
            <div class="room-price">
              <span class="price">¥{{ room.price }}</span>
              <span class="unit">/天</span>
            </div>
            <div class="room-desc">
              <h3>房间描述</h3>
              <p>{{ room.description }}</p>
            </div>
            <div class="room-facilities">
              <h3>房间设施</h3>
              <div class="facility-list">
                <div class="facility-item" v-for="(facility, idx) in room.facilities.split(',')" :key="idx">
                  <el-icon><CircleCheck /></el-icon>
                  <span>{{ facility }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="booking-card">
          <template #header>
            <span>立即预订</span>
          </template>
          <el-form :model="bookingForm" label-width="80px">
            <el-form-item label="入住日期">
              <el-date-picker
                v-model="bookingForm.checkInDate"
                type="date"
                placeholder="选择入住日期"
                style="width: 100%"
                :disabled-date="disabledCheckInDate"
              />
            </el-form-item>
            <el-form-item label="退房日期">
              <el-date-picker
                v-model="bookingForm.checkOutDate"
                type="date"
                placeholder="选择退房日期"
                style="width: 100%"
                :disabled-date="disabledCheckOutDate"
              />
            </el-form-item>
            <el-form-item label="服务套餐">
              <el-select v-model="bookingForm.packageId" placeholder="可选服务套餐" style="width: 100%" clearable>
                <el-option 
                  v-for="pkg in packages" 
                  :key="pkg.id" 
                  :label="pkg.name + ' - ¥' + pkg.price" 
                  :value="pkg.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="入住人">
              <el-input v-model="bookingForm.elderName" placeholder="请输入入住人姓名" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="bookingForm.elderPhone" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="bookingForm.remark" type="textarea" :rows="3" placeholder="特殊需求备注" />
            </el-form-item>
          </el-form>
          <div class="price-summary">
            <div class="price-item">
              <span>房费</span>
              <span>¥{{ room.price }} × {{ days }}天</span>
            </div>
            <div class="price-item" v-if="selectedPackage">
              <span>服务套餐</span>
              <span>¥{{ selectedPackage.price }}</span>
            </div>
            <div class="price-total">
              <span>合计</span>
              <span class="total-price">¥{{ totalPrice }}</span>
            </div>
          </div>
          <el-button 
            type="primary" 
            size="large" 
            style="width: 100%;" 
            @click="handleBooking"
            :disabled="!canBook"
          >
            提交预订
          </el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRoomDetail } from '@/api/room'
import { getPackageList } from '@/api/package'
import { createBooking } from '@/api/booking'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const room = ref(null)
const packages = ref([])

const bookingForm = ref({
  roomId: route.params.id,
  packageId: null,
  checkInDate: null,
  checkOutDate: null,
  elderName: '',
  elderPhone: '',
  remark: ''
})

const days = computed(() => {
  if (!bookingForm.value.checkInDate || !bookingForm.value.checkOutDate) return 0
  const diff = bookingForm.value.checkOutDate - bookingForm.value.checkInDate
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const selectedPackage = computed(() => {
  if (!bookingForm.value.packageId) return null
  return packages.value.find(p => p.id === bookingForm.value.packageId)
})

const totalPrice = computed(() => {
  let total = (room.value?.price || 0) * days.value
  if (selectedPackage.value) {
    total += selectedPackage.value.price
  }
  return total.toFixed(2)
})

const canBook = computed(() => {
  return bookingForm.value.checkInDate && 
         bookingForm.value.checkOutDate && 
         days.value > 0 &&
         bookingForm.value.elderName &&
         bookingForm.value.elderPhone
})

const disabledCheckInDate = (time) => {
  return time.getTime() < Date.now() - 86400000
}

const disabledCheckOutDate = (time) => {
  if (!bookingForm.value.checkInDate) return true
  return time.getTime() <= bookingForm.value.checkInDate.getTime()
}

const handleBooking = async () => {
  const res = await createBooking({
    roomId: bookingForm.value.roomId,
    packageId: bookingForm.value.packageId,
    checkInDate: formatDate(bookingForm.value.checkInDate),
    checkOutDate: formatDate(bookingForm.value.checkOutDate),
    elderName: bookingForm.value.elderName,
    elderPhone: bookingForm.value.elderPhone,
    remark: bookingForm.value.remark
  })
  
  if (res.code === 200) {
    ElMessage.success('预订成功')
    router.push('/my-bookings')
  }
}

const formatDate = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

onMounted(async () => {
  const roomRes = await getRoomDetail(route.params.id)
  if (roomRes.code === 200) {
    room.value = roomRes.data
  }

  const pkgRes = await getPackageList(1)
  if (pkgRes.code === 200) {
    packages.value = pkgRes.data
  }
})
</script>

<style scoped>
.room-detail-page {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
}

.back-btn {
  margin-bottom: 20px;
}

.room-image-large {
  height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-bottom: 20px;
}

.room-info h2 {
  margin: 0 0 15px 0;
  font-size: 24px;
}

.room-tags {
  margin-bottom: 20px;
}

.room-tags .el-tag {
  margin-right: 10px;
}

.room-price {
  margin-bottom: 20px;
}

.room-price .price {
  font-size: 36px;
  font-weight: bold;
  color: #f56c6c;
}

.room-price .unit {
  color: #909399;
  font-size: 16px;
}

.room-desc, .room-facilities {
  margin-bottom: 20px;
}

.room-desc h3, .room-facilities h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #303133;
}

.facility-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.facility-item {
  display: flex;
  align-items: center;
  color: #606266;
}

.facility-item .el-icon {
  color: #67c23a;
  margin-right: 8px;
}

.booking-card {
  position: sticky;
  top: 20px;
}

.price-summary {
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
  margin-bottom: 20px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #606266;
}

.price-total {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #dcdfe6;
  font-size: 16px;
  font-weight: bold;
}

.total-price {
  color: #f56c6c;
  font-size: 24px;
}
</style>
