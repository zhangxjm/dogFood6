<template>
  <div class="create-reservation">
    <van-nav-bar title="预约拍摄" left-text="返回" left-arrow @click-left="router.back()" />
    <div class="page-container">
      <div class="card package-info" v-if="packageInfo">
        <img :src="packageInfo.coverImage" class="cover" />
        <div class="info">
          <div class="name">{{ packageInfo.name }}</div>
          <div class="price">¥{{ packageInfo.price }}</div>
        </div>
      </div>
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.customerName"
            label="客户姓名"
            placeholder="请输入姓名"
            :rules="[{ required: true, message: '请输入姓名' }]"
          />
          <van-field
            v-model="form.phone"
            label="联系电话"
            placeholder="请输入手机号"
            :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]"
          />
          <van-field
            v-model="form.appointmentDate"
            label="预约日期"
            placeholder="请选择日期"
            readonly
            @click="showDatePicker = true"
            :rules="[{ required: true, message: '请选择日期' }]"
          />
          <van-field
            v-model="form.appointmentTime"
            label="预约时间"
            placeholder="请选择时间"
            readonly
            @click="showTimePicker = true"
            :rules="[{ required: true, message: '请选择时间' }]"
          />
          <van-field
            v-model="form.address"
            label="拍摄地址"
            placeholder="请输入拍摄地址"
          />
          <van-field
            v-model="form.remark"
            label="备注"
            type="textarea"
            placeholder="请输入备注信息"
            autosize
          />
        </van-cell-group>
        <div style="margin: 16px;">
          <van-button round block type="primary" native-type="submit">提交预约</van-button>
        </div>
      </van-form>
    </div>
    <van-calendar v-model:show="showDatePicker" @confirm="onDateConfirm" />
    <van-popup v-model:show="showTimePicker" position="bottom">
      <van-picker
        :columns="timeColumns"
        @confirm="onTimeConfirm"
        @cancel="showTimePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPackageDetail, createReservation } from '../api'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()
const packageInfo = ref(null)
const showDatePicker = ref(false)
const showTimePicker = ref(false)
const form = ref({
  customerName: '',
  phone: '',
  appointmentDate: '',
  appointmentTime: '',
  address: '',
  remark: ''
})

const timeColumns = []
for (let h = 9; h <= 18; h++) {
  for (let m = 0; m < 60; m += 30) {
    timeColumns.push({ text: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`, value: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00` })
  }
}

const loadPackage = async () => {
  try {
    packageInfo.value = await getPackageDetail(route.params.packageId)
  } catch (e) {
    showToast('加载套餐信息失败')
  }
}

const onDateConfirm = value => {
  form.value.appointmentDate = value.toISOString().split('T')[0]
  showDatePicker.value = false
}

const onTimeConfirm = ({ selectedOptions }) => {
  form.value.appointmentTime = selectedOptions[0].value
  showTimePicker.value = false
}

const onSubmit = async () => {
  try {
    await createReservation({
      ...form.value,
      packageId: route.params.packageId,
      packageName: packageInfo.value.name
    })
    showToast('预约成功')
    setTimeout(() => router.push('/reservation'), 1500)
  } catch (e) {}
}

onMounted(loadPackage)
</script>

<style lang="less" scoped>
.package-info {
  display: flex;
  gap: 12px;
  padding: 12px;
  .cover {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    object-fit: cover;
  }
  .info {
    flex: 1;
    .name {
      font-weight: bold;
      margin-bottom: 8px;
    }
    .price {
      color: #ff4444;
      font-size: 18px;
      font-weight: bold;
    }
  }
}
</style>
