package com.example.project.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

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

    @Column(name = "cusEmail", length = 100)
    private String cusEmail;

    @Column(name = "cusPhone", length = 20)
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