package com.silvercare.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.util.Date;

@Data
@TableName("health_data")
public class HealthData {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long userId;
    
    private Integer systolicPressure;
    
    private Integer diastolicPressure;
    
    private Integer heartRate;
    
    private Integer bloodSugar;
    
    private Integer temperature;
    
    private Integer weight;
    
    private String remark;
    
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;
    
    @TableLogic
    private Integer deleted;
}
