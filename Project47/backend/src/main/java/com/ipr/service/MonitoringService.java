package com.ipr.service;

import com.ipr.dto.MonitoringMessage;
import com.ipr.entity.Product;
import com.ipr.repository.ProductRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class MonitoringService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MonitoringService.class);

    private final ProductRepository productRepository;
    private final RabbitTemplate rabbitTemplate;

    @Value("${ipr.rabbitmq.exchange}")
    private String exchange;

    @Value("${ipr.rabbitmq.routing.evidence}")
    private String evidenceRouting;

    public MonitoringService(ProductRepository productRepository, RabbitTemplate rabbitTemplate) {
        this.productRepository = productRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product addProduct(Product product) {
        product.setInfringementStatus(Product.InfringementStatus.PENDING);
        Product saved = productRepository.save(product);

        MonitoringMessage message = new MonitoringMessage();
        message.setProductId(saved.getId());
        message.setProductName(saved.getName());
        message.setPlatform(saved.getPlatform());
        message.setProductUrl(saved.getProductUrl());
        message.setAction("NEW_PRODUCT");
        message.setTimestamp(System.currentTimeMillis());

        rabbitTemplate.convertAndSend(exchange, evidenceRouting, message);
        log.info("Sent evidence collection request for product: {}", saved.getId());

        return saved;
    }

    public Product updateProductStatus(Long id, Product.InfringementStatus status) {
        Product product = productRepository.findById(id).orElse(null);
        if (product != null) {
            product.setInfringementStatus(status);
            product.setDetectedAt(LocalDateTime.now());
            return productRepository.save(product);
        }
        return null;
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    @RabbitListener(queues = "${ipr.rabbitmq.queue.monitoring}")
    public void processMonitoringMessage(MonitoringMessage message) {
        log.info("Received monitoring message: {}", message);

        if ("ANALYZE".equals(message.getAction())) {
            analyzeProduct(message.getProductId());
        }
    }

    @Async
    public void analyzeProduct(Long productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            log.warn("Product not found: {}", productId);
            return;
        }

        log.info("Analyzing product: {}", productId);

        Random random = new Random();
        int score = random.nextInt(101);
        product.setInfringementScore(score);

        if (score >= 70) {
            product.setInfringementStatus(Product.InfringementStatus.CONFIRMED);
        } else if (score >= 40) {
            product.setInfringementStatus(Product.InfringementStatus.SUSPECTED);
        } else {
            product.setInfringementStatus(Product.InfringementStatus.CLEARED);
        }

        product.setDetectedAt(LocalDateTime.now());
        productRepository.save(product);

        log.info("Product analysis complete: {}, score: {}, status: {}",
                productId, score, product.getInfringementStatus());
    }

    public List<Product> getProductsByStatus(Product.InfringementStatus status) {
        return productRepository.findByInfringementStatus(status);
    }

    public long getProductCountByStatus(Product.InfringementStatus status) {
        return productRepository.countByInfringementStatus(status);
    }
}
