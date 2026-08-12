package com.campusnavigator.navigation;

import com.campusnavigator.entity.NavigationEdge;
import com.campusnavigator.entity.NavigationNode;

import java.util.*;

public class AStarPathfinder {

    public static class PathResult {
        private List<NavigationNode> pathNodes;
        private List<double[]> coordinates;
        private double totalDistance;
        private int walkingMinutes;
        private List<String> steps;

        public PathResult(List<NavigationNode> pathNodes, List<double[]> coordinates, double totalDistance, int walkingMinutes, List<String> steps) {
            this.pathNodes = pathNodes;
            this.coordinates = coordinates;
            this.totalDistance = totalDistance;
            this.walkingMinutes = walkingMinutes;
            this.steps = steps;
        }

        public List<NavigationNode> getPathNodes() { return pathNodes; }
        public List<double[]> getCoordinates() { return coordinates; }
        public double getTotalDistance() { return totalDistance; }
        public int getWalkingMinutes() { return walkingMinutes; }
        public List<String> getSteps() { return steps; }
    }

    public static double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public static PathResult findPath(Long startNodeId, Long targetNodeId, List<NavigationNode> nodes, List<NavigationEdge> edges, boolean avoidStairs, boolean wheelchairOnly) {
        Map<Long, NavigationNode> nodeMap = new HashMap<>();
        for (NavigationNode n : nodes) nodeMap.put(n.getId(), n);

        NavigationNode startNode = nodeMap.get(startNodeId);
        NavigationNode targetNode = nodeMap.get(targetNodeId);

        if (startNode == null || targetNode == null) return null;

        Map<Long, List<EdgeRef>> adj = new HashMap<>();
        for (NavigationNode n : nodes) adj.put(n.getId(), new ArrayList<>());

        for (NavigationEdge edge : edges) {
            if (!Boolean.TRUE.equals(edge.getWalkable())) continue;
            if (avoidStairs && Boolean.TRUE.equals(edge.getStairs())) continue;
            if (wheelchairOnly && !Boolean.TRUE.equals(edge.getAccessible())) continue;

            double cost = edge.getDistanceMeters();
            if (Boolean.TRUE.equals(edge.getStairs())) cost += 50.0;

            adj.get(edge.getFromNodeId()).add(new EdgeRef(edge.getToNodeId(), cost, edge.getDistanceMeters()));
            adj.get(edge.getToNodeId()).add(new EdgeRef(edge.getFromNodeId(), cost, edge.getDistanceMeters()));
        }

        Map<Long, Double> gScore = new HashMap<>();
        Map<Long, Double> fScore = new HashMap<>();
        Map<Long, Long> cameFrom = new HashMap<>();

        for (NavigationNode n : nodes) {
            gScore.put(n.getId(), Double.POSITIVE_INFINITY);
            fScore.put(n.getId(), Double.POSITIVE_INFINITY);
        }

        gScore.put(startNodeId, 0.0);
        fScore.put(startNodeId, haversine(startNode.getLatitude(), startNode.getLongitude(), targetNode.getLatitude(), targetNode.getLongitude()));

        PriorityQueue<Long> openSet = new PriorityQueue<>(Comparator.comparingDouble(fScore::get));
        openSet.add(startNodeId);

        while (!openSet.isEmpty()) {
            Long currentId = openSet.poll();

            if (currentId.equals(targetNodeId)) {
                List<NavigationNode> pathNodes = new ArrayList<>();
                Long curr = currentId;
                while (curr != null) {
                    pathNodes.add(0, nodeMap.get(curr));
                    curr = cameFrom.get(curr);
                }

                double totalDistance = 0;
                List<double[]> coordinates = new ArrayList<>();
                List<String> steps = new ArrayList<>();

                for (int i = 0; i < pathNodes.size(); i++) {
                    NavigationNode node = pathNodes.get(i);
                    coordinates.add(new double[]{node.getLatitude(), node.getLongitude()});

                    if (i > 0) {
                        NavigationNode prev = pathNodes.get(i - 1);
                        double leg = haversine(prev.getLatitude(), prev.getLongitude(), node.getLatitude(), node.getLongitude());
                        totalDistance += leg;
                        steps.add("Walk " + (int) Math.round(leg) + "m towards " + node.getName());
                    } else {
                        steps.add("Start at " + node.getName());
                    }
                }

                int walkingMinutes = Math.max(1, (int) Math.round(totalDistance / 80.0));
                return new PathResult(pathNodes, coordinates, Math.round(totalDistance), walkingMinutes, steps);
            }

            for (EdgeRef edge : adj.getOrDefault(currentId, Collections.emptyList())) {
                double tentativeG = gScore.get(currentId) + edge.cost;
                if (tentativeG < gScore.get(edge.to)) {
                    cameFrom.put(edge.to, currentId);
                    gScore.put(edge.to, tentativeG);
                    NavigationNode neighbor = nodeMap.get(edge.to);
                    double h = haversine(neighbor.getLatitude(), neighbor.getLongitude(), targetNode.getLatitude(), targetNode.getLongitude());
                    fScore.put(edge.to, tentativeG + h);

                    if (!openSet.contains(edge.to)) {
                        openSet.add(edge.to);
                    }
                }
            }
        }

        return null;
    }

    private static class EdgeRef {
        Long to;
        double cost;
        double distance;

        EdgeRef(Long to, double cost, double distance) {
            this.to = to;
            this.cost = cost;
            this.distance = distance;
        }
    }
}
