package com.example.project.dto;
import lombok.Getter;
import lombok.Setter;   

import lombok.AllArgsConstructor;

@Getter
@Setter
@AllArgsConstructor
public class BookingStepInfo {
    private Integer bookingStepId;
    private Integer subId;
    private String subName;
    private String result;
    private String note;
    private Integer drugId;
    private String stepStatus;
    
}
