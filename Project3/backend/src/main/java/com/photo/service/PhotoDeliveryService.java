package com.photo.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.photo.entity.PhotoDelivery;
import com.photo.entity.PhotoOrder;
import com.photo.mapper.PhotoDeliveryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PhotoDeliveryService extends ServiceImpl<PhotoDeliveryMapper, PhotoDelivery> {

    @Autowired
    private PhotoOrderService orderService;

    public List<PhotoDelivery> getDeliveryList(String phone) {
        LambdaQueryWrapper<PhotoDelivery> wrapper = new LambdaQueryWrapper<>();
        if (phone != null && !phone.isEmpty()) {
            wrapper.eq(PhotoDelivery::getPhone, phone);
        }
        wrapper.orderByDesc(PhotoDelivery::getCreateTime);
        return this.list(wrapper);
    }

    public PhotoDelivery getDeliveryDetail(Long id) {
        return this.getById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean createDelivery(PhotoDelivery delivery) {
        PhotoOrder order = orderService.getById(delivery.getOrderId());
        if (order != null) {
            delivery.setOrderNo(order.getOrderNo());
            delivery.setCustomerName(order.getCustomerName());
            delivery.setPhone(order.getPhone());
            orderService.updateOrderStatus(order.getId(), 3);
        }
        delivery.setCreateTime(LocalDateTime.now());
        delivery.setUpdateTime(LocalDateTime.now());
        delivery.setDeliveryStatus(1);
        delivery.setDeliveryTime(LocalDateTime.now());
        return this.save(delivery);
    }

    public boolean confirmDelivery(Long id) {
        PhotoDelivery delivery = new PhotoDelivery();
        delivery.setId(id);
        delivery.setDeliveryStatus(2);
        delivery.setUpdateTime(LocalDateTime.now());
        return this.updateById(delivery);
    }
}
