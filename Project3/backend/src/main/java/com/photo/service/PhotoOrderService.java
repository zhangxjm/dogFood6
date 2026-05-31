package com.photo.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.photo.entity.PhotoOrder;
import com.photo.entity.Reservation;
import com.photo.mapper.PhotoOrderMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PhotoOrderService extends ServiceImpl<PhotoOrderMapper, PhotoOrder> {

    @Autowired
    private ReservationService reservationService;

    public List<PhotoOrder> getOrderList(String phone) {
        LambdaQueryWrapper<PhotoOrder> wrapper = new LambdaQueryWrapper<>();
        if (phone != null && !phone.isEmpty()) {
            wrapper.eq(PhotoOrder::getPhone, phone);
        }
        wrapper.orderByDesc(PhotoOrder::getCreateTime);
        return this.list(wrapper);
    }

    public PhotoOrder getOrderDetail(Long id) {
        return this.getById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public PhotoOrder createOrder(PhotoOrder order) {
        Reservation reservation = reservationService.getById(order.getReservationId());
        if (reservation != null) {
            order.setPackageId(reservation.getPackageId());
            order.setPackageName(reservation.getPackageName());
            order.setCustomerName(reservation.getCustomerName());
            order.setPhone(reservation.getPhone());
            reservationService.updateReservationStatus(reservation.getId(), 1);
        }
        order.setOrderNo("ORD" + System.currentTimeMillis());
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        order.setPayStatus(0);
        order.setOrderStatus(0);
        this.save(order);
        return order;
    }

    public boolean payOrder(Long id) {
        PhotoOrder order = new PhotoOrder();
        order.setId(id);
        order.setPayStatus(1);
        order.setOrderStatus(1);
        order.setPayTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        return this.updateById(order);
    }

    public boolean updateOrderStatus(Long id, Integer status) {
        PhotoOrder order = new PhotoOrder();
        order.setId(id);
        order.setOrderStatus(status);
        order.setUpdateTime(LocalDateTime.now());
        return this.updateById(order);
    }
}
