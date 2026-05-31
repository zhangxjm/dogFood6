package com.silvercare.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.silvercare.common.Result;
import com.silvercare.entity.ChatMessage;
import com.silvercare.entity.User;
import com.silvercare.mapper.ChatMessageMapper;
import com.silvercare.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatMessageMapper chatMessageMapper;

    @Autowired
    private UserMapper userMapper;

    @GetMapping("/history/{otherUserId}")
    public Result<List<ChatMessage>> getHistory(@PathVariable Long otherUserId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        QueryWrapper<ChatMessage> wrapper = new QueryWrapper<>();
        wrapper.and(w -> w.eq("from_user_id", userId).eq("to_user_id", otherUserId))
               .or(w -> w.eq("from_user_id", otherUserId).eq("to_user_id", userId));
        wrapper.orderByAsc("create_time");
        wrapper.last("LIMIT 100");
        return Result.success(chatMessageMapper.selectList(wrapper));
    }

    @GetMapping("/staff/list")
    public Result<List<User>> getStaffList() {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.in("role", "ADMIN", "STAFF");
        wrapper.eq("status", 1);
        return Result.success(userMapper.selectList(wrapper));
    }

    @PutMapping("/read/{messageId}")
    public Result<Void> markAsRead(@PathVariable Long messageId) {
        ChatMessage message = chatMessageMapper.selectById(messageId);
        if (message != null) {
            message.setIsRead(1);
            chatMessageMapper.updateById(message);
        }
        return Result.success();
    }
}
