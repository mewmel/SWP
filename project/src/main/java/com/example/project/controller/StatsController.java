package com.example.project.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.repository.CustomerRepository;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.ManagerRepository;
import com.example.project.repository.ServiceRepository;
import com.example.project.repository.SubServiceRepository;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin
public class StatsController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private ManagerRepository managerRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private SubServiceRepository subServiceRepository;

    /**
     * API lấy thống kê tổng hợp
     * GET /api/stats/overview
     */
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverviewStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
                                    // Đếm tổng số bệnh nhân (chỉ đếm tài khoản active)
                        long totalActiveCustomers = customerRepository.findAll().stream()
                            .filter(customer -> "active".equals(customer.getCusStatus()) || 
                                              customer.getCusStatus() == null)
                            .count();
                        stats.put("totalCustomers", totalActiveCustomers);
            
            // Đếm tổng số bác sĩ
            long totalDoctors = doctorRepository.count();
            stats.put("totalDoctors", totalDoctors);
            
            // Đếm tổng số quản lý
            long totalManagers = managerRepository.count();
            stats.put("totalManagers", totalManagers);
            
            // Tổng số nhân viên (bác sĩ + quản lý)
            long totalStaff = totalDoctors + totalManagers;
            stats.put("totalStaff", totalStaff);
            
            // Đếm tổng số dịch vụ khả dụng (SubService)
            long totalSubServices = subServiceRepository.count();
            stats.put("availableServices", totalSubServices);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Lỗi khi lấy thống kê tổng hợp");
            return ResponseEntity.status(500).body(error);
        }
    }
} 