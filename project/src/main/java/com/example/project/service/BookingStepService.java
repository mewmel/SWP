package com.example.project.service;

import com.example.project.entity.Booking;
import com.example.project.entity.BookingStep;
import com.example.project.entity.SubService;
import com.example.project.entity.WorkSlot;
import com.example.project.repository.BookingRepository;
import com.example.project.repository.BookingStepRepository;
import com.example.project.repository.SubServiceRepository;
import com.example.project.repository.WorkSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingStepService {
    @Autowired
    private BookingRepository bookingRepo;
    @Autowired
    private SubServiceRepository subServiceRepo;
    @Autowired
    private BookingStepRepository bookingStepRepo;
    @Autowired
    private WorkSlotRepository workSlotRepo;

    /**
     * Gọi khi booking được xác nhận (bookStatus = "confirmed")
     * Sẽ tạo các bước điều trị (BookingStep) theo danh sách SubService
     */
    public void createStepsForConfirmedBooking(Integer bookId) {
        Booking booking = bookingRepo.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));

        if (!"confirmed".equalsIgnoreCase(booking.getBookStatus())) {
            throw new IllegalStateException("Booking chưa ở trạng thái confirmed.");
        }

        // Lấy ngày bắt đầu điều trị từ WorkSlot
        WorkSlot slot = workSlotRepo.findById(booking.getSlotId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khung giờ khám"));
        LocalDate startDate = slot.getWorkDate();

        // Lấy danh sách subService theo serId
        List<SubService> subServices = subServiceRepo.findBySerId(booking.getSerId());

        for (SubService ss : subServices) {
            // Ngày thực hiện = ngày bắt đầu + (estimatedDayOffset - 1)
            int offset = (ss.getEstimatedDayOffset() != null) ? ss.getEstimatedDayOffset() : 1;
            LocalDate performedDate = startDate.plusDays(offset - 1);

            BookingStep step = new BookingStep();
            step.setBookId(bookId);
            step.setSubId(ss.getSubId());
            step.setPerformedAt(performedDate.atStartOfDay());
            // result, note, drugId để null mặc định

            bookingStepRepo.save(step);
        }
    }
}