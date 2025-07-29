
package com.example.project.dto;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor

public class BookingWithSlotAndCus {
    private Integer bookId;
    private Integer cusId;
    private String cusFullName;
    private Integer docId;
    private String bookType;
    private String bookStatus;
    private LocalDateTime createdAt;
    private String note;
    private LocalDate workDate;
    private LocalTime startTime;
    private LocalTime endTime;

}