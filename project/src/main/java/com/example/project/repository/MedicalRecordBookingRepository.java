package com.example.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.project.entity.MedicalRecordBooking;
import com.example.project.entity.MedicalRecordBooking.MedicalRecordBookingId;

public interface MedicalRecordBookingRepository extends JpaRepository<MedicalRecordBooking, MedicalRecordBookingId> {
    List<MedicalRecordBooking> findByIdRecordId(Integer recordId);
}
