package com.ttc.monitor.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("circuit_breaker")
public class CircuitBreaker implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;
    private String resourceName;
    private String resourceType;
    private Integer status;
    private Integer failureCount;
    private Integer threshold;
    private Integer timeout;
    private LocalDateTime openTime;
    private LocalDateTime halfOpenTime;
    private LocalDateTime closeTime;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
