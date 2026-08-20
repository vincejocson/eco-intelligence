// DOM Elements
const initialSlider = document.getElementById('initial-slider');
const initialVal = document.getElementById('initial-val');
const monthlySlider = document.getElementById('monthly-slider');
const yearsSlider = document.getElementById('years-slider');
const monthlyVal = document.getElementById('monthly-val');
const yearsVal = document.getElementById('years-val');
const projectedValue = document.getElementById('projected-value');
const displayYear = document.getElementById('display-year');
const ctx = document.getElementById('growthChart').getContext('2d');
const totalReturnsEl = document.getElementById('total-returns');

// Rates
const ecoFundRate = 0.12;
const savingsRate = 0.01;

let growthChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Eco-Intelligence (12%)',
                borderColor: '#005af0',
                backgroundColor: 'rgba(0, 90, 240, 0.1)',
                borderWidth: 2,
                fill: true,
                data: []
            },
            {
                label: 'Bank Savings (1%)',
                borderColor: '#6c757d',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                data: []
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { 
                position: 'bottom', 
                labels: { boxWidth: 12 } 
            },

            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += '₱' + context.parsed.y.toLocaleString('en-US', { 
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2 
                            });
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: { 
                beginAtZero: true, 
                ticks: { callback: (value) => '₱' + (value/1000) + 'k' } 
            }
        }
    }
});

// Financial Math Formula
function calculateCompound(initial, monthly, years, annualRate) {
    const months = years * 12;
    const monthlyRate = annualRate / 12;
   
    // Future and Initial Value of an Annuity formula
    const fvInitial = initial * Math.pow(1 + monthlyRate, months);
    const fvMonthly = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return fvInitial + fvMonthly;
}

// Update UI & Chart
function updateSimulator() {
    const initial = parseInt(initialSlider.value);
    const monthly = parseInt(monthlySlider.value);
    const years = parseInt(yearsSlider.value);

    // Update Text Labels
    initialVal.innerText = initial.toLocaleString();
    monthlyVal.innerText = monthly.toLocaleString();
    yearsVal.innerText = years;
    displayYear.innerText = years;

    // Generate Data Points for Chart
    const labels = [];
    const ecoData = [];
    const savingsData = [];

    for (let i = 0; i <= years; i++) {
        labels.push('Yr ' + i);
        if (i === 0) {
            ecoData.push(initial);
            savingsData.push(initial);
        } else {
            ecoData.push(calculateCompound(initial,monthly, i, ecoFundRate));
            savingsData.push(calculateCompound(initial, monthly, i, savingsRate));
        }
    }

    // Update Big Number display (Final Year Eco Fund Value)
    const finalEcoValue = ecoData[ecoData.length - 1];
    projectedValue.innerText = '₱' + finalEcoValue.toLocaleString(undefined, { maximumFractionDigits: 0 });

    const totalPrincipal = initial + (monthly * 12 * years);
    const totalEarnings = finalEcoValue - totalPrincipal;
    
    const displayEarnings = Math.max(0, totalEarnings);
    totalReturnsEl.innerText = '₱' + displayEarnings.toLocaleString('en-US', { maximumFractionDigits: 0 });

    // Inject into Chart
    growthChart.data.labels = labels;
    growthChart.data.datasets[0].data = ecoData;
    growthChart.data.datasets[1].data = savingsData;
    growthChart.update();
}

// Event Listeners for real-time sliding
initialSlider.addEventListener('input', updateSimulator);
monthlySlider.addEventListener('input', updateSimulator);
yearsSlider.addEventListener('input', updateSimulator);


// Initial Load
updateSimulator();