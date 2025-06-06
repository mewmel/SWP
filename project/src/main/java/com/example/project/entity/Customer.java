package com.example.project.entity;

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
    @Column(name = "cusId")
    private String cusId;

    @Column(name = "cusfullName")
    private String cusFullName;

    @Column(name = "cusGender")
    private String cusGender;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Column(name = "cusDate")
    private LocalDate cusDate;

    @Column(name = "cusEmail")
    private String cusEmail; // <--- PHẢI LÀ camelCase

    @Column(name = "cusPhone")
    private String cusPhone;

    @Column(name = "cusPassword")
    private String cusPassword; // <--- PHẢI LÀ camelCase

    @Column(name = "cusAddress")
    private String cusAddress;

    @Column(name = "cusStatus")
    private String cusStatus;
}
