package com.ttc.common.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;

import java.util.Collections;
import java.util.concurrent.TimeUnit;

@Slf4j
public class RedisLockUtil {
    private static final StringRedisTemplate redisTemplate = SpringContextUtil.getBean(StringRedisTemplate.class);
    private static final String UNLOCK_SCRIPT =
            "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
    private static final RedisScript<Long> UNLOCK_REDIS_SCRIPT = new DefaultRedisScript<>(UNLOCK_SCRIPT, Long.class);

    public static boolean tryLock(String lockKey, String requestId, long expireTime) {
        try {
            Boolean result = redisTemplate.opsForValue().setIfAbsent(lockKey, requestId, expireTime, TimeUnit.SECONDS);
            return Boolean.TRUE.equals(result);
        } catch (Exception e) {
            log.error("获取分布式锁异常, lockKey: {}, requestId: {}", lockKey, requestId, e);
            return false;
        }
    }

    public static boolean tryLock(String lockKey, String requestId) {
        return tryLock(lockKey, requestId, 30);
    }

    public static void unlock(String lockKey, String requestId) {
        try {
            redisTemplate.execute(UNLOCK_REDIS_SCRIPT, Collections.singletonList(lockKey), requestId);
        } catch (Exception e) {
            log.error("释放分布式锁异常, lockKey: {}, requestId: {}", lockKey, requestId, e);
        }
    }
}
