package com.silvercare.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.silvercare.common.Result;
import com.silvercare.entity.Booking;
import com.silvercare.entity.Room;
import com.silvercare.entity.ServicePackage;
import com.silvercare.mapper.BookingMapper;
import com.silvercare.mapper.RoomMapper;
import com.silvercare.mapper.ServicePackageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class BookingService {

    @Autowired
    private BookingMapper bookingMapper;

    @Autowired
    private RoomMapper roomMapper;

    @Autowired
    private ServicePackageMapper packageMapper;

    @Transactional
    public Result<Booking> createBooking(Booking booking) {
        Room room = roomMapper.selectById(booking.getRoomId());
        if (room == null || room.getStatus() != 1) {
            return Result.error("房间不可用");
        }

        Date checkIn = booking.getCheckInDate();
        Date checkOut = booking.getCheckOutDate();
        long diff = checkOut.getTime() - checkIn.getTime();
        int days = (int) TimeUnit.DAYS.convert(diff, TimeUnit.MILLISECONDS);
        if (days <= 0) {
            return Result.error("入住日期必须早于退房日期");
        }
        booking.setDays(days);

        BigDecimal totalAmount = room.getPrice().multiply(BigDecimal.valueOf(days));
        
        if (booking.getPackageId() != null) {
            ServicePackage servicePackage = packageMapper.selectById(booking.getPackageId());
            if (servicePackage != null) {
                totalAmount = totalAmount.add(servicePackage.getPrice());
            }
        }
        
        booking.setTotalAmount(totalAmount);
        booking.setOrderNo("BK" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        booking.setStatus("PENDING");
        
        bookingMapper.insert(booking);
        return Result.success(booking);
    }

    public Result<List<Booking>> listByUserId(Long userId) {
        QueryWrapper<Booking> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.orderByDesc("create_time");
        return Result.success(bookingMapper.selectList(wrapper));
    }

    public Result<List<Booking>> list() {
        QueryWrapper<Booking> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("create_time");
        return Result.success(bookingMapper.selectList(wrapper));
    }

    public Result<Booking> getById(Long id) {
        return Result.success(bookingMapper.selectById(id));
    }

    public Result<Booking> updateStatus(Long id, String status) {
        Booking booking = bookingMapper.selectById(id);
        if (booking == null) {
            return Result.error("预订不存在");
        }
        booking.setStatus(status);
        bookingMapper.updateById(booking);
        return Result.success(booking);
    }

    public Result<Booking> cancelBooking(Long id) {
        return updateStatus(id, "CANCELLED");
    }
}
