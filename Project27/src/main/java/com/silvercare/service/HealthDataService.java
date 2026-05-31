package com.silvercare.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.silvercare.common.Result;
import com.silvercare.entity.HealthData;
import com.silvercare.mapper.HealthDataMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HealthDataService {

    @Autowired
    private HealthDataMapper healthDataMapper;

    public Result<HealthData> save(HealthData healthData) {
        healthDataMapper.insert(healthData);
        return Result.success(healthData);
    }

    public Result<List<HealthData>> listByUserId(Long userId) {
        QueryWrapper<HealthData> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.orderByDesc("create_time");
        return Result.success(healthDataMapper.selectList(wrapper));
    }

    public Result<HealthData> getLatest(Long userId) {
        QueryWrapper<HealthData> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.orderByDesc("create_time");
        wrapper.last("LIMIT 1");
        return Result.success(healthDataMapper.selectOne(wrapper));
    }
}
