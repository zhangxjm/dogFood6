package com.ttc.monitor.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("alert")
public class Alert implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;
    private String alertType;
    private String alertLevel;
    private String alertContent;
    private String source;
    private String deviceCode;
    private Integer status;
    private String handler;
    private String handleResult;
    private LocalDateTime handleTime;
    private LocalDateTime alertTime;
    private LocalDateTime createTime;
}
