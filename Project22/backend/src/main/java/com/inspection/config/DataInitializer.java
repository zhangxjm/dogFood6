package com.inspection.config;

import com.inspection.entity.*;
import com.inspection.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final ProductionLineRepository lineRepository;
    private final CameraRepository cameraRepository;
    private final EdgeNodeRepository edgeNodeRepository;
    private final DefectTypeRepository defectTypeRepository;
    private final VisionModelRepository modelRepository;
    private final UserRepository userRepository;
    private final SortingRuleRepository sortingRuleRepository;
    private final SystemSettingRepository systemSettingRepository;

    public DataInitializer(ProductionLineRepository lineRepository, CameraRepository cameraRepository, EdgeNodeRepository edgeNodeRepository, DefectTypeRepository defectTypeRepository, VisionModelRepository modelRepository, UserRepository userRepository, SortingRuleRepository sortingRuleRepository, SystemSettingRepository systemSettingRepository) {
        this.lineRepository = lineRepository;
        this.cameraRepository = cameraRepository;
        this.edgeNodeRepository = edgeNodeRepository;
        this.defectTypeRepository = defectTypeRepository;
        this.modelRepository = modelRepository;
        this.userRepository = userRepository;
        this.sortingRuleRepository = sortingRuleRepository;
        this.systemSettingRepository = systemSettingRepository;
    }

    @Override
    public void run(String... args) {
        log.info("Initializing sample data...");

        initUsers();
        initEdgeNodes();
        initProductionLines();
        initCameras();
        initDefectTypes();
        initVisionModels();
        initSortingRules();
        initSystemSettings();

        log.info("Sample data initialization completed!");
    }

    private void initUsers() {
        if (userRepository.count() > 0) return;

        List<User> users = Arrays.asList(
            createUser("admin", "admin123", "ADMIN", "系统管理员"),
            createUser("manager", "manager123", "MANAGER", "生产主管"),
            createUser("operator", "operator123", "OPERATOR", "质检操作员")
        );
        userRepository.saveAll(users);
        log.info("Initialized {} users", users.size());
    }

    private User createUser(String username, String password, String role, String displayName) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setRole(role);
        user.setDisplayName(displayName);
        return user;
    }

    private void initEdgeNodes() {
        if (edgeNodeRepository.count() > 0) return;

        Random random = new Random();
        List<EdgeNode> nodes = Arrays.asList(
            createEdgeNode("边缘节点-A1", "192.168.1.101", random),
            createEdgeNode("边缘节点-A2", "192.168.1.102", random),
            createEdgeNode("边缘节点-B1", "192.168.1.103", random)
        );
        edgeNodeRepository.saveAll(nodes);
        log.info("Initialized {} edge nodes", nodes.size());
    }

    private EdgeNode createEdgeNode(String name, String ip, Random random) {
        EdgeNode node = new EdgeNode();
        node.setName(name);
        node.setIpAddress(ip);
        node.setStatus("ONLINE");
        node.setCpuUsage(20 + random.nextDouble() * 40);
        node.setMemoryUsage(30 + random.nextDouble() * 30);
        node.setInferenceLatency(15 + random.nextDouble() * 20);
        return node;
    }

    private void initProductionLines() {
        if (lineRepository.count() > 0) return;

        List<ProductionLine> lines = Arrays.asList(
            createLine("A1-手机外壳产线", "RUNNING", 120.0),
            createLine("A2-屏幕模组产线", "RUNNING", 90.0),
            createLine("B1-电池组件产线", "STOPPED", 0.0),
            createLine("B2-PCB板产线", "RUNNING", 150.0)
        );
        lineRepository.saveAll(lines);
        log.info("Initialized {} production lines", lines.size());
    }

    private ProductionLine createLine(String name, String status, double speed) {
        ProductionLine line = new ProductionLine();
        line.setName(name);
        line.setStatus(status);
        line.setSpeed(speed);
        line.setDescription("自动化产线-" + name);
        return line;
    }

    private void initCameras() {
        if (cameraRepository.count() > 0) return;

        List<Camera> cameras = Arrays.asList(
            createCamera("A1-CAM1", "192.168.1.201", 1L, 1L, "ONLINE"),
            createCamera("A1-CAM2", "192.168.1.202", 1L, 1L, "ONLINE"),
            createCamera("A2-CAM1", "192.168.1.203", 2L, 2L, "ONLINE"),
            createCamera("A2-CAM2", "192.168.1.204", 2L, 2L, "ONLINE"),
            createCamera("B1-CAM1", "192.168.1.205", 3L, 3L, "OFFLINE"),
            createCamera("B2-CAM1", "192.168.1.206", 4L, 3L, "ONLINE")
        );
        cameraRepository.saveAll(cameras);
        log.info("Initialized {} cameras", cameras.size());
    }

    private Camera createCamera(String name, String ip, Long lineId, Long nodeId, String status) {
        Camera camera = new Camera();
        camera.setName(name);
        camera.setIpAddress(ip);
        camera.setStatus(status);
        camera.setLineId(lineId);
        camera.setEdgeNodeId(nodeId);
        camera.setResolution("1920x1080");
        camera.setFps(30);
        return camera;
    }

    private void initDefectTypes() {
        if (defectTypeRepository.count() > 0) return;

        List<DefectType> defects = Arrays.asList(
            createDefect("划痕", "MINOR", "#FBBF24", "表面轻微划痕"),
            createDefect("凹陷", "MAJOR", "#F97316", "表面明显凹陷变形"),
            createDefect("色差", "MINOR", "#FBBF24", "颜色偏差"),
            createDefect("裂纹", "CRITICAL", "#EF4444", "结构性裂纹"),
            createDefect("气泡", "MINOR", "#FBBF24", "表面气泡"),
            createDefect("异物", "MAJOR", "#F97316", "夹杂异物"),
            createDefect("尺寸超差", "CRITICAL", "#EF4444", "关键尺寸不符合标准"),
            createDefect("表面脏污", "MINOR", "#FBBF24", "表面污渍可擦拭")
        );
        defectTypeRepository.saveAll(defects);
        log.info("Initialized {} defect types", defects.size());
    }

    private DefectType createDefect(String name, String severity, String color, String desc) {
        DefectType defect = new DefectType();
        defect.setName(name);
        defect.setSeverity(severity);
        defect.setColorCode(color);
        defect.setDescription(desc);
        return defect;
    }

    private void initVisionModels() {
        if (modelRepository.count() > 0) return;

        List<VisionModel> models = Arrays.asList(
            createModel("YOLOv8-Defect-v1", "1.0.0", 96.5, true),
            createModel("YOLOv8-Defect-v2", "2.0.0", 97.8, false),
            createModel("ResNet50-Classification", "1.2.0", 94.2, false)
        );
        modelRepository.saveAll(models);
        log.info("Initialized {} vision models", models.size());
    }

    private VisionModel createModel(String name, String version, double accuracy, boolean active) {
        VisionModel model = new VisionModel();
        model.setName(name);
        model.setVersion(version);
        model.setAccuracy(accuracy);
        model.setActive(active);
        model.setDescription("AI视觉检测模型");
        model.setCreatedAt(LocalDateTime.now());
        return model;
    }

    private void initSortingRules() {
        if (sortingRuleRepository.count() > 0) return;

        List<SortingRule> rules = Arrays.asList(
            createRule("轻微缺陷放行", "MINOR", "PASS", 3, null),
            createRule("主要缺陷返工", "MAJOR", "REWORK", 2, null),
            createRule("严重缺陷报废", "CRITICAL", "REJECT", 1, null)
        );
        sortingRuleRepository.saveAll(rules);
        log.info("Initialized {} sorting rules", rules.size());
    }

    private SortingRule createRule(String name, String severity, String action, int priority, Long lineId) {
        SortingRule rule = new SortingRule();
        rule.setName(name);
        rule.setDefectSeverity(severity);
        rule.setAction(action);
        rule.setPriority(priority);
        rule.setLineId(lineId);
        rule.setEnabled(true);
        return rule;
    }

    private void initSystemSettings() {
        if (systemSettingRepository.count() > 0) return;

        List<SystemSetting> settings = Arrays.asList(
            createSetting("detection.threshold", "0.8", "缺陷检测置信度阈值"),
            createSetting("alert.consecutive_failures", "5", "连续不合格告警阈值"),
            createSetting("data.retention.days", "90", "检测记录保留天数"),
            createSetting("simulation.enabled", "true", "是否启用模拟检测"),
            createSetting("simulation.interval.ms", "2000", "模拟检测间隔毫秒数")
        );
        systemSettingRepository.saveAll(settings);
        log.info("Initialized {} system settings", settings.size());
    }

    private SystemSetting createSetting(String key, String value, String desc) {
        SystemSetting setting = new SystemSetting();
        setting.setSettingKey(key);
        setting.setSettingValue(value);
        setting.setDescription(desc);
        return setting;
    }
}
