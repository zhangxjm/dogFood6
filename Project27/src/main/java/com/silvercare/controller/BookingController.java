package com.silvercare.controller;

import com.silvercare.common.Result;
import com.silvercare.entity.Booking;
import com.silvercare.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/booking")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping("/create")
    public Result<Booking> createBooking(@RequestBody Booking booking, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        booking.setUserId(userId);
        return bookingService.createBooking(booking);
    }

    @GetMapping("/my")
    public Result<List<Booking>> myBookings(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return bookingService.listByUserId(userId);
    }

    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public Result<List<Booking>> list() {
        return bookingService.list();
    }

    @GetMapping("/{id}")
    public Result<Booking> getById(@PathVariable Long id) {
        return bookingService.getById(id);
    }

    @PutMapping("/status/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public Result<Booking> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return bookingService.updateStatus(id, status);
    }

    @PutMapping("/cancel/{id}")
    public Result<Booking> cancelBooking(@PathVariable Long id) {
        return bookingService.cancelBooking(id);
    }
}
