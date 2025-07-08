package com.example.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.project.entity.SubService;

public interface SubServiceRepository extends JpaRepository<SubService, Integer> {
    List<SubService> findBySerId(Integer serId);

    @Query("SELECT s FROM SubService s WHERE s.serId = :serId AND LOWER(s.subName) LIKE CONCAT('%', LOWER(:keyword), '%')")
    List<SubService> findTestSubServices(@Param("serId") Integer serId, @Param("keyword") String keyword);

}