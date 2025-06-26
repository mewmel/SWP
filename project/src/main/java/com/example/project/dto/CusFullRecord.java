package com.example.project.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor

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
    private MedicalRecord medicalRecord;
    private CurrentBooking currentBooking;

    

    @Getter
    @Setter
    public static class MedicalRecord {
    private String recordId;
    private String diagnosis;
    private String treatmentPlan;
    private String medicalNotes;     // đổi tên notes cho rõ nghĩa
    private String recordStatus;
    private String dischargeDate;
    }

    @Getter
    @Setter
    public static class CurrentBooking {
    private String bookType;
    private String bookStatus;
    private String note;
    private String serName;
    }
}
