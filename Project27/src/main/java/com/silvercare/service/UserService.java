package com.silvercare.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.silvercare.common.Result;
import com.silvercare.config.JwtUtil;
import com.silvercare.entity.User;
import com.silvercare.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public Result<Map<String, Object>> login(String username, String password) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", username);
        User user = userMapper.selectOne(wrapper);
        
        if (user == null) {
            return Result.error("用户不存在");
        }
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return Result.error("密码错误");
        }
        
        if (user.getStatus() != 1) {
            return Result.error("账号已被禁用");
        }
        
        String token = jwtUtil.generateToken(user.getUsername(), user.getId(), user.getRole());
        
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", user);
        
        return Result.success(data);
    }

    public Result<User> register(User user) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", user.getUsername());
        if (userMapper.selectCount(wrapper) > 0) {
            return Result.error("用户名已存在");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        user.setStatus(1);
        userMapper.insert(user);
        
        return Result.success(user);
    }

    public Result<User> getById(Long id) {
        return Result.success(userMapper.selectById(id));
    }

    public Result<List<User>> list() {
        return Result.success(userMapper.selectList(null));
    }

    public Result<User> update(User user) {
        userMapper.updateById(user);
        return Result.success(user);
    }

    public Result<Void> delete(Long id) {
        userMapper.deleteById(id);
        return Result.success();
    }
}
