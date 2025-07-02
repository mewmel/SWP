package com.example.project.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.entity.Drug;
import com.example.project.entity.DrugItem;
import com.example.project.repository.DrugItemRepository;
import com.example.project.repository.DrugRepository;



@RestController
@RequestMapping("/api/drug-items")
public class DrugItemController {

    @Autowired
    private DrugItemRepository drugItemRepository;


    @Autowired
    private DrugRepository drugRepository;


    /**
     * Tạo mới danh sách DrugItem cho một Drug cụ thể.
     * @param drugId ID của Drug mà các DrugItem này sẽ thuộc về.
     * @param items Danh sách các DrugItem cần tạo mới.
     * @return ResponseEntity chứa danh sách các DrugItem đã được lưu.
     */
    @PostMapping("/create/{drugId}")
public ResponseEntity<?> createDrugItems(@PathVariable Integer drugId, @RequestBody List<DrugItem> items) {
    // Optional: kiểm tra tồn tại của Drug nếu muốn chắc ăn
    Optional<Drug> optionalDrug = drugRepository.findById(drugId);
    if (optionalDrug.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    // Gán drugId cho từng item trước khi lưu
    for (DrugItem item : items) {
        item.setDrugId(drugId);
    }

    List<DrugItem> savedItems = drugItemRepository.saveAll(items);
    return ResponseEntity.ok(savedItems);
}

}
