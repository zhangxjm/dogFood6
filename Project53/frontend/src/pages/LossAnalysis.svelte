<script>
    import { onMount } from 'svelte';
    import { lossAnalysisApi } from '../api.js';
    import BarChart from '../components/BarChart.svelte';

    let lossList = [];
    let stats = {};
    let loading = true;

    async function loadData() {
        try {
            const [lossRes, statsRes] = await Promise.all([
                lossAnalysisApi.getAll(),
                lossAnalysisApi.getStatistics()
            ]);
            lossList = lossRes.data;
            stats = statsRes.data;
            loading = false;
        } catch (error) {
            console.error('加载数据失败:', error);
            loading = false;
            loadMockData();
        }
    }

    function loadMockData() {
        lossList = [
            { id: 1, lossType: '功率因数损耗', description: '无功损耗增加', lossValue: 45.2, lossPercentage: 8.5, cost: 1250, severity: 'high', reason: '电机轻载运行', suggestion: '安装无功补偿装置' },
            { id: 2, lossType: '温度过热损耗', description: '效率下降能耗增加', lossValue: 18.6, lossPercentage: 3.2, cost: 520, severity: 'medium', reason: '散热不良', suggestion: '清洗换热器' },
            { id: 3, lossType: '尖峰负荷损耗', description: '尖峰电价成本高', lossValue: 85.3, lossPercentage: 12.5, cost: 2340, severity: 'high', reason: '集中用电', suggestion: '错峰用电' },
            { id: 4, lossType: '空载运行损耗', description: '待机时间过长', lossValue: 32.1, lossPercentage: 5.8, cost: 890, severity: 'medium', reason: '启停不合理', suggestion: '自动启停' }
        ];
        stats = {
            totalLossValue: 181.2,
            totalCost: 5000,
            lossByType: {
                '功率因数损耗': 45.2,
                '温度过热损耗': 18.6,
                '尖峰负荷损耗': 85.3,
                '空载运行损耗': 32.1
            },
            lossCount: 4
        };
    }

    function getChartData() {
        const lossByType = stats.lossByType || {};
        return {
            labels: Object.keys(lossByType),
            data: Object.values(lossByType)
        };
    }

    function getSeverityText(s) {
        const map = { high: '高', medium: '中', low: '低' };
        return map[s] || s;
    }

    function getSeverityClass(s) {
        return `severity-${s}`;
    }

    onMount(loadData);
</script>

<div class="loss-analysis-page">
    <div class="page-header">
        <div>
            <h1>损耗分析</h1>
            <p class="subtitle">智能识别设备能耗损耗并提供优化建议</p>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-icon red">💰</div>
            <div class="stat-content">
                <div class="stat-value">{stats.totalLossValue?.toFixed(1) || 0} kWh</div>
                <div class="stat-label">月损耗电量</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon orange">💸</div>
            <div class="stat-content">
                <div class="stat-value">¥{stats.totalCost?.toLocaleString() || 0}</div>
                <div class="stat-label">月损耗成本</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon blue">⚠️</div>
            <div class="stat-content">
                <div class="stat-value">{stats.lossCount || 0} 项</div>
                <div class="stat-label">发现问题</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green">📉</div>
            <div class="stat-content">
                <div class="stat-value">15.2%</div>
                <div class="stat-label">可优化空间</div>
            </div>
        </div>
    </div>

    <div class="content-grid">
        <div class="chart-card">
            <h3>损耗类型分布</h3>
            <BarChart data={getChartData()} />
        </div>

        <div class="list-card">
            <h3>损耗明细</h3>
            <div class="loss-list">
                {#each lossList as loss}
                    <div class="loss-item">
                        <div class="loss-header">
                            <span class="loss-type">{loss.lossType}</span>
                            <span class="severity {getSeverityClass(loss.severity)}">{getSeverityText(loss.severity)}</span>
                        </div>
                        <p class="loss-desc">{loss.description}</p>
                        <div class="loss-metrics">
                            <div>
                                <span class="label">损耗电量</span>
                                <span class="value danger">{loss.lossValue} kWh</span>
                            </div>
                            <div>
                                <span class="label">损耗占比</span>
                                <span class="value warning">{loss.lossPercentage}%</span>
                            </div>
                            <div>
                                <span class="label">经济损失</span>
                                <span class="value danger">¥{loss.cost}</span>
                            </div>
                        </div>
                        <div class="loss-suggestion">
                            <span class="suggestion-label">💡 建议：</span>
                            <span>{loss.suggestion}</span>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .loss-analysis-page {
        max-width: 1200px;
        margin: 0 auto;
    }

    .page-header {
        margin-bottom: 25px;
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

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        margin-bottom: 25px;
    }

    .stat-card {
        background: white;
        padding: 18px;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
    }

    .stat-icon.red { background: #ffebee; }
    .stat-icon.orange { background: #fff3e0; }
    .stat-icon.blue { background: #e3f2fd; }
    .stat-icon.green { background: #e8f5e9; }

    .stat-content {
        flex: 1;
    }

    .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: #1e3a5f;
        margin-bottom: 4px;
    }

    .stat-label {
        font-size: 12px;
        color: #888;
    }

    .content-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .chart-card,
    .list-card {
        background: white;
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }

    .chart-card h3,
    .list-card h3 {
        font-size: 18px;
        color: #1e3a5f;
        margin-bottom: 20px;
    }

    .loss-list {
        max-height: 500px;
        overflow-y: auto;
    }

    .loss-item {
        padding: 15px;
        border: 1px solid #eee;
        border-radius: 8px;
        margin-bottom: 12px;
    }

    .loss-item:last-child {
        margin-bottom: 0;
    }

    .loss-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .loss-type {
        font-weight: 600;
        color: #1e3a5f;
        font-size: 15px;
    }

    .severity {
        padding: 4px 10px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 500;
    }

    .severity-high { background: #ffebee; color: #c62828; }
    .severity-medium { background: #fff3e0; color: #f57c00; }
    .severity-low { background: #e8f5e9; color: #2e7d32; }

    .loss-desc {
        color: #666;
        font-size: 13px;
        margin-bottom: 12px;
    }

    .loss-metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 12px;
        padding: 10px 0;
        border-top: 1px solid #f0f0f0;
        border-bottom: 1px solid #f0f0f0;
    }

    .loss-metrics .label {
        display: block;
        font-size: 11px;
        color: #888;
        margin-bottom: 2px;
    }

    .loss-metrics .value {
        font-size: 14px;
        font-weight: 600;
        color: #1e3a5f;
    }

    .loss-metrics .value.danger {
        color: #c62828;
    }

    .loss-metrics .value.warning {
        color: #f57c00;
    }

    .loss-suggestion {
        font-size: 13px;
        color: #555;
        background: #f8f9fa;
        padding: 10px;
        border-radius: 6px;
    }

    .suggestion-label {
        font-weight: 600;
        margin-right: 5px;
    }
</style>
