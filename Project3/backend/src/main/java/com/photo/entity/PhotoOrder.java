package com.photo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("photo_order")
public class PhotoOrder {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private Long reservationId;

    private Long packageId;

    private String packageName;

    private String customerName;

    private String phone;

    private BigDecimal amount;

    private Integer payStatus;

    private Integer orderStatus;

    private LocalDateTime payTime;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
