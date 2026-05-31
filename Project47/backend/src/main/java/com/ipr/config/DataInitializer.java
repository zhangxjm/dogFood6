package com.ipr.config;

import com.ipr.entity.CopyrightWork;
import com.ipr.entity.Evidence;
import com.ipr.entity.LegalCase;
import com.ipr.entity.Product;
import com.ipr.repository.CopyrightWorkRepository;
import com.ipr.repository.EvidenceRepository;
import com.ipr.repository.LegalCaseRepository;
import com.ipr.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DataInitializer.class);

    private final ProductRepository productRepository;
    private final EvidenceRepository evidenceRepository;
    private final LegalCaseRepository legalCaseRepository;
    private final CopyrightWorkRepository copyrightWorkRepository;

    public DataInitializer(ProductRepository productRepository, EvidenceRepository evidenceRepository,
                           LegalCaseRepository legalCaseRepository, CopyrightWorkRepository copyrightWorkRepository) {
        this.productRepository = productRepository;
        this.evidenceRepository = evidenceRepository;
        this.legalCaseRepository = legalCaseRepository;
        this.copyrightWorkRepository = copyrightWorkRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            log.info("Initializing sample data...");
            initCopyrightWorks();
            initProducts();
            initEvidence();
            initLegalCases();
            log.info("Sample data initialization complete.");
        } else {
            log.info("Sample data already exists, skipping initialization.");
        }
    }

    private void initCopyrightWorks() {
        CopyrightWork work1 = new CopyrightWork();
        work1.setWorkName("品牌Logo - 跨境优品");
        work1.setWorkType("商标");
        work1.setOwner("跨境优品有限公司");
        work1.setRegistrationNumber("TM-2024-001234");
        work1.setRegistrationDate(LocalDateTime.now().minusMonths(6));
        work1.setDescription("跨境优品品牌注册商标，包含文字和图形设计");
        work1.setKeywords("跨境优品,品牌,logo,商标");
        work1.setStatus(CopyrightWork.WorkStatus.ACTIVE);
        copyrightWorkRepository.save(work1);

        CopyrightWork work2 = new CopyrightWork();
        work2.setWorkName("智能手表外观设计");
        work2.setWorkType("外观设计专利");
        work2.setOwner("创新科技有限公司");
        work2.setRegistrationNumber("PAT-2024-056789");
        work2.setRegistrationDate(LocalDateTime.now().minusMonths(3));
        work2.setDescription("新一代智能手表外观设计专利");
        work2.setKeywords("智能手表,外观设计,专利");
        work2.setStatus(CopyrightWork.WorkStatus.ACTIVE);
        copyrightWorkRepository.save(work2);

        CopyrightWork work3 = new CopyrightWork();
        work3.setWorkName("电子产品系列插画");
        work3.setWorkType("美术作品");
        work3.setOwner("创意设计工作室");
        work3.setRegistrationNumber("CR-2024-123456");
        work3.setRegistrationDate(LocalDateTime.now().minusMonths(12));
        work3.setDescription("电子产品系列原创插画作品");
        work3.setKeywords("插画,电子产品,原创");
        work3.setStatus(CopyrightWork.WorkStatus.ACTIVE);
        copyrightWorkRepository.save(work3);

        log.info("Copyright works initialized: 3 records");
    }

    private void initProducts() {
        String[] platforms = {"Amazon", "eBay", "AliExpress", "Shopee", "Wish"};
        String[] productNames = {
                "智能手表 Pro Max",
                "无线蓝牙耳机 X1",
                "品牌运动鞋 - 限量版",
                "高端智能手环",
                "设计师太阳镜",
                "经典机械手表",
                "运动智能手环",
                "真无线降噪耳机"
        };
        String[] sellers = {"TechStore Global", "Fashion World", "Smart Life Shop", "Gadget Hub", "Premium Goods"};

        for (int i = 0; i < 8; i++) {
            Product product = new Product();
            product.setName(productNames[i]);
            product.setPlatform(platforms[i % platforms.length]);
            product.setProductUrl("https://www." + platforms[i % platforms.length].toLowerCase() +
                    ".com/product/" + (1000 + i));
            product.setSellerName(sellers[i % sellers.length]);
            product.setPrice(49.99 + (i * 25));
            product.setCurrency("USD");
            product.setDescription("跨境电商平台上的热门商品，疑似侵犯知识产权。");
            product.setInfringementStatus(Product.InfringementStatus.values()[i % 4]);
            product.setInfringementScore(20 + (i * 10));
            product.setDetectedAt(LocalDateTime.now().minusDays(i));
            productRepository.save(product);
        }

        log.info("Products initialized: 8 records");
    }

    private void initEvidence() {
        for (long productId = 1; productId <= 5; productId++) {
            Evidence screenshot = new Evidence();
            screenshot.setProductId(productId);
            screenshot.setType(Evidence.EvidenceType.SCREENSHOT);
            screenshot.setFileName("screenshot_" + productId + ".png");
            screenshot.setFilePath("/evidence/" + productId + "/screenshots/");
            screenshot.setFileSize(1024L * 500);
            screenshot.setFileHash(UUID.randomUUID().toString().replace("-", "").substring(0, 32));
            screenshot.setDescription("商品页面截图证据");
            screenshot.setStatus(Evidence.EvidenceStatus.VERIFIED);
            evidenceRepository.save(screenshot);

            Evidence pageSource = new Evidence();
            pageSource.setProductId(productId);
            pageSource.setType(Evidence.EvidenceType.PAGE_SOURCE);
            pageSource.setFileName("page_source_" + productId + ".html");
            pageSource.setFilePath("/evidence/" + productId + "/pages/");
            pageSource.setFileSize(1024L * 100);
            pageSource.setFileHash(UUID.randomUUID().toString().replace("-", "").substring(0, 32));
            pageSource.setDescription("商品页面源代码");
            pageSource.setStatus(Evidence.EvidenceStatus.VERIFIED);
            evidenceRepository.save(pageSource);
        }

        log.info("Evidence initialized: 10 records");
    }

    private void initLegalCases() {
        String[] caseTitles = {
                "Amazon平台商标侵权案件",
                "eBay平台外观设计专利侵权",
                "AliExpress假冒商品维权案",
                "Shopee版权侵权纠纷"
        };

        LegalCase.CaseStatus[] statuses = {
                LegalCase.CaseStatus.PREPARING,
                LegalCase.CaseStatus.FILED,
                LegalCase.CaseStatus.HEARING,
                LegalCase.CaseStatus.CLOSED_WON
        };

        for (int i = 0; i < 4; i++) {
            LegalCase legalCase = new LegalCase();
            legalCase.setCaseNumber("IPR-2024" + String.format("%02d", i + 1) + "-" +
                    UUID.randomUUID().toString().substring(0, 6).toUpperCase());
            legalCase.setProductId((long) (i + 1));
            legalCase.setCaseTitle(caseTitles[i]);
            legalCase.setCaseDescription("这是一起典型的跨境电商知识产权侵权案件，涉及多个平台的疑似侵权商品。");
            legalCase.setPlaintiff("知识产权权利人公司");
            legalCase.setDefendant("跨境电商平台商家");
            legalCase.setAttorney("张律师");
            legalCase.setStatus(statuses[i]);
            legalCase.setCaseType(LegalCase.CaseType.values()[i % 5]);
            if (i >= 2) {
                legalCase.setFiledAt(LocalDateTime.now().minusDays(30 - i * 10));
            }
            if (i == 3) {
                legalCase.setClosedAt(LocalDateTime.now().minusDays(5));
                legalCase.setResult("胜诉，被告停止侵权行为并赔偿经济损失");
            }
            legalCaseRepository.save(legalCase);
        }

        log.info("Legal cases initialized: 4 records");
    }
}
