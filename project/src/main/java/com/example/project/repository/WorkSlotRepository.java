package com.example.project.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.project.entity.WorkSlot;

public interface WorkSlotRepository extends JpaRepository<WorkSlot, Integer> {
    // Method cũ (có thể để lại, nhưng không dùng nữa nếu bị lỗi mappingdo+JPA);_;
    // Optional<WorkSlot> findByDocIdAndWorkDateAndStartTimeAndEndTime(
    //         Integer docId, LocalDate workDate, LocalTime startTime, LocalTime endTime
    // );

    // Method mới dùng JPQL ép kiểu sang string để tránh lỗi TIME/DATETIME
    @Query(value = "SELECT * FROM WorkSlot w WHERE w.docId = :docId AND w.workDate = :workDate " +
            "AND LEFT(CONVERT(VARCHAR, w.startTime, 108), 5) = :startTime " +
            "AND LEFT(CONVERT(VARCHAR, w.endTime, 108), 5) = :endTime",
            nativeQuery = true)
    Optional<WorkSlot> findSlotNative(
            @Param("docId") Integer docId,
            @Param("workDate") LocalDate workDate,
            @Param("startTime") String startTime,
            @Param("endTime") String endTime
    );
}