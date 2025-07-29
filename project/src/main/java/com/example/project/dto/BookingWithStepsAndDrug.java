package com.example.project.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class BookingWithStepsAndDrug {
    private Integer bookId;
    private List<BookingStepDTO> bookingSteps;
    private Integer drugId; // Nếu có
    private List<DrugItemDTO> drugItems; // Nếu có

    @Getter @Setter @AllArgsConstructor @NoArgsConstructor
    public static class BookingStepDTO {
        private String subName;
        private String performedAt;
        private String result;
        private String note;
        private String stepStatus;
    }

    @Getter @Setter @AllArgsConstructor @NoArgsConstructor
    public static class DrugItemDTO {
        private Integer drugItemId;
        private String drugName;
        private String dosage;
        private String frequency;
        private String duration;
        private String drugItemNote;
    }
}