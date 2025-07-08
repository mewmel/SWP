package com.example.project.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.dto.BookingStepInfo;
import com.example.project.dto.BookingStepResultDTO;
import com.example.project.dto.TestResult;
import com.example.project.dto.VisitSubService;
import com.example.project.entity.BookingStep;
import com.example.project.entity.SubService;
import com.example.project.repository.BookingStepRepository;
import com.example.project.repository.SubServiceRepository;
import com.example.project.service.BookingStepService;


@RestController
@RequestMapping("/api/booking-steps")
public class BookingStepController {
    @Autowired
    private BookingStepRepository bookingStepRepo;
    @Autowired
    private SubServiceRepository subServiceRepo;



    @Autowired
    private BookingStepService bookingStepService;

    // Trả về danh sách BookingStep kèm tên bước cho 1 bookingId
    @GetMapping("/by-booking/{bookId}")
    public List<Map<String, Object>> getStepsByBooking(@PathVariable Integer bookId) {
        List<BookingStep> steps = bookingStepRepo.findByBookId(bookId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (BookingStep step : steps) {
            SubService sub = subServiceRepo.findById(step.getSubId()).orElse(null);
            Map<String, Object> map = new HashMap<>();
            map.put("bookingStepId", step.getBookingStepId());
            map.put("subName", sub != null ? sub.getSubName() : "");
            map.put("performedAt", step.getPerformedAt());
            map.put("result", step.getResult());
            map.put("note", step.getNote());
            result.add(map);
        }
        return result;
    }

    // Endpoint tạo BookingStep cho booking đã xác nhận
    @PostMapping("/create/{bookId}")
    public Map<String, Object> createStepForBooking(@PathVariable Integer bookId) {
        bookingStepService.createStepForConfirmedBooking(bookId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "success");
        resp.put("message", "Đã tạo bước điều trị cho booking " + bookId);
        return resp;
    }


    @GetMapping("/booking-steps/today-performed-at")
    public List<LocalDateTime> getBookingStepPerformedAtToday() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        return bookingStepRepo.findByPerformedAtBetween(start, end)
                .stream()
                .map(BookingStep::getPerformedAt)
                .collect(Collectors.toList());
    }

    @GetMapping("/results")
    public List<BookingStepResultDTO> getResultsByCus(@RequestParam Integer cusId) {
        // Query list BookingStep theo cusId
        List<BookingStep> steps = bookingStepRepo.findByCusId(cusId); // Viết custom query JOIN với Booking để lấy theo cusId

        return steps.stream().map(step -> {
            BookingStepResultDTO dto = new BookingStepResultDTO();
            SubService sub = subServiceRepo.findById(step.getSubId()).orElse(null);
            dto.setSubName(sub != null ? sub.getSubName() : "");
            dto.setPerformedAt(step.getPerformedAt() != null ? step.getPerformedAt().toString() : "");
            dto.setResult(step.getResult());
            dto.setNote(step.getNote());
            dto.setStepStatus(step.getStepStatus());
            return dto;
        }).collect(Collectors.toList());
    }




        // Trả về danh sách BookingStep theo bookingId bên doctor dashboard- để hiện bên xác nhận lịch
    @GetMapping("/{bookId}")
        public List<BookingStepInfo> getBookingStepsByBooking(@PathVariable Integer bookId) {
            List<Object[]> rows = bookingStepRepo.findInactiveStepDTOByBookId(bookId);
            // Map từ Object[] sang BookingStepInfo
            return rows.stream().map(r -> new BookingStepInfo(
                    (Integer) r[0],         // bookingStepId
                    (Integer) r[1],         // subId
                    (String)  r[2],         // subName
                    (String)  r[3],         // result
                    (String)  r[4],         // note
                    r[5] == null ? null : ((Number) r[5]).intValue(), // drugId (nullable)
                    (String)  r[6]          // stepStatus
            )).collect(Collectors.toList());
        }    

    @GetMapping("/{bookId}/subservice-of-visit")
    public List<SubService> getSubServiceOfVisit(@PathVariable Integer bookId) {
        VisitSubService dto = bookingStepService.getSubServicesForBooking(bookId);

        // Lấy group theo visitNumber (lần khám hiện tại)
        List<SubService> currentVisitSubs = dto.getSubServicesGrouped().get(dto.getVisitNumber());

        // Nếu chưa có (ví dụ chưa thực hiện lần khám này), trả về empty list
        return currentVisitSubs != null ? currentVisitSubs : List.of();
    }

        // Cập nhật BookingStep với bookingId
        @PutMapping("/update-with-booking/{bookId}/{subId}")
        public ResponseEntity<?> updateBookingStepWithBooking(@PathVariable Integer bookId, @PathVariable Integer subId, @RequestBody BookingStep req) {
            boolean updated = bookingStepService.updateBookingStepWithBooking(bookId, subId, req);
            if (updated) {
                return ResponseEntity.ok().body("Cập nhật thành công !");
            } else {
                return ResponseEntity.badRequest().body("Không thể cập nhật");
            }
        }



@PostMapping("/save-test-results")
    public ResponseEntity<?> saveTestResults(@RequestBody List<TestResult> testResults) {
        try {
            bookingStepService.saveTestResults(testResults);
            return ResponseEntity.ok(Map.of("message", "OK"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error", "error", e.getMessage()));
        }
    }

        
        
@GetMapping("/test-results/{bookId}")
public List<TestResult> getTestResultsForBooking(@PathVariable Integer bookId) {
    return bookingStepService.getTestResultsForBooking(bookId);
}



}