package com.example.project.dto;

import java.util.List;
import java.util.Map;

import com.example.project.entity.SubService;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data // Tự sinh getter/setter/toString/equals/hashCode
@AllArgsConstructor // Tự sinh constructor với tất cả tham số
public class VisitSubService {
    private Integer bookId;
    private int visitNumber;
    private Map<Integer, List<SubService>> subServicesGrouped;
}
