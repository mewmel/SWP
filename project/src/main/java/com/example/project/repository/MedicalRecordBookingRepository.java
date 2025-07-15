

package com.example.project.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.project.entity.MedicalRecordBooking;
import com.example.project.entity.MedicalRecordBooking.MedicalRecordBookingId;
@Repository

public interface MedicalRecordBookingRepository extends JpaRepository<MedicalRecordBooking, MedicalRecordBookingId> {}