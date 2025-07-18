package com.example.project.repository;

import java.time.LocalDate;
import java.util.List;
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

    List<WorkSlot> findByWorkDate(LocalDate workDate);

    List<WorkSlot> findByDocIdAndWorkDate(Integer docId, LocalDate workDate);

    
    // Lấy danh sách các khung giờ làm việc của bác sĩ trong tuần
    @Query("SELECT w FROM WorkSlot w WHERE w.docId = :docId AND w.slotStatus = 'approved' AND w.workDate BETWEEN :from AND :to")
    List<WorkSlot> findApprovedSlotsByDoctorAndDateRange(
        @Param("docId") Integer docId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );
    // Lấy danh sách các khung giờ làm việc của bác sĩ trong tuần


    @Query(value = "SELECT * FROM WorkSlot w WHERE w.docId = :docId AND w.workDate = :workDate AND w.startTime = CAST(:startTime AS TIME) AND w.endTime = CAST(:endTime AS TIME)", nativeQuery = true)
Optional<WorkSlot> findByDocIdAndWorkDateAndStartTimeAndEndTime(
    @Param("docId") Integer docId,
    @Param("workDate") LocalDate workDate,
    @Param("startTime") String startTime,
    @Param("endTime") String endTime
);

// Lấy danh sách các khung giờ làm việc của bác sĩ trong tuần

@Query("SELECT w FROM WorkSlot w WHERE w.docId = :docId AND w.workDate BETWEEN :from AND :to")
List<WorkSlot> findAllSlotsByDoctorAndDateRange(
        @Param("docId") Integer docId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
);

}





