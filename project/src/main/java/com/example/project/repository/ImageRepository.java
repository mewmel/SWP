package com.example.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.project.entity.Image;

@Repository
public interface ImageRepository extends JpaRepository<Image, Integer> {
    // Optional<Image> findByDocId(Integer docId);
}
