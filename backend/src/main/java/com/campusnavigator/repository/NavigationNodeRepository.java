package com.campusnavigator.repository;

import com.campusnavigator.entity.NavigationNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NavigationNodeRepository extends JpaRepository<NavigationNode, Long> {
}
