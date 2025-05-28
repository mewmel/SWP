package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Setter
@Getter
@Entity
@Table(name = "Customer")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cusId;

    private String cusFullName;
    private Boolean cusGender;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate cusDate;

    private String cusEmail;
    private String cusPhone;
    private String cusPassword;
    private String cusAddress;
    private Boolean cusStatus;

    // Getters và Setters

}

