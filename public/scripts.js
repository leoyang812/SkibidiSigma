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
    const endLocationInput = document.getElementById('endLocation');

    if (startLocationInput) initializeAutocomplete(startLocationInput);
    if (endLocationInput) initializeAutocomplete(endLocationInput);

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
        });
        waypointDiv.appendChild(removeButton);

        waypointsContainer.appendChild(waypointDiv);
    }

    // Event listener for adding waypoints
    const addWaypointButton = document.getElementById('addWaypoint');
    if (addWaypointButton) {
        addWaypointButton.addEventListener('click', addWaypoint);
    }

    // Save form data to session storage
    function saveFormData() {
        const waypoints = Array.from(document.querySelectorAll('#waypointsContainer .waypoint')).map(input => input.value);
        sessionStorage.setItem('waypoints', JSON.stringify(waypoints));
    }

    // Load form data from session storage
    function loadFormData() {
        const waypoints = JSON.parse(sessionStorage.getItem('waypoints'));

        if (waypoints) {
            waypoints.forEach(value => {
                addWaypoint();
                const lastWaypointInput = document.querySelector('#waypointsContainer .waypoint:last-child');
                lastWaypointInput.value = value;
            });
        }
    }

    // Load form data on page load
    loadFormData();

    // Handle form submission
    const routeForm = document.getElementById('routeForm');
    if (routeForm) {
        routeForm.addEventListener('submit', () => {
            saveFormData();
        });
    }

    // Handle back button functionality
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            saveFormData();
        });
    }
});
