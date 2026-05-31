package com.photo.controller;

import com.photo.common.Result;
import com.photo.entity.PhotoDelivery;
import com.photo.service.PhotoDeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/delivery")
public class PhotoDeliveryController {

    @Autowired
    private PhotoDeliveryService deliveryService;

    @GetMapping("/list")
    public Result<List<PhotoDelivery>> list(@RequestParam(required = false) String phone) {
        return Result.success(deliveryService.getDeliveryList(phone));
    }

    @GetMapping("/{id}")
    public Result<PhotoDelivery> detail(@PathVariable Long id) {
        return Result.success(deliveryService.getDeliveryDetail(id));
    }

    @PostMapping("/create")
    public Result<Void> create(@RequestBody PhotoDelivery delivery) {
        boolean success = deliveryService.createDelivery(delivery);
        return success ? Result.success() : Result.error("创建领取记录失败");
    }

    @PostMapping("/confirm/{id}")
    public Result<Void> confirm(@PathVariable Long id) {
        boolean success = deliveryService.confirmDelivery(id);
        return success ? Result.success() : Result.error("确认失败");
    }
}
