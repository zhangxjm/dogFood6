package com.silvercare.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.silvercare.entity.Payment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PaymentMapper extends BaseMapper<Payment> {
}
