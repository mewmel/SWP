package com.example.project.dto;

import java.time.LocalDateTime;
import java.util.List;

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
    private Integer drugId; 
    private List<FullBookingWithStep> fullBookingWithStep;


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
    public static class FullBookingWithStep {
    private int bookId;
    private String bookType;
    private String bookStatus;
    private String note;
    private String serName;
    private List<String> subName; // Danh sách các bước trong booking này
    }

}