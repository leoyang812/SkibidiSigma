const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.json());

// Haversine formula to calculate distance between two points
function haversine(coord1, coord2) {
    const R = 6371; // Earth radius in kilometers
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;

    const dlat = (lat2 - lat1) * (Math.PI / 180);
    const dlon = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Graph class
class Graph {
    constructor() {
        this.nodes = new Set();
        this.edges = {};
        this.distances = {};
    }

    addNode(value) {
        this.nodes.add(value);
        this.edges[value] = [];
    }

    addEdge(fromNode, toNode, distance) {
        this.edges[fromNode].push(toNode);
        this.edges[toNode].push(fromNode);
        this.distances[`${fromNode}-${toNode}`] = distance;
        this.distances[`${toNode}-${fromNode}`] = distance;
    }
}

// Dijkstra's algorithm
function dijkstra(graph, initial, cargoByStop, totalCargoCapacity) {
    const visited = { [initial]: 0 };
    const path = {};
    const cargoLoaded = { [initial]: 0 };

    const nodes = new Set([...graph.nodes]);

    while (nodes.size > 0) {
        let minNode = null;

        nodes.forEach(node => {
            if (node in visited) {
                if (minNode === null || visited[node] < visited[minNode]) {
                    minNode = node;
                }
            }
        });

        if (minNode === null) break;

        nodes.delete(minNode);
        const currentWeight = visited[minNode];

        graph.edges[minNode].forEach(edge => {
            const weight = currentWeight + graph.distances[`${minNode}-${edge}`];
            const newCargo = cargoLoaded[minNode] + (cargoByStop[edge] || 0);
            if (!(edge in visited) || (weight < visited[edge] && newCargo <= totalCargoCapacity)) {
                visited[edge] = weight;
                path[edge] = minNode;
                cargoLoaded[edge] = newCargo;
            }
        });
    }

    return { visited, path };
}

// Reconstruct path
function reconstructPath(path, start, goal) {
    const reversedPath = [];
    let node = goal;

    while (node !== start) {
        reversedPath.push(node);
        node = path[node];
    }

    reversedPath.push(start);
    return reversedPath.reverse();
}

// Calculate total distance
function calculateTotalDistance(graph, path) {
    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
        totalDistance += graph.distances[`${path[i]}-${path[i + 1]}`];
    }
    return totalDistance;
}

// Geocode address to get coordinates
async function geocodeAddress(address) {
    const apiKey = 'AIzaSyBLWsl5v2a7kj2ggZnTuAhHt3WzamVNPE0';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const { results } = response.data;
        if (results.length > 0) {
            const { lat, lng } = results[0].geometry.location;
            return [lat, lng];
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error(`Error geocoding address ${address}: ${error.message}`);
        return null;
    }
}

// Route optimization endpoint
app.post('/optimize', async (req, res) => {
    const { startAddress, goalAddress, cargoCapacity, numTrucks, cargoByStop, waypoints } = req.body;
    const totalCargoCapacity = numTrucks * cargoCapacity;

    // Initialize the graph and geocode addresses
    const graph = new Graph();
    const coordinates = {};

    // Geocode the start and goal addresses
    const startCoords = await geocodeAddress(startAddress);
    const goalCoords = await geocodeAddress(goalAddress);

    if (!startCoords || !goalCoords) {
        return res.status(400).json({ error: 'Invalid start or goal address' });
    }

    graph.addNode(startAddress);
    coordinates[startAddress] = startCoords;

    graph.addNode(goalAddress);
    coordinates[goalAddress] = goalCoords;

    // Geocode waypoints and add nodes and edges to the graph
    for (const waypoint of waypoints) {
        const waypointCoords = await geocodeAddress(waypoint);
        if (!waypointCoords) {
            return res.status(400).json({ error: `Invalid waypoint address: ${waypoint}` });
        }

        graph.addNode(waypoint);
        coordinates[waypoint] = waypointCoords;

        // Add edges between all nodes (fully connected graph)
        for (const [existingNode, existingCoords] of Object.entries(coordinates)) {
            if (existingNode !== waypoint) {
                const distance = haversine(existingCoords, waypointCoords);
                graph.addEdge(existingNode, waypoint, distance);
            }
        }
    }

    // Add edge between start and goal if not already done
    const distanceStartGoal = haversine(startCoords, goalCoords);
    graph.addEdge(startAddress, goalAddress, distanceStartGoal);

    // Calculate route
    const { visited, path } = dijkstra(graph, startAddress, cargoByStop, totalCargoCapacity);
    if (visited[goalAddress] !== undefined) {
        const dijkstraPath = reconstructPath(path, startAddress, goalAddress);
        const totalDistance = calculateTotalDistance(graph, dijkstraPath);
        res.json({ path: dijkstraPath, distance: totalDistance });
    } else {
        res.status(400).json({ error: 'No valid path found or cargo exceeds capacity' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
