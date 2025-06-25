package com.example.project.dto;

import java.time.LocalDateTime;

public class BookingStepDto {
    private LocalDateTime performedAt;
    private String subName;

    public BookingStepDto(LocalDateTime performedAt, String subName) {
        this.performedAt = performedAt;
        this.subName = subName;
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
}