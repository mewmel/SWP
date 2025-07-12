package com.example.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.example.project.entity.DoctorAvatar;

public interface DoctorAvatarRepository extends JpaRepository<DoctorAvatar, Integer> {

@Query("SELECT da FROM DoctorAvatar da WHERE da.doctor.docId = :docId AND da.isActive = true")
Optional<DoctorAvatar> findActiveAvatarByDoctorId(@Param("docId") Integer docId);

    @Modifying
    @Transactional
    @Query("UPDATE DoctorAvatar da SET da.isActive = false WHERE da.doctor.docId = :docId")
    void deactivateAllAvatarsByDocId(@Param("docId") Integer docId);
}
