// A* Pathfinder implementation for Campus Navigation Graph

// Haversine formula for geographic distance (heuristic h(n) in meters)
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest node in graph to a given latitude/longitude coordinate
export function findNearestNode(lat, lng, nodes) {
  let minDistance = Infinity;
  let nearestNode = null;

  nodes.forEach((node) => {
    const dist = haversineDistance(lat, lng, node.latitude, node.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearestNode = node;
    }
  });

  return { node: nearestNode, distance: minDistance };
}

// A* Pathfinder algorithm over nodes and weighted edges
export function findShortestPath(startNodeId, targetNodeId, nodes, edges, options = {}) {
  const { avoidStairs = false, wheelchairOnly = false } = options;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const startNode = nodeMap.get(startNodeId);
  const targetNode = nodeMap.get(targetNodeId);

  if (!startNode || !targetNode) return null;

  // Build adjacency list (undirected graph)
  const adjacencyList = new Map();
  nodes.forEach((n) => adjacencyList.set(n.id, []));

  edges.forEach((edge) => {
    if (!edge.walkable) return;
    if (avoidStairs && edge.stairs) return;
    if (wheelchairOnly && !edge.accessible) return;

    let edgeCost = edge.distance;
    if (edge.stairs) edgeCost += 50; // extra penalty if not explicitly avoided

    adjacencyList.get(edge.from).push({ to: edge.to, cost: edgeCost, distance: edge.distance, edge });
    adjacencyList.get(edge.to).push({ to: edge.from, cost: edgeCost, distance: edge.distance, edge });
  });

  // A* Data structures
  const openSet = new Set([startNodeId]);
  const cameFrom = new Map();

  const gScore = new Map();
  nodes.forEach((n) => gScore.set(n.id, Infinity));
  gScore.set(startNodeId, 0);

  const fScore = new Map();
  nodes.forEach((n) => fScore.set(n.id, Infinity));
  fScore.set(
    startNodeId,
    haversineDistance(startNode.latitude, startNode.longitude, targetNode.latitude, targetNode.longitude)
  );

  while (openSet.size > 0) {
    // Current node with lowest fScore
    let currentId = null;
    let lowestF = Infinity;
    for (const nodeId of openSet) {
      const f = fScore.get(nodeId);
      if (f < lowestF) {
        lowestF = f;
        currentId = nodeId;
      }
    }

    if (currentId === targetNodeId) {
      // Reconstruct path
      const pathNodes = [];
      let curr = currentId;
      while (curr !== undefined) {
        pathNodes.unshift(nodeMap.get(curr));
        curr = cameFrom.get(curr);
      }

      // Calculate total actual physical distance
      let totalDistance = 0;
      const coordinates = [];
      const steps = [];

      for (let i = 0; i < pathNodes.length; i++) {
        const node = pathNodes[i];
        coordinates.push([node.latitude, node.longitude]);

        if (i > 0) {
          const prev = pathNodes[i - 1];
          const legDist = Math.round(haversineDistance(prev.latitude, prev.longitude, node.latitude, node.longitude));
          totalDistance += legDist;
          steps.push(`Walk ${legDist}m towards ${node.name}`);
        } else {
          steps.push(`Start at ${node.name}`);
        }
      }

      // Estimated walking time: ~1.33 m/s = 80 meters per minute
      const walkingMinutes = Math.max(1, Math.round(totalDistance / 80));

      return {
        pathNodes,
        coordinates,
        totalDistance,
        walkingMinutes,
        steps
      };
    }

    openSet.delete(currentId);
    const neighbors = adjacencyList.get(currentId) || [];

    for (const neighbor of neighbors) {
      const tentativeG = gScore.get(currentId) + neighbor.cost;

      if (tentativeG < gScore.get(neighbor.to)) {
        cameFrom.set(neighbor.to, currentId);
        gScore.set(neighbor.to, tentativeG);

        const target = nodeMap.get(neighbor.to);
        const h = haversineDistance(target.latitude, target.longitude, targetNode.latitude, targetNode.longitude);
        fScore.set(neighbor.to, tentativeG + h);

        openSet.add(neighbor.to);
      }
    }
  }

  return null; // No route found
}
