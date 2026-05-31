package com.silvercare.controller;

import com.silvercare.common.Result;
import com.silvercare.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create")
    public Result<Map<String, Object>> createPayment(@RequestParam Long bookingId) {
        return paymentService.createPayment(bookingId);
    }

    @PostMapping("/mock/{paymentId}")
    public Result<String> mockPayment(@PathVariable Long paymentId) {
        return paymentService.mockPayment(paymentId);
    }

    @PostMapping("/notify")
    public Result<String> wechatNotify(@RequestBody String notifyData) {
        return paymentService.wechatNotify(notifyData);
    }
}
