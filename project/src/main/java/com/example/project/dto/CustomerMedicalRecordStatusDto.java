package com.example.project.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CustomerMedicalRecordStatusDto {
    private boolean hasActiveMedicalRecord;
    private Integer recordId;
    private Integer cusId;
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
    
    // Constructor cho trường hợp không có active medical record
    public CustomerMedicalRecordStatusDto(boolean hasActiveMedicalRecord) {
        this.hasActiveMedicalRecord = hasActiveMedicalRecord;
    }
}
