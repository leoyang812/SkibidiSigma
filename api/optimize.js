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
            if (!(edge in visited) || weight < visited[edge] && newCargo <= totalCargoCapacity) {
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

// Route optimization endpoint
app.post('/optimize', async (req, res) => {
    const { startAddress, goalAddress, cargoCapacity, numTrucks, cargoByStop } = req.body;
    const totalCargoCapacity = numTrucks * cargoCapacity;

    // Initialize the graph and geocode addresses
    const graph = new Graph();
    const coordinates = {};

    // Add nodes and edges (mock example, replace with actual geocoding)
    graph.addNode(startAddress);
    graph.addNode(goalAddress);
    const distance = haversine([0, 0], [1, 1]); // Mock coordinates
    graph.addEdge(startAddress, goalAddress, distance);

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
const trucksDatabase = [
    { model: 'Small Truck', minCapacity: 500, maxCapacity: 1000 },
    { model: 'Medium Truck', minCapacity: 1000, maxCapacity: 1500 },
    { model: 'Large Truck', minCapacity: 1500, maxCapacity: 2000 }
];

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { addresses, cargoByStop, numTrucks, truckCapacityRange } = req.body;

        // Validate truck capacity range
        const truck = trucksDatabase.find(t => 
            truckCapacityRange >= t.minCapacity && truckCapacityRange <= t.maxCapacity
        );

        if (!truck) {
            return res.status(400).json({ error: `Invalid truck capacity: ${truckCapacityRange}` });
        }

        const graph = new Graph();
        const coordinates = {};

        for (const { address, city } of addresses) {
            if (!canadianCities.has(city)) {
                return res.status(400).json({ error: `Invalid city: ${city}` });
            }

            const coords = await geocodeAddress(address, city);
            if (!coords) {
                return res.status(400).json({ error: `Invalid address: ${address}, ${city}` });
            }

            const fullAddress = `${address}, ${city}`;
            coordinates[fullAddress] = coords;
            graph.addNode(fullAddress);
        }

        // Add edges and other logic here...

        res.status(200).json({ /* Response data */ });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
