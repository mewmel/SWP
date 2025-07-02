package com.example.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.project.entity.DoctorService;
import com.example.project.entity.DoctorServiceId;

@Repository
public interface DoctorServiceRepository extends JpaRepository<DoctorService, DoctorServiceId> {

        // Lấy tất cả service của bác sĩ
    List<DoctorService> findByDocId(Integer docId);
 

}

    // @Query("SELECT ds FROM DoctorService ds WHERE ds.docId = :docId AND ds.serviceName IN :serviceNames")
    // List<DoctorService> findServiceName(@Param("docId") Integer docId, List<String> serviceNames) {
    //     // Implementation here
    //     return null; // Placeholder
    // }