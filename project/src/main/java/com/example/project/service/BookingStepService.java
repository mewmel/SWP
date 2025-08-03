package com.example.project.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.IntStream;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.stereotype.Service;

import com.example.project.dto.BookingWithStepsAndDrug;
import com.example.project.dto.BookingWithStepsAndDrug.DrugItemDTO;
import com.example.project.dto.TestResult;
import com.example.project.dto.VisitSubService;
import com.example.project.entity.Booking;
import com.example.project.entity.BookingStep;
import com.example.project.entity.Drug;
import com.example.project.entity.DrugItem;
import com.example.project.entity.SubService;
import com.example.project.repository.BookingRepository;
import com.example.project.repository.BookingStepRepository;
import com.example.project.repository.SubServiceRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.example.project.repository.DrugRepository;
import com.example.project.repository.DrugItemRepository;
import com.example.project.repository.MedicalRecordBookingRepository;


import java.util.ArrayList;


@Service
public class BookingStepService {
    @Autowired
    private BookingRepository bookingRepo;
    @Autowired
    private SubServiceRepository subServiceRepo;
    @Autowired
    private BookingStepRepository bookingStepRepo;

    @Autowired
    private DrugRepository drugRepo;

    @Autowired
    private DrugItemRepository drugItemRepo;

    @Autowired
    private MedicalRecordBookingRepository medicalRecordBookingRepo;

