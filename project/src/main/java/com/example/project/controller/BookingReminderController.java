package com.example.project.controller;

import com.example.project.service.BookingReminderScheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/booking/reminder")
public class BookingReminderController {

    @Autowired
    private BookingReminderScheduler bookingReminderScheduler;

    // Endpoint để test gửi thủ công, có thể gọi trên trình duyệt hoặc swagger
//    @PostMapping("/manual")
//    public String sendManualReminder() {
//        bookingReminderScheduler.sendBookingReminders();
//        return "Reminder emails sent (manual trigger).";
//    }
}