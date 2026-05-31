package com.silvercare.controller;

import com.silvercare.common.Result;
import com.silvercare.entity.User;
import com.silvercare.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/info")
    public Result<User> getInfo(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return userService.getById(userId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<User> getById(@PathVariable Long id) {
        return userService.getById(id);
    }

    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<List<User>> list() {
        return userService.list();
    }

    @PutMapping("/update")
    public Result<User> update(@RequestBody User user) {
        return userService.update(user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> delete(@PathVariable Long id) {
        return userService.delete(id);
    }
}
