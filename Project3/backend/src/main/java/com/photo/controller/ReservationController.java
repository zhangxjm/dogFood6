package com.photo.controller;

import com.photo.common.Result;
import com.photo.entity.Reservation;
import com.photo.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservation")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @GetMapping("/list")
    public Result<List<Reservation>> list(@RequestParam(required = false) String phone) {
        return Result.success(reservationService.getReservationList(phone));
    }

    @GetMapping("/{id}")
    public Result<Reservation> detail(@PathVariable Long id) {
        return Result.success(reservationService.getReservationDetail(id));
    }

    @PostMapping("/create")
    public Result<Void> create(@RequestBody Reservation reservation) {
        boolean success = reservationService.createReservation(reservation);
        return success ? Result.success() : Result.error("预约失败");
    }

    @PostMapping("/status/{id}")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        boolean success = reservationService.updateReservationStatus(id, status);
        return success ? Result.success() : Result.error("状态更新失败");
    }

    @PostMapping("/cancel/{id}")
    public Result<Void> cancel(@PathVariable Long id) {
        boolean success = reservationService.cancelReservation(id);
        return success ? Result.success() : Result.error("取消失败");
    }
}
