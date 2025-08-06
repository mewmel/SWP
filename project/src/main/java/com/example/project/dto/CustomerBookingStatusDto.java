package com.example.project.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CustomerBookingStatusDto {
    private String status; // "can_book", "has_active_medical_record", "has_pending_booking"
    private String message;
    
    // Thông tin medical record nếu có
    private Integer recordId;
    private Integer docId;
    private String docFullName;
    private String docEmail;
    private String docPhone;
    private Integer serId;
    private String serviceName;
    private String diagnosis;
    private String treatmentPlan;
    private String createdAt;
    private String note;
    
    // Thông tin booking pending nếu có
    private Integer bookId;
    private String bookStatus;
    private String bookCreatedAt;
    private String appointmentDate;
    
    // Constructor cho trường hợp có thể đặt lịch
    public CustomerBookingStatusDto(String status, String message) {
        this.status = status;
        this.message = message;
    }
}
