package com.example.project.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.dto.DoctorWeekScheduleDTO;
import com.example.project.entity.WorkSlot;
import com.example.project.repository.WorkSlotRepository;
import com.example.project.service.WorkSlotService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/workslots")
@RequiredArgsConstructor
public class WorkSlotController {
    private final WorkSlotService workSlotService;

        @Autowired
    private WorkSlotRepository workSlotRepository;

    @PostMapping("/week-bulk")
    public ResponseEntity<?> saveDoctorWeekSchedules(@RequestBody List<DoctorWeekScheduleDTO> dtos) {
        workSlotService.saveDoctorWeekSchedules(dtos);
        return ResponseEntity.ok("Saved all schedules for all doctors in week!");
    }

    /**
     * Lấy danh sách các khung giờ làm việc của bác sĩ trong tuần
     * @param docId ID của bác sĩ
     * @param startOfWeek Ngày bắt đầu tuần (thường là thứ 2)
     * @return Danh sách các khung giờ làm việc
     */
 @GetMapping("/{docId}/slots")
    public List<WorkSlot> getApprovedWorkSlotsForDoctor(
            @PathVariable Integer docId,
            @RequestParam("from") String from,
            @RequestParam("to") String to) {
        LocalDate fromDate = LocalDate.parse(from);
        LocalDate toDate = LocalDate.parse(to);
        return workSlotRepository.findApprovedSlotsByDoctorAndDateRange(docId, fromDate, toDate);
    }




}