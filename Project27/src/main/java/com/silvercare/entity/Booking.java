package com.silvercare.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
@TableName("booking")
public class Booking {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String orderNo;
    
    private Long userId;
    
    private Long roomId;
    
    private Long packageId;
    
    private Date checkInDate;
    
    private Date checkOutDate;
    
    private Integer days;
    
    private BigDecimal totalAmount;
    
    private String status;
    
    private String remark;
    
    private String elderName;
    
    private String elderPhone;
    
    private String elderIdCard;
    
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;
    
    @TableLogic
    private Integer deleted;
}
