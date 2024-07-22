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
    const endLocationInput = document.getElementById('end-address'); // Updated to match step3.html

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
        const startLocation = document.getElementById('startLocation')?.value || '';
        const endLocation = document.getElementById('end-address')?.value || ''; // Updated to match step3.html
        const waypoints = Array.from(document.querySelectorAll('#waypointsContainer .waypoint')).map(input => input.value);

        sessionStorage.setItem('startLocation', startLocation);
        sessionStorage.setItem('endLocation', endLocation);
        sessionStorage.setItem('waypoints', JSON.stringify(waypoints));
    }

    // Load form data from session storage
    function loadFormData() {
        const startLocation = sessionStorage.getItem('startLocation');
        const endLocation = sessionStorage.getItem('endLocation');
        const waypoints = JSON.parse(sessionStorage.getItem('waypoints'));

        if (startLocation) {
            document.getElementById('startLocation').value = startLocation;
        }

        if (endLocation) {
            document.getElementById('end-address').value = endLocation; // Updated to match step3.html
        }

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
    const detailsForm = document.getElementById('detailsForm');

    if (routeForm) {
        routeForm.addEventListener('submit', saveFormData);
    }
    if (detailsForm) {
        detailsForm.addEventListener('submit', saveFormData);
    }

    // Handle back button functionality
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            saveFormData();
            window.history.back();
        });
    }
});
