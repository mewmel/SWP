package com.example.project.service;

import com.example.project.dto.PatientDashboardDto;
import com.example.project.dto.PatientProfileDto;
import com.example.project.entity.Booking;
import com.example.project.entity.Doctor;
import com.example.project.entity.BookingStep;
import com.example.project.entity.SubService;
import com.example.project.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class PatientProfileService {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private BookingStepRepository bookingStepRepository;
    @Autowired
    private ServiceRepository serviceRepository;
    @Autowired
    private SubServiceRepository subServiceRepository;

    public PatientProfileDto getPatientProfile(Integer cusId) {
        List<Booking> bookings = bookingRepository.findByCusIdOrderByCreatedAtDesc(cusId);
        if (bookings.isEmpty()) throw new RuntimeException("Không có booking nào!");

        Booking latestBooking = bookings.get(0);
        LocalDateTime ngayDangKy = latestBooking.getCreatedAt();

        String bacSiPhuTrach = doctorRepository.findById(latestBooking.getDocId())
                .map(Doctor::getDocFullName)
                .orElse("Không xác định");

        Integer latestBookingId = latestBooking.getBookId();
        List<BookingStep> stepsOfLatestBooking = bookingStepRepository.findByBookId(latestBookingId);

        // Chỉ tính các bước đã đến ngày (performedAt <= hiện tại)
        LocalDateTime now = LocalDateTime.now();
        long chuKyHienTai = stepsOfLatestBooking.stream()
                .filter(step -> step.getPerformedAt() != null && !step.getPerformedAt().isAfter(now))
                .count();

        return new PatientProfileDto(
                cusId,
                ngayDangKy,
                bacSiPhuTrach,
                (int) chuKyHienTai
        );
    }

    public PatientDashboardDto getPatientDashboard(Integer cusId) {
        // 1. Lấy booking mới nhất của bệnh nhân
        List<Booking> bookings = bookingRepository.findByCusIdOrderByCreatedAtDesc(cusId);
        if (bookings.isEmpty()) {
            return new PatientDashboardDto(null, null, null, null);
        }
        Booking latestBooking = bookings.get(0);

        // 2. Lấy tên dịch vụ từ entity Service (dùng tên đầy đủ để tránh trùng với annotation)
        String treatmentName = null;
        if (latestBooking.getSerId() != null) {
            Optional<com.example.project.entity.Service> serviceOpt = serviceRepository.findById(latestBooking.getSerId());
            if (serviceOpt.isPresent()) {
                treatmentName = serviceOpt.get().getSerName();
            }
        }

        // 3. Lấy các bước (BookingStep) của booking hiện tại
        List<BookingStep> steps = bookingStepRepository.findByBookId(latestBooking.getBookId());

        // 4. Lọc các bước đã đến ngày (performedAt <= hiện tại)
        LocalDateTime now = LocalDateTime.now();
        long arrivedStepCount = steps.stream()
                .filter(step -> step.getPerformedAt() != null && !step.getPerformedAt().isAfter(now))
                .count();

        // Nếu chưa có bước nào đến ngày, thì giai đoạn = 0
        String treatmentStage = "Giai đoạn " + arrivedStepCount;

        // 5. Tìm step tiếp theo (performedAt > hiện tại, gần nhất)
        Optional<BookingStep> nextStepOpt = steps.stream()
                .filter(step -> step.getPerformedAt() != null && step.getPerformedAt().isAfter(now))
                .sorted((a, b) -> a.getPerformedAt().compareTo(b.getPerformedAt()))
                .findFirst();

        String nextEventDate = null;
        String nextEventType = null;
        if (nextStepOpt.isPresent()) {
            BookingStep nextStep = nextStepOpt.get();
            nextEventDate = nextStep.getPerformedAt().format(DateTimeFormatter.ofPattern("dd/MM"));

            // Lấy tên dịch vụ phụ từ SubService dựa vào subId
            if (nextStep.getSubId() != null) {
                Optional<SubService> subServiceOpt = subServiceRepository.findById(nextStep.getSubId());
                if (subServiceOpt.isPresent()) {
                    nextEventType = subServiceOpt.get().getSubName();
                }
            }
        }

        return new PatientDashboardDto(
                treatmentName,
                treatmentStage,
                nextEventDate,
                nextEventType
        );
    }
}