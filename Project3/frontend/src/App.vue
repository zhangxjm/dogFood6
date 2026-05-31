<template>
  <div class="app">
    <router-view />
    <van-tabbar v-model="active" route>
      <van-tabbar-item to="/" icon="photograph">套餐</van-tabbar-item>
      <van-tabbar-item to="/reservation" icon="calendar">预约</van-tabbar-item>
      <van-tabbar-item to="/order" icon="orders">订单</van-tabbar-item>
      <van-tabbar-item to="/delivery" icon="gift-o">领取</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const active = ref(0)
</script>

<style lang="less">
.app {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 50px;
}
</style>
