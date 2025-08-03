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
import org.springframework.web.bind.annotation.DeleteMapping;
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
            System.out.println("🔍 DEBUG: Getting drugs for booking: " + bookId);
            List<Map<String, Object>> result = new ArrayList<>();
            
            // Tìm drug theo bookId
            Optional<Drug> drugOpt = drugRepository.findByBookId(bookId);
            
            if (drugOpt.isPresent()) {
                Drug drug = drugOpt.get();
                System.out.println("✅ DEBUG: Found drug: " + drug);
                
                // Lấy tất cả drug items của drug này
                List<DrugItem> drugItems = drugItemRepository.findByDrugId(drug.getDrugId());
                System.out.println("✅ DEBUG: Found " + drugItems.size() + " drug items");
                
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
                    System.out.println("✅ DEBUG: Added drug item: " + itemData);
                }
                
                drugData.put("drugItems", itemsList);
                result.add(drugData);
                System.out.println("✅ DEBUG: Final response: " + result);
            } else {
                System.out.println("❌ DEBUG: No drug found for booking: " + bookId);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("❌ DEBUG: Error getting drugs: " + e.getMessage());
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
    System.out.println("🔍 DEBUG: Updating drug " + drugId + " with request: " + request);
    
    Optional<Drug> optionalDrug = drugRepository.findById(drugId);
    if (optionalDrug.isEmpty()) {
        System.out.println("❌ DEBUG: Drug not found for ID: " + drugId);
        return ResponseEntity.notFound().build();
    }

    Drug drug = optionalDrug.get();
    System.out.println("🔍 DEBUG: Found existing drug: " + drug);

    try {
        String createdAtStr = request.get("createdAt");
        String note = request.get("note");

        System.out.println("🔍 DEBUG: Updating drug with createdAt: " + createdAtStr + ", note: " + note);

        if (createdAtStr != null && !createdAtStr.isEmpty()) {
            // Xử lý format date với .000Z ở cuối
            String cleanDateStr = createdAtStr;
            if (createdAtStr.endsWith(".000Z")) {
                cleanDateStr = createdAtStr.substring(0, createdAtStr.length() - 5);
            }
            LocalDateTime createdAt = LocalDateTime.parse(cleanDateStr);
            drug.setCreatedAt(createdAt);
        }

        drug.setDrugNote(note);

        Drug savedDrug = drugRepository.save(drug);
        System.out.println("✅ DEBUG: Drug updated successfully: " + savedDrug);
        return ResponseEntity.ok("Drug updated successfully");

    } catch (Exception e) {
        System.out.println("❌ DEBUG: Error updating drug: " + e.getMessage());
        return ResponseEntity.status(400).body("Invalid input: " + e.getMessage());
    }
}

    // DELETE /api/drugs/{drugId}
    @DeleteMapping("/{drugId}")
    public ResponseEntity<?> deleteDrug(@PathVariable Integer drugId) {
        System.out.println("🔍 DEBUG: Deleting drug with ID: " + drugId);
        
        try {
            Optional<Drug> optionalDrug = drugRepository.findById(drugId);
            if (optionalDrug.isEmpty()) {
                System.out.println("❌ DEBUG: Drug not found for ID: " + drugId);
                return ResponseEntity.notFound().build();
            }

            Drug drug = optionalDrug.get();
            System.out.println("✅ DEBUG: Found drug to delete: " + drug);

            // Xóa tất cả drug items trước
            List<DrugItem> drugItems = drugItemRepository.findByDrugId(drugId);
            System.out.println("🔍 DEBUG: Found " + drugItems.size() + " drug items to delete");
            
            for (DrugItem item : drugItems) {
                System.out.println("🗑️ DEBUG: Deleting drug item: " + item);
                drugItemRepository.delete(item);
            }
            System.out.println("✅ DEBUG: All drug items deleted successfully");

            // Sau đó xóa drug chính
            drugRepository.delete(drug);
            System.out.println("✅ DEBUG: Drug deleted successfully");

            return ResponseEntity.ok("Đơn thuốc đã được xóa thành công");
            
        } catch (Exception e) {
            System.out.println("❌ DEBUG: Error deleting drug: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi xóa đơn thuốc: " + e.getMessage());
        }
    }
  
}