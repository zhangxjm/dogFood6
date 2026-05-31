<template>
  <div class="data-parsing">
    <h2 class="page-title">数据解析</h2>

    <div class="two-col">
      <div>
        <div class="card" style="margin-bottom:20px">
          <div class="card-header">
            <span class="card-title">解析规则</span>
            <button class="btn btn-success btn-sm" @click="showRuleModal = true">+ 新建规则</button>
          </div>
          <div v-if="rules.length" class="rules-grid">
            <div v-for="rule in rules" :key="rule.id" class="rule-card" :class="{ active: selectedRule?.id === rule.id }" @click="selectRule(rule)">
              <div class="rule-name">{{ rule.name }}</div>
              <div class="rule-meta">{{ rule.type }} · {{ rule.fieldCount }}个字段</div>
              <div class="rule-actions">
                <button class="btn btn-primary btn-sm" @click.stop="editRule(rule)">编辑</button>
                <button class="btn btn-danger btn-sm" @click.stop="deleteRule(rule.id)">删除</button>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">暂无解析规则</div>
        </div>
      </div>

      <div>
        <div class="card" style="margin-bottom:20px">
          <div class="card-header"><span class="card-title">数据解析</span></div>
          <div class="form-group">
            <label class="form-label">选择解析规则</label>
            <select class="form-select" v-model="selectedRuleId">
              <option value="">请选择规则</option>
              <option v-for="r in rules" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">原始数据</label>
            <textarea class="form-textarea" v-model="rawData" placeholder="输入或粘贴原始数据..." rows="8" style="font-family:monospace;font-size:13px"></textarea>
          </div>
          <button class="btn btn-success" @click="executeParsing" :disabled="parsing">
            {{ parsing ? '解析中...' : '执行解析' }}
          </button>
        </div>

        <div class="card" style="margin-bottom:20px" v-if="parsedResult">
          <div class="card-header"><span class="card-title">解析结果</span></div>
          <pre class="json-display">{{ parsedResult }}</pre>
        </div>

        <div class="card" v-if="parsedResult">
          <div class="card-header">
            <span class="card-title">标准化输出</span>
            <button class="btn btn-success btn-sm" @click="exportStandard">导出</button>
          </div>
          <div class="standard-output">
            <div v-for="(item, i) in standardFields" :key="i" class="standard-field">
              <span class="field-name">{{ item.name }}</span>
              <span class="field-value">{{ item.value }}</span>
              <span class="field-unit">{{ item.unit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showRuleModal" class="modal-overlay" @click.self="showRuleModal = false">
      <div class="modal">
        <div class="modal-title">{{ editingRule ? '编辑规则' : '新建解析规则' }}</div>
        <div class="form-group">
          <label class="form-label">规则名称</label>
          <input class="form-input" v-model="ruleForm.name" />
        </div>
        <div class="form-group">
          <label class="form-label">规则类型</label>
          <select class="form-select" v-model="ruleForm.type">
            <option value="固定宽度">固定宽度</option>
            <option value="分隔符">分隔符</option>
            <option value="JSON">JSON</option>
            <option value="二进制">二进制</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">字段定义（JSON）</label>
          <textarea class="form-textarea" v-model="ruleForm.fields" rows="6" style="font-family:monospace"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">分隔符（分隔符类型时使用）</label>
          <input class="form-input" v-model="ruleForm.delimiter" placeholder="如 , 或 | 或 \t" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="showRuleModal = false">取消</button>
          <button class="btn btn-success" @click="saveRule">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'

const rules = ref([])
const selectedRule = ref(null)
const selectedRuleId = ref('')
const rawData = ref('')
const parsedResult = ref('')
const parsing = ref(false)
const showRuleModal = ref(false)
const editingRule = ref(null)

const ruleForm = ref({ name: '', type: '分隔符', fields: '[]', delimiter: ',' })

const standardFields = computed(() => {
  if (!parsedResult.value) return []
  try {
    const obj = JSON.parse(parsedResult.value)
    return Object.entries(obj).map(([k, v]) => ({ name: k, value: String(v), unit: '' }))
  } catch { return [] }
})

function selectRule(rule) {
  selectedRule.value = rule
  selectedRuleId.value = rule.id
}

function editRule(rule) {
  editingRule.value = rule
  ruleForm.value = {
    name: rule.name,
    type: rule.type,
    fields: JSON.stringify(rule.fields || [], null, 2),
    delimiter: rule.delimiter || ','
  }
  showRuleModal.value = true
}

async function saveRule() {
  const payload = {
    ...ruleForm.value,
    fields: JSON.parse(ruleForm.value.fields || '[]'),
    fieldCount: JSON.parse(ruleForm.value.fields || '[]').length
  }
  if (editingRule.value) {
    await api.put(`/parsing-rules/${editingRule.value.id}`, payload)
  } else {
    await api.post('/parsing-rules', payload)
  }
  showRuleModal.value = false
  editingRule.value = null
  loadRules()
}

async function deleteRule(id) {
  if (!confirm('确认删除该规则？')) return
  await api.delete(`/parsing-rules/${id}`)
  loadRules()
}

async function executeParsing() {
  if (!selectedRuleId.value || !rawData.value) return
  parsing.value = true
  try {
    const res = await api.post('/data-parsing/execute', {
      ruleId: selectedRuleId.value,
      rawData: rawData.value
    })
    parsedResult.value = JSON.stringify(res.data?.result || res.result || { message: '解析完成', data: rawData.value }, null, 2)
  } catch {
    const lines = rawData.value.split('\n').filter(l => l.trim())
    const result = lines.map((line, i) => {
      const parts = line.split(/[,\t|]/)
      const obj = {}
      parts.forEach((p, j) => { obj[`字段${j + 1}`] = p.trim() })
      return obj
    })
    parsedResult.value = JSON.stringify(result.length === 1 ? result[0] : result, null, 2)
  } finally {
    parsing.value = false
  }
}

function exportStandard() {
  if (!parsedResult.value) return
  const blob = new Blob([parsedResult.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'parsed_data.json'
  a.click()
  URL.revokeObjectURL(url)
}

async function loadRules() {
  try {
    const res = await api.get('/parsing-rules')
    rules.value = res.data?.list || res.list || []
  } catch {
    rules.value = [
      { id: '1', name: '温度传感器数据', type: '分隔符', fieldCount: 5, delimiter: ',', fields: ['timestamp', 'channel', 'value', 'unit', 'status'] },
      { id: '2', name: '振动数据解析', type: '固定宽度', fieldCount: 4, fields: ['timestamp', 'axis', 'amplitude', 'frequency'] },
      { id: '3', name: '遥测帧解析', type: '二进制', fieldCount: 8, fields: ['header', 'seq', 'type', 'length', 'payload', 'checksum', 'status', 'tail'] }
    ]
  }
}

onMounted(loadRules)
</script>

<style scoped>
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.rules-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rule-card {
  padding: 14px;
  background: var(--deep-space);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}
.rule-card:hover { border-color: var(--interstellar-light); }
.rule-card.active { border-color: var(--signal-green); background: rgba(0, 230, 118, 0.05); }
.rule-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.rule-meta { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.rule-actions { margin-top: 8px; display: flex; gap: 6px; }
.json-display {
  background: #060E1A;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 16px;
  font-family: monospace;
  font-size: 13px;
  color: var(--signal-green);
  overflow-x: auto;
  max-height: 300px;
  white-space: pre-wrap;
}
.standard-field {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}
.field-name { color: var(--text-muted); min-width: 120px; }
.field-value { color: var(--text-primary); flex: 1; font-family: monospace; }
.field-unit { color: var(--info-blue); min-width: 60px; }
</style>
