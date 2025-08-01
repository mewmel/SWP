package com.example.project.controller;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.entity.Drug;
import com.example.project.entity.DrugItem;
import com.example.project.repository.DrugItemRepository;
import com.example.project.repository.DrugRepository;


@RestController
@RequestMapping("/api/drugs")
@CrossOrigin
public class DrugController {


    @Autowired
    private DrugRepository drugRepository;

    @Autowired
    private DrugItemRepository drugItemRepository;

    // GET /api/drugs/by-booking/{bookId}
    @GetMapping("/by-booking/{bookId}")
    public ResponseEntity<List<Map<String, Object>>> getDrugsByBooking(@PathVariable Integer bookId) {
        try {
            List<Map<String, Object>> result = new ArrayList<>();
            
            // Tìm drug theo bookId
            Optional<Drug> drugOpt = drugRepository.findByBookId(bookId);
            
            if (drugOpt.isPresent()) {
                Drug drug = drugOpt.get();
                
                // Lấy tất cả drug items của drug này
                List<DrugItem> drugItems = drugItemRepository.findByDrugId(drug.getDrugId());
                
                // Tạo response data
                Map<String, Object> drugData = new HashMap<>();
                drugData.put("drugId", drug.getDrugId());
                drugData.put("bookId", drug.getBookId());
                drugData.put("docId", drug.getDocId());
                drugData.put("cusId", drug.getCusId());
                drugData.put("drugNote", drug.getDrugNote());
                drugData.put("createdAt", drug.getCreatedAt());
                
                // Thêm danh sách drug items
                List<Map<String, Object>> itemsList = new ArrayList<>();
                for (DrugItem item : drugItems) {
                    Map<String, Object> itemData = new HashMap<>();
                    itemData.put("drugItemId", item.getDrugItemId());
                    itemData.put("drugId", item.getDrugId());
                    itemData.put("drugName", item.getDrugName());
                    itemData.put("dosage", item.getDosage());
                    itemData.put("frequency", item.getFrequency());
                    itemData.put("duration", item.getDuration());
                    itemData.put("drugItemNote", item.getDrugItemNote());
                    itemsList.add(itemData);
                }
                
                drugData.put("drugItems", itemsList);
                result.add(drugData);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }

    @PostMapping("/create/{bookId}")
    public ResponseEntity<?> createDrug(@PathVariable Integer bookId, @RequestBody Drug drugRequest) {
        try {
            // Optional: Validate input
            if (drugRequest.getDocId() == null || drugRequest.getCusId() == null) {
                return ResponseEntity.badRequest().body("Thiếu docId hoặc cusId");
            }

            // Optional: Set booking (nếu Drug có FK tới Booking)
            drugRequest.setBookId(bookId);

            // Optionally, set other info from repo (if needed)
            // drugRequest.setDoctor(doctorRepository.findById(drugRequest.getDocId()).orElse(null));
            // drugRequest.setCustomer(customerRepository.findById(drugRequest.getCusId()).orElse(null));

            Drug saved = drugRepository.save(drugRequest);
            return ResponseEntity.ok(saved.getDrugId());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi tạo thuốc: " + e.getMessage());
        }
    }
    

    //PUT /api/drugs/update/${drugId}
@PutMapping("/update/{drugId}")
public ResponseEntity<?> updateDrug(@PathVariable Integer drugId, @RequestBody Map<String, String> request) {
    Optional<Drug> optionalDrug = drugRepository.findById(drugId);
    if (optionalDrug.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    Drug drug = optionalDrug.get();

    try {
        String createdAtStr = request.get("createdAt");
        String note = request.get("note");

        if (createdAtStr != null && !createdAtStr.isEmpty()) {
            LocalDateTime createdAt = LocalDateTime.parse(createdAtStr);
            drug.setCreatedAt(createdAt);
        }

        drug.setDrugNote(note);

        drugRepository.save(drug);
        return ResponseEntity.ok("Drug updated successfully");

    } catch (Exception e) {
        return ResponseEntity.status(400).body("Invalid input: " + e.getMessage());
    }
}
  
}