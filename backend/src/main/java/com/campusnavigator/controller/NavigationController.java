package com.campusnavigator.controller;

import com.campusnavigator.entity.NavigationEdge;
import com.campusnavigator.entity.NavigationNode;
import com.campusnavigator.navigation.AStarPathfinder;
import com.campusnavigator.repository.NavigationEdgeRepository;
import com.campusnavigator.repository.NavigationNodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/navigation")
@CrossOrigin(origins = "*")
public class NavigationController {

    @Autowired
    private NavigationNodeRepository nodeRepository;

    @Autowired
    private NavigationEdgeRepository edgeRepository;

    public static class RouteRequest {
        private Long startNodeId;
        private Long destinationNodeId;
        private boolean avoidStairs = false;
        private boolean wheelchairOnly = false;

        public Long getStartNodeId() { return startNodeId; }
        public void setStartNodeId(Long startNodeId) { this.startNodeId = startNodeId; }

        public Long getDestinationNodeId() { return destinationNodeId; }
        public void setDestinationNodeId(Long destinationNodeId) { this.destinationNodeId = destinationNodeId; }

        public boolean isAvoidStairs() { return avoidStairs; }
        public void setAvoidStairs(boolean avoidStairs) { this.avoidStairs = avoidStairs; }

        public boolean isWheelchairOnly() { return wheelchairOnly; }
        public void setWheelchairOnly(boolean wheelchairOnly) { this.wheelchairOnly = wheelchairOnly; }
    }

    @GetMapping("/nodes")
    public List<NavigationNode> getAllNodes() {
        return nodeRepository.findAll();
    }

    @GetMapping("/edges")
    public List<NavigationEdge> getAllEdges() {
        return edgeRepository.findAll();
    }

    @PostMapping("/route")
    public ResponseEntity<AStarPathfinder.PathResult> calculateRoute(@RequestBody RouteRequest request) {
        List<NavigationNode> nodes = nodeRepository.findAll();
        List<NavigationEdge> edges = edgeRepository.findAll();

        AStarPathfinder.PathResult result = AStarPathfinder.findPath(
                request.getStartNodeId(),
                request.getDestinationNodeId(),
                nodes,
                edges,
                request.isAvoidStairs(),
                request.isWheelchairOnly()
        );

        if (result == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(result);
    }
}
