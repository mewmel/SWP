package com.example.project.repository;

import com.example.project.entity.WorkSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

public interface WorkSlotRepository extends JpaRepository<WorkSlot, Integer> {
    Optional<WorkSlot> findByDocIdAndWorkDateAndStartTimeAndEndTime(
            Integer docId, LocalDate workDate, LocalTime startTime, LocalTime endTime
    );
}