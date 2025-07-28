package com.example.project.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MedicalHistoryDTO {
    private Integer bookId;
    private String bookType;
    private String bookStatus;
    private String date;      // workDate
    private String time;      // startTime - endTime
    private List<String> subNames; // subName list
}
