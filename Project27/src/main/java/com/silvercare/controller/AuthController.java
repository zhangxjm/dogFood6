package com.silvercare.controller;

import com.silvercare.common.Result;
import com.silvercare.entity.User;
import com.silvercare.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");
        return userService.login(username, password);
    }

    @PostMapping("/register")
    public Result<User> register(@RequestBody User user) {
        return userService.register(user);
    }
}
