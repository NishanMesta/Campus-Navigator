package com.campusnavigator.controller;

import com.campusnavigator.entity.Building;
import com.campusnavigator.repository.BuildingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
@CrossOrigin(origins = "*")
public class BuildingController {

    @Autowired
    private BuildingRepository buildingRepository;

    @GetMapping
    public List<Building> getAllBuildings(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty() && !"ALL".equalsIgnoreCase(category)) {
            return buildingRepository.findByCategory(category);
        }
        return buildingRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Building> getBuildingById(@PathVariable Long id) {
        return buildingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Building> searchBuildings(@RequestParam("q") String query) {
        return buildingRepository.findByNameContainingIgnoreCaseOrCodeContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query, query);
    }
}
