package com.ttc.payload.impl;

import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ttc.common.constant.CommonConstants;
import com.ttc.common.domain.Result;
import com.ttc.common.exception.BusinessException;
import com.ttc.payload.domain.Device;
import com.ttc.payload.domain.PayloadData;
import com.ttc.payload.mapper.DeviceMapper;
import com.ttc.payload.mapper.PayloadDataMapper;
import com.ttc.payload.service.PayloadService;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.client.producer.SendCallback;
import org.apache.rocketmq.client.producer.SendResult;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class PayloadServiceImpl extends ServiceImpl<PayloadDataMapper, PayloadData> implements PayloadService {

    @Autowired
    private DeviceMapper deviceMapper;

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<?> collectData(PayloadData data) {
        data.setCollectTime(LocalDateTime.now());
        data.setCreateTime(LocalDateTime.now());
        checkDataThreshold(data);
        save(data);
        String cacheKey = CommonConstants.REDIS_KEY_PREFIX_PAYLOAD + data.getDeviceCode() + ":" + data.getDataType();
        redisTemplate.opsForValue().set(cacheKey, JSON.toJSONString(data), 1, TimeUnit.MINUTES);
        distributeData(data);
        log.info("载荷数据采集成功, deviceCode: {}, dataType: {}", data.getDeviceCode(), data.getDataType());
        return Result.success(data);
    }

    private void checkDataThreshold(PayloadData data) {
        if (data.getThresholdMin() != null && data.getThresholdMax() != null) {
            try {
                double value = Double.parseDouble(data.getDataValue());
                if (value < data.getThresholdMin() || value > data.getThresholdMax()) {
                    data.setStatus(CommonConstants.PAYLOAD_STATUS_ABNORMAL);
                    Map<String, Object> alert = new HashMap<>();
                    alert.put("type", "payload_abnormal");
                    alert.put("deviceCode", data.getDeviceCode());
                    alert.put("dataType", data.getDataType());
                    alert.put("value", value);
                    alert.put("thresholdMin", data.getThresholdMin());
                    alert.put("thresholdMax", data.getThresholdMax());
                    alert.put("time", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
                    rocketMQTemplate.asyncSend(CommonConstants.ROCKETMQ_TOPIC_ALERT,
                            MessageBuilder.withPayload(JSON.toJSONString(alert)).build(),
                            new SendCallback() {
                                @Override
                                public void onSuccess(SendResult sendResult) {
                                    log.debug("载荷异常告警发送成功, deviceCode: {}, dataType: {}",
                                            data.getDeviceCode(), data.getDataType());
                                }
                                @Override
                                public void onException(Throwable e) {
                                    log.error("载荷异常告警发送失败, deviceCode: {}, dataType: {}",
                                            data.getDeviceCode(), data.getDataType(), e);
                                }
                            });
                    log.warn("载荷数据异常, deviceCode: {}, dataType: {}, value: {}",
                            data.getDeviceCode(), data.getDataType(), value);
                    return;
                }
            } catch (NumberFormatException e) {
                log.debug("非数值类型数据,跳过阈值检查");
            }
        }
        data.setStatus(CommonConstants.PAYLOAD_STATUS_NORMAL);
    }

    @Override
    public Result<?> getRealtimeData(String deviceCode) {
        String cacheKey = CommonConstants.REDIS_KEY_PREFIX_PAYLOAD + deviceCode + ":*";
        Set<String> keys = redisTemplate.keys(cacheKey);
        if (keys != null && !keys.isEmpty()) {
            Map<String, PayloadData> result = new HashMap<>();
            for (String key : keys) {
                String data = redisTemplate.opsForValue().get(key);
                if (data != null) {
                    PayloadData payloadData = JSON.parseObject(data, PayloadData.class);
                    result.put(payloadData.getDataType(), payloadData);
                }
            }
            return Result.success(result);
        }
        QueryWrapper<PayloadData> wrapper = new QueryWrapper<>();
        wrapper.eq("device_code", deviceCode).orderByDesc("collect_time").last("limit 10");
        List<PayloadData> list = list(wrapper);
        Map<String, PayloadData> result = new HashMap<>();
        for (PayloadData data : list) {
            result.put(data.getDataType(), data);
        }
        return Result.success(result);
    }

    @Override
    public Result<?> listData(Integer page, Integer size, String deviceCode, String dataType) {
        QueryWrapper<PayloadData> wrapper = new QueryWrapper<>();
        if (deviceCode != null && !deviceCode.isEmpty()) {
            wrapper.eq("device_code", deviceCode);
        }
        if (dataType != null && !dataType.isEmpty()) {
            wrapper.eq("data_type", dataType);
        }
        wrapper.orderByDesc("collect_time");
        Page<PayloadData> pageResult = page(new Page<>(page, size), wrapper);
        Map<String, Object> result = new HashMap<>();
        result.put("list", pageResult.getRecords());
        result.put("total", pageResult.getTotal());
        return Result.success(result);
    }

    @Override
    public Result<?> getDeviceList() {
        List<Device> devices = deviceMapper.selectList(null);
        return Result.success(devices);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<?> addDevice(Device device) {
        QueryWrapper<Device> wrapper = new QueryWrapper<>();
        wrapper.eq("device_code", device.getDeviceCode());
        if (deviceMapper.selectCount(wrapper) > 0) {
            return Result.error("设备编码已存在");
        }
        device.setCreateTime(LocalDateTime.now());
        device.setUpdateTime(LocalDateTime.now());
        deviceMapper.insert(device);
        return Result.success(device);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<?> updateDevice(Device device) {
        device.setUpdateTime(LocalDateTime.now());
        deviceMapper.updateById(device);
        return Result.success(device);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<?> deleteDevice(Long id) {
        deviceMapper.deleteById(id);
        return Result.success();
    }

    @Override
    public Result<?> getDeviceStatus(String deviceCode) {
        Map<String, Object> result = new HashMap<>();
        QueryWrapper<Device> deviceWrapper = new QueryWrapper<>();
        deviceWrapper.eq("device_code", deviceCode);
        Device device = deviceMapper.selectOne(deviceWrapper);
        if (device == null) {
            return Result.error("设备不存在");
        }
        result.put("device", device);
        QueryWrapper<PayloadData> dataWrapper = new QueryWrapper<>();
        dataWrapper.eq("device_code", deviceCode).orderByDesc("collect_time").last("limit 1");
        PayloadData latestData = getOne(dataWrapper);
        result.put("latestData", latestData);
        long abnormalCount = count(new QueryWrapper<PayloadData>()
                .eq("device_code", deviceCode)
                .eq("status", CommonConstants.PAYLOAD_STATUS_ABNORMAL)
                .ge("collect_time", LocalDateTime.now().minusHours(1)));
        result.put("abnormalCountLastHour", abnormalCount);
        return Result.success(result);
    }

    @Override
    public Result<?> distributeData(PayloadData data) {
        rocketMQTemplate.asyncSend(CommonConstants.ROCKETMQ_TOPIC_PAYLOAD,
                MessageBuilder.withPayload(JSON.toJSONString(data)).build(),
                new SendCallback() {
                    @Override
                    public void onSuccess(SendResult sendResult) {
                        log.debug("载荷数据分发成功, deviceCode: {}, dataType: {}",
                                data.getDeviceCode(), data.getDataType());
                    }
                    @Override
                    public void onException(Throwable e) {
                        log.error("载荷数据分发失败, deviceCode: {}, dataType: {}",
                                data.getDeviceCode(), data.getDataType(), e);
                    }
                });
        log.debug("载荷数据分发, deviceCode: {}, dataType: {}", data.getDeviceCode(), data.getDataType());
        return Result.success();
    }

    @Override
    public Result<?> getHistoryData(String deviceCode, String startTime, String endTime) {
        QueryWrapper<PayloadData> wrapper = new QueryWrapper<>();
        wrapper.eq("device_code", deviceCode);
        if (startTime != null && !startTime.isEmpty()) {
            wrapper.ge("collect_time", LocalDateTime.parse(startTime, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        if (endTime != null && !endTime.isEmpty()) {
            wrapper.le("collect_time", LocalDateTime.parse(endTime, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        wrapper.orderByAsc("collect_time");
        List<PayloadData> list = list(wrapper);
        return Result.success(list);
    }

    @Override
    public Result<?> getDataStatistics() {
        Map<String, Object> result = new HashMap<>();
        long totalDevices = deviceMapper.selectCount(null);
        long activeDevices = deviceMapper.selectCount(new QueryWrapper<Device>().eq("status", 1));
        long totalData = count(null);
        long todayData = count(new QueryWrapper<PayloadData>().ge("collect_time", LocalDateTime.now().toLocalDate().atStartOfDay()));
        long abnormalData = count(new QueryWrapper<PayloadData>().eq("status", CommonConstants.PAYLOAD_STATUS_ABNORMAL));
        result.put("totalDevices", totalDevices);
        result.put("activeDevices", activeDevices);
        result.put("totalData", totalData);
        result.put("todayData", todayData);
        result.put("abnormalData", abnormalData);
        return Result.success(result);
    }
}
