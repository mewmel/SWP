package com.example.project.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class CusFullRecord {

    private Integer cusId;
    private String cusFullName;
    private String cusGender;
    private String cusDate;
    private String cusEmail;
    private String cusPhone;
    private String cusAddress;
    private String cusOccupation;
    private String emergencyContact;
    private String cusStatus;
    private CurrentMedicalRecord currentMedicalRecord;
    private CurrentBooking currentBooking;
    private Integer drugId; 
    // private DrugItemWithBooking currentDrugItem;
    
    
    @Getter
    @Setter
    public static class CurrentMedicalRecord {
    private int recordId;
    private String diagnosis;
    private String treatmentPlan;
    private String medicalNotes;     // đổi tên notes cho rõ nghĩa
    private String recordStatus;
    private LocalDateTime createdAt;
    private LocalDateTime dischargeDate;
    }

    @Getter
    @Setter
    public static class CurrentBooking {
    private int bookId;
    private String bookType;
    private String bookStatus;
    private String note;
    private String serName;
    }
}
