package com.ttc.command.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("ttc_command")
public class Command implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;
    private String commandCode;
    private String commandName;
    private String commandType;
    private String targetDevice;
    private String commandContent;
    private Integer priority;
    private Integer status;
    private String executeResult;
    private LocalDateTime scheduledTime;
    private LocalDateTime sendTime;
    private LocalDateTime executeTime;
    private LocalDateTime finishTime;
    private String operator;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
