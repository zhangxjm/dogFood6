package com.docarchive.controller;

import com.docarchive.common.Result;
import com.docarchive.dto.LoginRequest;
import com.docarchive.entity.User;
import com.docarchive.security.JwtTokenProvider;
import com.docarchive.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userService.findByUsername(request.getUsername()).orElse(null);

        Map<String, Object> data = new HashMap<>();
        data.put("token", jwt);
        data.put("username", user.getUsername());
        data.put("realName", user.getRealName());
        data.put("role", user.getRole());
        data.put("email", user.getEmail());

        return Result.success("登录成功", data);
    }

    @GetMapping("/me")
    public Result<User> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return Result.error("未登录");
        }
        String username = authentication.getName();
        return userService.findByUsername(username)
                .map(Result::success)
                .orElse(Result.error("用户不存在"));
    }
}
