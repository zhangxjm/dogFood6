package com.aerospace.groundstation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemStatusDTO {

    private ConnectionStatus kafkaStatus;
    private ConnectionStatus databaseStatus;
    private Long uptime;
    private Long totalRecords;
    private Long todayRecords;
    private Double memoryUsage;
    private Double cpuUsage;
    private Double diskUsage;

    public enum ConnectionStatus {
        CONNECTED, DISCONNECTED
    }
}
