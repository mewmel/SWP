package com.example.project.dto;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestResult {
    private Integer bookingStepId;
    private Integer subId;
    private String subName;
    private LocalDateTime performedAt;
    private List<IndexResult> results;
    private String note;
    private String stepStatus;

    @Data
    public static class IndexResult {
        private String indexName;
        private String unit;
        private String status;
        private String value;
    }
}
