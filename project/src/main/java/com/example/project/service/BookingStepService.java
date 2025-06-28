package com.example.project.service;

import com.example.project.entity.Booking;
import com.example.project.entity.BookingStep;
import com.example.project.entity.SubService;
import com.example.project.repository.BookingRepository;
import com.example.project.repository.BookingStepRepository;
import com.example.project.repository.SubServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDateTime;

@Service
public class BookingStepService {
    @Autowired
    private BookingRepository bookingRepo;
    @Autowired
    private SubServiceRepository subServiceRepo;
    @Autowired
    private BookingStepRepository bookingStepRepo;

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
            // Nếu subService không cùng serId với booking thì dừng luôn
            if (!sub.getSerId().equals(booking.getSerId())) {
                break;
            }

            Integer offset = sub.getEstimatedDayOffset() != null ? sub.getEstimatedDayOffset() : 1;
            // Ngày thực hiện: cộng (offset-1) ngày vào startDate
            LocalDateTime performedAt = startDate.plusDays(offset - 1);

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
}