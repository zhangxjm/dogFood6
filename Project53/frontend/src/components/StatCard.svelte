<script>
    export let title;
    export let value;
    export let unit;
    export let icon;
    export let color;
    export let trend;
    export let trendUp;
</script>

<div class="stat-card">
    <div class="icon-wrapper" style="background: {color}20;">
        <span class="icon">{icon}</span>
    </div>
    <div class="content">
        <h3>{title}</h3>
        <div class="value-row">
            <span class="value">{typeof value === 'number' ? value.toFixed(1) : value}</span>
            <span class="unit">{unit}</span>
        </div>
        {#if trend}
            <div class="trend" class:up={trendUp === true} class:down={trendUp === false}>
                {#if trendUp === true}
                    <span class="arrow">↑</span>
                {:else if trendUp === false}
                    <span class="arrow">↓</span>
                {/if}
                <span>{trend}</span>
            </div>
        {/if}
    </div>
    <div class="side-indicator" style="background: {color};"></div>
</div>

<style>
    .stat-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        display: flex;
        align-items: center;
        gap: 15px;
        position: relative;
        overflow: hidden;
    }

    .icon-wrapper {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .icon {
        font-size: 24px;
    }

    .content {
        flex: 1;
    }

    .content h3 {
        font-size: 13px;
        color: #888;
        font-weight: 500;
        margin-bottom: 8px;
    }

    .value-row {
        display: flex;
        align-items: baseline;
        gap: 6px;
    }

    .value {
        font-size: 24px;
        font-weight: 600;
        color: #1e3a5f;
    }

    .unit {
        font-size: 13px;
        color: #888;
    }

    .trend {
        margin-top: 6px;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .trend.up {
        color: #e53935;
    }

    .trend.down {
        color: #2e7d32;
    }

    .side-indicator {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 4px;
    }
</style>
