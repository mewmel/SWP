package com.example.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.repository.BookingRevenueRepository;

@RestController
@RequestMapping("/api/booking-revenue")
@CrossOrigin(origins = "*")
public class BookingRevenueController {
    
    @Autowired
    private BookingRevenueRepository bookingRevenueRepository;
    
    
}
