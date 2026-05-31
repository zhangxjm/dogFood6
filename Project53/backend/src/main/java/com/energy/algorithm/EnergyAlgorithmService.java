package com.energy.algorithm;

import com.energy.entity.EnergyData;
import com.energy.entity.EnergySavingPlan;
import com.energy.entity.LossAnalysis;
import com.energy.service.EnergyDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EnergyAlgorithmService {

    private final EnergyDataService energyDataService;

    public double calculateEnergyEfficiency(Long equipmentId, LocalDateTime start, LocalDateTime end) {
        List<EnergyData> dataList = energyDataService.findByEquipmentIdAndTimeRange(equipmentId, start, end);
        if (dataList.isEmpty()) {
            return 0.0;
        }

        double totalPower = 0.0;
        double totalRatedPower = 0.0;
        int count = 0;

        for (EnergyData data : dataList) {
            if (data.getPower() != null && data.getPower() > 0) {
                totalPower += data.getPower();
                count++;
            }
        }

        if (count == 0) {
            return 0.0;
        }

        double avgPower = totalPower / count;
        double efficiency = Math.min(100.0, (avgPower / (avgPower + calculateBaseLoss(dataList))) * 100);
        return Math.round(efficiency * 100.0) / 100.0;
    }

    private double calculateBaseLoss(List<EnergyData> dataList) {
        double totalLoss = 0.0;
        for (EnergyData data : dataList) {
            if (data.getPowerFactor() != null && data.getPowerFactor() < 0.9) {
                totalLoss += (1 - data.getPowerFactor()) * 10;
            }
            if (data.getTemperature() != null && data.getTemperature() > 60) {
                totalLoss += (data.getTemperature() - 60) * 0.5;
            }
        }
        return totalLoss / Math.max(1, dataList.size());
    }

    public Map<String, Object> predictEnergyConsumption(Long equipmentId, int days) {
        Map<String, Object> result = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime historicalStart = now.minusDays(30);

        List<EnergyData> historicalData = energyDataService.findByEquipmentIdAndTimeRange(equipmentId, historicalStart, now);
        if (historicalData.isEmpty()) {
            result.put("prediction", new double[days]);
            result.put("confidence", 0.0);
            return result;
        }

        Map<Integer, Double> dailyConsumption = new HashMap<>();
        for (EnergyData data : historicalData) {
            int dayOfMonth = data.getCollectTime().getDayOfMonth();
            dailyConsumption.merge(dayOfMonth, data.getEnergyConsumption() != null ? data.getEnergyConsumption() : 0.0, Double::sum);
        }

        double[] trend = calculateTrend(dailyConsumption);
        double[] prediction = new double[days];
        double lastValue = dailyConsumption.values().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

        for (int i = 0; i < days; i++) {
            prediction[i] = Math.max(0, lastValue + trend[0] * i + trend[1] * i * i);
            prediction[i] = Math.round(prediction[i] * 100.0) / 100.0;
        }

        result.put("prediction", prediction);
        result.put("confidence", calculateConfidence(dailyConsumption));
        result.put("historicalDaily", dailyConsumption);
        return result;
    }

    private double[] calculateTrend(Map<Integer, Double> data) {
        if (data.size() < 2) {
            return new double[]{0.0, 0.0};
        }

        List<Map.Entry<Integer, Double>> sorted = new ArrayList<>(data.entrySet());
        sorted.sort(Map.Entry.comparingByKey());

        double n = sorted.size();
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

        for (int i = 0; i < sorted.size(); i++) {
            double x = i;
            double y = sorted.get(i).getValue();
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        }

        double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        double intercept = (sumY - slope * sumX) / n;

        return new double[]{slope, 0.0};
    }

    private double calculateConfidence(Map<Integer, Double> data) {
        if (data.size() < 5) {
            return 0.5;
        }

        double mean = data.values().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double variance = data.values().stream()
                .mapToDouble(v -> Math.pow(v - mean, 2))
                .average()
                .orElse(0.0);
        double stdDev = Math.sqrt(variance);

        double cv = mean > 0 ? stdDev / mean : 1.0;
        double confidence = Math.max(0.3, Math.min(0.95, 1.0 - cv * 0.5));
        return Math.round(confidence * 100.0) / 100.0;
    }

    public List<LossAnalysis> analyzeLosses(Long equipmentId, LocalDateTime start, LocalDateTime end) {
        List<LossAnalysis> losses = new ArrayList<>();
        List<EnergyData> dataList = energyDataService.findByEquipmentIdAndTimeRange(equipmentId, start, end);

        if (dataList.isEmpty()) {
            return losses;
        }

        LossAnalysis powerFactorLoss = analyzePowerFactorLoss(equipmentId, dataList);
        if (powerFactorLoss != null) {
            losses.add(powerFactorLoss);
        }

        LossAnalysis temperatureLoss = analyzeTemperatureLoss(equipmentId, dataList);
        if (temperatureLoss != null) {
            losses.add(temperatureLoss);
        }

        LossAnalysis peakLoadLoss = analyzePeakLoadLoss(equipmentId, dataList);
        if (peakLoadLoss != null) {
            losses.add(peakLoadLoss);
        }

        LossAnalysis idleLoss = analyzeIdleLoss(equipmentId, dataList);
        if (idleLoss != null) {
            losses.add(idleLoss);
        }

        return losses;
    }

    private LossAnalysis analyzePowerFactorLoss(Long equipmentId, List<EnergyData> dataList) {
        long lowPfCount = dataList.stream()
                .filter(d -> d.getPowerFactor() != null && d.getPowerFactor() < 0.85)
                .count();

        if (lowPfCount == 0) {
            return null;
        }

        double avgPf = dataList.stream()
                .filter(d -> d.getPowerFactor() != null)
                .mapToDouble(EnergyData::getPowerFactor)
                .average()
                .orElse(1.0);

        double lossValue = (1.0 - avgPf) * 15.0;
        double cost = lossValue * 0.8 * dataList.size() / 24;

        LossAnalysis loss = new LossAnalysis();
        loss.setEquipmentId(equipmentId);
        loss.setLossType("功率因数损耗");
        loss.setDescription("设备运行期间功率因数偏低，导致无功损耗增加");
        loss.setLossValue(Math.round(lossValue * 100.0) / 100.0);
        loss.setLossPercentage(Math.round((1.0 - avgPf) * 1000.0) / 10.0);
        loss.setCost(Math.round(cost * 100.0) / 100.0);
        loss.setReason("可能是电机轻载运行、设备老化或无功补偿不足");
        loss.setSuggestion("建议安装无功补偿装置，优化设备负载率");
        loss.setSeverity(avgPf < 0.8 ? "high" : avgPf < 0.85 ? "medium" : "low");
        loss.setAnalysisTime(LocalDateTime.now());
        return loss;
    }

    private LossAnalysis analyzeTemperatureLoss(Long equipmentId, List<EnergyData> dataList) {
        long overheatCount = dataList.stream()
                .filter(d -> d.getTemperature() != null && d.getTemperature() > 70)
                .count();

        if (overheatCount == 0) {
            return null;
        }

        double avgTemp = dataList.stream()
                .filter(d -> d.getTemperature() != null)
                .mapToDouble(EnergyData::getTemperature)
                .average()
                .orElse(25.0);

        double lossValue = (avgTemp - 60) * 0.3;
        double cost = lossValue * 1.2;

        LossAnalysis loss = new LossAnalysis();
        loss.setEquipmentId(equipmentId);
        loss.setLossType("温度过热损耗");
        loss.setDescription("设备运行温度过高，导致效率下降和能耗增加");
        loss.setLossValue(Math.round(lossValue * 100.0) / 100.0);
        loss.setLossPercentage(Math.round((avgTemp - 60) * 2.0) / 10.0);
        loss.setCost(Math.round(cost * 100.0) / 100.0);
        loss.setReason("可能是散热不良、润滑不足或过载运行");
        loss.setSuggestion("检查冷却系统，定期维护保养，避免长时间过载");
        loss.setSeverity(avgTemp > 80 ? "high" : avgTemp > 70 ? "medium" : "low");
        loss.setAnalysisTime(LocalDateTime.now());
        return loss;
    }

    private LossAnalysis analyzePeakLoadLoss(Long equipmentId, List<EnergyData> dataList) {
        double avgPower = dataList.stream()
                .filter(d -> d.getPower() != null)
                .mapToDouble(EnergyData::getPower)
                .average()
                .orElse(0.0);

        long peakCount = dataList.stream()
                .filter(d -> d.getPower() != null && d.getPower() > avgPower * 1.5)
                .count();

        if (peakCount < 3) {
            return null;
        }

        double peakEnergy = dataList.stream()
                .filter(d -> d.getPower() != null && d.getPower() > avgPower * 1.5)
                .mapToDouble(d -> d.getEnergyConsumption() != null ? d.getEnergyConsumption() : 0.0)
                .sum();

        double lossValue = peakEnergy * 0.2;

        LossAnalysis loss = new LossAnalysis();
        loss.setEquipmentId(equipmentId);
        loss.setLossType("尖峰负荷损耗");
        loss.setDescription("设备在尖峰时段运行，增加了用电成本");
        loss.setLossValue(Math.round(lossValue * 100.0) / 100.0);
        loss.setLossPercentage(Math.round((lossValue / (peakEnergy + 1)) * 1000.0) / 10.0);
        loss.setCost(Math.round(lossValue * 1.5 * 100.0) / 100.0);
        loss.setReason("生产计划安排不合理，设备在电价高峰期集中运行");
        loss.setSuggestion("优化生产计划，错峰用电，配置储能系统");
        loss.setSeverity(peakCount > 10 ? "high" : peakCount > 5 ? "medium" : "low");
        loss.setAnalysisTime(LocalDateTime.now());
        return loss;
    }

    private LossAnalysis analyzeIdleLoss(Long equipmentId, List<EnergyData> dataList) {
        long idleCount = dataList.stream()
                .filter(d -> d.getPower() != null && d.getPower() > 0 && d.getPower() < 10)
                .count();

        if (idleCount < 5) {
            return null;
        }

        double idleEnergy = dataList.stream()
                .filter(d -> d.getPower() != null && d.getPower() > 0 && d.getPower() < 10)
                .mapToDouble(d -> d.getEnergyConsumption() != null ? d.getEnergyConsumption() : 0.0)
                .sum();

        LossAnalysis loss = new LossAnalysis();
        loss.setEquipmentId(equipmentId);
        loss.setLossType("空载运行损耗");
        loss.setDescription("设备长时间空载运行，造成能源浪费");
        loss.setLossValue(Math.round(idleEnergy * 100.0) / 100.0);
        double totalEnergy = dataList.stream()
                .mapToDouble(d -> d.getEnergyConsumption() != null ? d.getEnergyConsumption() : 0.0)
                .sum();
        loss.setLossPercentage(Math.round((idleEnergy / (totalEnergy + 1)) * 1000.0) / 10.0);
        loss.setCost(Math.round(idleEnergy * 0.8 * 100.0) / 100.0);
        loss.setReason("设备启停控制不合理，待机时间过长");
        loss.setSuggestion("安装自动启停装置，优化设备运行 schedule");
        loss.setSeverity(idleCount > 20 ? "high" : idleCount > 10 ? "medium" : "low");
        loss.setAnalysisTime(LocalDateTime.now());
        return loss;
    }

    public List<EnergySavingPlan> generateSavingPlans(Long equipmentId) {
        List<EnergySavingPlan> plans = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.minusDays(7);

        List<LossAnalysis> losses = analyzeLosses(equipmentId, start, now);

        for (LossAnalysis loss : losses) {
            EnergySavingPlan plan = createPlanFromLoss(loss);
            if (plan != null) {
                plans.add(plan);
            }
        }

        EnergySavingPlan generalPlan = createGeneralOptimizationPlan(equipmentId);
        plans.add(generalPlan);

        plans.sort((a, b) -> {
            int priorityOrder = getPriorityOrder(a.getPriority()) - getPriorityOrder(b.getPriority());
            if (priorityOrder != 0) return priorityOrder;
            return Double.compare(b.getExpectedSaving(), a.getExpectedSaving());
        });

        return plans;
    }

    private int getPriorityOrder(String priority) {
        if (priority == null) return 3;
        return switch (priority) {
            case "high" -> 1;
            case "medium" -> 2;
            case "low" -> 3;
            default -> 3;
        };
    }

    private EnergySavingPlan createPlanFromLoss(LossAnalysis loss) {
        EnergySavingPlan plan = new EnergySavingPlan();
        plan.setEquipmentId(loss.getEquipmentId());

        switch (loss.getLossType()) {
            case "功率因数损耗":
                plan.setPlanName("无功补偿优化方案");
                plan.setDescription("针对功率因数偏低问题，安装无功补偿装置");
                plan.setMeasures("1. 安装SVG静态无功发生器\n2. 优化设备负载率至75%以上\n3. 定期检测电容器状态");
                plan.setExpectedSaving(loss.getLossValue() * 0.85);
                plan.setExpectedCost(15000.0);
                plan.setPaybackPeriod(12);
                break;

            case "温度过热损耗":
                plan.setPlanName("散热系统改造方案");
                plan.setDescription("改善设备散热条件，降低运行温度");
                plan.setMeasures("1. 清洗换热器和散热片\n2. 检查并更换润滑油\n3. 增加通风设备或空调系统");
                plan.setExpectedSaving(loss.getLossValue() * 0.7);
                plan.setExpectedCost(5000.0);
                plan.setPaybackPeriod(6);
                break;

            case "尖峰负荷损耗":
                plan.setPlanName("错峰用电优化方案");
                plan.setDescription("调整生产计划，避开用电高峰期");
                plan.setMeasures("1. 将高能耗工序转移到低谷时段\n2. 配置储能系统削峰填谷\n3. 安装智能负荷控制系统");
                plan.setExpectedSaving(loss.getLossValue() * 0.6);
                plan.setExpectedCost(30000.0);
                plan.setPaybackPeriod(18);
                break;

            case "空载运行损耗":
                plan.setPlanName("设备启停优化方案");
                plan.setDescription("实现设备智能启停，减少空载能耗");
                plan.setMeasures("1. 安装变频器实现软启动\n2. 设置自动停机延时\n3. 建立设备运行台账");
                plan.setExpectedSaving(loss.getLossValue() * 0.9);
                plan.setExpectedCost(8000.0);
                plan.setPaybackPeriod(4);
                break;

            default:
                return null;
        }

        plan.setPriority(loss.getSeverity());
        plan.setStatus("pending");
        plan.setExpectedSaving(Math.round(plan.getExpectedSaving() * 100.0) / 100.0);
        return plan;
    }

    private EnergySavingPlan createGeneralOptimizationPlan(Long equipmentId) {
        EnergySavingPlan plan = new EnergySavingPlan();
        plan.setEquipmentId(equipmentId);
        plan.setPlanName("能源管理体系建设方案");
        plan.setDescription("建立全面的能源管理体系，实现持续节能");
        plan.setMeasures("1. 建立能源计量体系\n2. 制定能耗定额管理制度\n3. 开展员工节能培训\n4. 定期进行能源审计");
        plan.setExpectedSaving(50.0);
        plan.setExpectedCost(20000.0);
        plan.setPaybackPeriod(8);
        plan.setPriority("medium");
        plan.setStatus("pending");
        return plan;
    }
}
