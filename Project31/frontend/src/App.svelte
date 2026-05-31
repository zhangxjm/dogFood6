<script>
  import { onMount, onDestroy } from 'svelte'
  import Header from './components/Header.svelte'
  import Sidebar from './components/Sidebar.svelte'
  import Dashboard from './components/Dashboard.svelte'
  import DeviceList from './components/DeviceList.svelte'
  import DeviceDetail from './components/DeviceDetail.svelte'
  import ThreeScene from './components/ThreeScene.svelte'
  import CommandPanel from './components/CommandPanel.svelte'
  import AlarmList from './components/AlarmList.svelte'
  import { deviceStore } from './stores/deviceStore'

  let currentView = 'dashboard'
  let selectedDevice = null
  let show3D = true

  const handleViewChange = (view) => {
    console.log('切换视图:', view)
    currentView = view
    selectedDevice = null
  }

  const handleSelectDevice = (device) => {
    console.log('选择设备:', device)
    selectedDevice = device
    currentView = 'detail'
  }

  const handleBack = () => {
    currentView = 'dashboard'
    selectedDevice = null
  }
</script>

<svelte:window on:keydown={(e) => {
  if (e.key === 'Escape') handleBack()
}} />

<div class="app-container">
  <Header />
  <div class="main-content">
    <Sidebar currentView={currentView} onViewChange={handleViewChange} />
    <div class="content-area">
      {#if currentView === 'dashboard'}
        <Dashboard onSelectDevice={handleSelectDevice} show3D={show3D} />
      {:else if currentView === 'devices'}
        <DeviceList onSelectDevice={handleSelectDevice} />
      {:else if currentView === 'detail' && selectedDevice}
        <DeviceDetail device={selectedDevice} onBack={handleBack} />
      {:else if currentView === 'commands'}
        <CommandPanel />
      {:else if currentView === 'alarms'}
        <AlarmList />
      {:else}
        <Dashboard onSelectDevice={handleSelectDevice} show3D={show3D} />
      {/if}
    </div>
    {#if show3D && currentView === 'dashboard'}
      <ThreeScene />
    {/if}
  </div>
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .content-area {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
</style>
