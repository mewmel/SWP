package com.example.project.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.project.dto.BookingRequest;
import com.example.project.entity.Booking;
import com.example.project.entity.Customer;
import com.example.project.entity.WorkSlot;
import com.example.project.repository.BookingRepository;
import com.example.project.repository.CustomerRepository;
import com.example.project.repository.WorkSlotRepository;

@Service
public class BookingService {
    @Autowired
    private CustomerRepository customerRepo;
    @Autowired
    private BookingRepository bookingRepo;
    @Autowired
    private WorkSlotRepository workSlotRepo;
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public boolean createBookingAndAccount(BookingRequest req) {
        // Tìm Customer theo email và provider = 'local'
        Optional<Customer> optCustomer = customerRepo.findByCusEmailAndCusProvider(req.getEmail(), "local");
        Customer customer;
        boolean isNewAccount = false;
        String rawPassword = null;

        if (optCustomer.isEmpty()) {
            // Tạo mật khẩu ngẫu nhiên
            rawPassword = RandomStringUtils.randomAlphanumeric(8);
            customer = new Customer();
            customer.setCusFullName(req.getFullName());
            customer.setCusGender(req.getGender());
            customer.setCusDate(LocalDate.parse(req.getDob()));
            customer.setCusEmail(req.getEmail());
            customer.setCusPhone(req.getPhone());
            customer.setCusAddress(req.getAddress());
            customer.setCusOccupation(req.getOccupation());
            customer.setEmergencyContact(req.getEmergencyContact());
            customer.setCusStatus("active");
            customer.setCusProvider("local");
            customer.setCusPassword(passwordEncoder.encode(rawPassword));
            customerRepo.save(customer);
            // Gửi email
            sendPasswordEmail(customer.getCusEmail(), rawPassword);
            isNewAccount = true;
        } else {
            customer = optCustomer.get();
        }

        // ==== XỬ LÝ CHUẨN DỮ LIỆU GIỜ ĐỂ TRÁNH LỖI KIỂU DỮ LIỆU ====
        String startTimeStr = req.getStartTime();
        String endTimeStr = req.getEndTime();

        // Xử lý trường hợp FE gửi dư :00 hoặc thừa/khoảng trắng
        if (startTimeStr != null) {
            startTimeStr = startTimeStr.trim();
            if (startTimeStr.length() == 8) startTimeStr = startTimeStr.substring(0, 5);
        }
        if (endTimeStr != null) {
            endTimeStr = endTimeStr.trim();
            if (endTimeStr.length() == 8) endTimeStr = endTimeStr.substring(0, 5);
        }

        // Log để debug (có thể bỏ sau khi chạy ổn định)
        System.out.println("DEBUG startTime: '" + startTimeStr + "', endTime: '" + endTimeStr + "'");

        // Parse đúng kiểu LocalDate, LocalTime
        LocalDate workDate = LocalDate.parse(req.getAppointmentDate());
        LocalTime startTime = LocalTime.parse(startTimeStr);
        LocalTime endTime = LocalTime.parse(endTimeStr);

        // Log kiểu dữ liệu thực
        System.out.println("LocalTime start: " + startTime + " (" + startTime.getClass().getName() + ")");
        System.out.println("LocalTime end: " + endTime + " (" + endTime.getClass().getName() + ")");

        // Tìm WorkSlot
        Optional<WorkSlot> optSlot = workSlotRepo.findSlotNative(
                req.getDocId(),
                workDate,
                startTime.toString(), // "09:00"
                endTime.toString()    // "10:00"
        );
        if (optSlot.isEmpty()) {
            throw new RuntimeException("Không tìm thấy khung giờ phù hợp!");
        }

        WorkSlot slot = optSlot.get();

        // Tạo booking
        Booking booking = new Booking();
        booking.setCusId(customer.getCusId());
        booking.setDocId(req.getDocId());
        booking.setSlotId(slot.getSlotId());
        booking.setBookType(req.getBookType());
        booking.setBookStatus("booked");
        booking.setCreatedAt(LocalDateTime.now());
        booking.setNote(req.getNote());
        bookingRepo.save(booking);

        return isNewAccount;
    }

    private void sendPasswordEmail(String to, String password) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("Tài khoản mới trên FertilityEHR");
        msg.setText("Bạn đã được tạo tài khoản tự động trên hệ thống phòng khám FertilityEHR.\n"
                + "Tên đăng nhập: " + to
                + "\nMật khẩu: " + password
                + "\nVui lòng đăng nhập và đổi mật khẩu sau khi nhận được email này.");
        mailSender.send(msg);
    }
}