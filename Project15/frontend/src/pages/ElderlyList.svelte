<script>
  import { onMount } from 'svelte';
  import { elderlyList, selectedElderly } from '../store.js';

  let loading = true;
  let showModal = false;
  let editingElderly = null;
  let formData = {
    name: '',
    gender: '',
    age: '',
    phone: '',
    address: '',
    idCard: '',
    medicalHistory: '',
    emergencyContact: '',
    emergencyPhone: ''
  };

  async function fetchElderly() {
    loading = true;
    try {
      const res = await fetch('/api/elderly');
      const json = await res.json();
      elderlyList.set(json.data || []);
    } catch (error) {
      console.error('Failed to fetch elderly:', error);
    } finally {
      loading = false;
    }
  }

  function handleAdd() {
    editingElderly = null;
    formData = {
      name: '',
      gender: '',
      age: '',
      phone: '',
      address: '',
      idCard: '',
      medicalHistory: '',
      emergencyContact: '',
      emergencyPhone: ''
    };
    showModal = true;
  }

  function handleEdit(elderly) {
    editingElderly = elderly;
    formData = { ...elderly };
    showModal = true;
  }

  function handleView(elderly) {
    selectedElderly.set(elderly);
  }

  async function handleDelete(id) {
    if (!confirm('确定要删除该老人信息吗？')) return;
    try {
      await fetch(`/api/elderly/${id}`, { method: 'DELETE' });
      fetchElderly();
    } catch (error) {
      console.error('Failed to delete elderly:', error);
    }
  }

  async function handleSubmit() {
    try {
      const url = editingElderly ? `/api/elderly/${editingElderly.id}` : '/api/elderly';
      const method = editingElderly ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      showModal = false;
      fetchElderly();
    } catch (error) {
      console.error('Failed to save elderly:', error);
    }
  }

  onMount(fetchElderly);
</script>

<div class="elderly-list">
  <div class="page-header">
    <h2>老人管理</h2>
    <button class="btn btn-primary" on:click={handleAdd}>
      <span>+ 添加老人</span>
    </button>
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>
  {:else if $elderlyList.length > 0}
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>性别</th>
            <th>年龄</th>
            <th>联系电话</th>
            <th>地址</th>
            <th>紧急联系人</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {#each $elderlyList as elderly (elderly.id)}
            <tr>
              <td class="name-cell">
                <div class="elderly-avatar">👴</div>
                <span>{elderly.name}</span>
              </td>
              <td>{elderly.gender || '-'}</td>
              <td>{elderly.age || '-'}</td>
              <td>{elderly.phone || '-'}</td>
              <td class="address-cell">{elderly.address || '-'}</td>
              <td>{elderly.emergencyContact || '-'}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm" on:click={() => handleView(elderly)}>查看</button>
                  <button class="btn btn-sm" on:click={() => handleEdit(elderly)}>编辑</button>
                  <button class="btn btn-sm btn-danger" on:click={() => handleDelete(elderly.id)}>删除</button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="empty-state">
      <div class="empty-icon">👴</div>
      <p>暂无老人信息</p>
    </div>
  {/if}
</div>

{#if showModal}
  <div class="modal-overlay" on:click={() => showModal = false}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>{editingElderly ? '编辑老人信息' : '添加老人'}</h2>
        <button class="modal-close" on:click={() => showModal = false}>×</button>
      </div>
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label>姓名 *</label>
          <input type="text" bind:value={formData.name} required placeholder="请输入姓名">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>性别</label>
            <select bind:value={formData.gender}>
              <option value="">请选择</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div class="form-group">
            <label>年龄</label>
            <input type="number" bind:value={formData.age} placeholder="请输入年龄">
          </div>
        </div>
        <div class="form-group">
          <label>联系电话</label>
          <input type="text" bind:value={formData.phone} placeholder="请输入联系电话">
        </div>
        <div class="form-group">
          <label>身份证号</label>
          <input type="text" bind:value={formData.idCard} placeholder="请输入身份证号">
        </div>
        <div class="form-group">
          <label>居住地址</label>
          <input type="text" bind:value={formData.address} placeholder="请输入居住地址">
        </div>
        <div class="form-group">
          <label>病史记录</label>
          <textarea bind:value={formData.medicalHistory} rows="2" placeholder="请输入病史记录"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>紧急联系人</label>
            <input type="text" bind:value={formData.emergencyContact} placeholder="请输入紧急联系人">
          </div>
          <div class="form-group">
            <label>紧急联系电话</label>
            <input type="text" bind:value={formData.emergencyPhone} placeholder="请输入紧急联系电话">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn" on:click={() => showModal = false}>取消</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .elderly-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .page-header h2 {
    font-size: 20px;
    color: #262626;
    margin: 0;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
  }

  .data-table th,
  .data-table td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
  }

  .data-table th {
    background: #fafafa;
    font-weight: 600;
    color: #595959;
    font-size: 14px;
  }

  .data-table tbody tr:hover {
    background: #f5f5f5;
  }

  .name-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .elderly-avatar {
    width: 32px;
    height: 32px;
    background: #e6f7ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }

  .address-cell {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }

  .btn-sm {
    padding: 4px 12px;
    font-size: 12px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>
