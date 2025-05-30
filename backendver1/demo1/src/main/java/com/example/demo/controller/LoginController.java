package com.example.demo.controller;


import com.example.demo.entity.Customer;
import com.example.demo.repository.CustomerRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;

@Controller
public class LoginController {

    private final CustomerRepository customerRepository;

    public LoginController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }
    @PostMapping("/login")
    public String login(@RequestParam String username, // username là email
                        @RequestParam String password,
                        HttpSession session) {
        Customer customer = customerRepository.findByCusEmailAndCusPassword(username, password).orElse(null);
        if (customer != null) {
            session.setAttribute("loggedInCustomer", customer);

            return "redirect:/user-dashboard.html";// hoặc tên view phù hợp
        } else {
            return "redirect:/index.html";// trả về lại trang login nếu thất bại
        }
    }
}