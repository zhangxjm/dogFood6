package com.ttc.command.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ttc.command.domain.Command;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CommandMapper extends BaseMapper<Command> {
}
