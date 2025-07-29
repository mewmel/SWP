package com.example.project.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BookingStepResultDTO {
    private String subName;
    private String performedAt; // ISO string hoặc convert sang "dd/MM/yyyy - HH:mm"
    private String result;
    private String note;
    private String stepStatus;
}