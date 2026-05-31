package com.inspection.service;

import com.inspection.entity.*;
import com.inspection.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class DetectionSimulatorService {

    private static final Logger log = LoggerFactory.getLogger(DetectionSimulatorService.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final InspectionRecordRepository recordRepository;
    private final ProductionLineRepository lineRepository;
    private final CameraRepository cameraRepository;
    private final DefectTypeRepository defectTypeRepository;
    private final VisionModelRepository modelRepository;
    private final SystemSettingRepository settingRepository;
    private final SortingExecutionRepository sortingExecutionRepository;
    private final SortingRuleRepository sortingRuleRepository;

    private final Random random = new Random();

    public DetectionSimulatorService(SimpMessagingTemplate messagingTemplate, InspectionRecordRepository recordRepository, ProductionLineRepository lineRepository, CameraRepository cameraRepository, DefectTypeRepository defectTypeRepository, VisionModelRepository modelRepository, SystemSettingRepository settingRepository, SortingExecutionRepository sortingExecutionRepository, SortingRuleRepository sortingRuleRepository) {
        this.messagingTemplate = messagingTemplate;
        this.recordRepository = recordRepository;
        this.lineRepository = lineRepository;
        this.cameraRepository = cameraRepository;
        this.defectTypeRepository = defectTypeRepository;
        this.modelRepository = modelRepository;
        this.settingRepository = settingRepository;
        this.sortingExecutionRepository = sortingExecutionRepository;
        this.sortingRuleRepository = sortingRuleRepository;
    }

    @Scheduled(fixedRateString = "${simulation.interval:2000}")
    public void simulateInspection() {
        if (!isSimulationEnabled()) return;

        List<ProductionLine> runningLines = lineRepository.findAll().stream()
            .filter(line -> "RUNNING".equals(line.getStatus()))
            .toList();

        for (ProductionLine line : runningLines) {
            simulateLineInspection(line);
        }
    }

    private boolean isSimulationEnabled() {
        return settingRepository.findAll().stream()
            .filter(s -> "simulation.enabled".equals(s.getSettingKey()))
            .findFirst()
            .map(s -> "true".equalsIgnoreCase(s.getSettingValue()))
            .orElse(true);
    }

    private void simulateLineInspection(ProductionLine line) {
        List<Camera> cameras = cameraRepository.findAll().stream()
            .filter(c -> line.getId().equals(c.getLineId()) && "ONLINE".equals(c.getStatus()))
            .toList();

        if (cameras.isEmpty()) return;

        Camera camera = cameras.get(random.nextInt(cameras.size()));
        VisionModel activeModel = modelRepository.findAll().stream()
            .filter(VisionModel::getActive)
            .findFirst()
            .orElse(null);

        InspectionRecord record = new InspectionRecord();
        record.setLineId(line.getId());
        record.setCameraId(camera.getId());
        record.setModelId(activeModel != null ? activeModel.getId() : null);
        record.setInspectedAt(LocalDateTime.now());

        double passRate = 0.85 + random.nextDouble() * 0.1;
        if (random.nextDouble() < passRate) {
            record.setResult("PASS");
            record.setConfidence(0.9 + random.nextDouble() * 0.1);
        } else {
            record.setResult("FAIL");
            record.setConfidence(0.7 + random.nextDouble() * 0.25);
            List<DefectType> defects = defectTypeRepository.findAll();
            if (!defects.isEmpty()) {
                DefectType defect = defects.get(random.nextInt(defects.size()));
                record.setDefectTypeId(defect.getId());
            }
        }

        record.setImagePath("/demo-images/product-sample-" + (random.nextInt(5) + 1) + ".jpg");
        if ("FAIL".equals(record.getResult())) {
            record.setAnnotatedImagePath("/demo-images/product-defect-" + random.nextInt(3) + ".jpg");
        }

        InspectionRecord saved = recordRepository.save(record);
        processSorting(saved);

        messagingTemplate.convertAndSend("/topic/inspections", saved);
    }

    private void processSorting(InspectionRecord record) {
        if ("PASS".equals(record.getResult())) {
            createSortingExecution(record, null, "PASS");
            return;
        }

        DefectType defectType = defectTypeRepository.findById(record.getDefectTypeId()).orElse(null);
        if (defectType == null) {
            createSortingExecution(record, null, "REJECT");
            return;
        }

        List<SortingRule> rules = sortingRuleRepository.findAll().stream()
            .filter(SortingRule::getEnabled)
            .filter(rule -> rule.getDefectSeverity().equals(defectType.getSeverity()))
            .sorted((a, b) -> Integer.compare(a.getPriority(), b.getPriority()))
            .toList();

        String action = "REJECT";
        SortingRule appliedRule = null;

        if (!rules.isEmpty()) {
            appliedRule = rules.get(0);
            action = appliedRule.getAction();
        }

        createSortingExecution(record, appliedRule, action);
    }

    private void createSortingExecution(InspectionRecord record, SortingRule rule, String action) {
        SortingExecution execution = new SortingExecution();
        execution.setRecordId(record.getId());
        execution.setRuleId(rule != null ? rule.getId() : null);
        execution.setActionTaken(action);
        execution.setExecutedAt(LocalDateTime.now());
        sortingExecutionRepository.save(execution);
    }
}
