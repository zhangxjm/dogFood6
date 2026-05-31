package com.ipr.service;

import com.ipr.dto.MonitoringMessage;
import com.ipr.entity.LegalCase;
import com.ipr.repository.LegalCaseRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class LegalCaseService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(LegalCaseService.class);

    private final LegalCaseRepository legalCaseRepository;

    public LegalCaseService(LegalCaseRepository legalCaseRepository) {
        this.legalCaseRepository = legalCaseRepository;
    }

    public List<LegalCase> getAllCases() {
        return legalCaseRepository.findAll();
    }

    public LegalCase getCaseById(Long id) {
        return legalCaseRepository.findById(id).orElse(null);
    }

    public LegalCase getCaseByNumber(String caseNumber) {
        return legalCaseRepository.findByCaseNumber(caseNumber).orElse(null);
    }

    public List<LegalCase> getCasesByProductId(Long productId) {
        return legalCaseRepository.findByProductId(productId);
    }

    public LegalCase createCase(LegalCase legalCase) {
        if (legalCase.getCaseNumber() == null || legalCase.getCaseNumber().isEmpty()) {
            legalCase.setCaseNumber(generateCaseNumber());
        }
        legalCase.setStatus(LegalCase.CaseStatus.DRAFT);
        LegalCase saved = legalCaseRepository.save(legalCase);
        log.info("Legal case created: {}", saved.getCaseNumber());
        return saved;
    }

    public LegalCase updateCaseStatus(Long id, LegalCase.CaseStatus status) {
        LegalCase legalCase = legalCaseRepository.findById(id).orElse(null);
        if (legalCase != null) {
            legalCase.setStatus(status);
            if (status == LegalCase.CaseStatus.FILED) {
                legalCase.setFiledAt(LocalDateTime.now());
            } else if (status == LegalCase.CaseStatus.CLOSED_WON ||
                    status == LegalCase.CaseStatus.CLOSED_LOST ||
                    status == LegalCase.CaseStatus.SETTLED) {
                legalCase.setClosedAt(LocalDateTime.now());
            }
            return legalCaseRepository.save(legalCase);
        }
        return null;
    }

    public LegalCase updateCase(Long id, LegalCase legalCase) {
        LegalCase existing = legalCaseRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setCaseTitle(legalCase.getCaseTitle());
            existing.setCaseDescription(legalCase.getCaseDescription());
            existing.setPlaintiff(legalCase.getPlaintiff());
            existing.setDefendant(legalCase.getDefendant());
            existing.setAttorney(legalCase.getAttorney());
            existing.setCaseType(legalCase.getCaseType());
            existing.setCourtDate(legalCase.getCourtDate());
            existing.setResult(legalCase.getResult());
            return legalCaseRepository.save(existing);
        }
        return null;
    }

    public void deleteCase(Long id) {
        legalCaseRepository.deleteById(id);
    }

    @RabbitListener(queues = "${ipr.rabbitmq.queue.legal}")
    public void processLegalMessage(MonitoringMessage message) {
        log.info("Received legal workflow message: {}", message);

        if ("EVIDENCE_COLLECTED".equals(message.getAction())) {
            createAutoCase(message.getProductId(), message.getProductName(), message.getPlatform());
        }
    }

    private void createAutoCase(Long productId, String productName, String platform) {
        log.info("Creating automatic legal case for product: {}", productId);

        LegalCase legalCase = new LegalCase();
        legalCase.setCaseNumber(generateCaseNumber());
        legalCase.setProductId(productId);
        legalCase.setCaseTitle("跨境电商侵权案件 - " + productName);
        legalCase.setCaseDescription("平台" + platform + "发现疑似侵权商品，证据已自动收集，系统自动生成维权案件。");
        legalCase.setPlaintiff("知识产权权利人");
        legalCase.setDefendant("平台商家 - " + platform);
        legalCase.setStatus(LegalCase.CaseStatus.PREPARING);
        legalCase.setCaseType(LegalCase.CaseType.TRADEMARK);

        LegalCase saved = legalCaseRepository.save(legalCase);
        log.info("Automatic legal case created: {}", saved.getCaseNumber());
    }

    private String generateCaseNumber() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "IPR-" + date + "-" + uuid;
    }

    public long getCaseCountByStatus(LegalCase.CaseStatus status) {
        return legalCaseRepository.countByStatus(status);
    }
}
