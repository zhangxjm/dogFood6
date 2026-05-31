<script>
    import { onMount, onDestroy } from 'svelte';
    import { energyDataApi, equipmentApi } from '../api.js';
    import LineChart from '../components/LineChart.svelte';
    import StatCard from '../components/StatCard.svelte';

    let realtimeStats = {
        todayConsumption: 0,
        weekConsumption: 0,
        monthConsumption: 0,
        currentPower: 0
    };
    let equipmentList = [];
    let energyDataList = [];
    let refreshInterval;
    let loading = true;

    async function loadData() {
        try {
            const [statsRes, equipmentRes, dataRes] = await Promise.all([
                energyDataApi.getRealTimeStats(),
                equipmentApi.getAll(),
                energyDataApi.getAll()
            ]);
            realtimeStats = statsRes.data;
            equipmentList = equipmentRes.data;
            energyDataList = dataRes.data.slice(0, 50);
            loading = false;
        } catch (error) {
            console.error('加载数据失败:', error);
            loading = false;
            loadMockData();
        }
    }

    function loadMockData() {
        realtimeStats = {
            todayConsumption: 1256.8,
            weekConsumption: 8956.4,
            monthConsumption: 35678.2,
            currentPower: 456.3
        };
        equipmentList = [
            { id: 1, name: '空压机-01', status: 'running', type: '压缩机' },
            { id: 2, name: '冷水机-01', status: 'running', type: '制冷设备' },
            { id: 3, name: '电机组-A', status: 'standby', type: '电机' }
        ];
        loading = false;
    }

    function getChartData() {
        const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        const data = labels.map(() => Math.random() * 100 + 50);
        return { labels, data };
    }

    onMount(() => {
        loadData();
        refreshInterval = setInterval(loadData, 30000);
    });

    onDestroy(() => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
    });
</script>

<div class="dashboard">
    <div class="page-header">
        <h1>能耗实时统计</h1>
        <p class="subtitle">实时监控工业设备能耗状况</p>
    </div>

    <div class="stats-grid">
        <StatCard
            title="今日能耗"
            value={realtimeStats.todayConsumption}
            unit="kWh"
            icon="⚡"
            color="#4ecdc4"
            trend="+5.2%"
            trendUp={true}
        />
        <StatCard
            title="本周能耗"
            value={realtimeStats.weekConsumption}
            unit="kWh"
            icon="📅"
            color="#45b7d1"
            trend="-3.1%"
            trendUp={false}
        />
        <StatCard
            title="本月能耗"
            value={realtimeStats.monthConsumption}
            unit="kWh"
            icon="📆"
            color="#96ceb4"
            trend="+2.8%"
            trendUp={true}
        />
        <StatCard
            title="当前功率"
            value={realtimeStats.currentPower}
            unit="kW"
            icon="📊"
            color="#ff6b6b"
            trend="实时"
            trendUp={null}
        />
    </div>

    <div class="charts-section">
        <div class="chart-card">
            <h3>24小时能耗趋势</h3>
            <LineChart data={getChartData()} />
        </div>
    </div>

    <div class="equipment-section">
        <div class="section-header">
            <h2>设备状态概览</h2>
            <span class="count">共 {equipmentList.length} 台设备</span>
        </div>
        <div class="equipment-grid">
            {#each equipmentList as equipment}
                <div class="equipment-card">
                    <div class="equipment-icon">
                        {equipment.type === '压缩机' ? '🔧' : equipment.type === '制冷设备' ? '❄️' : '⚙️'}
                    </div>
                    <div class="equipment-info">
                        <h4>{equipment.name}</h4>
                        <p class="type">{equipment.type}</p>
                    </div>
                    <div class="equipment-status" class:running={equipment.status === 'running'}>
                        {equipment.status === 'running' ? '运行中' : '待机'}
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .dashboard {
        max-width: 1400px;
        margin: 0 auto;
    }

    .page-header {
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

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .charts-section {
        margin-bottom: 30px;
    }

    .chart-card {
        background: white;
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }

    .chart-card h3 {
        font-size: 18px;
        color: #1e3a5f;
        margin-bottom: 20px;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .section-header h2 {
        font-size: 20px;
        color: #1e3a5f;
    }

    .count {
        color: #666;
        font-size: 14px;
    }

    .equipment-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
    }

    .equipment-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .equipment-icon {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #4ecdc4, #45b7d1);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
    }

    .equipment-info {
        flex: 1;
    }

    .equipment-info h4 {
        font-size: 15px;
        color: #1e3a5f;
        margin-bottom: 4px;
    }

    .type {
        font-size: 13px;
        color: #888;
    }

    .equipment-status {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        background: #e8f5e9;
        color: #2e7d32;
    }

    .equipment-status.running {
        background: #e3f2fd;
        color: #1565c0;
    }
</style>
