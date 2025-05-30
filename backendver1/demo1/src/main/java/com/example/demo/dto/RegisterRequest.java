package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
public class RegisterRequest {
    private String fullName;
    private String  gender;
    private LocalDate dob;
    private String email;
    private String phone;
    private String password;
    private String address;
    // Getters và Setters

}
