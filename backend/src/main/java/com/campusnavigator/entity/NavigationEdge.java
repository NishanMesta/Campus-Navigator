package com.campusnavigator.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "navigation_edges")
public class NavigationEdge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "from_node_id", nullable = false)
    private Long fromNodeId;

    @Column(name = "to_node_id", nullable = false)
    private Long toNodeId;

    @Column(name = "distance_meters", nullable = false)
    private Double distanceMeters;

    private Boolean walkable = true;

    private Boolean accessible = true;

    private Boolean stairs = false;

    @Column(name = "path_type", length = 50)
    private String pathType;

    public NavigationEdge() {}

    public NavigationEdge(Long id, Long fromNodeId, Long toNodeId, Double distanceMeters, Boolean walkable, Boolean accessible, Boolean stairs, String pathType) {
        this.id = id;
        this.fromNodeId = fromNodeId;
        this.toNodeId = toNodeId;
        this.distanceMeters = distanceMeters;
        this.walkable = walkable;
        this.accessible = accessible;
        this.stairs = stairs;
        this.pathType = pathType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFromNodeId() { return fromNodeId; }
    public void setFromNodeId(Long fromNodeId) { this.fromNodeId = fromNodeId; }

    public Long getToNodeId() { return toNodeId; }
    public void setToNodeId(Long toNodeId) { this.toNodeId = toNodeId; }

    public Double getDistanceMeters() { return distanceMeters; }
    public void setDistanceMeters(Double distanceMeters) { this.distanceMeters = distanceMeters; }

    public Boolean getWalkable() { return walkable; }
    public void setWalkable(Boolean walkable) { this.walkable = walkable; }

    public Boolean getAccessible() { return accessible; }
    public void setAccessible(Boolean accessible) { this.accessible = accessible; }

    public Boolean getStairs() { return stairs; }
    public void setStairs(Boolean stairs) { this.stairs = stairs; }

    public String getPathType() { return pathType; }
    public void setPathType(String pathType) { this.pathType = pathType; }
}
