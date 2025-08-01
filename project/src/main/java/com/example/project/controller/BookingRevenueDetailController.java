package com.example.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.repository.BookingRevenueDetailRepository;

@RestController
@RequestMapping("/api/booking-revenue-detail")
@CrossOrigin
public class BookingRevenueDetailController {
    
    @Autowired
    private BookingRevenueDetailRepository bookingRevenueDetailRepository;
    
    
}
