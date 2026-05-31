import dayjs from 'dayjs'

export function formatDate(date: string | Date | undefined, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export function formatDateShort(date: string | Date | undefined): string {
  return formatDate(date, 'YYYY-MM-DD')
}

export function formatDateTime(date: string | Date | undefined): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm')
}

export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    online: '在线',
    offline: '离线',
    warning: '预警',
    error: '故障',
    pending: '待处理',
    approved: '已批准',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重',
    urgent: '紧急'
  }
  return statusMap[status] || status
}

export function getStatusType(status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' {
  const typeMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    online: 'success',
    offline: 'info',
    warning: 'warning',
    error: 'danger',
    pending: 'info',
    approved: 'primary',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'info',
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'danger',
    urgent: 'danger'
  }
  return typeMap[status] || 'info'
}

export function getHealthColor(score: number): string {
  if (score >= 80) return '#00B42A'
  if (score >= 60) return '#FF7D00'
  if (score >= 40) return '#F53F3F'
  return '#CB2634'
}

export function getHealthStatus(score: number): string {
  if (score >= 80) return '健康'
  if (score >= 60) return '良好'
  if (score >= 40) return '预警'
  return '故障'
}

export function getRiskColor(level: string): string {
  const colorMap: Record<string, string> = {
    low: '#00B42A',
    medium: '#FF7D00',
    high: '#F53F3F',
    critical: '#CB2634'
  }
  return colorMap[level] || '#165DFF'
}

export function getPriorityColor(priority: string): string {
  const colorMap: Record<string, string> = {
    low: '#00B42A',
    medium: '#165DFF',
    high: '#FF7D00',
    urgent: '#F53F3F'
  }
  return colorMap[priority] || '#165DFF'
}

export function formatNumber(num: number | undefined, decimals: number = 2): string {
  if (num === undefined || num === null) return '-'
  return num.toFixed(decimals)
}

export function formatPercent(num: number | undefined, decimals: number = 1): string {
  if (num === undefined || num === null) return '-'
  return `${(num * 100).toFixed(decimals)}%`
}

export function downloadFile(data: Blob, filename: string): void {
  const url = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: unknown, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  } as T
}

export function throttle<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T {
  let lastTime = 0
  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  } as T
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getPriorityText(priority: string): string {
  const priorityMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return priorityMap[priority] || priority
}

export function getStockStatus(quantity: number, safeStock: number): { text: string; type: string } {
  if (quantity <= 0) {
    return { text: '缺货', type: 'danger' }
  } else if (quantity < safeStock) {
    return { text: '库存不足', type: 'warning' }
  } else {
    return { text: '正常', type: 'success' }
  }
}
