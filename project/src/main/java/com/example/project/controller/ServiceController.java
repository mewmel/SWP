
package com.example.project.controller;

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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.entity.Service;
import com.example.project.entity.SubService;
import com.example.project.repository.ServiceRepository;
import com.example.project.repository.SubServiceRepository;

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

    /**
     * API test để kiểm tra dữ liệu
     * GET /api/services/test
     */
    @GetMapping("/services/test")
    public ResponseEntity<Map<String, Object>> testServices() {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Đếm số Service
            long serviceCount = serviceRepo.count();
            result.put("serviceCount", serviceCount);
            
            // Đếm số SubService
            long subServiceCount = subServiceRepo.count();
            result.put("subServiceCount", subServiceCount);
            
            // Lấy danh sách Service
            List<Service> services = serviceRepo.findAll();
            result.put("services", services.stream().map(s -> Map.of(
                "id", s.getSerId(),
                "name", s.getSerName(),
                "description", s.getSerDescription()
            )).toList());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * API lấy danh sách Service và SubService theo cấu trúc phân cấp
     * GET /api/services/hierarchy
     */
    @GetMapping("/services/hierarchy")
    public ResponseEntity<List<Map<String, Object>>> getServicesHierarchy() {
        try {
            List<Service> services = serviceRepo.findAll();
            List<Map<String, Object>> hierarchy = new ArrayList<>();
            
            for (Service service : services) {
                Map<String, Object> serviceData = new HashMap<>();
                serviceData.put("serviceId", service.getSerId());
                serviceData.put("serviceName", service.getSerName());
                serviceData.put("serviceDescription", service.getSerDescription());
                serviceData.put("serviceDuration", service.getDuration());
                serviceData.put("servicePrice", service.getSerPrice());
                
                // Lấy danh sách SubService của Service này
                List<SubService> subServices = subServiceRepo.findBySerId(service.getSerId());
                List<Map<String, Object>> subServiceList = new ArrayList<>();
                
                for (SubService subService : subServices) {
                    Map<String, Object> subServiceData = new HashMap<>();
                    subServiceData.put("subId", subService.getSubId());
                    subServiceData.put("subName", subService.getSubName());
                    subServiceData.put("subDescription", subService.getSubDescription());
                    subServiceData.put("subDuration", subService.getEstimatedDayOffset());
                    subServiceData.put("subPrice", subService.getSubPrice());
                    
                    subServiceList.add(subServiceData);
                }
                
                serviceData.put("subServices", subServiceList);
                hierarchy.add(serviceData);
            }
            
            return ResponseEntity.ok(hierarchy);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * API lấy danh sách dịch vụ cho trang bảng giá
     * GET /api/services/pricing
     */
    @GetMapping("/services/pricing")
    public ResponseEntity<List<Map<String, Object>>> getServicesPricing() {
        try {
            List<Service> services = serviceRepo.findAll();
            List<Map<String, Object>> pricingData = new ArrayList<>();
            
            for (Service service : services) {
                // Lấy danh sách SubService của Service này
                List<SubService> subServices = subServiceRepo.findBySerId(service.getSerId());
                
                for (SubService subService : subServices) {
                    Map<String, Object> serviceItem = new HashMap<>();
                    serviceItem.put("id", subService.getSubId());
                    serviceItem.put("name", subService.getSubName());
                    serviceItem.put("description", subService.getSubDescription());
                    serviceItem.put("price", subService.getSubPrice());
                    serviceItem.put("category", service.getSerName()); // Sử dụng tên Service làm category
                    serviceItem.put("duration", subService.getEstimatedDayOffset());
                    
                    pricingData.add(serviceItem);
                }
            }
            
            return ResponseEntity.ok(pricingData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * API cập nhật thông tin SubService
     * PUT /api/services/subservice/{subId}
     */
    @PutMapping("/services/subservice/{subId}")
    public ResponseEntity<Map<String, Object>> updateSubService(
            @PathVariable Integer subId,
            @RequestBody Map<String, Object> subServiceData) {
        try {
            String subName = (String) subServiceData.get("subName");
            Integer subPrice = (Integer) subServiceData.get("subPrice");
            
            if (subName == null || subName.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Tên dịch vụ không được để trống");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (subPrice == null || subPrice <= 0) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Giá dịch vụ phải lớn hơn 0");
                return ResponseEntity.badRequest().body(error);
            }
            
            Optional<SubService> subServiceOpt = subServiceRepo.findById(subId);
            if (subServiceOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Không tìm thấy dịch vụ với ID: " + subId);
                return ResponseEntity.notFound().build();
            }
            
            SubService subService = subServiceOpt.get();
            subService.setSubName(subName.trim());
            subService.setSubPrice(subPrice);
            
            SubService updatedSubService = subServiceRepo.save(subService);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cập nhật dịch vụ thành công");
            response.put("subId", updatedSubService.getSubId());
            response.put("subName", updatedSubService.getSubName());
            response.put("subPrice", updatedSubService.getSubPrice());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Lỗi khi cập nhật dịch vụ: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
