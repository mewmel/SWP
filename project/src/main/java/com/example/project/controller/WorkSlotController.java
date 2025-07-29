package com.example.project.controller;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
import com.example.project.dto.WorkSlotBookingDTO;
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

    /**
     * ✅ API MỚI: Lấy slotId dựa trên thông tin khung giờ làm việc
     * @param requestData chứa docId, workDate, startTime, endTime
     * @return Map chứa slotId hoặc lỗi
     */
    @PostMapping("/get-slot-id-by-date-time")
    public ResponseEntity<Map<String, Object>> getSlotIdByDateTime(@RequestBody Map<String, Object> requestData) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Extract parameters from request
            Integer docId = (Integer) requestData.get("docId");
            String workDate = (String) requestData.get("workDate");
            String startTime = (String) requestData.get("startTime");
            String endTime = (String) requestData.get("endTime");
            
            // Validate input
            if (docId == null || workDate == null || startTime == null || endTime == null) {
                response.put("error", "Missing required parameters: docId, workDate, startTime, endTime");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Parse date
            LocalDate parsedWorkDate = LocalDate.parse(workDate);
            
            // Find WorkSlot using the existing repository method
            Optional<WorkSlot> workSlotOpt = workSlotRepository.findByDocIdAndWorkDateAndStartTimeAndEndTime(
                docId, parsedWorkDate, startTime, endTime);
            
            if (workSlotOpt.isPresent()) {
                WorkSlot workSlot = workSlotOpt.get();
                
                // Check if slot is approved
                if (!"approved".equals(workSlot.getSlotStatus())) {
                    response.put("error", "Khung giờ chưa được duyệt hoặc đã bị hủy");
                    return ResponseEntity.badRequest().body(response);
                }
                
                response.put("slotId", workSlot.getSlotId());
                response.put("maxPatient", workSlot.getMaxPatient());
                response.put("slotStatus", workSlot.getSlotStatus());
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "Không tìm thấy khung giờ làm việc phù hợp");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            response.put("error", "Lỗi hệ thống: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * ✅ API MỚI: Lấy WorkSlot với thông tin booking count cho ngày cụ thể
     * GET /api/workslots?docId={docId}&date={date}
     * @param docId ID của bác sĩ
     * @param date Ngày cần lấy WorkSlot (yyyy-MM-dd)
     * @return List<WorkSlotBookingDTO> với thông tin startTime, endTime, maxPatient, currentBooking
     */
    @GetMapping
    public ResponseEntity<List<WorkSlotBookingDTO>> getWorkSlotsWithBookingCount(
            @RequestParam Integer docId,
            @RequestParam String date) {
        try {
            LocalDate workDate = LocalDate.parse(date);
            List<WorkSlotBookingDTO> result = workSlotService.getWorkSlotsWithBookingCount(docId, workDate);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * ✅ API MỚI: Lấy tất cả WorkSlot cho tất cả bác sĩ trong một ngày
     * GET /api/workslots/all?date={date}
     * @param date Ngày cần lấy WorkSlot (yyyy-MM-dd)
     * @return List<WorkSlot> với thông tin đầy đủ
     */
    @GetMapping("/all")
    public ResponseEntity<List<WorkSlot>> getAllWorkSlotsByDate(@RequestParam String date) {
        try {
            LocalDate workDate = LocalDate.parse(date);
            List<WorkSlot> workSlots = workSlotRepository.findByWorkDate(workDate);
            return ResponseEntity.ok(workSlots);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}