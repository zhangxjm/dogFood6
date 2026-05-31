package com.photo.controller;

import com.photo.common.Result;
import com.photo.entity.PhotoOrder;
import com.photo.service.PhotoOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/order")
public class PhotoOrderController {

    @Autowired
    private PhotoOrderService orderService;

    @GetMapping("/list")
    public Result<List<PhotoOrder>> list(@RequestParam(required = false) String phone) {
        return Result.success(orderService.getOrderList(phone));
    }

    @GetMapping("/{id}")
    public Result<PhotoOrder> detail(@PathVariable Long id) {
        return Result.success(orderService.getOrderDetail(id));
    }

    @PostMapping("/create")
    public Result<PhotoOrder> create(@RequestBody PhotoOrder order) {
        PhotoOrder created = orderService.createOrder(order);
        return created != null ? Result.success(created) : Result.error("创建订单失败");
    }

    @PostMapping("/pay/{id}")
    public Result<Void> pay(@PathVariable Long id) {
        boolean success = orderService.payOrder(id);
        return success ? Result.success() : Result.error("支付失败");
    }

    @PostMapping("/status/{id}")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        boolean success = orderService.updateOrderStatus(id, status);
        return success ? Result.success() : Result.error("状态更新失败");
    }
}
