package com.energy.config;

import com.energy.entity.EnergyData;
import com.energy.entity.EnergySavingPlan;
import com.energy.entity.Equipment;
import com.energy.entity.LossAnalysis;
import com.energy.elasticsearch.ElasticsearchService;
import com.energy.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final EquipmentService equipmentService;
    private final EnergyDataService energyDataService;
    private final EnergySavingPlanService energySavingPlanService;
    private final LossAnalysisService lossAnalysisService;
    private final ElasticsearchService elasticsearchService;

    private final Random random = new Random();

    @Override
    public void run(String... args) {
        if (equipmentService.findAll().isEmpty()) {
            initEquipmentData();
            initEnergyData();
            initSavingPlans();
            initLossAnalysis();
        }
    }

    private void initEquipmentData() {
        List<Equipment> equipments = new ArrayList<>();

        Equipment eq1 = createEquipment("EQ-001", "空压机-01", "压缩机", "A车间-1号", 110.0, "running");
        equipments.add(eq1);

        Equipment eq2 = createEquipment("EQ-002", "冷水机-01", "制冷设备", "A车间-2号", 150.0, "running");
        equipments.add(eq2);

        Equipment eq3 = createEquipment("EQ-003", "电机组-A", "电机", "B车间-1号", 75.0, "standby");
        equipments.add(eq3);

        Equipment eq4 = createEquipment("EQ-004", "风机组-01", "通风设备", "B车间-2号", 45.0, "running");
        equipments.add(eq4);

        Equipment eq5 = createEquipment("EQ-005", "锅炉-01", "加热设备", "C车间-1号", 200.0, "running");
        equipments.add(eq5);

        for (Equipment eq : equipments) {
            equipmentService.save(eq);
        }
    }

    private Equipment createEquipment(String code, String name, String type, String location, Double ratedPower, String status) {
        Equipment eq = new Equipment();
        eq.setCode(code);
        eq.setName(name);
        eq.setType(type);
        eq.setLocation(location);
        eq.setRatedPower(ratedPower);
        eq.setStatus(status);
        eq.setInstallDate(LocalDateTime.now().minusMonths(random.nextInt(12) + 1));
        return eq;
    }

    private void initEnergyData() {
        List<Equipment> equipments = equipmentService.findAll();
        List<EnergyData> allData = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Equipment eq : equipments) {
            for (int i = 0; i < 200; i++) {
                EnergyData data = createEnergyData(eq, now.minusHours(i));
                allData.add(data);
            }
        }

        for (EnergyData data : allData) {
            energyDataService.save(data);
        }

        elasticsearchService.saveAllEnergyData(allData);
    }

    private EnergyData createEnergyData(Equipment eq, LocalDateTime collectTime) {
        EnergyData data = new EnergyData();
        data.setEquipmentId(eq.getId());
        data.setEquipmentCode(eq.getCode());

        double basePower = eq.getRatedPower() * (0.6 + random.nextDouble() * 0.35);
        data.setVoltage(380.0 + random.nextDouble() * 20 - 10);
        data.setCurrent(basePower / (380.0 * 0.85));
        data.setPower(basePower);
        data.setPowerFactor(0.8 + random.nextDouble() * 0.15);
        data.setEnergyConsumption(basePower * (0.8 + random.nextDouble() * 0.4) / 1000);
        data.setTemperature(45.0 + random.nextDouble() * 35);
        data.setCollectTime(collectTime);

        return data;
    }

    private void initSavingPlans() {
        List<Equipment> equipments = equipmentService.findAll();

        for (Equipment eq : equipments) {
            if (random.nextBoolean()) {
                EnergySavingPlan plan1 = new EnergySavingPlan();
                plan1.setEquipmentId(eq.getId());
                plan1.setEquipmentCode(eq.getCode());
                plan1.setPlanName("无功补偿优化方案");
                plan1.setDescription("针对功率因数偏低问题，安装无功补偿装置");
                plan1.setMeasures("1. 安装SVG静态无功发生器\n2. 优化设备负载率至75%以上\n3. 定期检测电容器状态");
                plan1.setExpectedSaving(45.5 + random.nextDouble() * 30);
                plan1.setExpectedCost(15000.0);
                plan1.setPaybackPeriod(12);
                plan1.setPriority("high");
                plan1.setStatus("pending");
                energySavingPlanService.save(plan1);
            }

            if (random.nextBoolean()) {
                EnergySavingPlan plan2 = new EnergySavingPlan();
                plan2.setEquipmentId(eq.getId());
                plan2.setEquipmentCode(eq.getCode());
                plan2.setPlanName("散热系统改造方案");
                plan2.setDescription("改善设备散热条件，降低运行温度");
                plan2.setMeasures("1. 清洗换热器和散热片\n2. 检查并更换润滑油\n3. 增加通风设备或空调系统");
                plan2.setExpectedSaving(28.3 + random.nextDouble() * 20);
                plan2.setExpectedCost(5000.0);
                plan2.setPaybackPeriod(6);
                plan2.setPriority("medium");
                plan2.setStatus(random.nextBoolean() ? "in_progress" : "pending");
                energySavingPlanService.save(plan2);
            }
        }
    }

    private void initLossAnalysis() {
        List<Equipment> equipments = equipmentService.findAll();

        for (Equipment eq : equipments) {
            LossAnalysis loss1 = new LossAnalysis();
            loss1.setEquipmentId(eq.getId());
            loss1.setEquipmentCode(eq.getCode());
            loss1.setLossType("功率因数损耗");
            loss1.setDescription("设备运行期间功率因数偏低，导致无功损耗增加");
            loss1.setLossValue(45.2 + random.nextDouble() * 30);
            loss1.setLossPercentage(8.5 + random.nextDouble() * 5);
            loss1.setCost(1250.0 + random.nextDouble() * 1000);
            loss1.setReason("可能是电机轻载运行、设备老化或无功补偿不足");
            loss1.setSuggestion("建议安装无功补偿装置，优化设备负载率");
            loss1.setSeverity(random.nextBoolean() ? "high" : "medium");
            loss1.setAnalysisTime(LocalDateTime.now());
            lossAnalysisService.save(loss1);

            LossAnalysis loss2 = new LossAnalysis();
            loss2.setEquipmentId(eq.getId());
            loss2.setEquipmentCode(eq.getCode());
            loss2.setLossType("温度过热损耗");
            loss2.setDescription("设备运行温度过高，导致效率下降和能耗增加");
            loss2.setLossValue(18.6 + random.nextDouble() * 15);
            loss2.setLossPercentage(3.2 + random.nextDouble() * 3);
            loss2.setCost(520.0 + random.nextDouble() * 500);
            loss2.setReason("可能是散热不良、润滑不足或过载运行");
            loss2.setSuggestion("检查冷却系统，定期维护保养，避免长时间过载");
            loss2.setSeverity("medium");
            loss2.setAnalysisTime(LocalDateTime.now());
            lossAnalysisService.save(loss2);
        }
    }
}
