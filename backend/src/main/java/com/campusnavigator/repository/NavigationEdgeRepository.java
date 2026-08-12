package com.campusnavigator.repository;

import com.campusnavigator.entity.NavigationEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NavigationEdgeRepository extends JpaRepository<NavigationEdge, Long> {
    List<NavigationEdge> findByWalkableTrue();
}
