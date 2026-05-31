<script>
    import { onMount } from 'svelte';
    import { energyDataApi, equipmentApi } from '../api.js';
    import LineChart from '../components/LineChart.svelte';

    let energyDataList = [];
    let equipmentList = [];
    let selectedEquipment = '';
    let loading = true;

    async function loadData() {
        try {
            const [dataRes, equipRes] = await Promise.all([
                energyDataApi.getAll(),
                equipmentApi.getAll()
            ]);
            energyDataList = dataRes.data.slice(0, 100);
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
        energyDataList = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            equipmentId: Math.random() > 0.5 ? 1 : 2,
            equipmentCode: Math.random() > 0.5 ? 'EQ-001' : 'EQ-002',
            voltage: 380 + Math.random() * 20,
            current: 50 + Math.random() * 100,
            power: 50 + Math.random() * 100,
            powerFactor: 0.8 + Math.random() * 0.15,
            energyConsumption: 5 + Math.random() * 10,
            temperature: 50 + Math.random() * 30,
            collectTime: new Date(Date.now() - i * 3600000).toISOString()
        }));
    }

    function getChartData() {
        const filtered = selectedEquipment 
            ? energyDataList.filter(d => d.equipmentCode === selectedEquipment)
            : energyDataList;
        const labels = filtered.slice(0, 12).map(d => new Date(d.collectTime).getHours() + ':00').reverse();
        const data = filtered.slice(0, 12).map(d => d.energyConsumption).reverse();
        return { labels, data };
    }

    function getEquipmentName(code) {
        const eq = equipmentList.find(e => e.code === code);
        return eq ? eq.name : code;
    }

    $: filteredData = selectedEquipment 
        ? energyDataList.filter(d => d.equipmentCode === selectedEquipment)
        : energyDataList;

    onMount(loadData);
</script>

<div class="energy-data-page">
    <div class="page-header">
        <div>
            <h1>能耗数据</h1>
            <p class="subtitle">查看和分析设备能耗采集数据</p>
        </div>
        <div class="filter">
            <select bind:value={selectedEquipment}>
                <option value="">全部设备</option>
                {#each equipmentList as eq}
                    <option value={eq.code}>{eq.name}</option>
                {/each}
            </select>
        </div>
    </div>

    <div class="chart-card">
        <h3>能耗趋势</h3>
        <LineChart data={getChartData()} />
    </div>

    <div class="table-card">
        <table class="data-table">
            <thead>
                <tr>
                    <th>设备</th>
                    <th>电压(V)</th>
                    <th>电流(A)</th>
                    <th>功率(kW)</th>
                    <th>功率因数</th>
                    <th>能耗(kWh)</th>
                    <th>温度(°C)</th>
                    <th>采集时间</th>
                </tr>
            </thead>
            <tbody>
                {#each filteredData.slice(0, 20) as data}
                    <tr>
                        <td><strong>{getEquipmentName(data.equipmentCode)}</strong></td>
                        <td>{data.voltage?.toFixed(1)}</td>
                        <td>{data.current?.toFixed(1)}</td>
                        <td>{data.power?.toFixed(1)}</td>
                        <td><span class="pf {data.powerFactor < 0.85 ? 'warning' : ''}">{data.powerFactor?.toFixed(2)}</span></td>
                        <td>{data.energyConsumption?.toFixed(2)}</td>
                        <td><span class="temp {data.temperature > 70 ? 'danger' : data.temperature > 60 ? 'warning' : ''}">{data.temperature?.toFixed(1)}</span></td>
                        <td>{new Date(data.collectTime).toLocaleString('zh-CN')}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .energy-data-page {
        max-width: 1200px;
        margin: 0 auto;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
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

    .filter select {
        padding: 8px 16px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        background: white;
    }

    .chart-card {
        background: white;
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        margin-bottom: 25px;
    }

    .chart-card h3 {
        font-size: 18px;
        color: #1e3a5f;
        margin-bottom: 20px;
    }

    .table-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
    }

    .data-table th {
        background: #f8f9fa;
        padding: 15px;
        text-align: left;
        font-size: 13px;
        font-weight: 600;
        color: #1e3a5f;
        border-bottom: 2px solid #e9ecef;
    }

    .data-table td {
        padding: 12px 15px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 14px;
        color: #333;
    }

    .data-table tbody tr:hover {
        background: #f8f9fa;
    }

    .pf.warning {
        color: #f57c00;
        font-weight: 600;
    }

    .temp.danger {
        color: #c62828;
        font-weight: 600;
    }

    .temp.warning {
        color: #f57c00;
        font-weight: 600;
    }
</style>
