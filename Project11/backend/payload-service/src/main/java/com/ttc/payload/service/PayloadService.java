package com.ttc.payload.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.ttc.common.domain.Result;
import com.ttc.payload.domain.PayloadData;
import com.ttc.payload.domain.Device;
import java.util.List;
import java.util.Map;

public interface PayloadService extends IService<PayloadData> {
    Result<?> collectData(PayloadData data);
    Result<?> getRealtimeData(String deviceCode);
    Result<?> listData(Integer page, Integer size, String deviceCode, String dataType);
    Result<?> getDeviceList();
    Result<?> addDevice(Device device);
    Result<?> updateDevice(Device device);
    Result<?> deleteDevice(Long id);
    Result<?> getDeviceStatus(String deviceCode);
    Result<?> distributeData(PayloadData data);
    Result<?> getHistoryData(String deviceCode, String startTime, String endTime);
    Result<?> getDataStatistics();
}
