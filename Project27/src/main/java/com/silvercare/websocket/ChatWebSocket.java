package com.silvercare.websocket;

import com.alibaba.fastjson.JSON;
import com.silvercare.entity.ChatMessage;
import com.silvercare.mapper.ChatMessageMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@ServerEndpoint("/ws/chat/{userId}")
public class ChatWebSocket {

    private static final Map<Long, Session> onlineUsers = new ConcurrentHashMap<>();

    private static ChatMessageMapper chatMessageMapper;

    @Autowired
    public void setChatMessageMapper(ChatMessageMapper chatMessageMapper) {
        ChatWebSocket.chatMessageMapper = chatMessageMapper;
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("userId") Long userId) {
        onlineUsers.put(userId, session);
        log.info("User {} connected, online count: {}", userId, onlineUsers.size());
    }

    @OnClose
    public void onClose(@PathParam("userId") Long userId) {
        onlineUsers.remove(userId);
        log.info("User {} disconnected, online count: {}", userId, onlineUsers.size());
    }

    @OnMessage
    public void onMessage(String message, @PathParam("userId") Long fromUserId) {
        try {
            Map<String, Object> msgMap = JSON.parseObject(message);
            Long toUserId = Long.valueOf(msgMap.get("toUserId").toString());
            String content = msgMap.get("content").toString();
            String type = msgMap.getOrDefault("type", "text").toString();

            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setFromUserId(fromUserId);
            chatMessage.setToUserId(toUserId);
            chatMessage.setContent(content);
            chatMessage.setType(type);
            chatMessage.setIsRead(0);
            chatMessage.setCreateTime(new Date());

            chatMessageMapper.insert(chatMessage);

            Session toSession = onlineUsers.get(toUserId);
            if (toSession != null && toSession.isOpen()) {
                toSession.getAsyncRemote().sendText(JSON.toJSONString(chatMessage));
            }

            Session fromSession = onlineUsers.get(fromUserId);
            if (fromSession != null && fromSession.isOpen()) {
                fromSession.getAsyncRemote().sendText(JSON.toJSONString(chatMessage));
            }
        } catch (Exception e) {
            log.error("Message processing error", e);
        }
    }

    @OnError
    public void onError(Session session, Throwable error) {
        log.error("WebSocket error", error);
    }

    public static void sendMessageToUser(Long userId, String message) {
        Session session = onlineUsers.get(userId);
        if (session != null && session.isOpen()) {
            session.getAsyncRemote().sendText(message);
        }
    }
}
