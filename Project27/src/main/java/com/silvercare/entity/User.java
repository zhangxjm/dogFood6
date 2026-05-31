package com.silvercare.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.util.Date;

@Data
@TableName("user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String username;
    
    private String password;
    
    private String realName;
    
    private String phone;
    
    private String idCard;
    
    private Integer age;
    
    private String gender;
    
    private String avatar;
    
    private String role;
    
    private Integer status;
    
    private String emergencyContact;
    
    private String emergencyPhone;
    
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;
    
    @TableLogic
    private Integer deleted;
}
