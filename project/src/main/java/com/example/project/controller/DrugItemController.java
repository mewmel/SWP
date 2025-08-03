package com.example.project.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@CrossOrigin
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
    System.out.println("🔍 DEBUG: Creating drug items for drugId: " + drugId);
    System.out.println("🔍 DEBUG: Items to create: " + items);
    
    // Optional: kiểm tra tồn tại của Drug nếu muốn chắc ăn
    Optional<Drug> optionalDrug = drugRepository.findById(drugId);
    if (optionalDrug.isEmpty()) {
        System.out.println("❌ DEBUG: Drug not found for ID: " + drugId);
        return ResponseEntity.notFound().build();
    }

    // Gán drugId cho từng item trước khi lưu
    for (DrugItem item : items) {
        item.setDrugId(drugId);
    }

    List<DrugItem> savedItems = drugItemRepository.saveAll(items);
    System.out.println("✅ DEBUG: Drug items created successfully: " + savedItems);
    return ResponseEntity.ok(savedItems);
}

    /**
     * Xóa tất cả DrugItem của một Drug cụ thể.
     * @param drugId ID của Drug mà các DrugItem sẽ bị xóa.
     * @return ResponseEntity thông báo kết quả.
     */
    @DeleteMapping("/delete-by-drug/{drugId}")
    public ResponseEntity<?> deleteDrugItemsByDrugId(@PathVariable Integer drugId) {
        System.out.println("🗑️ DEBUG: Deleting drug items for drugId: " + drugId);
        
        try {
            // Kiểm tra tồn tại của Drug
            Optional<Drug> optionalDrug = drugRepository.findById(drugId);
            if (optionalDrug.isEmpty()) {
                System.out.println("❌ DEBUG: Drug not found for ID: " + drugId);
                return ResponseEntity.notFound().build();
            }

            // Tìm tất cả drug items của drug này
            List<DrugItem> drugItems = drugItemRepository.findByDrugId(drugId);
            System.out.println("🔍 DEBUG: Found " + drugItems.size() + " drug items to delete");
            
            // Xóa từng drug item
            for (DrugItem item : drugItems) {
                System.out.println("🗑️ DEBUG: Deleting drug item: " + item);
                drugItemRepository.delete(item);
            }
            
            System.out.println("✅ DEBUG: All drug items deleted successfully");
            return ResponseEntity.ok("Đã xóa " + drugItems.size() + " drug items thành công");
            
        } catch (Exception e) {
            System.out.println("❌ DEBUG: Error deleting drug items: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi xóa drug items: " + e.getMessage());
        }
    }

}
