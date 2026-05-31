package com.silvercare.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
@TableName("room")
public class Room {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String roomNo;
    
    private String name;
    
    private String type;
    
    private BigDecimal price;
    
    private String description;
    
    private String facilities;
    
    private String images;
    
    private Integer floor;
    
    private Integer bedCount;
    
    private String area;
    
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;
    
    @TableLogic
    private Integer deleted;
}
