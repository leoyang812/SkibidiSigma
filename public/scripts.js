document.addEventListener("DOMContentLoaded", () => {
    // Initialize autocomplete for address inputs
    function initializeAutocomplete(inputElement) {
        new google.maps.places.Autocomplete(inputElement, {
            types: ['address'],
            componentRestrictions: { country: 'ca' }
        });
    }

    // Initialize autocomplete for address inputs on page load
    const startLocationInput = document.getElementById('startLocation');
    const endLocationInput = document.getElementById('endLocation');

    if (startLocationInput) initializeAutocomplete(startLocationInput);
    if (endLocationInput) initializeAutocomplete(endLocationInput);

    // Initialize autocomplete for waypoints
    function initializeWaypointAutocomplete(waypointElement) {
        new google.maps.places.Autocomplete(waypointElement, {
            types: ['address'],
            componentRestrictions: { country: 'ca' }
        });
    }

    // Add a waypoint input field
    function addWaypoint() {
        const waypointsContainer = document.getElementById('waypointsContainer');
        const waypointInput = document.createElement('input');
        waypointInput.classList.add('waypoint');
        waypointInput.type = 'text';
        waypointInput.placeholder = 'Add waypoint address';
        initializeWaypointAutocomplete(waypointInput);

        // Create a container for the new waypoint input and its remove button
        const waypointDiv = document.createElement('div');
        waypointDiv.classList.add('form-group');
        waypointDiv.appendChild(waypointInput);

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.classList.add('remove-waypoint');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            waypointsContainer.removeChild(waypointDiv);
        });
        waypointDiv.appendChild(removeButton);

        waypointsContainer.appendChild(waypointDiv);
    }

    // Event listener for adding waypoints
    const addWaypointButton = document.getElementById('addWaypoint');
    if (addWaypointButton) {
        addWaypointButton.addEventListener('click', addWaypoint);
    }

    // Handle form submission
    const routeForm = document.getElementById('routeForm');
    if (routeForm) {
        routeForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const addresses = [];
            addresses.push({ address: startLocationInput.value });

            document.querySelectorAll('#waypointsContainer .waypoint').forEach(waypointInput => {
                addresses.push({ address: waypointInput.value });
            });

            addresses.push({ address: endLocationInput.value });

            const totalFreight = document.getElementById('totalFreight').value;
            const numTrucks = document.getElementById('numTrucks').value;
            const truckCapacity = document.getElementById('truckCapacity').value;

            const response = await fetch('/api/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    addresses,
                    totalFreight,
                    numTrucks,
                    truckCapacity
                }),
            });

            const result = await response.json();
            console.log(result);
        });
    }
});

// Initialize the map (optional)
function initMap() {
    const mapOptions = {
        center: { lat: 45.4215, lng: -75.6972 }, // Default center is Ottawa
        zoom: 7,
        mapTypeId: 'roadmap'
    };

    const map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

window.onload = initMap;
