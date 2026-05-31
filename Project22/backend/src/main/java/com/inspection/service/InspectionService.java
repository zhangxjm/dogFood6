package com.inspection.service;

import com.inspection.dto.InspectionRecordDTO;
import com.inspection.dto.ReportDTO;
import com.inspection.dto.TrendDataPoint;
import com.inspection.dto.DefectDistribution;
import com.inspection.dto.LineStatistics;
import com.inspection.entity.DefectType;
import com.inspection.entity.InspectionRecord;
import com.inspection.entity.ProductionLine;
import com.inspection.repository.DefectTypeRepository;
import com.inspection.repository.InspectionRecordRepository;
import com.inspection.repository.ProductionLineRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InspectionService {

    private static final Logger log = LoggerFactory.getLogger(InspectionService.class);

    private final InspectionRecordRepository recordRepository;
    private final DefectTypeRepository defectTypeRepository;
    private final ProductionLineRepository lineRepository;

    public InspectionService(InspectionRecordRepository recordRepository, DefectTypeRepository defectTypeRepository, ProductionLineRepository lineRepository) {
        this.recordRepository = recordRepository;
        this.defectTypeRepository = defectTypeRepository;
        this.lineRepository = lineRepository;
    }

    public Page<InspectionRecordDTO> getRecords(int page, int size, String result, Long lineId, Long defectTypeId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "inspectedAt"));
        
        Page<InspectionRecord> records;
        if (result != null || lineId != null || defectTypeId != null) {
            records = recordRepository.findAll(pageable);
        } else {
            records = recordRepository.findAll(pageable);
        }
        
        return records.map(this::convertToDTO);
    }

    public InspectionRecordDTO getRecordById(Long id) {
        return recordRepository.findById(id).map(this::convertToDTO).orElse(null);
    }

    public InspectionRecordDTO createRecord(InspectionRecord record) {
        record.setInspectedAt(LocalDateTime.now());
        InspectionRecord saved = recordRepository.save(record);
        return convertToDTO(saved);
    }

    public Map<String, Long> getLineStatistics(Long lineId, LocalDateTime start, LocalDateTime end) {
        List<InspectionRecord> records = recordRepository.findAll();
        long total = 0, passed = 0, failed = 0;
        
        for (InspectionRecord r : records) {
            if (r.getLineId() != null && r.getLineId().equals(lineId) 
                && r.getInspectedAt() != null
                && !r.getInspectedAt().isBefore(start) 
                && !r.getInspectedAt().isAfter(end)) {
                total++;
                if ("PASS".equals(r.getResult())) passed++;
                else failed++;
            }
        }
        
        Map<String, Long> result = new HashMap<>();
        result.put("total", total);
        result.put("passed", passed);
        result.put("failed", failed);
        return result;
    }

    public ReportDTO getDailyReport(String date) {
        LocalDate localDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        return generateReport("DAILY", 
            LocalDateTime.of(localDate, LocalTime.MIN), 
            LocalDateTime.of(localDate, LocalTime.MAX));
    }

    public ReportDTO getWeeklyReport(String date) {
        LocalDate localDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        LocalDate weekStart = localDate.minusDays(localDate.getDayOfWeek().getValue() - 1);
        return generateReport("WEEKLY",
            LocalDateTime.of(weekStart, LocalTime.MIN),
            LocalDateTime.of(weekStart.plusDays(6), LocalTime.MAX));
    }

    public ReportDTO getMonthlyReport(String month) {
        LocalDate date = month != null ? LocalDate.parse(month + "-01") : LocalDate.now();
        LocalDate monthStart = date.withDayOfMonth(1);
        LocalDate monthEnd = date.withDayOfMonth(date.lengthOfMonth());
        return generateReport("MONTHLY",
            LocalDateTime.of(monthStart, LocalTime.MIN),
            LocalDateTime.of(monthEnd, LocalTime.MAX));
    }

    private ReportDTO generateReport(String periodType, LocalDateTime start, LocalDateTime end) {
        List<InspectionRecord> allRecords = recordRepository.findAll();
        List<InspectionRecord> recordsInPeriod = allRecords.stream()
            .filter(r -> r.getInspectedAt() != null 
                && !r.getInspectedAt().isBefore(start) 
                && !r.getInspectedAt().isAfter(end))
            .collect(Collectors.toList());

        long total = recordsInPeriod.size();
        long passed = recordsInPeriod.stream().filter(r -> "PASS".equals(r.getResult())).count();
        long failed = total - passed;

        List<TrendDataPoint> trendData = generateTrendData(periodType, start, allRecords);
        
        Map<Long, Long> defectCounts = new HashMap<>();
        recordsInPeriod.stream()
            .filter(r -> r.getDefectTypeId() != null)
            .forEach(r -> defectCounts.merge(r.getDefectTypeId(), 1L, Long::sum));

        List<DefectDistribution> defectDistribution = new ArrayList<>();
        for (Map.Entry<Long, Long> entry : defectCounts.entrySet()) {
            DefectType defectType = defectTypeRepository.findById(entry.getKey()).orElse(null);
            if (defectType != null) {
                defectDistribution.add(new DefectDistribution(
                    defectType.getName(),
                    defectType.getSeverity(),
                    defectType.getColorCode(),
                    entry.getValue(),
                    failed > 0 ? (entry.getValue() * 100.0 / failed) : 0
                ));
            }
        }
        defectDistribution.sort((a, b) -> Long.compare(b.getCount(), a.getCount()));

        List<LineStatistics> lineStatistics = new ArrayList<>();
        for (ProductionLine line : lineRepository.findAll()) {
            long lineTotal = recordsInPeriod.stream()
                .filter(r -> line.getId().equals(r.getLineId()))
                .count();
            long linePassed = recordsInPeriod.stream()
                .filter(r -> line.getId().equals(r.getLineId()) && "PASS".equals(r.getResult()))
                .count();
            long lineFailed = lineTotal - linePassed;
            lineStatistics.add(new LineStatistics(
                line.getId(),
                line.getName(),
                lineTotal,
                linePassed,
                lineFailed,
                lineTotal > 0 ? (linePassed * 100.0 / lineTotal) : 100.0
            ));
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        return new ReportDTO(
            periodType,
            start.format(formatter),
            end.format(formatter),
            total,
            passed,
            failed,
            total > 0 ? (passed * 100.0 / total) : 100.0,
            trendData,
            defectDistribution,
            lineStatistics
        );
    }

    private List<TrendDataPoint> generateTrendData(String periodType, LocalDateTime start, List<InspectionRecord> allRecords) {
        List<TrendDataPoint> trendData = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-dd");
        LocalDate current = start.toLocalDate();
        LocalDate endDate = start.toLocalDate().plusDays(periodType.equals("WEEKLY") ? 6 : 
            periodType.equals("MONTHLY") ? 29 : 0);

        while (!current.isAfter(endDate)) {
            LocalDateTime dayStart = LocalDateTime.of(current, LocalTime.MIN);
            LocalDateTime dayEnd = LocalDateTime.of(current, LocalTime.MAX);
            
            List<InspectionRecord> dayRecords = allRecords.stream()
                .filter(r -> r.getInspectedAt() != null 
                    && !r.getInspectedAt().isBefore(dayStart) 
                    && !r.getInspectedAt().isAfter(dayEnd))
                .collect(Collectors.toList());

            long dayTotal = dayRecords.size();
            long dayPassed = dayRecords.stream().filter(r -> "PASS".equals(r.getResult())).count();
            long dayFailed = dayTotal - dayPassed;

            trendData.add(new TrendDataPoint(
                current.format(formatter),
                dayTotal,
                dayPassed,
                dayFailed,
                dayTotal > 0 ? (dayPassed * 100.0 / dayTotal) : 100.0
            ));

            current = current.plusDays(1);
        }
        return trendData;
    }

    private InspectionRecordDTO convertToDTO(InspectionRecord record) {
        InspectionRecordDTO dto = new InspectionRecordDTO();
        dto.setId(record.getId());
        dto.setLineId(record.getLineId());
        dto.setCameraId(record.getCameraId());
        dto.setDefectTypeId(record.getDefectTypeId());
        dto.setModelId(record.getModelId());
        dto.setResult(record.getResult());
        dto.setConfidence(record.getConfidence());
        dto.setImagePath(record.getImagePath());
        dto.setAnnotatedImagePath(record.getAnnotatedImagePath());
        dto.setInspectedAt(record.getInspectedAt());

        if (record.getLineId() != null) {
            lineRepository.findById(record.getLineId()).ifPresent(l -> dto.setLineName(l.getName()));
        }
        if (record.getDefectTypeId() != null) {
            defectTypeRepository.findById(record.getDefectTypeId()).ifPresent(d -> {
                dto.setDefectTypeName(d.getName());
                dto.setDefectSeverity(d.getSeverity());
                dto.setDefectColorCode(d.getColorCode());
            });
        }
        return dto;
    }
}
