package com.silvercare.service;

import com.silvercare.common.Result;
import com.silvercare.entity.Booking;
import com.silvercare.entity.Payment;
import com.silvercare.mapper.BookingMapper;
import com.silvercare.mapper.PaymentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentMapper paymentMapper;

    @Autowired
    private BookingMapper bookingMapper;

    @Transactional
    public Result<Map<String, Object>> createPayment(Long bookingId) {
        Booking booking = bookingMapper.selectById(bookingId);
        if (booking == null) {
            return Result.error("预订不存在");
        }

        Payment payment = new Payment();
        payment.setOrderNo(booking.getOrderNo());
        payment.setBookingId(bookingId);
        payment.setUserId(booking.getUserId());
        payment.setAmount(booking.getTotalAmount());
        payment.setPaymentMethod("WECHAT");
        payment.setStatus("PENDING");
        paymentMapper.insert(payment);

        Map<String, Object> result = new HashMap<>();
        result.put("paymentId", payment.getId());
        result.put("orderNo", booking.getOrderNo());
        result.put("amount", booking.getTotalAmount());
        result.put("payUrl", "weixin://wxpay/bizpayurl?pr=" + UUID.randomUUID().toString().substring(0, 16));
        
        return Result.success(result);
    }

    @Transactional
    public Result<String> mockPayment(Long paymentId) {
        Payment payment = paymentMapper.selectById(paymentId);
        if (payment == null) {
            return Result.error("支付记录不存在");
        }

        payment.setStatus("PAID");
        payment.setTransactionId("MOCK" + System.currentTimeMillis());
        payment.setPayTime(new Date());
        paymentMapper.updateById(payment);

        Booking booking = bookingMapper.selectById(payment.getBookingId());
        if (booking != null) {
            booking.setStatus("PAID");
            bookingMapper.updateById(booking);
        }

        return Result.success("支付成功");
    }

    public Result<String> wechatNotify(String notifyData) {
        return Result.success("success");
    }
}
