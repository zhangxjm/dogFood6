<script>
    import { onMount } from 'svelte';
    import { equipmentApi } from '../api.js';

    let equipmentList = [];
    let loading = true;
    let showModal = false;
    let newEquipment = {
        code: '',
        name: '',
        type: '',
        location: '',
        ratedPower: '',
        status: 'running'
    };

    async function loadData() {
        try {
            const res = await equipmentApi.getAll();
            equipmentList = res.data;
            loading = false;
        } catch (error) {
            console.error('加载设备失败:', error);
            loading = false;
            loadMockData();
        }
    }

    function loadMockData() {
        equipmentList = [
            { id: 1, code: 'EQ-001', name: '空压机-01', type: '压缩机', location: 'A车间-1号', ratedPower: 110, status: 'running', createTime: '2024-01-15' },
            { id: 2, code: 'EQ-002', name: '冷水机-01', type: '制冷设备', location: 'A车间-2号', ratedPower: 150, status: 'running', createTime: '2024-01-16' },
            { id: 3, code: 'EQ-003', name: '电机组-A', type: '电机', location: 'B车间-1号', ratedPower: 75, status: 'standby', createTime: '2024-01-20' },
            { id: 4, code: 'EQ-004', name: '风机组-01', type: '通风设备', location: 'B车间-2号', ratedPower: 45, status: 'running', createTime: '2024-02-01' },
            { id: 5, code: 'EQ-005', name: '锅炉-01', type: '加热设备', location: 'C车间-1号', ratedPower: 200, status: 'maintenance', createTime: '2024-02-10' }
        ];
    }

    async function addEquipment() {
        try {
            await equipmentApi.create(newEquipment);
            await loadData();
            closeModal();
        } catch (error) {
            console.error('添加设备失败:', error);
            equipmentList = [...equipmentList, { ...newEquipment, id: Date.now(), createTime: new Date().toISOString() }];
            closeModal();
        }
    }

    function closeModal() {
        showModal = false;
        newEquipment = { code: '', name: '', type: '', location: '', ratedPower: '', status: 'running' };
    }

    function getStatusText(status) {
        const map = { running: '运行中', standby: '待机', maintenance: '维护中', offline: '离线' };
        return map[status] || status;
    }

    function getStatusClass(status) {
        const map = { running: 'status-running', standby: 'status-standby', maintenance: 'status-maintenance', offline: 'status-offline' };
        return map[status] || '';
    }

    onMount(loadData);
</script>

<div class="equipment-page">
    <div class="page-header">
        <div>
            <h1>设备管理</h1>
            <p class="subtitle">管理工业设备信息与运行状态</p>
        </div>
        <button class="btn-primary" on:click={() => showModal = true}>
            + 添加设备
        </button>
    </div>

    <div class="stats-row">
        <div class="mini-stat">
            <span class="num">{equipmentList.length}</span>
            <span class="label">设备总数</span>
        </div>
        <div class="mini-stat">
            <span class="num running">{equipmentList.filter(e => e.status === 'running').length}</span>
            <span class="label">运行中</span>
        </div>
        <div class="mini-stat">
            <span class="num standby">{equipmentList.filter(e => e.status === 'standby').length}</span>
            <span class="label">待机</span>
        </div>
        <div class="mini-stat">
            <span class="num maintenance">{equipmentList.filter(e => e.status === 'maintenance').length}</span>
            <span class="label">维护中</span>
        </div>
    </div>

    <div class="table-card">
        <table class="data-table">
            <thead>
                <tr>
                    <th>设备编号</th>
                    <th>设备名称</th>
                    <th>设备类型</th>
                    <th>安装位置</th>
                    <th>额定功率(kW)</th>
                    <th>状态</th>
                    <th>创建时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                {#each equipmentList as equipment}
                    <tr>
                        <td><strong>{equipment.code}</strong></td>
                        <td>{equipment.name}</td>
                        <td>{equipment.type}</td>
                        <td>{equipment.location}</td>
                        <td>{equipment.ratedPower}</td>
                        <td><span class="status {getStatusClass(equipment.status)}">{getStatusText(equipment.status)}</span></td>
                        <td>{equipment.createTime?.split('T')[0] || '-'}</td>
                        <td>
                            <button class="btn-link">编辑</button>
                            <button class="btn-link danger">删除</button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    {#if showModal}
        <div class="modal-overlay" on:click={() => showModal = false}>
            <div class="modal" on:click|stopPropagation>
                <h3>添加新设备</h3>
                <div class="form-group">
                    <label>设备编号</label>
                    <input type="text" bind:value={newEquipment.code} placeholder="如: EQ-006">
                </div>
                <div class="form-group">
                    <label>设备名称</label>
                    <input type="text" bind:value={newEquipment.name} placeholder="如: 空压机-02">
                </div>
                <div class="form-group">
                    <label>设备类型</label>
                    <select bind:value={newEquipment.type}>
                        <option value="">请选择类型</option>
                        <option value="压缩机">压缩机</option>
                        <option value="制冷设备">制冷设备</option>
                        <option value="电机">电机</option>
                        <option value="通风设备">通风设备</option>
                        <option value="加热设备">加热设备</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>安装位置</label>
                    <input type="text" bind:value={newEquipment.location} placeholder="如: A车间-3号">
                </div>
                <div class="form-group">
                    <label>额定功率(kW)</label>
                    <input type="number" bind:value={newEquipment.ratedPower} placeholder="如: 100">
                </div>
                <div class="form-actions">
                    <button class="btn-secondary" on:click={closeModal}>取消</button>
                    <button class="btn-primary" on:click={addEquipment}>确认添加</button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .equipment-page {
        max-width: 1200px;
        margin: 0 auto;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
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

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(78, 205, 196, 0.4);
    }

    .stats-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        margin-bottom: 25px;
    }

    .mini-stat {
        background: white;
        padding: 15px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .mini-stat .num {
        font-size: 28px;
        font-weight: 600;
        color: #1e3a5f;
        display: block;
    }

    .mini-stat .num.running { color: #1565c0; }
    .mini-stat .num.standby { color: #f57c00; }
    .mini-stat .num.maintenance { color: #c62828; }

    .mini-stat .label {
        font-size: 12px;
        color: #888;
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
        padding: 15px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 14px;
        color: #333;
    }

    .data-table tbody tr:hover {
        background: #f8f9fa;
    }

    .status {
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
    }

    .status-running { background: #e3f2fd; color: #1565c0; }
    .status-standby { background: #fff3e0; color: #f57c00; }
    .status-maintenance { background: #ffebee; color: #c62828; }
    .status-offline { background: #f5f5f5; color: #757575; }

    .btn-link {
        background: none;
        border: none;
        color: #45b7d1;
        cursor: pointer;
        font-size: 13px;
        padding: 4px 8px;
    }

    .btn-link.danger {
        color: #e53935;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal {
        background: white;
        padding: 30px;
        border-radius: 12px;
        width: 450px;
        max-width: 90%;
    }

    .modal h3 {
        margin-bottom: 20px;
        color: #1e3a5f;
    }

    .form-group {
        margin-bottom: 15px;
    }

    .form-group label {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
        color: #555;
    }

    .form-group input,
    .form-group select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        box-sizing: border-box;
    }

    .form-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 25px;
    }

    .btn-secondary {
        background: #f0f0f0;
        color: #333;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
    }
</style>
