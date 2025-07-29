package com.example.project.controller;

import com.example.project.entity.Service;
import com.example.project.entity.SubService;
import com.example.project.repository.ServiceRepository;
import com.example.project.repository.SubServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin // Cho phép truy cập từ front-end
public class ServiceController {
    @Autowired
    private ServiceRepository serviceRepo;
    
    @Autowired
    private SubServiceRepository subServiceRepo;

    @GetMapping("/services")
    public List<Service> getAllServices() {
        return serviceRepo.findAll();
    }
    
    @GetMapping("/subservices")
    public List<SubService> getAllSubServices() {
        return subServiceRepo.findAll();
    }
    
    @GetMapping("/subservices/by-service/{serId}")
    public List<SubService> getSubServicesByService(@PathVariable Integer serId) {
        return subServiceRepo.findBySerId(serId);
    }
    
    /**
     * API lấy thống kê dịch vụ khả dụng
     * GET /api/services/stats
     */
    @GetMapping("/services/stats")
    public ResponseEntity<Map<String, Object>> getServiceStats() {
        try {
            // Đếm tổng số Service
            long totalServices = serviceRepo.count();
            
            // Đếm tổng số SubService
            long totalSubServices = subServiceRepo.count();
            
            // Đếm số Service có SubService
            List<Service> allServices = serviceRepo.findAll();
            long servicesWithSubServices = allServices.stream()
                .filter(service -> {
                    List<SubService> subServices = subServiceRepo.findBySerId(service.getSerId());
                    return !subServices.isEmpty();
                })
                .count();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalServices", totalServices);
            stats.put("totalSubServices", totalSubServices);
            stats.put("servicesWithSubServices", servicesWithSubServices);
            stats.put("availableServices", totalSubServices); // Số dịch vụ khả dụng = tổng số SubService
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Lỗi khi lấy thống kê dịch vụ");
            return ResponseEntity.status(500).body(error);
        }
    }
}