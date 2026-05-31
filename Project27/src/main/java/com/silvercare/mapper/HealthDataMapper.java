package com.silvercare.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.silvercare.entity.HealthData;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface HealthDataMapper extends BaseMapper<HealthData> {
}
