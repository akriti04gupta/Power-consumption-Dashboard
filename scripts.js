// Function to generate simulated real-time data
function generateSimulatedData() {
    const regions = ["North", "South", "East", "West"];
    const timePeriods = ["Peak", "Off-Peak"];
    const latLngs = [
        [51.505, -0.09], // Example coordinates (latitude, longitude)
        [51.515, -0.1],
        [51.525, -0.12],
        [51.535, -0.13]
    ];
    return {
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        region: regions[Math.floor(Math.random() * regions.length)],
        timePeriod: timePeriods[Math.floor(Math.random() * timePeriods.length)],
        consumption: Math.random() * 100, // Random number between 0 and 100
        location: latLngs[Math.floor(Math.random() * latLngs.length)] // Random location
    };
}

// Function to update the dashboard with new data
function updateDashboard() {
    let totalConsumption = 0;
    let peakConsumption = 0;
    let offPeakConsumption = 0;
    let regionalConsumption = {};
    let heatMapData = [];

    // Calculate total, peak, and off-peak consumption, and regional data
    data.forEach(entry => {
        totalConsumption += entry.consumption;
        if (entry.timePeriod === 'Peak') {
            peakConsumption += entry.consumption;
        } else if (entry.timePeriod === 'Off-Peak') {
            offPeakConsumption += entry.consumption;
        }
        regionalConsumption[entry.region] = (regionalConsumption[entry.region] || 0) + entry.consumption;
        heatMapData.push([...entry.location, entry.consumption]); // Add location and consumption to heat map data
    });

    // Update total, peak, and off-peak consumption display
    document.getElementById('total-consumption').textContent = `${totalConsumption.toFixed(2)} units`;
    document.getElementById('peak-consumption').textContent = `${peakConsumption.toFixed(2)} units`;
    document.getElementById('off-peak-consumption').textContent = `${offPeakConsumption.toFixed(2)} units`;

    // Populate data table
    const tableBody = document.getElementById('data-table-body');
    tableBody.innerHTML = ''; // Clear previous data
    data.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="data-checkbox" data-index="${index}"></td>
            <td>${entry.date}</td>
            <td>${entry.region}</td>
            <td>${entry.timePeriod}</td>
            <td>${entry.consumption.toFixed(2)} units</td>
        `;
        tableBody.appendChild(row);
    });

    // Update charts
    const ctx1 = document.getElementById('consumption-chart').getContext('2d');
    new Chart(ctx1, {
        type: 'line',
        data: {
            labels: data.map(entry => entry.date),
            datasets: [{
                label: 'Daily Consumption',
                data: data.map(entry => entry.consumption),
                borderColor: '#4caf50', // Coral color for border
                backgroundColor: 'rgba(76, 175, 80, 0.2)', // Light coral color for background
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: '#e0e0e0' // Coral color for grid lines
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e0e0e0' // Coral color for grid lines
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Date: ${context.label}, Consumption: ${context.raw.toFixed(2)} units`;
                        }
                    }
                },
                legend: {
                    labels: {
                        color: '#333'
                    }
                }
            }
        }
    });

    const ctx2 = document.getElementById('region-comparison-chart').getContext('2d');
    new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: Object.keys(regionalConsumption),
            datasets: [{
                label: 'Regional Consumption',
                data: Object.values(regionalConsumption),
                backgroundColor: [
                    '#ff6f61', // Coral
                    '#ffbb33', // Yellow
                    '#009688', // Teal
                    '#3f51b5'  // Indigo
                ],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: '#e0e0e0' // Coral color for grid lines
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e0e0e0' // Coral color for grid lines
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Region: ${context.label}, Consumption: ${context.raw.toFixed(2)} units`;
                        }
                    }
                },
                legend: {
                    labels: {
                        color: '#333'
                    }
                }
            }
        }
    });

    // Initialize and update the heat map
    const map = L.map('map').setView([51.505, -0.09], 13); // Center the map at an initial position

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.heatLayer(heatMapData, {
        radius: 25,
        blur: 15,
        gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'} // Color gradient
    }).addTo(map);
}

// Function to add data manually
function addManualData() {
    const dateInput = document.getElementById('date-picker').value;
    const regionInput = document.getElementById('region').value;
    const timePeriodInput = document.getElementById('time-period').value;
    const consumption = parseFloat(prompt('Enter consumption value:'));
    
    if (dateInput && regionInput && timePeriodInput && !isNaN(consumption)) {
        const location = [51.505 + Math.random() * 0.1, -0.09 + Math.random() * 0.1]; // Random location
        data.push({ date: dateInput, region: regionInput, timePeriod: timePeriodInput, consumption, location });
        updateDashboard();
    } else {
        alert('Invalid input. Please try again.');
    }
}

// Function to remove selected data
function removeSelectedData() {
    const selectedCheckboxes = document.querySelectorAll('.data-checkbox:checked');
    const indicesToRemove = Array.from(selectedCheckboxes).map(cb => parseInt(cb.getAttribute('data-index')));

    data = data.filter((_, index) => !indicesToRemove.includes(index));
    updateDashboard();
}

// Function to download data as CSV
function downloadData() {
    let csvContent = 'Date,Region,Time Period,Consumption,Latitude,Longitude\n';
    data.forEach(entry => {
        csvContent += `${entry.date},${entry.region},${entry.timePeriod},${entry.consumption.toFixed(2)},${entry.location[0]},${entry.location[1]}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'consumption_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Initialize data with some initial entries (simulated data for demonstration)
let data = [];
for (let i = 0; i < 5; i++) {
    data.push(generateSimulatedData());
}

// Initial dashboard update
updateDashboard();

// Event listeners for new features
document.getElementById('add-data').addEventListener('click', addManualData);
document.getElementById('remove-data').addEventListener('click', removeSelectedData);
document.getElementById('download-data').addEventListener('click', downloadData);
