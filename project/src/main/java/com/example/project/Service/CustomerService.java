package com.example.project.service;

import java.time.LocalDate;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.project.dto.LoginRequest;
import com.example.project.dto.RegisterRequest;
import com.example.project.entity.Customer;
import com.example.project.repository.CustomerRepository;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OtpService otpService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Optional<Customer> login(LoginRequest request) {
        Optional<Customer> customerOpt = customerRepository.findByCusEmail(request.getCusEmail());
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            if (passwordEncoder.matches(request.getCusPassword(), customer.getCusPassword())) {
                return Optional.of(customer);
            }
        }
        return Optional.empty();
    }

    public String register(RegisterRequest req) {
        // Validate
        if (req.getCusFullName() == null || req.getCusFullName().isEmpty()
                || req.getCusEmail() == null || req.getCusEmail().isEmpty()
                || req.getCusPassword() == null || req.getCusPassword().isEmpty()
                || req.getConfirmPassword() == null || req.getConfirmPassword().isEmpty()
                || req.getCusPhone() == null || req.getCusPhone().isEmpty()
                || req.getCusDob() == null || req.getCusDob().isEmpty()) {
            return "Vui lòng nhập đầy đủ tất cả các trường!";
        }
        if (!isValidEmail(req.getCusEmail())) {
            return "Email không hợp lệ!";
        }
        if (!isValidPhone(req.getCusPhone())) {
            return "Số điện thoại không hợp lệ!";
        }
        if (!req.getCusPassword().equals(req.getConfirmPassword())) {
            return "Mật khẩu xác nhận không khớp!";
        }
        if (customerRepository.findByCusEmail(req.getCusEmail()).isPresent()) {
            return "email_exists";
        }

        LocalDate dob = null;
        try {
            dob = LocalDate.parse(req.getCusDob());
        } catch (Exception ex) {
            return "Ngày sinh không hợp lệ!";
        }

        Customer customer = new Customer();
        customer.setCusFullName(req.getCusFullName());
        customer.setCusEmail(req.getCusEmail());
        customer.setCusPassword(passwordEncoder.encode(req.getCusPassword()));
        customer.setCusPhone(req.getCusPhone());
        customer.setCusDate(dob);
        customer.setCusGender(null);
        customer.setCusAddress(null);
        customer.setCusStatus("active"); // chỉ set là  "active" hoặc "inactive"

        customerRepository.save(customer);
        return "success";
    }
    public Customer updateCustomer(Integer cusId, Customer updatedData) {
    Optional<Customer> customerOpt = customerRepository.findByCusId(cusId);
    if (!customerOpt.isPresent()) return null;
    Customer customer = customerOpt.get();

    // tạm chưa cho update email và password!
    customer.setCusFullName(updatedData.getCusFullName());
    customer.setCusGender(updatedData.getCusGender());
    customer.setCusDate(updatedData.getCusDate());
    customer.setCusPhone(updatedData.getCusPhone());
    customer.setCusOccupation(updatedData.getCusOccupation());
    customer.setCusAddress(updatedData.getCusAddress());
    customer.setEmergencyContact(updatedData.getEmergencyContact());

    // Có thể validate số điện thoại, ngày sinh... nếu muốn

    return customerRepository.save(customer);
}

    // Hàm verify mật khẩu hiện tại theo ID
    public boolean verifyCurrentPassword(Integer cusId, String currentPassword) {
        Optional<Customer> customerOpt = customerRepository.findById(cusId);
        if (!customerOpt.isPresent()) {
            return false;
        }
        
        Customer customer = customerOpt.get();
        return passwordEncoder.matches(currentPassword, customer.getCusPassword());
    }

public boolean verifyOtp(String cusEmail, String otp) {
    // 1. Tìm customerId từ email
    Optional<Customer> customerOpt = customerRepository.findByCusEmail(cusEmail);
    if (!customerOpt.isPresent()) {
        return false; // Không tìm thấy khách hàng
    }
    Integer customerId = customerOpt.get().getCusId();
    // 2. Gọi sang OtpService để xác thực OTP
    return otpService.verifyOtp(customerId, otp);
}

// Hàm đổi mật khẩu theo email
    public String changeCusPassword(String cusEmail, String currentPassword, String newPassword, String otp) {
        Optional<Customer> customerOpt = customerRepository.findByCusEmail(cusEmail);
        if (!customerOpt.isPresent()) {
            return "Không tìm thấy khách hàng!";
        }
        
        Customer customer = customerOpt.get();
        Integer cusId = customer.getCusId();

        // 3. Nếu chưa có otp → gửi và trả về OTP_SENT
        if (otp == null || otp.isBlank()) {
            otpService.sendOtp(cusId, cusEmail);
            return "OTP_SENT";
        }

        // 4. Nếu có otp → verify qua otpService
        if (!otpService.verifyOtp(cusId, otp)) {
            return "OTP không hợp lệ hoặc đã hết hạn!";
        }
        
        // Kiểm tra mật khẩu mới có đủ mạnh không (tùy chọn)
        if (newPassword.length() < 6) {
            return "Mật khẩu mới phải có ít nhất 6 ký tự!";
        }
        
        // Cập nhật mật khẩu mới
        customer.setCusPassword(passwordEncoder.encode(newPassword));
        customerRepository.save(customer);
        return "success";
    }

    private boolean isValidEmail(String email) {
        return Pattern.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", email);
    }
    private boolean isValidPhone(String phone) {
        return Pattern.matches("^(0|\\+84)\\d{9,10}$", phone);
    }

    public Customer findOrCreateGoogleUser(String email, String name) {
        Optional<Customer> customerOpt = customerRepository.findByCusEmail(email);
        if (customerOpt.isPresent()) {
            return customerOpt.get();
        } else {
            Customer customer = new Customer();
            customer.setCusFullName(name);
            customer.setCusEmail(email);
            customer.setCusStatus("active");
            customerRepository.save(customer);
            return customer;
        }
    }
}
