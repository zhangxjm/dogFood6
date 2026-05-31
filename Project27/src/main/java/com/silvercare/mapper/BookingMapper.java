package com.silvercare.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.silvercare.entity.Booking;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface BookingMapper extends BaseMapper<Booking> {
}
