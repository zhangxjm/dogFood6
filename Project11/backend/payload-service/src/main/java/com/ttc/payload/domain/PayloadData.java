package com.ttc.payload.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("payload_data")
public class PayloadData implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;
    private String deviceCode;
    private String deviceName;
    private String dataType;
    private String dataValue;
    private String unit;
    private Double thresholdMin;
    private Double thresholdMax;
    private Integer status;
    private LocalDateTime collectTime;
    private LocalDateTime createTime;
}
