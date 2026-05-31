package com.ttc.payload.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ttc.payload.domain.PayloadData;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PayloadDataMapper extends BaseMapper<PayloadData> {
}
