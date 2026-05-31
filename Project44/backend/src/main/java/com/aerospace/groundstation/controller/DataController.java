package com.aerospace.groundstation.controller;

import com.aerospace.groundstation.dto.PageResult;
import com.aerospace.groundstation.dto.SatelliteDataDTO;
import com.aerospace.groundstation.service.DataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/data")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class DataController {

    private final DataService dataService;

    @GetMapping("/latest")
    public ResponseEntity<List<SatelliteDataDTO>> getLatestData(
            @RequestParam(defaultValue = "10") int limit) {
        List<SatelliteDataDTO> data = dataService.getLatestData(Math.min(limit, 50));
        return ResponseEntity.ok(data);
    }

    @GetMapping
    public ResponseEntity<PageResult<SatelliteDataDTO>> getData(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String satelliteId,
            @RequestParam(required = false) String dataType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {

        PageResult<SatelliteDataDTO> result = dataService.getData(
                page, size, satelliteId, dataType, status, startTime, endTime);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SatelliteDataDTO> getDataById(@PathVariable Long id) {
        SatelliteDataDTO data = dataService.getDataById(id);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(data);
    }
}
