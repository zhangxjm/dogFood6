package com.aerospace.groundstation.controller;

import com.aerospace.groundstation.dto.SystemStatusDTO;
import com.aerospace.groundstation.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class SystemController {

    private final StatisticsService statisticsService;

    @GetMapping("/status")
    public ResponseEntity<SystemStatusDTO> getSystemStatus() {
        SystemStatusDTO status = SystemStatusDTO.builder()
                .kafkaStatus(SystemStatusDTO.ConnectionStatus.CONNECTED)
                .databaseStatus(SystemStatusDTO.ConnectionStatus.CONNECTED)
                .uptime(statisticsService.getUptime())
                .totalRecords(statisticsService.getTotalRecords())
                .todayRecords(statisticsService.getTodayRecords())
                .memoryUsage(statisticsService.getMemoryUsage())
                .cpuUsage(statisticsService.getCpuUsage())
                .diskUsage(statisticsService.getDiskUsage())
                .build();
        
        return ResponseEntity.ok(status);
    }
}
