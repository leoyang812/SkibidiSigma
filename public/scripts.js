document.getElementById('add-waypoint').addEventListener('click', function() {
    const waypointsContainer = document.getElementById('waypoints-container');
    const waypointIndex = waypointsContainer.children.length / 2;
    const waypointDiv = document.createElement('div');
    waypointDiv.classList.add('form-group');
    waypointDiv.innerHTML = `
        <label for="waypoint-address-${waypointIndex}">Waypoint Address:</label>
        <input type="text" id="waypoint-address-${waypointIndex}" name="waypoint-address-${waypointIndex}" required>
        <label for="waypoint-city-${waypointIndex}">City:</label>
        <input type="text" id="waypoint-city-${waypointIndex}" name="waypoint-city-${waypointIndex}" required>
        <button type="button" class="remove-waypoint">Remove</button>
    `;
    waypointsContainer.appendChild(waypointDiv);

    waypointDiv.querySelector('.remove-waypoint').addEventListener('click', function() {
        waypointsContainer.removeChild(waypointDiv);
    });
});

document.getElementById('optimization-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const truckCapacityRange = document.getElementById('truck-capacity-range').value;
    const [minCapacity, maxCapacity] = truckCapacityRange.split('-').map(Number);
    const numTrucks = document.getElementById('num-trucks').value;

    const addresses = [];
    addresses.push({
        address: document.getElementById('start-address').value,
        city: document.getElementById('start-city').value
    });

    document.querySelectorAll('#waypoints-container .form-group').forEach((group, index) => {
        addresses.push({
            address: group.querySelector(`#waypoint-address-${index}`).value,
            city: group.querySelector(`#waypoint-city-${index}`).value
        });
    });

    addresses.push({
        address: document.getElementById('goal-address').value,
        city: document.getElementById('goal-city').value
    });

    const cargoByStop = {}; // You can populate this similarly by adding cargo fields in the form

    const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            addresses,
            cargoByStop,
            numTrucks,
            truckCapacityRange: { minCapacity, maxCapacity }
        }),
    });

    const result = await response.json();
    // Handle result...
});
