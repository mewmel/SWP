package com.example.project.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
import com.example.project.dto.BookingWithStepsAndDrug;
import com.example.project.dto.TestResult;
import com.example.project.dto.VisitSubService;
import com.example.project.entity.BookingStep;
import com.example.project.entity.SubService;
import com.example.project.repository.BookingStepRepository;
import com.example.project.repository.MedicalRecordBookingRepository;
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
    private MedicalRecordBookingRepository medicalRecordBookingRepository;


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


    @GetMapping("/today-performed-at")
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


     @GetMapping("/{bookId}/subservice-of-visit-follow-up")
public ResponseEntity<List<Map<String, Object>>> getFollowUpSubservices(@PathVariable Integer bookId) {
    // 1. Lấy tất cả các BookingStep theo bookId
    List<BookingStep> steps = bookingStepRepo.findByBookId(bookId);
    if (steps.isEmpty()) return ResponseEntity.ok(Collections.emptyList());

    // 2. Lấy subId list
    List<Integer> subIds = steps.stream()
            .map(BookingStep::getSubId)
            .distinct()
            .collect(Collectors.toList());

    // 3. Lấy các SubService tương ứng
    List<SubService> subServices = subServiceRepo.findAllBySubIdIn(subIds);

    // 4. Trả về chỉ subId, subName (không trả nguyên object cho nhẹ)
    List<Map<String, Object>> result = subServices.stream().map(sub -> {
        Map<String, Object> item = new HashMap<>();
        item.put("subId", sub.getSubId());
        item.put("subName", sub.getSubName());
        return item;
    }).collect(Collectors.toList());

    return ResponseEntity.ok(result);
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



    // Cập nhật trạng thái của bước điều trị thành "pending"
    // Ví dụ: khi bác sĩ không thể thực hiện bước điều trị ngay lập tức    
    @PutMapping("/set-pending/{bookId}/{subId}")
    public ResponseEntity<?> setStepPending(
            @PathVariable Integer bookId,
            @PathVariable Integer subId,
            @RequestBody Map<String, Object> reqBody
    ) {
        boolean updated = bookingStepService.setStepPending(bookId, subId, reqBody);
        if (updated) {
            return ResponseEntity.ok().body("Cập nhật trạng thái pending thành công!");
        } else {
            // Trả về 400 Bad Request + message
            return ResponseEntity.badRequest().body("Không thể cập nhật trạng thái pending!");
        }
    }

    // Lấy kết quả xét nghiệm cho bước điều trị
    // Ví dụ: check để xem đủ điều kiện checkout chưa
    @GetMapping("/check-test-result/{bookId}/{subId}")
    public ResponseEntity<?> getBookingStep(
        @PathVariable Integer bookId,
        @PathVariable Integer subId
    ) {
        Optional<BookingStep> stepOpt = bookingStepRepo.findByBookIdAndSubId(bookId, subId);
        if (stepOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        // Có thể trả luôn object, hoặc custom DTO (tùy bảo mật)
        return ResponseEntity.ok(stepOpt.get());
    }        

        
    @GetMapping("/test-results/{bookId}")
    public List<TestResult> getTestResultsForBooking(@PathVariable Integer bookId) {
        return bookingStepService.getTestResultsForBooking(bookId);
    }


    @PostMapping("/create-step-for-initial-booking")
    public ResponseEntity<?> createStepForInitialBooking(@RequestBody Map<String, Object> req) {
        try {
            // Lấy các trường từ request body
            Integer bookId = (Integer) req.get("bookId");
            Integer subId = (Integer) req.get("subId");
            String stepStatus = (String) req.get("stepStatus");

            // Validate
            if (bookId == null || subId == null || stepStatus == null) {
                return ResponseEntity.badRequest().body("Thiếu thông tin bắt buộc!");
            }

            BookingStep step = new BookingStep();
            step.setBookId(bookId);
            step.setSubId(subId);
            step.setStepStatus(stepStatus);

            // Các trường còn lại để null, backend sẽ cập nhật khi thực hiện

            BookingStep saved = bookingStepRepo.save(step);

            return ResponseEntity.ok(Map.of(
                "bookingStepId", saved.getBookingStepId()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không thể tạo bước dịch vụ: " + e.getMessage());
        }
    }   
    
    
    @GetMapping("/all-booking-steps/{recordId}")
    public ResponseEntity<?> getBookingWithStepsAndDrug(@PathVariable Integer recordId) {
        try {
            List<BookingWithStepsAndDrug> data = bookingStepService.getBookingsWithStepsAndDrugByRecordId(recordId);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi khi lấy dữ liệu: " + e.getMessage());
        }
    }
    
@GetMapping("/find-id/{bookingId}/{subId}")
public ResponseEntity<?> getBookingStepId(
    @PathVariable Integer bookingId,
    @PathVariable Integer subId
) {
    BookingStep step = bookingStepRepo.findByBookIdAndSubId(bookingId, subId)
        .orElse(null);
    if (step != null) {
        return ResponseEntity.ok(Collections.singletonMap("bookingStepId", step.getBookingStepId()));
    } else {
        return ResponseEntity.ok(Collections.singletonMap("bookingStepId", null));
    }
}


}