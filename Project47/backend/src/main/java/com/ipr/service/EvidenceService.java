package com.ipr.service;

import com.ipr.dto.MonitoringMessage;
import com.ipr.entity.Evidence;
import com.ipr.repository.EvidenceRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class EvidenceService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(EvidenceService.class);

    private final EvidenceRepository evidenceRepository;
    private final RabbitTemplate rabbitTemplate;

    @Value("${ipr.rabbitmq.exchange}")
    private String exchange;

    @Value("${ipr.rabbitmq.routing.legal}")
    private String legalRouting;

    public EvidenceService(EvidenceRepository evidenceRepository, RabbitTemplate rabbitTemplate) {
        this.evidenceRepository = evidenceRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    public List<Evidence> getAllEvidence() {
        return evidenceRepository.findAll();
    }

    public Evidence getEvidenceById(Long id) {
        return evidenceRepository.findById(id).orElse(null);
    }

    public List<Evidence> getEvidenceByProductId(Long productId) {
        return evidenceRepository.findByProductId(productId);
    }

    public Evidence addEvidence(Evidence evidence) {
        evidence.setStatus(Evidence.EvidenceStatus.COLLECTED);
        Evidence saved = evidenceRepository.save(evidence);
        log.info("Evidence added: {}", saved.getId());
        return saved;
    }

    public Evidence updateEvidenceStatus(Long id, Evidence.EvidenceStatus status) {
        Evidence evidence = evidenceRepository.findById(id).orElse(null);
        if (evidence != null) {
            evidence.setStatus(status);
            if (status == Evidence.EvidenceStatus.NOTARIZED) {
                evidence.setNotaryId("NOTARY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                evidence.setNotarizedAt(LocalDateTime.now());
            }
            return evidenceRepository.save(evidence);
        }
        return null;
    }

    public void deleteEvidence(Long id) {
        evidenceRepository.deleteById(id);
    }

    @RabbitListener(queues = "${ipr.rabbitmq.queue.evidence}")
    public void processEvidenceMessage(MonitoringMessage message) {
        log.info("Received evidence collection request: {}", message);
        collectEvidence(message.getProductId(), message.getProductName(), message.getPlatform());
    }

    public void collectEvidence(Long productId, String productName, String platform) {
        log.info("Starting evidence collection for product: {}", productId);

        Evidence screenshot = new Evidence();
        screenshot.setProductId(productId);
        screenshot.setType(Evidence.EvidenceType.SCREENSHOT);
        screenshot.setFileName("screenshot_" + productId + "_" + System.currentTimeMillis() + ".png");
        screenshot.setFilePath("/evidence/" + productId + "/screenshots/");
        screenshot.setFileSize(1024L * 500);
        screenshot.setFileHash(generateHash(productId + "_screenshot"));
        screenshot.setDescription("商品页面截图 - " + productName + " (" + platform + ")");
        screenshot.setStatus(Evidence.EvidenceStatus.VERIFIED);
        evidenceRepository.save(screenshot);

        Evidence pageSource = new Evidence();
        pageSource.setProductId(productId);
        pageSource.setType(Evidence.EvidenceType.PAGE_SOURCE);
        pageSource.setFileName("page_source_" + productId + "_" + System.currentTimeMillis() + ".html");
        pageSource.setFilePath("/evidence/" + productId + "/pages/");
        pageSource.setFileSize(1024L * 100);
        pageSource.setFileHash(generateHash(productId + "_pagesource"));
        pageSource.setDescription("商品页面源代码 - " + productName + " (" + platform + ")");
        pageSource.setStatus(Evidence.EvidenceStatus.VERIFIED);
        evidenceRepository.save(pageSource);

        log.info("Evidence collection complete for product: {}", productId);

        MonitoringMessage legalMessage = new MonitoringMessage();
        legalMessage.setProductId(productId);
        legalMessage.setProductName(productName);
        legalMessage.setPlatform(platform);
        legalMessage.setAction("EVIDENCE_COLLECTED");
        legalMessage.setTimestamp(System.currentTimeMillis());

        rabbitTemplate.convertAndSend(exchange, legalRouting, legalMessage);
        log.info("Sent legal workflow notification for product: {}", productId);
    }

    private String generateHash(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest((input + System.currentTimeMillis()).getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().substring(0, 32);
        } catch (NoSuchAlgorithmException e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }

    public long getEvidenceCountByStatus(Evidence.EvidenceStatus status) {
        return evidenceRepository.countByStatus(status);
    }
}
