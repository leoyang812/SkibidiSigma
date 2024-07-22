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
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("optimization-form");
    const waypointsContainer = document.getElementById("waypoints");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        // Gather form data
        const startAddress = document.getElementById("start-address").value;
        const startCity = document.getElementById("start-city").value;
        const endAddress = document.getElementById("end-address").value;
        const endCity = document.getElementById("end-city").value;
        const cargo = document.getElementById("cargo").value;
        const truck = document.getElementById("truck").value;
        
        const waypoints = [];
        const waypointAddresses = document.querySelectorAll(".waypoint-address");
        const waypointCities = document.querySelectorAll(".waypoint-city");
        
        for (let i = 0; i < waypointAddresses.length; i++) {
            waypoints.push({
                address: waypointAddresses[i].value,
                city: waypointCities[i].value
            });
        }
        
        // Call your backend API with the data here
        console.log({ startAddress, startCity, endAddress, endCity, waypoints, cargo, truck });
    });

    window.addWaypoint = () => {
        const waypoint = document.createElement("div");
        waypoint.classList.add("form-group");
        waypoint.innerHTML = `
            <label for="waypoint-address">Waypoint Address:</label>
            <input type="text" class="waypoint-address" name="waypoint-address">
            <label for="waypoint-city">Waypoint City:</label>
            <input type="text" class="waypoint-city" name="waypoint-city">
            <button type="button" class="remove-waypoint" onclick="removeWaypoint(this)">Remove</button>
        `;
        waypointsContainer.appendChild(waypoint);
    };

    window.removeWaypoint = (button) => {
        button.parentElement.remove();
    };
});
function initAutocomplete() {
    const startInput = document.getElementById('startLocation');
    const endInput = document.getElementById('endLocation');
    const waypointInput = document.getElementById('waypoints');

    const options = {
        types: ['(cities)'], // Restrict results to cities
        componentRestrictions: { country: 'ca' } // Restrict to Canada
    };

    const startAutocomplete = new google.maps.places.Autocomplete(startInput, options);
    const endAutocomplete = new google.maps.places.Autocomplete(endInput, options);
    const waypointAutocomplete = new google.maps.places.Autocomplete(waypointInput, options);

    // Initialize the map
    const mapOptions = {
        center: { lat: 45.4215, lng: -75.6972 }, // Default center is Ottawa
        zoom: 7,
        mapTypeId: 'roadmap'
    };

    const map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Handle form submission
    document.getElementById('routeForm').addEventListener('submit', function(event) {
        event.preventDefault();
        // Handle route optimization logic here
        // For now, just log the inputs
        console.log('Start Location:', startInput.value);
        console.log('End Location:', endInput.value);
        console.log('Waypoints:', waypointInput.value);
        console.log('Total Freight:', document.getElementById('totalFreight').value);
        console.log('Number of Trucks:', document.getElementById('numTrucks').value);
        console.log('Truck Capacity:', document.getElementById('truckCapacity').value);
    });

    // Handle adding waypoints
    document.getElementById('addWaypoint').addEventListener('click', function() {
        const waypoint = waypointInput.value;
        if (waypoint) {
            console.log('Waypoint added:', waypoint);
            // Add waypoint to your list of waypoints
            waypointInput.value = '';
        } else {
            alert('Please enter a waypoint.');
        }
    });
}

// Initialize the autocomplete functionality when the window loads
window.onload = initAutocomplete;

