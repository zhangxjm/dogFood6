<script>
  import Header from './components/Header.svelte';
  import Dashboard from './pages/Dashboard.svelte';
  import ElderlyList from './pages/ElderlyList.svelte';
  import HealthMonitor from './pages/HealthMonitor.svelte';
  import Alerts from './pages/Alerts.svelte';
  import Emergency from './pages/Emergency.svelte';
  import Devices from './pages/Devices.svelte';
  import { page } from './store.js';

  function renderPage() {
    switch ($page) {
      case 'dashboard':
        return Dashboard;
      case 'elderly':
        return ElderlyList;
      case 'health':
        return HealthMonitor;
      case 'alerts':
        return Alerts;
      case 'emergency':
        return Emergency;
      case 'devices':
        return Devices;
      default:
        return Dashboard;
    }
  }
</script>

<div class="app">
  <Header />
  <main class="main-content">
    <svelte:component this={renderPage()} />
  </main>
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }
</style>
