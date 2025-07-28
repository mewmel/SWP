package com.example.project.dto;

import java.time.LocalDateTime;

public class BookingStepDto {
    private LocalDateTime performedAt;
    private String subName;
    private String stepStatus; // <-- Thêm trường này

    // Constructor mới
    public BookingStepDto(LocalDateTime performedAt, String subName, String stepStatus) {
        this.performedAt = performedAt;
        this.subName = subName;
        this.stepStatus = stepStatus;
    }
    // getters, setters...
    public LocalDateTime getPerformedAt() {
        return performedAt;
    }

    public void setPerformedAt(LocalDateTime performedAt) {
        this.performedAt = performedAt;
    }

    public String getSubName() {
        return subName;
    }

    public void setSubName(String subName) {
        this.subName = subName;

    }
    public String getStepStatus() {
        return stepStatus;
    }

    public void setStepStatus(String stepStatus) {
        this.stepStatus = stepStatus;
    }
}