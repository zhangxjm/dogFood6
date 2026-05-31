package com.photo.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.photo.entity.Reservation;
import com.photo.mapper.ReservationMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationService extends ServiceImpl<ReservationMapper, Reservation> {

    public List<Reservation> getReservationList(String phone) {
        LambdaQueryWrapper<Reservation> wrapper = new LambdaQueryWrapper<>();
        if (phone != null && !phone.isEmpty()) {
            wrapper.eq(Reservation::getPhone, phone);
        }
        wrapper.orderByDesc(Reservation::getCreateTime);
        return this.list(wrapper);
    }

    public Reservation getReservationDetail(Long id) {
        return this.getById(id);
    }

    public boolean createReservation(Reservation reservation) {
        reservation.setCreateTime(LocalDateTime.now());
        reservation.setUpdateTime(LocalDateTime.now());
        reservation.setStatus(0);
        return this.save(reservation);
    }

    public boolean updateReservationStatus(Long id, Integer status) {
        Reservation reservation = new Reservation();
        reservation.setId(id);
        reservation.setStatus(status);
        reservation.setUpdateTime(LocalDateTime.now());
        return this.updateById(reservation);
    }

    public boolean cancelReservation(Long id) {
        return updateReservationStatus(id, 3);
    }
}
