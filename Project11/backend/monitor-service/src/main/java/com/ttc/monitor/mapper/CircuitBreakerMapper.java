package com.ttc.monitor.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ttc.monitor.domain.CircuitBreaker;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CircuitBreakerMapper extends BaseMapper<CircuitBreaker> {
}
