
// Hormone chart
const ctx = document.getElementById('hormoneChart').getContext('2d');
const hormoneChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['14/06', '16/06', '18/06', '20/06', '22/06', '24/06'],
        datasets: [{
            label: 'E2 (pg/ml)',
            data: [180, 210, 235, 260, 248, 245],
            borderColor: 'rgb(74, 144, 226)',
            backgroundColor: 'rgba(74, 144, 226, 0.1)',
            tension: 0.1
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
                beginAtZero: false,
                min: 150,
                max: 300
            }
        }
    }
});

// Filter functionality
document.querySelectorAll('.filter-select').forEach(select => {
    select.addEventListener('change', function() {
        console.log('Filter changed:', this.value);
        // Add filter logic here
    });
});

// Download button
document.querySelector('.download-btn').addEventListener('click', function() {
    alert('Đang tải báo cáo...');
});

// Test item clicks
document.querySelectorAll('.test-item').forEach(item => {
    item.addEventListener('click', function() {
        const testName = this.querySelector('h4').textContent;
        alert(`Xem chi tiết: ${testName}`);
    });
});
