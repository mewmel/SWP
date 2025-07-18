
package com.example.project.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.project.entity.MedicalRecordBooking;
import com.example.project.entity.MedicalRecordBooking.MedicalRecordBookingId;

public interface MedicalRecordBookingRepository extends JpaRepository<MedicalRecordBooking, MedicalRecordBookingId> {}
