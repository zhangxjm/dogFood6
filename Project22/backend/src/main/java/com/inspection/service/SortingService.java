package com.inspection.service;

import com.inspection.dto.SortingStatisticsDTO;
import com.inspection.entity.SortingExecution;
import com.inspection.entity.SortingRule;
import com.inspection.repository.SortingExecutionRepository;
import com.inspection.repository.SortingRuleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class SortingService {

    private static final Logger log = LoggerFactory.getLogger(SortingService.class);

    private final SortingRuleRepository ruleRepository;
    private final SortingExecutionRepository executionRepository;

    public SortingService(SortingRuleRepository ruleRepository, SortingExecutionRepository executionRepository) {
        this.ruleRepository = ruleRepository;
        this.executionRepository = executionRepository;
    }

    public List<SortingRule> getAllRules() {
        return ruleRepository.findAll();
    }

    public SortingRule createRule(SortingRule rule) {
        return ruleRepository.save(rule);
    }

    public SortingRule updateRule(Long id, SortingRule rule) {
        rule.setId(id);
        return ruleRepository.save(rule);
    }

    public void deleteRule(Long id) {
        ruleRepository.deleteById(id);
    }

    public List<SortingExecution> getExecutions(int page, int size) {
        return executionRepository.findAll();
    }

    public SortingStatisticsDTO getStatistics() {
        LocalDateTime start = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        List<SortingExecution> todayExecutions = executionRepository.findAll().stream()
            .filter(e -> e.getExecutedAt() != null && !e.getExecutedAt().isBefore(start))
            .toList();

        long pass = todayExecutions.stream().filter(e -> "PASS".equals(e.getActionTaken())).count();
        long rework = todayExecutions.stream().filter(e -> "REWORK".equals(e.getActionTaken())).count();
        long reject = todayExecutions.stream().filter(e -> "REJECT".equals(e.getActionTaken())).count();
        long total = pass + rework + reject;

        return new SortingStatisticsDTO(
            total,
            pass,
            rework,
            reject,
            total > 0 ? (pass * 100.0 / total) : 100.0
        );
    }
}
