package com.example.project.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingRequest {
    private String fullName;
    private String gender;
    private String dob; // yyyy-MM-dd
    private String phone;
    private String email;
    private String address;
    private String occupation;
    private String emergencyContact;
    private Integer docId;
    private String appointmentDate; // yyyy-MM-dd
    private String startTime; // HH:mm
    private String endTime;   // HH:mm
    private String note;
    private String bookType; // "initial"|"follow-up"
    private Integer serId;   // <== BỔ SUNG: để truyền dịch vụ
}