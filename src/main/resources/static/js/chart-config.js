// Chart.js Configuration for Credit Score Dashboard

function initializeCharts(chartData) {
    // Breakdown Doughnut Chart
    const breakdownCtx = document.getElementById('breakdownChart');
    if (breakdownCtx) {
        new Chart(breakdownCtx, {
            type: 'doughnut',
            data: {
                labels: chartData.labels,
                datasets: [{
                    data: chartData.values,
                    backgroundColor: chartData.colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12,
                                family: "'Segoe UI', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // Breakdown Bar Chart (Alternative visualization)
    const barCtx = document.getElementById('breakdownBarChart');
    if (barCtx) {
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Score',
                    data: chartData.values,
                    backgroundColor: chartData.colors,
                    borderWidth: 0,
                    borderRadius: 6
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
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
}

// Load dashboard data and initialize charts
async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard/chart-data');
        const result = await response.json();

        if (result.success) {
            initializeCharts(result.chartData);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Call this when dashboard page loads
if (document.getElementById('dashboardPage')) {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.querySelector('.page-container.active')?.id === 'dashboardPage') {
            loadDashboardData();
        }
    });
}