package com.example.project.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkSlotBookingDTO {
    private Integer slotId;
    private String startTime;
    private String endTime;
    private Integer maxPatient;
    private Integer currentBooking;
    // ... các trường khác nếu cần
}