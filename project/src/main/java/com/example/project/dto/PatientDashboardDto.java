package com.example.project.dto;

public class PatientDashboardDto {
    private String treatmentName;
    private String treatmentStage;
    private String nextEventDate;
    private String nextEventType;

    public PatientDashboardDto() {}

    public PatientDashboardDto(String treatmentName, String treatmentStage, String nextEventDate, String nextEventType) {
        this.treatmentName = treatmentName;
        this.treatmentStage = treatmentStage;
        this.nextEventDate = nextEventDate;
        this.nextEventType = nextEventType;
    }

    public String getTreatmentName() { return treatmentName; }
    public void setTreatmentName(String treatmentName) { this.treatmentName = treatmentName; }

    public String getTreatmentStage() { return treatmentStage; }
    public void setTreatmentStage(String treatmentStage) { this.treatmentStage = treatmentStage; }

    public String getNextEventDate() { return nextEventDate; }
    public void setNextEventDate(String nextEventDate) { this.nextEventDate = nextEventDate; }

    public String getNextEventType() { return nextEventType; }
    public void setNextEventType(String nextEventType) { this.nextEventType = nextEventType; }
}