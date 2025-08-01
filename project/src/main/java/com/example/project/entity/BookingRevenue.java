package com.example.project.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "BookingRevenue")
public class BookingRevenue {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "revenueId")
    private Integer revenueId;
    
    @Column(name = "bookId", nullable = false)
    private Integer bookId;
    
    @Column(name = "serId", nullable = false)
    private Integer serId;
    
    @Column(name = "totalAmount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;
    
    @Column(name = "createdAt", nullable = false)
    private LocalDateTime createdAt;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bookId", insertable = false, updatable = false)
    private Booking booking;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serId", insertable = false, updatable = false)
    private Service service;
    
    // Constructors
    public BookingRevenue() {
        this.createdAt = LocalDateTime.now();
    }
    
    public BookingRevenue(Integer bookId, Integer serId, BigDecimal totalAmount) {
        this.bookId = bookId;
        this.serId = serId;
        this.totalAmount = totalAmount;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Integer getRevenueId() {
        return revenueId;
    }
    
    public void setRevenueId(Integer revenueId) {
        this.revenueId = revenueId;
    }
    
    public Integer getBookId() {
        return bookId;
    }
    
    public void setBookId(Integer bookId) {
        this.bookId = bookId;
    }
    
    public Integer getSerId() {
        return serId;
    }
    
    public void setSerId(Integer serId) {
        this.serId = serId;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public Booking getBooking() {
        return booking;
    }
    
    public void setBooking(Booking booking) {
        this.booking = booking;
    }
    
    public Service getService() {
        return service;
    }
    
    public void setService(Service service) {
        this.service = service;
    }
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
    
    @Override
    public String toString() {
        return "BookingRevenue{" +
                "revenueId=" + revenueId +
                ", bookId=" + bookId +
                ", serId=" + serId +
                ", totalAmount=" + totalAmount +
                ", createdAt=" + createdAt +
                '}';
    }
}
