package com.example.project.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;
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
import com.example.project.entity.Doctor;
import com.example.project.entity.WorkSlot;
import com.example.project.repository.BookingRepository;
import com.example.project.repository.CustomerRepository;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.ServiceRepository;
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
    @Autowired
    private DoctorRepository doctorRepo;
    @Autowired
    private ServiceRepository serviceRepo;

    public boolean createBookingAndAccount(BookingRequest req) {
        // Tìm Customer theo email và provider = 'local'
        Optional<Customer> optCustomer = customerRepo.findByCusEmailAndCusProvider(req.getEmail(), "local");
        Customer customer;
        boolean isNewAccount = false;
        String rawPassword = null;

        // === Lấy tên bác sĩ và dịch vụ ===
        String doctorName = "";
        String serviceName = "";

        // Lấy tên bác sĩ
        Optional<Doctor> optDoctor = doctorRepo.findById(req.getDocId());
        doctorName = optDoctor.map(Doctor::getDocFullName).orElse("Không xác định");

        Optional<com.example.project.entity.Service> optService = serviceRepo.findById(req.getSerId());
        serviceName = optService.map(s -> s.getSerName()).orElse("Không xác định");

        // Tạo customer mới nếu chưa có
        if (optCustomer.isEmpty()) {
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
            isNewAccount = true;
        } else {
            // Gửi email xác nhận đặt lịch (không gửi mật khẩu)
            customer = optCustomer.get();
        }

        // ==== XỬ LÝ CHUẨN DỮ LIỆU GIỜ ====
        String startTimeStr = req.getStartTime();
        String endTimeStr = req.getEndTime();

        if (startTimeStr != null) {
            startTimeStr = startTimeStr.trim();
            if (startTimeStr.length() == 8)
                startTimeStr = startTimeStr.substring(0, 5);
        }
        if (endTimeStr != null) {
            endTimeStr = endTimeStr.trim();
            if (endTimeStr.length() == 8)
                endTimeStr = endTimeStr.substring(0, 5);
        }

        LocalDate workDate = LocalDate.parse(req.getAppointmentDate());
        LocalTime startTime = LocalTime.parse(startTimeStr);
        LocalTime endTime = LocalTime.parse(endTimeStr);

        // Tìm WorkSlot
        Optional<WorkSlot> optSlot = workSlotRepo.findSlotNative(
                req.getDocId(),
                workDate,
                startTime.toString(),
                endTime.toString());
        if (optSlot.isEmpty()) {
            // Không gửi mail khi đặt lịch thất bại
            throw new RuntimeException("Không tìm thấy khung giờ phù hợp!");
        }

        WorkSlot slot = optSlot.get();

        // Tạo booking
        Booking booking = new Booking();
        booking.setCusId(customer.getCusId());
        booking.setDocId(req.getDocId());
        booking.setSlotId(slot.getSlotId());
        booking.setSerId(req.getSerId());
        booking.setBookType(req.getBookType());
        booking.setBookStatus("pending");
        booking.setCreatedAt(LocalDateTime.of(workDate, startTime));
        booking.setNote(req.getNote());

        // Chỉ gửi mail khi booking save thành công
        bookingRepo.save(booking);

        if (isNewAccount) {
            sendNewAccountAndBookingEmail(customer, rawPassword, req, doctorName, serviceName);
        } else {
            sendBookingConfirmationEmail(customer, req, doctorName, serviceName);
        }

        return isNewAccount;
    }

    // Gửi email cho tài khoản mới và xác nhận đặt lịch (có mật khẩu)
    private void sendNewAccountAndBookingEmail(Customer customer, String password, BookingRequest req,
            String doctorName, String serviceName) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(customer.getCusEmail());
        msg.setSubject("Tạo tài khoản & Đặt lịch thành công trên FertilityEHR");

        StringBuilder body = new StringBuilder();
        body.append("Bạn đã được tạo tài khoản tự động trên hệ thống phòng khám FertilityEHR.\n")
                .append("Email đăng nhập: ").append(customer.getCusEmail()).append("\n")
                .append("Mật khẩu: ").append(password).append("\n")
                .append("Vui lòng đăng nhập và đổi mật khẩu sau khi nhận được email này.\n\n")
                .append("THÔNG TIN ĐẶT LỊCH KHÁM:\n")
                .append(formatBookingInfo(req, doctorName, serviceName));
        msg.setText(body.toString());
        mailSender.send(msg);
    }

    // Gửi email xác nhận đặt lịch (không gửi tài khoản/mật khẩu)
    private void sendBookingConfirmationEmail(Customer customer, BookingRequest req, String doctorName,
            String serviceName) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(customer.getCusEmail());
        msg.setSubject("Xác nhận đặt lịch khám trên FertilityEHR");
        StringBuilder body = new StringBuilder();
        body.append("Bạn đã đặt lịch khám thành công trên hệ thống phòng khám FertilityEHR.\n\n")
                .append("THÔNG TIN ĐẶT LỊCH KHÁM:\n")
                .append(formatBookingInfo(req, doctorName, serviceName));
        msg.setText(body.toString());
        mailSender.send(msg);
    }

    // Format thông tin đặt lịch gửi qua email
    private String formatBookingInfo(BookingRequest req, String doctorName, String serviceName) {
        StringBuilder sb = new StringBuilder();
        sb.append("Họ tên: ").append(req.getFullName()).append("\n");
        sb.append("Số điện thoại: ").append(req.getPhone()).append("\n");
        sb.append("Ngày sinh: ").append(req.getDob()).append("\n");
        sb.append("Ngày khám: ").append(req.getAppointmentDate()).append("\n");
        sb.append("Khung giờ: ").append(req.getStartTime()).append(" - ").append(req.getEndTime()).append("\n");
        sb.append("Bác sĩ: ").append(doctorName).append("\n");
        sb.append("Dịch vụ: ").append(serviceName).append("\n");
        sb.append("Ghi chú: ").append(req.getNote() == null ? "" : req.getNote()).append("\n");
        return sb.toString();
    }

    // Cập nhật ghi chú và trạng thái booking
    public boolean updateNoteAndStatus(Integer bookId, String status, String note) {
        Optional<Booking> optBooking = bookingRepo.findById(bookId);
        if (optBooking.isPresent()) {
            Booking booking = optBooking.get();
            booking.setBookStatus(status);
            booking.setNote(note);
            bookingRepo.save(booking);
            return true;
        }
        return false;
    }

    // Cập nhật trạng thái booking
    public boolean updateStatus(Integer bookId, String status) {
        Optional<Booking> optBooking = bookingRepo.findById(bookId);
        if (optBooking.isPresent()) {
            Booking booking = optBooking.get();
            // Validate status value
            booking.setBookStatus(status);
            bookingRepo.save(booking);
            return true;
        }
        return false; // Booking không tồn tại
    }

    // Hàm xử lý tạo booking + gửi mail
    public Integer createFollowUpBooking(Map<String, Object> bookingData) {
        // 1. Tạo Booking
        Booking booking = new Booking();
        booking.setCusId((Integer) bookingData.get("cusId"));
        booking.setDocId((Integer) bookingData.get("docId"));
        booking.setSlotId((Integer) bookingData.get("slotId"));
        booking.setNote((String) bookingData.get("note"));
        booking.setBookType((String) bookingData.get("bookType")); // "follow-up"
        booking.setSerId((Integer) bookingData.get("serId"));
        booking.setBookStatus("confirmed");
        booking.setCreatedAt(LocalDateTime.now());

        String workDate = (String) bookingData.get("workDate");
        String startTime = (String) bookingData.get("startTime");
        String endTime = (String) bookingData.get("endTime");

        Booking saved = bookingRepo.save(booking);

        // 2. Gửi email cho bệnh nhân
        Customer customer = customerRepo.findById(booking.getCusId()).orElse(null);
        Doctor doctor = doctorRepo.findById(booking.getDocId()).orElse(null);
        com.example.project.entity.Service service = serviceRepo.findById(booking.getSerId()).orElse(null);

        if (customer != null && doctor != null) {
            sendFollowUpBookingEmail(saved, customer, doctor, service, workDate, startTime, endTime);
        }

        return saved.getBookId();
    }

        private void sendFollowUpBookingEmail(
            Booking booking, Customer customer, Doctor doctor,
            com.example.project.entity.Service service,
            String workDate, String startTime, String endTime
    ) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(customer.getCusEmail());
        message.setSubject("Thông báo lịch tái khám mới");

        // Format ngày giờ nếu cần (hoặc dùng raw)
        String thoiGian = (workDate != null && startTime != null && endTime != null)
            ? (workDate + " (" + startTime + " - " + endTime + ")")
            : (booking.getCreatedAt() == null ? "" : booking.getCreatedAt().toString());

        message.setText(
            String.format(
                "Chào bạn %s,\n\n"
                + "Bác sĩ %s đã đặt lịch tái khám cho bạn tại phòng khám.\n\n"
                + "Thông tin chi tiết:\n"
                + "- Thời gian: %s\n"
                + "- Dịch vụ: %s\n"
                + "- Ghi chú: %s\n\n"
                + "Vui lòng kiểm tra lại lịch cá nhân và đến đúng giờ hẹn.\n"
                + "Xin cảm ơn!",
                customer.getCusFullName(),
                doctor.getDocFullName(),
                thoiGian,
                service == null ? "" : service.getSerName(),
                booking.getNote() == null ? "" : booking.getNote()
            )
        );
        mailSender.send(message);
    }

}