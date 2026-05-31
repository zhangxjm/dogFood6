package com.silvercare.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.util.Date;

@Data
@TableName("chat_message")
public class ChatMessage {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long fromUserId;
    
    private Long toUserId;
    
    private String content;
    
    private String type;
    
    private Integer isRead;
    
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;
    
    @TableLogic
    private Integer deleted;
}
