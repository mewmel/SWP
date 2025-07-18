package com.example.project.controller;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.entity.Drug;
import com.example.project.repository.DrugRepository;
import com.example.project.service.DrugService;


@RestController
@RequestMapping("/api/drugs")
public class DrugController {

@Autowired
    private DrugService drugService;

    @Autowired
    private DrugRepository drugRepository;


    


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
