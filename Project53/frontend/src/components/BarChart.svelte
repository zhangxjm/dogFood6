<script>
    import { onMount, onDestroy } from 'svelte';
    import { Chart, registerables } from 'chart.js';

    export let data;

    let chart;
    let canvas;

    Chart.register(...registerables);

    const colors = ['#4ecdc4', '#45b7d1', '#96ceb4', '#ff6b6b', '#feca57', '#a29bfe'];

    function createChart() {
        if (chart) {
            chart.destroy();
        }

        const ctx = canvas.getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data?.labels || [],
                datasets: [{
                    label: '损耗电量 (kWh)',
                    data: data?.data || [],
                    backgroundColor: (context) => colors[context.dataIndex % colors.length],
                    borderRadius: 6,
                    barThickness: 40
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#666',
                            font: { size: 11 }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#666',
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }

    onMount(() => {
        createChart();
    });

    $: if (data && chart) {
        createChart();
    }

    onDestroy(() => {
        if (chart) {
            chart.destroy();
        }
    });
</script>

<div class="chart-container">
    <canvas bind:this={canvas}></canvas>
</div>

<style>
    .chart-container {
        height: 300px;
        width: 100%;
    }
</style>
