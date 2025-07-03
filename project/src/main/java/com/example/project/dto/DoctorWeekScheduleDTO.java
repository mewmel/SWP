package com.example.project.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DoctorWeekScheduleDTO {
    private Integer docId;
    private Integer maId; // Thêm trường manager ID
    private LocalDate weekStartDate; // Ngày bắt đầu tuần, thường là Thứ 2
    private List<ShiftDTO> shifts;   // shift cho từng ngày trong tuần

    @Getter
    @Setter
    public static class ShiftDTO {
        private String weekday; // "T2", "T3", ..., "T7", "CN"
        private Boolean morning;
        private Boolean afternoon;
        private Integer maxPatient; // optional
    }
}