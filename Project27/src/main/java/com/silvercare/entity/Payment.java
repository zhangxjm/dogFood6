package com.silvercare.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
@TableName("payment")
public class Payment {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String orderNo;
    
    private Long bookingId;
    
    private Long userId;
    
    private BigDecimal amount;
    
    private String paymentMethod;
    
    private String transactionId;
    
    private String status;
    
    private Date payTime;
    
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;
    
    @TableLogic
    private Integer deleted;
}
