package com.example.demo.controller;


import com.example.demo.entity.Customer;
import com.example.demo.repository.CustomerRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;

import java.io.UnsupportedEncodingException;

@Controller
public class LoginController {

    private final CustomerRepository customerRepository;

    public LoginController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }
    @PostMapping("/login")
    public String login(@RequestParam String username,
                        @RequestParam String password,
                        HttpSession session) throws UnsupportedEncodingException {
        Customer customer = customerRepository.findByCusEmailAndCusPassword(username, password).orElse(null);
        if (customer != null) {
            session.setAttribute("loggedInCustomer", customer);
            // Chuyển hướng về index.html kèm tên user
            return "redirect:/index.html?userName=" + java.net.URLEncoder.encode(customer.getCusFullName(), "UTF-8");
        } else {
            return "redirect:/index.html?error=true";
        }
    }
}