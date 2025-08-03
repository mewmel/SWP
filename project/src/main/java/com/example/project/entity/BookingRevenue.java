package com.example.project.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "BookingRevenue")
public class BookingRevenue {
    
    // Enum for revenue status
    public enum RevenueStatus {
        pending, success
    }
    
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
    
    @Column(name = "imageId")
    private Integer imageId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "revenueStatus", nullable = false, length = 20)
    private RevenueStatus revenueStatus = RevenueStatus.pending;
    
    @Column(name = "createdAt", nullable = false)
    private LocalDateTime createdAt;
    
    // Relationships - Commented out to avoid lazy loading issues
    /*
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bookId", insertable = false, updatable = false)
    private Booking booking;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serId", insertable = false, updatable = false)
    private Service service;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "imageId", insertable = false, updatable = false)
    private Image image;
    */
    
    // Constructors
    public BookingRevenue() {
        this.revenueStatus = RevenueStatus.pending;
        this.createdAt = LocalDateTime.now();
    }
    
    public BookingRevenue(Integer bookId, Integer serId, BigDecimal totalAmount) {
        this.bookId = bookId;
        this.serId = serId;
        this.totalAmount = totalAmount;
        this.revenueStatus = RevenueStatus.pending;
        this.createdAt = LocalDateTime.now();
    }
    
    public BookingRevenue(Integer bookId, Integer serId, BigDecimal totalAmount, Integer imageId) {
        this.bookId = bookId;
        this.serId = serId;
        this.totalAmount = totalAmount;
        this.imageId = imageId;
        this.revenueStatus = RevenueStatus.pending;
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
    
    public Integer getImageId() {
        return imageId;
    }
    
    public void setImageId(Integer imageId) {
        this.imageId = imageId;
    }
    
    public RevenueStatus getRevenueStatus() {
        return revenueStatus;
    }
    
    public void setRevenueStatus(RevenueStatus revenueStatus) {
        this.revenueStatus = revenueStatus;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    /*
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
    
    public Image getImage() {
        return image;
    }
    
    public void setImage(Image image) {
        this.image = image;
    }
    */
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (revenueStatus == null) {
            revenueStatus = RevenueStatus.pending;
        }
    }
    
    @Override
    public String toString() {
        return "BookingRevenue{" +
                "revenueId=" + revenueId +
                ", bookId=" + bookId +
                ", serId=" + serId +
                ", totalAmount=" + totalAmount +
                ", imageId=" + imageId +
                ", revenueStatus=" + revenueStatus +
                ", createdAt=" + createdAt +
                '}';
    }
}
