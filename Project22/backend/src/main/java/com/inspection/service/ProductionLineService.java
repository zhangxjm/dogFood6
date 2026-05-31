package com.inspection.service;

import com.inspection.dto.ProductionLineStatusDTO;
import com.inspection.entity.ProductionLine;
import com.inspection.repository.ProductionLineRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductionLineService {

    private static final Logger log = LoggerFactory.getLogger(ProductionLineService.class);

    private final ProductionLineRepository lineRepository;
    private final InspectionService inspectionService;

    public ProductionLineService(ProductionLineRepository lineRepository, InspectionService inspectionService) {
        this.lineRepository = lineRepository;
        this.inspectionService = inspectionService;
    }

    public List<ProductionLine> getAllLines() {
        return lineRepository.findAll();
    }

    public ProductionLine getLineById(Long id) {
        return lineRepository.findById(id).orElse(null);
    }

    public ProductionLine createLine(ProductionLine line) {
        return lineRepository.save(line);
    }

    public ProductionLine updateLine(Long id, ProductionLine line) {
        line.setId(id);
        return lineRepository.save(line);
    }

    public void deleteLine(Long id) {
        lineRepository.deleteById(id);
    }

    public List<ProductionLineStatusDTO> getAllLineStatuses() {
        List<ProductionLine> lines = lineRepository.findAll();
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        
        return lines.stream().map(line -> {
            var stats = inspectionService.getLineStatistics(line.getId(), startOfDay, LocalDateTime.now());
            return new ProductionLineStatusDTO(
                line.getId(),
                line.getName(),
                line.getStatus(),
                line.getSpeed(),
                stats.get("total"),
                stats.get("passed"),
                stats.get("failed"),
                stats.get("total") > 0 ? (stats.get("passed") * 100.0 / stats.get("total")) : 100.0,
                2,
                "RUNNING".equals(line.getStatus()) ? 2 : 0
            );
        }).collect(Collectors.toList());
    }
}
