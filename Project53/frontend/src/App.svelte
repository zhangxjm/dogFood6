<script>
    import { Router, Route } from 'svelte-routing';
    import Layout from './components/Layout.svelte';
    import Dashboard from './pages/Dashboard.svelte';
    import Equipment from './pages/Equipment.svelte';
    import EnergyData from './pages/EnergyData.svelte';
    import SavingPlans from './pages/SavingPlans.svelte';
    import LossAnalysis from './pages/LossAnalysis.svelte';
</script>

<Router>
    <Layout>
        <Route path="/" component={Dashboard} />
        <Route path="/equipment" component={Equipment} />
        <Route path="/energy-data" component={EnergyData} />
        <Route path="/saving-plans" component={SavingPlans} />
        <Route path="/loss-analysis" component={LossAnalysis} />
    </Layout>
</Router>
