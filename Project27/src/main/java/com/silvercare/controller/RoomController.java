package com.silvercare.controller;

import com.silvercare.common.Result;
import com.silvercare.entity.Room;
import com.silvercare.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/room")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @GetMapping("/list")
    public Result<List<Room>> list(@RequestParam(required = false) Integer status) {
        return roomService.list(status);
    }

    @GetMapping("/available")
    public Result<List<Room>> getAvailableRooms(
            @RequestParam Date checkIn,
            @RequestParam Date checkOut) {
        return roomService.getAvailableRooms(checkIn, checkOut);
    }

    @GetMapping("/{id}")
    public Result<Room> getById(@PathVariable Long id) {
        return roomService.getById(id);
    }

    @PostMapping("/save")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Room> save(@RequestBody Room room) {
        return roomService.save(room);
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Room> update(@RequestBody Room room) {
        return roomService.update(room);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> delete(@PathVariable Long id) {
        return roomService.delete(id);
    }
}
