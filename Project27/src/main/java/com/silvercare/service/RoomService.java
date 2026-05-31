package com.silvercare.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.silvercare.common.Result;
import com.silvercare.entity.Room;
import com.silvercare.mapper.RoomMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class RoomService {

    @Autowired
    private RoomMapper roomMapper;

    public Result<List<Room>> list(Integer status) {
        QueryWrapper<Room> wrapper = new QueryWrapper<>();
        if (status != null) {
            wrapper.eq("status", status);
        }
        wrapper.orderByAsc("room_no");
        return Result.success(roomMapper.selectList(wrapper));
    }

    public Result<Room> getById(Long id) {
        return Result.success(roomMapper.selectById(id));
    }

    public Result<Room> save(Room room) {
        room.setStatus(1);
        roomMapper.insert(room);
        return Result.success(room);
    }

    public Result<Room> update(Room room) {
        roomMapper.updateById(room);
        return Result.success(room);
    }

    public Result<Void> delete(Long id) {
        roomMapper.deleteById(id);
        return Result.success();
    }

    public Result<List<Room>> getAvailableRooms(LocalDate checkIn, LocalDate checkOut) {
        QueryWrapper<Room> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1);
        return Result.success(roomMapper.selectList(wrapper));
    }
}
