package com.example.project.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingStepResultDTO {
    private String subName;
    private String performedAt; // ISO string hoặc convert sang "dd/MM/yyyy - HH:mm"
    private String result;
    private String note;
    private String stepStatus;
}