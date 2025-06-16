package com.example.project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

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