package com.example.project.controller;

import com.example.project.dto.DoctorWeekScheduleDTO;
import com.example.project.service.WorkSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}