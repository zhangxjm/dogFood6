package com.aerospace.groundstation.controller;

import com.aerospace.groundstation.dto.DataStatisticsDTO;
import com.aerospace.groundstation.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/realtime")
    public ResponseEntity<Map<String, Object>> getRealtimeStatistics() {
        DataStatisticsDTO stats = statisticsService.getRealtimeStatistics();
        
        Map<String, Object> result = new HashMap<>();
        result.put("statistics", stats);
        result.put("queueSize", statisticsService.getProcessingQueueSize());
        result.put("throughput", statisticsService.getCurrentThroughput());
        result.put("totalRecords", statisticsService.getTotalRecords());
        result.put("todayRecords", statisticsService.getTodayRecords());
        result.put("errorCount", statisticsService.getErrorCount());
        result.put("processedCount", statisticsService.getProcessedCount());
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public ResponseEntity<List<DataStatisticsDTO>> getHistoryStatistics(
            @RequestParam(defaultValue = "30") int minutes) {
        List<DataStatisticsDTO> history = statisticsService.getHistoryStatistics(Math.min(minutes, 300));
        return ResponseEntity.ok(history);
    }
}
