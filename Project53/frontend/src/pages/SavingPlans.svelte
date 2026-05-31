<script>
    import { onMount } from 'svelte';
    import { savingPlansApi, algorithmApi, equipmentApi } from '../api.js';

    let plans = [];
    let equipmentList = [];
    let selectedEquipment = '';
    let loading = true;

    async function loadData() {
        try {
            const [plansRes, equipRes] = await Promise.all([
                savingPlansApi.getAll(),
                equipmentApi.getAll()
            ]);
            plans = plansRes.data;
            equipmentList = equipRes.data;
            loading = false;
        } catch (error) {
            console.error('加载数据失败:', error);
            loading = false;
            loadMockData();
        }
    }

    function loadMockData() {
        equipmentList = [
            { id: 1, code: 'EQ-001', name: '空压机-01' },
            { id: 2, code: 'EQ-002', name: '冷水机-01' }
        ];
        plans = [
            { id: 1, planName: '无功补偿优化方案', description: '安装无功补偿装置', expectedSaving: 45.5, expectedCost: 15000, paybackPeriod: 12, priority: 'high', status: 'pending', measures: '1. 安装SVG静态无功发生器\n2. 优化设备负载率' },
            { id: 2, planName: '散热系统改造方案', description: '改善设备散热条件', expectedSaving: 28.3, expectedCost: 5000, paybackPeriod: 6, priority: 'medium', status: 'in_progress', measures: '1. 清洗换热器\n2. 增加通风设备' },
            { id: 3, planName: '错峰用电优化方案', description: '调整生产计划避峰', expectedSaving: 65.2, expectedCost: 30000, paybackPeriod: 18, priority: 'medium', status: 'pending', measures: '1. 转移高能耗工序\n2. 配置储能系统' },
            { id: 4, planName: '设备启停优化方案', description: '实现智能启停控制', expectedSaving: 32.8, expectedCost: 8000, paybackPeriod: 4, priority: 'high', status: 'completed', measures: '1. 安装变频器\n2. 设置自动停机' }
        ];
    }

    async function generatePlans() {
        if (!selectedEquipment) return;
        try {
            const res = await algorithmApi.generatePlans(selectedEquipment);
            plans = res.data;
        } catch (error) {
            console.error('生成方案失败:', error);
        }
    }

    function getPriorityText(p) {
        const map = { high: '高', medium: '中', low: '低' };
        return map[p] || p;
    }

    function getStatusText(s) {
        const map = { pending: '待执行', in_progress: '进行中', completed: '已完成' };
        return map[s] || s;
    }

    function getPriorityClass(p) {
        return `priority-${p}`;
    }

    function getStatusClass(s) {
        return `status-${s}`;
    }

    $: filteredPlans = plans;

    onMount(loadData);
</script>

<div class="saving-plans-page">
    <div class="page-header">
        <div>
            <h1>节能方案</h1>
            <p class="subtitle">基于AI算法的智能节能方案推荐</p>
        </div>
        <div class="actions">
            <select bind:value={selectedEquipment} class="equip-select">
                <option value="">选择设备生成方案</option>
                {#each equipmentList as eq}
                    <option value={eq.id}>{eq.name}</option>
                {/each}
            </select>
            <button class="btn-primary" on:click={generatePlans} disabled={!selectedEquipment}>
                🤖 智能生成方案
            </button>
        </div>
    </div>

    <div class="plans-grid">
        {#each filteredPlans as plan}
            <div class="plan-card">
                <div class="plan-header">
                    <div class="plan-title">
                        <span class="icon">💡</span>
                        <h3>{plan.planName}</h3>
                    </div>
                    <span class="priority {getPriorityClass(plan.priority)}">{getPriorityText(plan.priority)}优先级</span>
                </div>
                <p class="description">{plan.description}</p>
                <div class="measures">
                    <strong>实施措施：</strong>
                    <pre>{plan.measures}</pre>
                </div>
                <div class="metrics">
                    <div class="metric">
                        <span class="label">预期节能</span>
                        <span class="value saving">{plan.expectedSaving} kWh</span>
                    </div>
                    <div class="metric">
                        <span class="label">投入成本</span>
                        <span class="value cost">¥{plan.expectedCost?.toLocaleString()}</span>
                    </div>
                    <div class="metric">
                        <span class="label">回收期</span>
                        <span class="value">{plan.paybackPeriod} 个月</span>
                    </div>
                </div>
                <div class="plan-footer">
                    <span class="status {getStatusClass(plan.status)}">{getStatusText(plan.status)}</span>
                    <button class="btn-link">查看详情</button>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .saving-plans-page {
        max-width: 1200px;
        margin: 0 auto;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 30px;
    }

    .page-header h1 {
        font-size: 28px;
        color: #1e3a5f;
        margin-bottom: 8px;
    }

    .subtitle {
        color: #666;
        font-size: 14px;
    }

    .actions {
        display: flex;
        gap: 10px;
    }

    .equip-select {
        padding: 10px 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        background: white;
    }

    .btn-primary {
        background: linear-gradient(135deg, #4ecdc4, #45b7d1);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;
    }

    .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(78, 205, 196, 0.4);
    }

    .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .plans-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 20px;
    }

    .plan-card {
        background: white;
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s;
    }

    .plan-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .plan-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;
    }

    .plan-title {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .plan-title .icon {
        font-size: 24px;
    }

    .plan-title h3 {
        font-size: 16px;
        color: #1e3a5f;
        margin: 0;
    }

    .priority {
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
    }

    .priority-high { background: #ffebee; color: #c62828; }
    .priority-medium { background: #fff3e0; color: #f57c00; }
    .priority-low { background: #e8f5e9; color: #2e7d32; }

    .description {
        color: #666;
        font-size: 14px;
        margin-bottom: 15px;
        line-height: 1.5;
    }

    .measures {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 15px;
    }

    .measures strong {
        display: block;
        font-size: 13px;
        color: #555;
        margin-bottom: 8px;
    }

    .measures pre {
        margin: 0;
        font-size: 12px;
        color: #666;
        white-space: pre-wrap;
        font-family: inherit;
        line-height: 1.6;
    }

    .metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 15px;
        padding: 15px 0;
        border-top: 1px solid #eee;
        border-bottom: 1px solid #eee;
    }

    .metric {
        text-align: center;
    }

    .metric .label {
        display: block;
        font-size: 12px;
        color: #888;
        margin-bottom: 4px;
    }

    .metric .value {
        font-size: 15px;
        font-weight: 600;
        color: #1e3a5f;
    }

    .metric .value.saving {
        color: #2e7d32;
    }

    .metric .value.cost {
        color: #c62828;
    }

    .plan-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .status {
        padding: 6px 12px;
        border-radius: 15px;
        font-size: 12px;
    }

    .status-pending { background: #e3f2fd; color: #1565c0; }
    .status-in_progress { background: #fff3e0; color: #f57c00; }
    .status-completed { background: #e8f5e9; color: #2e7d32; }

    .btn-link {
        background: none;
        border: none;
        color: #45b7d1;
        cursor: pointer;
        font-size: 13px;
    }
</style>
