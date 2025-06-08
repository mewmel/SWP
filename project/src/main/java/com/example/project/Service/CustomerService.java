package com.example.project.Service;

import com.example.project.dto.LoginRequest;
import com.example.project.dto.RegisterRequest;
import com.example.project.entity.Customer;
import com.example.project.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Optional<Customer> login(LoginRequest request) {
        Optional<Customer> customerOpt = customerRepository.findByCusEmail(request.getCusEmail());
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            // So sánh mật khẩu đã mã hóa
            if (passwordEncoder.matches(request.getCusPassword(), customer.getCusPassword())) {
                return Optional.of(customer);
            }
        }
        return Optional.empty();
    }

    // HÀM ĐĂNG KÝ ĐÃ CHỈNH SỬA
    public String register(RegisterRequest req) {
        if (req.getCusFullName() == null || req.getCusFullName().isEmpty()
                || req.getCusEmail() == null || req.getCusEmail().isEmpty()
                || req.getCusPassword() == null || req.getCusPassword().isEmpty()
                || req.getConfirmPassword() == null || req.getConfirmPassword().isEmpty()) {
            return "Vui lòng nhập đầy đủ họ tên, email, mật khẩu và xác nhận mật khẩu!";
        }
        if (!req.getCusPassword().equals(req.getConfirmPassword())) {
            return "Mật khẩu xác nhận không khớp!";
        }
        if (customerRepository.findByCusEmail(req.getCusEmail()).isPresent()) {
            // Trả về mã đặc biệt để controller xử lý status 409
            return "email_exists";
        }

        Customer customer = new Customer();
        customer.setCusFullName(req.getCusFullName());
        customer.setCusEmail(req.getCusEmail());
        customer.setCusPassword(passwordEncoder.encode(req.getCusPassword()));
        customer.setCusGender(null);
        customer.setCusDate(null);
        customer.setCusPhone(null);
        customer.setCusAddress(null);
        customer.setCusStatus("active");

        customerRepository.save(customer);
        return "success";
    }
}