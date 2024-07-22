document.getElementById('optimization-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const startAddress = document.getElementById('start-address').value;
    const goalAddress = document.getElementById('goal-address').value;
    const cargoCapacity = document.getElementById('cargo-capacity').value;
    const numTrucks = document.getElementById('num-trucks').value;
    
    // Make an API call to your backend server
    const response = await fetch('http://localhost:3000/optimize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            startAddress,
            goalAddress,
            cargoCapacity,
            numTrucks,
            cargoByStop: {} // Add actual cargo by stop data if needed
        }),
    });
    
    const result = await response.json();
    if (result.error) {
        document.getElementById('results').innerText = result.error;
    } else {
        document.getElementById('results').innerText = `Optimized Path: ${result.path.join(' -> ')}\nTotal Distance: ${result.distance} km`;
    }
});