    /**
     * Tạo BookingStep cho tất cả các SubService liên quan khi booking đã confirmed
     * performedAt sẽ là:
     * - offset==1: ngày đầu (booking.getCreatedAt())
     * - offset==3: ngày thứ 3 (booking.getCreatedAt() + 2 ngày)
     * - offset==9: ngày thứ 9 (booking.getCreatedAt() + 8 ngày)
     * Nếu gặp subService có serId khác thì dừng luôn vòng lặp
     */
    public void createStepForConfirmedBooking(Integer bookId) {
        Booking booking = bookingRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));

        if (!"confirmed".equalsIgnoreCase(booking.getBookStatus())) {
            throw new IllegalStateException("Booking chưa ở trạng thái confirmed.");
        }

        // Kiểm tra đã có BookingStep chưa
        List<BookingStep> steps = bookingStepRepo.findByBookId(bookId);
        if (steps != null && !steps.isEmpty()) {
            return;
        }

        // Lấy tất cả subService theo serId của booking
        List<SubService> subServices = subServiceRepo.findBySerId(booking.getSerId());
        if (subServices == null || subServices.isEmpty()) {
            throw new RuntimeException("Không tìm thấy SubService cho dịch vụ này!");
        }

        // Ngày đầu tiên
        LocalDateTime startDate = booking.getCreatedAt();

        for (SubService sub : subServices) {
            // Chỉ tạo step khi estimatedDayOffset = 1
            Integer offset = sub.getEstimatedDayOffset() != null ? sub.getEstimatedDayOffset() : 1;
            if (!Integer.valueOf(1).equals(offset)) {
                continue;
            }

            // Ngày thực hiện: cộng (offset-1) ngày vào startDate (ở đây offset luôn là 1 => performedAt = startDate)
            LocalDateTime performedAt = startDate;

            BookingStep step = new BookingStep();
            step.setBookId(bookId);
            step.setSubId(sub.getSubId());
            step.setPerformedAt(performedAt);
            // result, note, drugId để null
            // Set stepStatus mặc định là "inactive" đúng với DB
            step.setStepStatus("inactive");

            bookingStepRepo.save(step);
        }

    }

    public VisitSubService getSubServicesForBooking(Integer bookId) {
        // 1. Lấy booking để biết customer
        Booking booking = bookingRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking với ID = " + bookId));

        // 2. Tính "lần khám thứ mấy" dựa trên thứ tự bookId tăng dần
        List<Booking> customerBookings = bookingRepo.findByCusIdOrderByBookIdAsc(booking.getCusId());
        int visitNumber = IntStream.range(0, customerBookings.size())
                .filter(i -> customerBookings.get(i).getBookId().equals(bookId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking trong danh sách của customer")) + 1;

        // 3. Lấy danh sách BookingStep (KHÔNG join)
        List<BookingStep> steps = bookingStepRepo.findByBookId(bookId);

        // 4. Lấy tất cả subId
        List<Integer> subIds = steps.stream().map(BookingStep::getSubId).collect(Collectors.toList());

        // 5. Lấy tất cả SubService theo subIds (1 lần query)
        List<SubService> subServices = subServiceRepo.findAllById(subIds);

        // 6. Map subId -> SubService
        Map<Integer, SubService> subServiceMap = subServices.stream()
                .collect(Collectors.toMap(SubService::getSubId, ss -> ss));

        // 7. Group lại theo estimatedDayOffset
        Map<Integer, List<SubService>> subServicesGrouped = steps.stream()
                .map(step -> subServiceMap.get(step.getSubId()))
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.groupingBy(
                        SubService::getEstimatedDayOffset,
                        TreeMap::new,
                    Collectors.toList()
            ));

        return new VisitSubService(bookId, visitNumber, subServicesGrouped);
    }

    public boolean updateBookingStepWithBooking(Integer bookId, Integer subId, BookingStep req) {
        Optional<BookingStep> existingStep = bookingStepRepo.findByBookIdAndSubId(bookId, subId);
        if (!existingStep.isPresent()) return false;

        existingStep.get().setPerformedAt(req.getPerformedAt());
        existingStep.get().setResult(req.getResult());
        existingStep.get().setNote(req.getNote());
        existingStep.get().setStepStatus(req.getStepStatus());

        bookingStepRepo.save(existingStep.get());
        return true;
    }

    public List<TestResult> getTestResultsForBooking(Integer bookId) {
        Booking booking = bookingRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking với ID = " + bookId));
        Integer serId = booking.getSerId();

        // Lấy tất cả subService thuộc service này, tên chứa "Xét nghiệm"
        List<SubService> testSubs = subServiceRepo.findTestSubServices(serId, "Xét nghiệm");

        // Lấy bookingSteps hiện tại của booking này (map subId -> step)
        List<BookingStep> steps = bookingStepRepo.findByBookId(bookId);
        Map<Integer, BookingStep> subIdToStep = steps.stream()
                .collect(Collectors.toMap(BookingStep::getSubId, s -> s));

        List<TestResult> result = new ArrayList<>();
        ObjectMapper mapper = new ObjectMapper();

        for (SubService sub : testSubs) {
            BookingStep step = subIdToStep.get(sub.getSubId());
            TestResult tr = new TestResult();
            tr.setSubId(sub.getSubId());
            tr.setSubName(sub.getSubName());
            if (step != null) {
                tr.setBookingStepId(step.getBookingStepId());
                tr.setPerformedAt(step.getPerformedAt());
                tr.setNote(step.getNote());
                tr.setStepStatus(step.getStepStatus());
                // Parse result JSON
                List<TestResult.IndexResult> list = new ArrayList<>();
                if (step.getResult() != null && !step.getResult().isBlank()) {
                    try {
                        list = mapper.readValue(step.getResult(), new TypeReference<List<TestResult.IndexResult>>() {});
                    } catch (Exception ignored) {}
                }
                tr.setResults(list);
            } else {
                tr.setBookingStepId(null);
                tr.setPerformedAt(null);
                tr.setNote("");
                tr.setStepStatus("pending");
                tr.setResults(new ArrayList<>());
            }
            result.add(tr);
        }
        return result;
    }


    @Transactional
    public void saveTestResults(List<TestResult> testResults) throws Exception {
        System.out.println("🔍 DEBUG: saveTestResults called with " + testResults.size() + " test results");
        
        for (TestResult dto : testResults) {
            System.out.println("🔍 DEBUG: Processing test result: " + dto);
            
            // Chỉ lưu nếu status là pending hoặc completed
            if (!"pending".equalsIgnoreCase(dto.getStepStatus())
                && !"completed".equalsIgnoreCase(dto.getStepStatus())) {
                    System.out.println("⚠️ DEBUG: Skipping test result with status: " + dto.getStepStatus());
                    continue; // Bỏ qua
            }

            BookingStep step = null;
            if (dto.getBookingStepId() != null) {
                // Đã có, update
                step = bookingStepRepo.findById(dto.getBookingStepId()).orElse(null);
                System.out.println("🔍 DEBUG: Found existing step: " + step);
            }
            if (step == null) {
                // Chưa có, tạo mới
                step = new BookingStep();
                step.setSubId(dto.getSubId());
                // Use bookId from the DTO
                if (dto.getBookId() != null) {
                    step.setBookId(dto.getBookId());
                    System.out.println("🔍 DEBUG: Using bookId from DTO: " + dto.getBookId());
                } else {
                    System.out.println("❌ DEBUG: No bookId provided in DTO for subId: " + dto.getSubId());
                    continue; // Skip this test result if we don't have bookId
                }
                System.out.println("🔍 DEBUG: Created new step: " + step);
            }
            // Update fields
            step.setPerformedAt(dto.getPerformedAt());
            step.setStepStatus(dto.getStepStatus());
            step.setNote(dto.getNote());
            // Serialize results list thành JSON string
            ObjectMapper mapper = new ObjectMapper();
            String json = mapper.writeValueAsString(dto.getResults());
            step.setResult(json);
            
            System.out.println("🔍 DEBUG: Saving step with result JSON: " + json);

            BookingStep savedStep = bookingStepRepo.save(step);
            System.out.println("✅ DEBUG: Step saved successfully: " + savedStep);
        }
    }


    public boolean setStepPending(Integer bookId, Integer subId, Map<String, Object> reqBody) {
        Optional<BookingStep> stepOpt = bookingStepRepo.findByBookIdAndSubId(bookId, subId);
        if (stepOpt.isEmpty()) return false;

        BookingStep step = stepOpt.get();

        // Update từng field nếu có trong body
        if (reqBody.containsKey("stepStatus")) {
            step.setStepStatus((String) reqBody.get("stepStatus"));
        }
        if (reqBody.containsKey("note")) {
            step.setNote((String) reqBody.get("note"));
        }
        if (reqBody.containsKey("performedAt")) {
            String performedAtStr = (String) reqBody.get("performedAt");
            if (performedAtStr != null && !performedAtStr.isBlank()) {
                try {
                    // Xử lý cả dạng có "Z" hoặc không có
                    step.setPerformedAt(java.time.OffsetDateTime.parse(performedAtStr).toLocalDateTime());
                } catch (Exception e) {
                    // Nếu vẫn fail (do định dạng khác), thử loại bỏ "Z" ở cuối và parse lại
                    step.setPerformedAt(java.time.LocalDateTime.parse(performedAtStr.replace("Z", "")));
                }
            }
        }

        bookingStepRepo.save(step);
        return true;
    }

        public List<BookingWithStepsAndDrug> getBookingsWithStepsAndDrugByRecordId(Integer recordId) {
        List<Integer> bookIds = medicalRecordBookingRepo.findByIdRecordId(recordId)
                .stream().map(link -> link.getId().getBookId()).toList();

        List<BookingWithStepsAndDrug> result = new ArrayList<>();
        for (Integer bookId : bookIds) {
            // Lấy các step
            List<BookingStep> steps = bookingStepRepo.findByBookId(bookId);
            List<BookingWithStepsAndDrug.BookingStepDTO> stepDTOs = steps.stream().map(step -> {
                String subName = subServiceRepo.findById(step.getSubId())
                        .map(sub -> sub.getSubName()).orElse("Không rõ");
                String performedAt = step.getPerformedAt() != null ? step.getPerformedAt().toString() : null;
                return new BookingWithStepsAndDrug.BookingStepDTO(
                        subName,
                        performedAt,
                        step.getResult(),
                        step.getNote(),
                        step.getStepStatus()
                );
            }).toList();

            // Lấy drugId & danh sách drugItem (nếu có)
        Drug drug = drugRepo.findByBookId(bookId).orElse(null); // Phải có findByBookId trong DrugRepository
        Integer drugId = drug != null ? drug.getDrugId() : null;
        List<DrugItemDTO> drugItemDTOs = new ArrayList<>();
        if (drugId != null) {
            List<DrugItem> drugItems = drugItemRepo.findByDrugId(drugId);
            drugItemDTOs = drugItems.stream().map(item ->
                new DrugItemDTO(
                    item.getDrugItemId(),
                    item.getDrugName(),
                    item.getDosage(),
                    item.getFrequency(),
                    item.getDuration(),
                    item.getDrugItemNote()
                )
            ).toList();
        }
            result.add(new BookingWithStepsAndDrug(bookId, stepDTOs, drugId, drugItemDTOs));
        }
        return result;
    }    
}
