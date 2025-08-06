package com.example.project.entity;

import java.time.LocalDateTime;

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
@Table(name = "BookingStatusDetail")
public class BookingStatusDetail {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "statusDetailId")
    private Integer statusDetailId;

    @Column(name = "bookId", nullable = false)
    private Integer bookId;

    @Column(name = "checkInTime")
    private LocalDateTime checkInTime;

    @Column(name = "checkOutTime")
    private LocalDateTime checkOutTime;

    @Column(name = "prescriptionStatus", length = 20, nullable = false)
    private String prescriptionStatus = "pending";

    @Column(name = "revenueStatus", length = 20, nullable = false)
    private String revenueStatus = "pending";

    // Constructor
    public BookingStatusDetail() {}

    public BookingStatusDetail(Integer bookId) {
        this.bookId = bookId;
        this.prescriptionStatus = "pending";
        this.revenueStatus = "pending";
    }
}
