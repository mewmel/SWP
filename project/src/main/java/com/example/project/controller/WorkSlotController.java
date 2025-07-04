package com.example.project.controller;

import com.example.project.dto.DoctorWeekScheduleDTO;
import com.example.project.dto.WorkSlotBookingDTO;
import com.example.project.entity.WorkSlot;
import com.example.project.service.WorkSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/workslots")
@RequiredArgsConstructor
public class WorkSlotController {
    private final WorkSlotService workSlotService;

    @PostMapping("/week-bulk")
    public ResponseEntity<?> saveDoctorWeekSchedules(@RequestBody List<DoctorWeekScheduleDTO> dtos) {
        workSlotService.saveDoctorWeekSchedules(dtos);
        return ResponseEntity.ok("Saved all schedules for all doctors in week!");
    }

    // Đúng RESTful: GET /api/workslots?date=2025-07-03
    @GetMapping
    public List<WorkSlot> getWorkSlotsByDate(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return workSlotService.getSlotsByDate(date);
    }

    @GetMapping("/by-doctor")
    public List<WorkSlotBookingDTO> getSlots(
            @RequestParam Integer docId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return workSlotService.getWorkSlotsWithBookingCount(docId, date);
    }
}