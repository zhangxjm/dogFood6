<template>
  <div class="report-list">
    <h2 class="page-title">报告中心</h2>

    <div class="tab-bar">
      <button class="tab-btn" :class="{ active: activeTab === 'reports' }" @click="activeTab = 'reports'">报告列表</button>
      <button class="tab-btn" :class="{ active: activeTab === 'templates' }" @click="activeTab = 'templates'">模板管理</button>
    </div>

    <template v-if="activeTab === 'reports'">
      <div class="filter-bar">
        <select class="form-select" v-model="filters.status">
          <option value="">全部状态</option>
          <option value="已生成">已生成</option>
          <option value="生成中">生成中</option>
          <option value="失败">失败</option>
        </select>
        <input class="form-input" placeholder="搜索报告..." v-model="filters.keyword" />
        <button class="btn btn-primary" @click="loadReports">查询</button>
        <button class="btn btn-success" style="margin-left:auto" @click="showGenerateModal = true">生成报告</button>
      </div>

      <div class="card">
        <div v-if="loading" style="text-align:center;padding:40px"><span class="loading-spinner"></span></div>
        <template v-else>
          <table v-if="reports.length">
            <thead>
              <tr>
                <th>报告编号</th>
                <th>报告名称</th>
                <th>关联试验</th>
                <th>模板</th>
                <th>状态</th>
                <th>生成时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in reports" :key="r.id">
                <td style="font-family:Orbitron,monospace;font-size:13px">{{ r.code }}</td>
                <td>{{ r.name }}</td>
                <td>{{ r.experiment_name || '-' }}</td>
                <td>{{ r.template_name || '-' }}</td>
                <td><span class="badge" :class="r.status === '已生成' ? 'badge-success' : r.status === '生成中' ? 'badge-info' : 'badge-danger'">{{ r.status }}</span></td>
                <td>{{ r.created_at || '-' }}</td>
                <td>
                  <button class="btn btn-primary btn-sm" @click="previewReport(r)">预览</button>
                  <button class="btn btn-success btn-sm" style="margin-left:6px" @click="downloadReport(r)" :disabled="r.status !== '已生成'">下载</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty-state">暂无报告</div>
        </template>
      </div>
    </template>

    <template v-else>
      <div class="card">
        <div class="card-header">
          <span class="card-title">报告模板</span>
          <button class="btn btn-success btn-sm" @click="showTemplateModal = true">+ 新建模板</button>
        </div>
        <div v-if="templates.length" class="template-grid">
          <div v-for="t in templates" :key="t.id" class="template-card">
            <div class="template-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:32px;height:32px;color:var(--info-blue)"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div class="template-name">{{ t.name }}</div>
            <div class="template-desc">{{ t.description || '暂无描述' }}</div>
            <div class="template-meta">{{ t.sections?.length || 0 }} 个章节</div>
          </div>
        </div>
        <div v-else class="empty-state">暂无模板</div>
      </div>
    </template>

    <div v-if="showGenerateModal" class="modal-overlay" @click.self="showGenerateModal = false">
      <div class="modal">
        <div class="modal-title">生成报告</div>
        <div class="form-group">
          <label class="form-label">选择试验 <span style="color:var(--danger-red)">*</span></label>
          <select class="form-select" v-model="generateForm.experimentId">
            <option value="">请选择</option>
            <option v-for="e in experimentOptions" :key="e.id" :value="e.id">{{ e.experiment_code }} - {{ e.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">选择模板</label>
          <select class="form-select" v-model="generateForm.templateId">
            <option value="">默认模板</option>
            <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">报告名称</label>
          <input class="form-input" v-model="generateForm.name" placeholder="请输入报告名称" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="showGenerateModal = false">取消</button>
          <button class="btn btn-success" @click="handleGenerate" :disabled="generating">{{ generating ? '生成中...' : '确认生成' }}</button>
        </div>
      </div>
    </div>

    <div v-if="showTemplateModal" class="modal-overlay" @click.self="showTemplateModal = false">
      <div class="modal">
        <div class="modal-title">新建模板</div>
        <div class="form-group">
          <label class="form-label">模板名称</label>
          <input class="form-input" v-model="templateForm.name" />
        </div>
        <div class="form-group">
          <label class="form-label">模板描述</label>
          <textarea class="form-textarea" v-model="templateForm.description" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">章节定义（JSON）</label>
          <textarea class="form-textarea" v-model="templateForm.sections" rows="5" style="font-family:monospace" placeholder='["试验概述","数据采集","分析结果","结论"]'></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="showTemplateModal = false">取消</button>
          <button class="btn btn-success" @click="saveTemplate">保存</button>
        </div>
      </div>
    </div>

    <div v-if="previewData" class="modal-overlay" @click.self="previewData = null">
      <div class="modal" style="max-width:700px">
        <div class="modal-title">{{ previewData.name }}</div>
        <div class="preview-content">
          <div v-for="(sec, i) in previewData.sections || []" :key="i" class="preview-section">
            <h4>{{ sec.title }}</h4>
            <p>{{ sec.content || '暂无内容' }}</p>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="previewData = null">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../api'

const activeTab = ref('reports')
const loading = ref(false)
const generating = ref(false)
const reports = ref([])
const templates = ref([])
const experimentOptions = ref([])
const showGenerateModal = ref(false)
const showTemplateModal = ref(false)
const previewData = ref(null)

const filters = ref({ status: '', keyword: '' })
const generateForm = reactive({ experimentId: '', templateId: '', name: '' })
const templateForm = reactive({ name: '', description: '', sections: '[]' })

async function loadReports() {
  loading.value = true
  try {
    const res = await api.get('/reports', { params: filters.value })
    reports.value = res.data?.list || res.list || []
  } catch {
    reports.value = [
      { id: '1', code: 'RPT-2024-001', name: '热真空试验报告', experiment_name: 'SY-2024-003', template_name: '标准模板', status: '已生成', created_at: '2024-12-15 14:30' },
      { id: '2', code: 'RPT-2024-002', name: '力学振动试验报告', experiment_name: 'SY-2024-007', template_name: '标准模板', status: '生成中', created_at: '2024-12-16 09:00' }
    ]
  } finally {
    loading.value = false
  }
}

async function loadTemplates() {
  try {
    const res = await api.get('/report-templates')
    templates.value = res.data?.list || res.list || []
  } catch {
    templates.value = [
      { id: '1', name: '标准试验报告', description: '通用试验报告模板', sections: ['试验概述', '试验条件', '数据采集', '分析结果', '结论与建议'] },
      { id: '2', name: '环境试验报告', description: '空间环境模拟试验专用', sections: ['环境参数', '试验过程', '监测数据', '异常记录', '总结'] }
    ]
  }
}

async function loadExperiments() {
  try {
    const res = await api.get('/experiments', { params: { pageSize: 100 } })
    experimentOptions.value = res.data?.list || res.list || []
  } catch { /* ignore */ }
}

function previewReport(report) {
  previewData.value = {
    name: report.name,
    sections: [
      { title: '试验概述', content: `试验编号: ${report.experiment_name}，报告编号: ${report.code}` },
      { title: '数据采集', content: '共采集数据 2,458 条，有效率 98.7%' },
      { title: '分析结果', content: '各项指标均在允许范围内' },
      { title: '结论', content: '试验合格' }
    ]
  }
}

function downloadReport(report) {
  alert(`下载报告: ${report.name}`)
}

async function handleGenerate() {
  if (!generateForm.experimentId) return
  generating.value = true
  try {
    await api.post('/reports/generate', generateForm)
    showGenerateModal.value = false
    loadReports()
  } catch {
    showGenerateModal.value = false
    reports.value.unshift({
      id: Date.now().toString(), code: `RPT-${Date.now()}`, name: generateForm.name || '新报告',
      experiment_name: '-', template_name: '-', status: '生成中', created_at: new Date().toLocaleString()
    })
  } finally {
    generating.value = false
  }
}

async function saveTemplate() {
  try {
    const payload = { ...templateForm, sections: JSON.parse(templateForm.sections || '[]') }
    await api.post('/report-templates', payload)
  } catch { /* ignore */ }
  showTemplateModal.value = false
  loadTemplates()
}

onMounted(() => {
  loadReports()
  loadTemplates()
  loadExperiments()
})
</script>

<style scoped>
.tab-bar {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--border);
}
.tab-btn {
  padding: 10px 24px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 14px;
  font-family: 'Noto Sans SC', sans-serif;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}
.tab-btn:hover { color: var(--text-secondary); }
.tab-btn.active { color: var(--signal-green); border-bottom-color: var(--signal-green); }
.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.template-card {
  padding: 20px;
  background: var(--deep-space);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-align: center;
  transition: all 0.2s;
}
.template-card:hover { border-color: var(--interstellar-light); transform: translateY(-2px); }
.template-icon { margin-bottom: 12px; }
.template-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.template-desc { font-size: 12px; color: var(--text-muted); margin-top: 6px; }
.template-meta { font-size: 12px; color: var(--info-blue); margin-top: 8px; }
.preview-section { margin-bottom: 16px; }
.preview-section h4 { font-size: 15px; color: var(--text-primary); margin-bottom: 6px; border-left: 3px solid var(--info-blue); padding-left: 10px; }
.preview-section p { font-size: 14px; color: var(--text-secondary); padding-left: 13px; }
</style>
