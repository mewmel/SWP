package com.example.project.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "Service")
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "serId")
    private Integer serId;

    @Column(name = "serName", length = 100)
    private String serName;

    @Column(name = "serDescription", length = 500)
    private String serDescription;

    @Column(name = "serPrice", precision = 12, scale = 2)
    private BigDecimal serPrice; // Dùng BigDecimal, không dùng Double/Float!

    @Column(name = "duration")
    private Integer duration;
}