<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

interface Props {
  title: string
  value: string | number
  icon: unknown
  color?: 'primary' | 'success' | 'warning' | 'danger'
  trend?: number
  suffix?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  suffix: ''
})

const colorClasses = computed(() => {
  const colorMap = {
    primary: {
      bg: 'bg-primary-50',
      icon: 'bg-primary-500',
      text: 'text-primary-600'
    },
    success: {
      bg: 'bg-success-50',
      icon: 'bg-success-500',
      text: 'text-success-600'
    },
    warning: {
      bg: 'bg-warning-50',
      icon: 'bg-warning-500',
      text: 'text-warning-600'
    },
    danger: {
      bg: 'bg-danger-50',
      icon: 'bg-danger-500',
      text: 'text-danger-600'
    }
  }
  return colorMap[props.color]
})

const trendIcon = computed(() => {
  if (!props.trend) return Minus
  return props.trend > 0 ? TrendingUp : TrendingDown
})

const trendColor = computed(() => {
  if (!props.trend) return 'text-gray-500'
  return props.trend > 0 ? 'text-success-500' : 'text-danger-500'
})
</script>

<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-sm text-gray-500 mb-2">{{ title }}</p>
        <div class="flex items-baseline gap-1">
          <span class="text-3xl font-bold text-gray-800">{{ value }}</span>
          <span class="text-sm text-gray-500">{{ suffix }}</span>
        </div>
        <div v-if="trend !== undefined" class="flex items-center gap-1 mt-3">
          <component :is="trendIcon" class="w-4 h-4" :class="trendColor" />
          <span class="text-sm" :class="trendColor">
            {{ trend > 0 ? '+' : '' }}{{ trend.toFixed(1) }}%
          </span>
          <span class="text-sm text-gray-400">较上周</span>
        </div>
      </div>
      <div
        class="w-14 h-14 rounded-xl flex items-center justify-center"
        :class="colorClasses.icon"
      >
        <component :is="icon" class="w-7 h-7 text-white" />
      </div>
    </div>
  </div>
</template>
