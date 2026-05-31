package com.ttc.command.impl;

import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ttc.command.domain.Command;
import com.ttc.command.mapper.CommandMapper;
import com.ttc.command.service.CommandService;
import com.ttc.common.constant.CommonConstants;
import com.ttc.common.domain.Result;
import com.ttc.common.exception.BusinessException;
import com.ttc.common.utils.RedisLockUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.client.producer.SendCallback;
import org.apache.rocketmq.client.producer.SendResult;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class CommandServiceImpl extends ServiceImpl<CommandMapper, Command> implements CommandService {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<?> sendCommand(Command command) {
        String lockKey = CommonConstants.REDIS_LOCK_PREFIX + "send:" + command.getCommandCode();
        String requestId = UUID.randomUUID().toString();
        try {
            if (!RedisLockUtil.tryLock(lockKey, requestId, CommonConstants.REDIS_LOCK_EXPIRE_TIME)) {
                return Result.error("指令正在发送中，请稍后再试");
            }
            command.setStatus(CommonConstants.COMMAND_STATUS_PENDING);
            command.setCreateTime(LocalDateTime.now());
            command.setUpdateTime(LocalDateTime.now());
            if (command.getCommandCode() == null) {
                command.setCommandCode("CMD" + System.currentTimeMillis());
            }
            save(command);
            rocketMQTemplate.syncSend(CommonConstants.ROCKETMQ_TOPIC_COMMAND + ":send",
                    MessageBuilder.withPayload(JSON.toJSONString(command)).build());
            log.info("指令发送成功, commandCode: {}, id: {}", command.getCommandCode(), command.getId());
            return Result.success(command);
        } catch (Exception e) {
            log.error("发送指令异常", e);
            throw new BusinessException("发送指令失败: " + e.getMessage());
        } finally {
            RedisLockUtil.unlock(lockKey, requestId);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<?> executeCommand(Long id) {
        Command command = getById(id);
        if (command == null) {
            return Result.error("指令不存在");
        }
        if (!CommonConstants.COMMAND_STATUS_PENDING.equals(command.getStatus())) {
            return Result.error("指令状态不允许执行");
        }
        String lockKey = CommonConstants.REDIS_LOCK_PREFIX + "execute:" + id;
        String requestId = UUID.randomUUID().toString();
        try {
            if (!RedisLockUtil.tryLock(lockKey, requestId, CommonConstants.REDIS_LOCK_EXPIRE_TIME)) {
                return Result.error("指令正在执行中，请稍后再试");
            }
            command.setStatus(CommonConstants.COMMAND_STATUS_EXECUTING);
            command.setExecuteTime(LocalDateTime.now());
            command.setUpdateTime(LocalDateTime.now());
            updateById(command);
            rocketMQTemplate.syncSend(CommonConstants.ROCKETMQ_TOPIC_COMMAND + ":execute",
                    MessageBuilder.withPayload(JSON.toJSONString(command)).build());
            redisTemplate.opsForValue().set(CommonConstants.REDIS_KEY_PREFIX_COMMAND + id,
                    JSON.toJSONString(command), 5, TimeUnit.MINUTES);
            log.info("指令执行中, commandCode: {}, id: {}", command.getCommandCode(), id);
            return Result.success(command);
        } catch (Exception e) {
            log.error("执行指令异常", e);
            throw new BusinessException("执行指令失败: " + e.getMessage());
        } finally {
            RedisLockUtil.unlock(lockKey, requestId);
        }
    }

    @Override
    public Result<?> getCommandStatus(Long id) {
        String cacheKey = CommonConstants.REDIS_KEY_PREFIX_COMMAND + id;
        String cacheData = redisTemplate.opsForValue().get(cacheKey);
        if (cacheData != null) {
            return Result.success(JSON.parseObject(cacheData, Command.class));
        }
        Command command = getById(id);
        if (command == null) {
            return Result.error("指令不存在");
        }
        redisTemplate.opsForValue().set(cacheKey, JSON.toJSONString(command), 5, TimeUnit.MINUTES);
        return Result.success(command);
    }

    @Override
    public Result<?> listCommands(Integer page, Integer size, String commandType, Integer status) {
        QueryWrapper<Command> wrapper = new QueryWrapper<>();
        if (commandType != null && !commandType.isEmpty()) {
            wrapper.eq("command_type", commandType);
        }
        if (status != null) {
            wrapper.eq("status", status);
        }
        wrapper.orderByDesc("create_time");
        Page<Command> pageResult = page(new Page<>(page, size), wrapper);
        Map<String, Object> result = new HashMap<>();
        result.put("list", pageResult.getRecords());
        result.put("total", pageResult.getTotal());
        result.put("page", page);
        result.put("size", size);
        return Result.success(result);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<?> updateCommandStatus(Long id, Integer status, String result) {
        Command command = getById(id);
        if (command == null) {
            return Result.error("指令不存在");
        }
        command.setStatus(status);
        command.setExecuteResult(result);
        command.setUpdateTime(LocalDateTime.now());
        if (CommonConstants.COMMAND_STATUS_SUCCESS.equals(status) ||
            CommonConstants.COMMAND_STATUS_FAILED.equals(status) ||
            CommonConstants.COMMAND_STATUS_TIMEOUT.equals(status)) {
            command.setFinishTime(LocalDateTime.now());
        }
        updateById(command);
        redisTemplate.delete(CommonConstants.REDIS_KEY_PREFIX_COMMAND + id);
        rocketMQTemplate.syncSend(CommonConstants.ROCKETMQ_TOPIC_ALERT,
                MessageBuilder.withPayload(JSON.toJSONString(command)).build());
        return Result.success();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<?> batchSendCommands(List<Command> commands) {
        LocalDateTime now = LocalDateTime.now();
        for (Command command : commands) {
            command.setStatus(CommonConstants.COMMAND_STATUS_PENDING);
            command.setCreateTime(now);
            command.setUpdateTime(now);
            if (command.getCommandCode() == null) {
                command.setCommandCode("CMD" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4));
            }
        }
        saveBatch(commands);
        for (Command command : commands) {
            rocketMQTemplate.asyncSend(CommonConstants.ROCKETMQ_TOPIC_COMMAND + ":send",
                    MessageBuilder.withPayload(JSON.toJSONString(command)).build(),
                    new SendCallback() {
                        @Override
                        public void onSuccess(SendResult sendResult) {
                            log.info("批量指令发送成功, commandCode: {}", command.getCommandCode());
                        }
                        @Override
                        public void onException(Throwable e) {
                            log.error("批量指令发送失败, commandCode: {}", command.getCommandCode(), e);
                        }
                    });
        }
        log.info("批量发送指令成功, 数量: {}", commands.size());
        return Result.success();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<?> cancelCommand(Long id) {
        Command command = getById(id);
        if (command == null) {
            return Result.error("指令不存在");
        }
        if (!CommonConstants.COMMAND_STATUS_PENDING.equals(command.getStatus())) {
            return Result.error("只能取消待发送的指令");
        }
        command.setStatus(CommonConstants.COMMAND_STATUS_FAILED);
        command.setExecuteResult("用户取消");
        command.setUpdateTime(LocalDateTime.now());
        command.setFinishTime(LocalDateTime.now());
        updateById(command);
        return Result.success();
    }
}
