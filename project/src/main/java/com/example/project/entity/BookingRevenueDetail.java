package com.example.project.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "BookingRevenueDetail")
public class BookingRevenueDetail {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "revenueDetailId")
    private Integer revenueDetailId;
    
    @Column(name = "bookId", nullable = false)
    private Integer bookId;
    
    @Column(name = "serId", nullable = false)
    private Integer serId;
    
    @Column(name = "subId", nullable = false)
    private Integer subId;
    
    @Column(name = "subPrice", nullable = false, precision = 12, scale = 2)
    private BigDecimal subPrice;
    
    @Column(name = "createdAt", nullable = false)
    private LocalDateTime createdAt;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bookId", insertable = false, updatable = false)
    private Booking booking;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serId", insertable = false, updatable = false)
    private Service service;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subId", insertable = false, updatable = false)
    private SubService subService;
    
    // Constructors
    public BookingRevenueDetail() {
        this.createdAt = LocalDateTime.now();
    }
    
    public BookingRevenueDetail(Integer bookId, Integer serId, Integer subId, BigDecimal subPrice) {
        this.bookId = bookId;
        this.serId = serId;
        this.subId = subId;
        this.subPrice = subPrice;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Integer getRevenueDetailId() {
        return revenueDetailId;
    }
    
    public void setRevenueDetailId(Integer revenueDetailId) {
        this.revenueDetailId = revenueDetailId;
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
    
    public Integer getSubId() {
        return subId;
    }
    
    public void setSubId(Integer subId) {
        this.subId = subId;
    }
    
    public BigDecimal getSubPrice() {
        return subPrice;
    }
    
    public void setSubPrice(BigDecimal subPrice) {
        this.subPrice = subPrice;
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
    
    public SubService getSubService() {
        return subService;
    }
    
    public void setSubService(SubService subService) {
        this.subService = subService;
    }
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
    
    @Override
    public String toString() {
        return "BookingRevenueDetail{" +
                "revenueDetailId=" + revenueDetailId +
                ", bookId=" + bookId +
                ", serId=" + serId +
                ", subId=" + subId +
                ", subPrice=" + subPrice +
                ", createdAt=" + createdAt +
                '}';
    }
}
