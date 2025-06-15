package com.example.project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "Customer", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"cusEmail", "cusProvider"})
})
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cusId")
    private Integer cusId;

    @Column(name = "cusFullName", length = 100)
    private String cusFullName;

    @Column(name = "cusGender", length = 1)
    private String cusGender; // 'M' hoặc 'F'

    @Column(name = "cusDate")
    private LocalDate cusDate;

    @Column(name = "cusEmail", length = 100, nullable = false)
    private String cusEmail;

    @Column(name = "cusPhone", precision = 10)
    private String cusPhone;

    @Column(name = "cusPassword", length = 100)
    private String cusPassword;

    @Column(name = "cusAddress", length = 100)
    private String cusAddress;

    @Column(name = "cusStatus", length = 20, nullable = false)
    private String cusStatus;

    @Column(name = "cusOccupation", length = 100)
    private String cusOccupation;

    @Column(name = "emergencyContact", length = 100)
    private String emergencyContact;

    @Column(name = "cusProvider", length = 20, nullable = false)
    private String cusProvider = "local";
}