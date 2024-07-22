document.addEventListener("DOMContentLoaded", () => {
    // Initialize autocomplete for address inputs
    function initializeAutocomplete(inputElement) {
        if (inputElement) {
            new google.maps.places.Autocomplete(inputElement, {
                types: ['address'],
                componentRestrictions: { country: 'ca' } // Restrict results to Canada
            });
        }
    }

    // Initialize autocomplete for address inputs on page load
    const startLocationInput = document.getElementById('startLocation');
    const endLocationInput = document.getElementById('end-address'); // Changed to match step3.html

    if (startLocationInput) {
        initializeAutocomplete(startLocationInput);
        startLocationInput.value = localStorage.getItem('startLocation') || '';
    }

    if (endLocationInput) {
        initializeAutocomplete(endLocationInput);
        endLocationInput.value = localStorage.getItem('endLocation') || '';
    }

    // Initialize autocomplete for waypoints
    function initializeWaypointAutocomplete(waypointElement) {
        if (waypointElement) {
            new google.maps.places.Autocomplete(waypointElement, {
                types: ['address'],
                componentRestrictions: { country: 'ca' } // Restrict results to Canada
            });
        }
    }

    // Add a waypoint input field
    function addWaypoint() {
        const waypointsContainer = document.getElementById('waypointsContainer');
        if (!waypointsContainer) return;

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
            saveWaypoints();
        });
        waypointDiv.appendChild(removeButton);

        waypointsContainer.appendChild(waypointDiv);
        saveWaypoints();
    }

    // Save waypoints to localStorage
    function saveWaypoints() {
        const waypoints = [];
        document.querySelectorAll('#waypointsContainer .waypoint').forEach(waypointInput => {
            waypoints.push(waypointInput.value);
        });
        localStorage.setItem('waypoints', JSON.stringify(waypoints));
    }

    // Load waypoints from localStorage
    function loadWaypoints() {
        const waypoints = JSON.parse(localStorage.getItem('waypoints')) || [];
        waypoints.forEach(waypoint => {
            addWaypoint();
            document.querySelector('#waypointsContainer .waypoint:last-child').value = waypoint;
        });
    }

    // Event listener for adding waypoints
    const addWaypointButton = document.getElementById('addWaypoint');
    if (addWaypointButton) {
        addWaypointButton.addEventListener('click', addWaypoint);
    }

    // Handle form submission
    const routeForm = document.getElementById('routeForm');
    const detailsForm = document.getElementById('detailsForm');
    const reviewForm = document.getElementById('reviewForm');

    async function handleSubmit(formElement) {
        formElement.addEventListener('submit', async function(event) {
            event.preventDefault();

            const addresses = [];
            if (startLocationInput) {
                addresses.push({ address: startLocationInput.value });
                localStorage.setItem('startLocation', startLocationInput.value);
            }

            if (document.querySelectorAll('#waypointsContainer .waypoint')) {
                document.querySelectorAll('#waypointsContainer .waypoint').forEach(waypointInput => {
                    addresses.push({ address: waypointInput.value });
                });
                saveWaypoints();
            }

            if (endLocationInput) {
                addresses.push({ address: endLocationInput.value });
                localStorage.setItem('endLocation', endLocationInput.value);
            }

            const totalFreight = document.getElementById('totalFreight')?.value;
            const numTrucks = document.getElementById('numTrucks')?.value;
            const truckCapacity = document.getElementById('truckCapacity')?.value;

            // Replace with your API endpoint
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
            // Handle result
            console.log(result);
        });
    }

    if (routeForm) handleSubmit(routeForm);
    if (detailsForm) handleSubmit(detailsForm);
    if (reviewForm) handleSubmit(reviewForm);

    // Load waypoints on page load
    loadWaypoints();
});

// Initialize the map on step5.html
function initMap() {
    const mapOptions = {
        center: { lat: 45.4215, lng: -75.6972 }, // Default center is Ottawa
        zoom: 7,
        mapTypeId: 'roadmap'
    };

    const map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Dummy route for demonstration
    const route = [
        { lat: 45.4215, lng: -75.6972 }, // Ottawa
        { lat: 46.8139, lng: -71.2082 }  // Quebec City
    ];

    const path = new google.maps.Polyline({
        path: route,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    path.setMap(map);
}

// Call initMap if you need a map display
window.onload = () => {
    if (document.getElementById('map')) {
        initMap();
    }
};
